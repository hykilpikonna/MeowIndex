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

