use std::os::unix::fs::MetadataExt;
use pathdiff::diff_paths;
use std::path::{PathBuf};

const DOT_PATH: &str = ".meow_index";

/// Generate thumbnail for a file if absent
pub fn generate_thumb(base: PathBuf, file: PathBuf) -> Result<(), String>
{
    let ext = file.extension().unwrap_or("".as_ref()).to_str().unwrap_or("");
    let relative = diff_paths(&file, &base).ok_or("Cannot unwrap path")?;
    let thumb = base.join(DOT_PATH).join(relative)
        .with_extension(format!("thumb.{}", ext));

    if thumb.is_file() {
        match (thumb.metadata(), file.metadata()) {
            // Thumbnail already up to date
            (Ok(tm), Ok(fm)) => if tm.mtime() >= fm.mtime() { return Ok(()) },
            _ => {}
        }
    }

    // Generate new thumbnail
    println!("Generating thumbnail for {}\nto {}", file.display(), thumb.display());

    Ok(())
}

fn generate(base: PathBuf, dir: PathBuf)
{
    // Check if already up-to-date
}
