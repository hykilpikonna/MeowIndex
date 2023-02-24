use std::{env, fs};
use std::path::Path;
use std::process::{Command, Output};
use std::time::Instant;
use serde::{Deserialize};
use anyhow::{Context, Result};
use tempdir::TempDir;
use crate::utils::run_cmd;

#[derive(Deserialize, Debug)]
pub struct Encoder {
    name: String,
    cmd: String,
    suffix: String,
}

#[derive(Deserialize, Debug)]
pub struct Encoders {
    processes: u32,
    encoders: Vec<Encoder>
}

impl Encoder {
    pub fn execute(&self, orig: &str, out: &str) -> Result<Output> {
        run_cmd(&*self.cmd
            .replace("{{INPUT}}", &*shlex::quote(orig))
            .replace("{{OUTPUT}}", &*shlex::quote(out)))
    }
}

impl Encoders {
    pub fn load() -> Result<Encoders> {
        let file = env::var("MEOW_ENCODING_FILE").unwrap_or("encoding.toml".to_string());
        let content = fs::read_to_string(file)?;
        Ok(toml::from_str(&*content)?)
    }

    pub fn exec_all(&self, orig: &str, out: &Path) -> Result<()> {
        for enc in &self.encoders {
            let enc_out = out.with_extension(enc.suffix.to_owned());
            // Skip if encoded video already exists
            if enc_out.exists() { continue }

            debug!("Encoding '{}' for {orig}...", enc.name);
            let start = Instant::now();

            // Create tmp (this is to prevent partially completed encoding results being detected as completed)
            let tmp_dir = TempDir::new("meow_encoder_tmp")?;
            let tmp_out = tmp_dir.path().join(out.file_name().context("No file name")?);

            // Convert to tmp
            enc.execute(orig, tmp_out.to_str().context("Call to path.to_str failed")?)?;
            debug!("Done, took {:.2} minutes, copying result...", start.elapsed().as_secs_f32() / 60.0);

            // Copy results
            if let Some(parent) = enc_out.parent() {
                fs::create_dir_all(parent)?
            }
            fs::copy(tmp_out, enc_out)?;

            // Cleanup tmp
            tmp_dir.close()?;
        }
        Ok(())
    }
}


