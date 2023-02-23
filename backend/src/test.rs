mod generator;
mod macros;
mod utils;
mod thumbnailer;

use std::path::{Path, PathBuf};
use generator::*;
use crate::thumbnailer::{Thumbnailer, Thumbnailers};

extern crate pretty_env_logger;
#[macro_use] extern crate log;

fn main() {
    pretty_env_logger::init();

    let gen = Generator::new("/data".into()).unwrap();

    let path: PathBuf = "/data/Anime/1977 Star Wars Collection/01 Star Wars Episode I The Phantom Menace - George Lucas 1999 Eng Subs 720p [H264-mp4].mp4".into();
    let mime = gen.get_mime(&path)
        .expect("Panic");
    info!("mime {mime}");

    let thumbnailer_path = "/usr/share/thumbnailers/totem.thumbnailer";
    let thumbnailer = Thumbnailer::load(Path::new(thumbnailer_path)).unwrap();
    info!("thumb {:?}", thumbnailer);
    info!("check {:?}", thumbnailer.check("audio/x-mp3"));
    thumbnailer.gen(path.to_str().unwrap(), "/tmp/test.png", 256).expect("Generation failed");

    let ts = Thumbnailers::load_all().unwrap();
    info!("Video thumbnailer: {:?}", ts.find("audio/x-mp3"))
}
