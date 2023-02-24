use std::{env, fs};
use std::path::Path;
use std::process::{Command, Output};
use serde::{Deserialize};
use anyhow::{Context, Result};
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
}


