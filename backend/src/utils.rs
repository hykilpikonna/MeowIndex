use std::{fs, io};
use std::path::{PathBuf};
use std::process::{Command, Output};
use anyhow::{Result, bail};
use shlex::Shlex;

pub fn write_sf<C: AsRef<[u8]>>(path: &PathBuf, contents: C) -> io::Result<()> {
    // Create parent if it has parent
    if let Some(p) = path.parent() {
        fs::create_dir_all(p)?
    }

    fs::write(path, contents)
}

pub fn run_cmd(cmd: &str) -> Result<Output> {
    let args: Vec<String> = Shlex::new(&*cmd).collect();
    let out = Command::new(args[0].to_owned()).args(&args[1..]).output()?;
    if !out.status.success() {
        error!("Command failed: {cmd}");
        error!("Command output: {:?}", out);
        bail!(String::from_utf8(out.stderr)?);
    }
    // debug!("Command output: {:?}", out);
    Ok(out)
}
