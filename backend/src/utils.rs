use std::{fs, io};
use std::path::{PathBuf};

pub fn write_sf<C: AsRef<[u8]>>(path: &PathBuf, contents: C) -> io::Result<()> {
    // Create parent if it has parent
    if let Some(p) = path.parent() {
        fs::create_dir_all(p)?
    }

    fs::write(path, contents)
}
