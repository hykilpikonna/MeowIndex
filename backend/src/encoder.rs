use std::{env, fs};
use serde::{Deserialize};
use anyhow::{Result};

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

impl Encoders {
    pub fn load() -> Result<Encoders> {
        let file = env::var("MEOW_ENCODING_FILE").unwrap_or("encoding.toml".to_string());
        let content = fs::read_to_string(file)?;
        Ok(toml::from_str(&*content)?)
    }
}


