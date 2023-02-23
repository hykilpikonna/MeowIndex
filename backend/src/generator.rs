use crate::macros::*;
use crate::utils::*;

use std::fs;
use std::os::unix::fs::MetadataExt;
use pathdiff::diff_paths;
use std::path::{PathBuf};
use std::fs::{File, Metadata};
use std::fs::DirEntry;
use std::io::{BufReader};
use xdg_mime::{SharedMimeInfo};
use anyhow::{Result};
use serde::{de, Deserialize, ser, Serialize};

const DOT_PATH: &str = ".meow_index";

#[derive(Serialize, Deserialize)]
pub struct ReturnPath {
    pub(crate) name: String,
    pub(crate) file_type: String,
    pub(crate) mtime: i64
}

pub struct Generator {
    pub(crate) mime_db: SharedMimeInfo,
    pub(crate) base: PathBuf,
}

pub trait GeneratorTraits {
    fn new(base: PathBuf) -> Generator;
    fn dot_path(&self, path: &PathBuf) -> PathBuf;
    fn get_cached<T>(&self, file: &PathBuf, token: &str, read: impl Fn(&PathBuf) -> Result<T>,
                     gen: impl Fn(&PathBuf) -> Result<()>) -> Result<T>;
    fn get_cached_json<T>(&self, file: &PathBuf, token: &str, gen: impl Fn() -> Result<T>) -> Result<T>
        where T: de::DeserializeOwned + ?Sized + ser::Serialize;
    fn get_mime(&self, file: &PathBuf) -> Result<String>;
}

impl GeneratorTraits for Generator {
    fn new(base: PathBuf) -> Generator {
        Generator { mime_db: SharedMimeInfo::new(), base }
    }

    /// Get the same file location in DOT_PATH directory
    fn dot_path(&self, path: &PathBuf) -> PathBuf {
        self.base.join(DOT_PATH).join(diff_paths(&path, &self.base).unwrap())
    }

    /// Get the cached result
    fn get_cached<T>(&self, file: &PathBuf, token: &str, read: impl Fn(&PathBuf) -> Result<T>,
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
    fn get_cached_json<T>(&self, file: &PathBuf, token: &str, gen: impl Fn() -> Result<T>) -> Result<T>
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
    fn get_mime(&self, file: &PathBuf) -> Result<String> {
        self.get_cached(&file, "mime", |f| {
            Ok(fs::read_to_string(f)?)
        }, |f| {
            let mut guesser = self.mime_db.guess_mime_type();
            write_sf(f, guesser.path(file).guess().mime_type().to_string())?;
            Ok(())
        })
    }
}

