use std::collections::HashSet;
use std::fs;
use std::path::Path;
use anyhow::{Result};
use crate::utils::run_cmd;

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

    /// Check if this thumbnailer should run on a specific mime type
    pub fn check(&self, mime: &str) -> bool {
        self.mime_type.contains(mime)
    }

    /// Generate thumbnail
    pub fn gen(&self, orig: &str, new: &str, pixels: i32) -> Result<()> {
        run_cmd(&*self.exec
            .replace("%s", &*format!("'{pixels}'"))
            .replace("%u", &shlex::quote(orig))
            .replace("%i", &shlex::quote(orig))
            .replace("%o", &shlex::quote(new)))?;

        Ok(())
    }
}

pub struct Thumbnailers {
    list: Vec<Thumbnailer>
}

impl Thumbnailers {
    /// Load all thumbanilers available in the system
    pub fn load_all() -> Result<Thumbnailers> {
        Ok(Thumbnailers { list: fs::read_dir("/usr/share/thumbnailers")?
            .filter_map(|f| f.ok())
            .filter_map(|f| Thumbnailer::load(&*f.path()).ok())
            .collect() })
    }

    /// Find a thumbnailer for a mime type
    pub fn find(&self, mime: &str) -> Option<&Thumbnailer> {
        self.list.iter().find(|x| x.check(mime))
    }
}
