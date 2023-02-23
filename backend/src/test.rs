mod generator;
mod macros;
mod utils;

use std::path::PathBuf;
use generator::*;

extern crate pretty_env_logger;
#[macro_use] extern crate log;

fn main() {
    pretty_env_logger::init();

    let gen = Generator::new("/data".into());

    let path: PathBuf = "/data/Anime/1977 Star Wars Collection/01 Star Wars Episode I The Phantom Menace - George Lucas 1999 Eng Subs 720p [H264-mp4].mp4".into();
    let mime = gen.get_mime(&path)
        .expect("Panic");
    info!("mime {mime}")
}
