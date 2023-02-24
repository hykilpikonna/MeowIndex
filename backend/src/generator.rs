use crate::utils::*;

use std::fs;
use std::os::unix::fs::MetadataExt;
use pathdiff::diff_paths;
use std::path::{PathBuf};
use std::fs::{File, Metadata};
use std::fs::DirEntry;
use std::io::{BufReader};
use xdg_mime::{SharedMimeInfo};
use anyhow::{Context, Result};
use serde::{de, ser};
use crate::encoder::Encoders;
use crate::thumbnailer::{Thumbnailers};

const DOT_PATH: &str = ".meow_index";

pub struct Generator {
    pub(crate) mime_db: SharedMimeInfo,
    pub(crate) thumbnailers: Thumbnailers,
    pub(crate) encoders: Encoders,
    pub(crate) base: PathBuf,
}

impl Generator {
    pub fn new(base: PathBuf) -> Result<Generator> {
        Ok(Generator {
            mime_db: SharedMimeInfo::new(),
            thumbnailers: Thumbnailers::load_all()?,
            encoders: Encoders::load()?,
            base: fs::canonicalize(base)?
        })
    }

    /// Get the same file location in DOT_PATH directory
    pub fn dot_path(&self, path: &PathBuf) -> PathBuf {
        debug!("Diffing {} to {}", path.display(), self.base.display());
        if path.is_relative() { self.base.join(DOT_PATH).join(path) }
        else { self.base.join(DOT_PATH).join(diff_paths(&path, &self.base).unwrap()) }
    }

    /// Get the cached result
    pub fn get_cached<T>(&self, file: &PathBuf, token: &str, read: impl Fn(&PathBuf) -> Result<T>,
                     gen: impl Fn(&PathBuf) -> Result<()>) -> Result<T> {
        let dot = self.dot_path(file).with_extension(token);
        if ! dot.exists() || match (dot.metadata(), file.metadata()) {
            (Ok(dm), Ok(fm)) => { fm.mtime() > dm.mtime() }
            (_, _) => true
        } {
            debug!("Regenerating cached result {}", dot.display());
            gen(&dot)?;
        }
        Ok(read(&dot)?)
    }

    /// Get the cached result
    pub fn get_cached_json<T>(&self, file: &PathBuf, token: &str, gen: impl Fn() -> Result<T>) -> Result<T>
        where T: de::DeserializeOwned + ?Sized + ser::Serialize {
        self.get_cached(&file, token, |f| {
            let open = File::open(f)?;
            let reader = BufReader::new(open);
            let val: T = serde_json::from_reader(reader)?;
            Ok(val)
        }, |f| {
            let res = gen()?;
            fs::write(f, serde_json::to_string(&res)?)?;
            Ok(())
        })
    }

    /// Get cached mime type
    pub fn get_mime(&self, file: &PathBuf) -> Result<String> {
        self.get_cached(&file, "mime", |f| {
            Ok(fs::read_to_string(f)?)
        }, |f| {
            let mut guesser = self.mime_db.guess_mime_type();
            write_sf(f, guesser.path(file).guess().mime_type().to_string())?;
            Ok(())
        })
    }

    /// Process a single file
    pub fn get_thumb(&self, file: &PathBuf) -> Result<Vec<u8>> {
        self.get_cached(file, "thumb-128.png", |thumb| {
            Ok(fs::read(thumb)?)
        }, |thumb| {
            debug!("Generating thumbnail for {}\nto {}", file.display(), thumb.display());
            let mime = self.get_mime(file)?;
            if let Some(t) = self.thumbnailers.find(&*mime) {
                t.gen(file.to_str().context("Orig file failed to convert to str")?,
                      thumb.to_str().context("New file failed to convert to str")?, 128)?;
            }
            Ok(())
        })
    }

    /// Process a directory
    pub fn process_dir(&self, dir: &PathBuf) -> Result<()> {
        // List files
        let files: Vec<(DirEntry, Metadata)> = dir.to_owned().read_dir()?
            .filter_map(|x| x.ok())
            .filter_map(|x| {
                let meta = x.metadata();
                Some((x, meta.ok()?))
            }).collect();

        // Recurse into directories
        files.iter().for_each(|(f, _m)| {
            if f.path().is_dir() {
                // Recurse into directory
                let _ = self.process_dir(&f.path());
            }
        });

        Ok(())
    }
}

