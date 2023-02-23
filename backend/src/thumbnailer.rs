use std::collections::HashSet;
use std::fs;
use std::path::Path;
use anyhow::{Result};

#[derive(Debug)]
pub struct Thumbnailer {
    try_exec: String,
    exec: String,
    mime_type: HashSet<String>
}

impl Thumbnailer {
    /// Load an XDG thumbnailer (examples in /usr/share/thumbnailers)
    pub fn load(p: &Path) -> Result<Thumbnailer> {
        let mut content = fs::read_to_string(p)?;
        content = content.replace("\r\n", "\n");
        let lines = content.split("\n");

        let mut t = Thumbnailer {
            try_exec: "".to_string(), exec: "".to_string(), mime_type: HashSet::new()
        };

        lines.filter(|line| line.contains("="))
            .for_each(|line| {
                let sp: Vec<&str> = line.splitn(2, "=").collect();
                let (key, val) = (sp[0].trim(), sp[1].trim().to_string());
                match key {
                    "TryExec" => t.try_exec = val,
                    "Exec" => t.exec = val,
                    "MimeType" => t.mime_type = HashSet::from_iter(val.split(";").map(str::to_string)),
                    _ => {},
                }
            });

        Ok(t)
    }
}
