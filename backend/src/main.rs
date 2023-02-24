#[macro_use]
mod macros;
mod generator;
mod utils;
mod thumbnailer;
mod encoder;

use generator::*;
use macros::*;

use std::convert::Infallible;
use std::{env, fs};
use std::net::SocketAddr;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use hyper::{Body, http, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};
use path_clean::{clean};
use anyhow::{Result};
use serde::{Deserialize, Serialize};

extern crate pretty_env_logger;
#[macro_use] extern crate log;

#[tokio::main]
async fn main() -> Result<()> {
    pretty_env_logger::init();

    let cwd = env::current_dir().unwrap();
    let addr = SocketAddr::from(([0, 0, 0, 0], 3029));
    info!("Serving {} started on http://127.0.0.1:3029", cwd.display());
    let app: &MyApp = Box::leak(Box::new(MyApp::new(&cwd).unwrap())) as &'static _;

    // A `Service` is needed for every connection, so this
    // creates one from our `hello_world` function.
    let make_svc = make_service_fn(|_conn| async {
        // service_fn converts our function into a `Service`
        Ok::<_, Infallible>(service_fn(|x| app.hello_world(x)))
    });

    let server = Server::bind(&addr).serve(make_svc);

    // Run this server for... forever!
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }

    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct ReturnPath {
    name: String,
    file_type: String,
    mtime: i64,
    size: u64,
    mime: Option<String>,
    has_thumb: bool
}

struct MyApp {
    generator: Generator
}

impl MyApp {
    fn new(base: &Path) -> Result<MyApp> {
        Ok(MyApp { generator: Generator::new(base.into())? })
    }

    async fn hello_world(&self, req: Request<Body>) -> http::Result<Response<Body>> {
        let rel: String = clean(&url_escape::decode(req.uri().path()));
        let path = self.generator.base.join(&rel.strip_prefix("/").unwrap());
        println!("Raw path: {} | Sanitized path: {}", req.uri().path(), path.display());

        let params = req.params();

        // Reading thumbnail of a file
        if params.contains_key("thumb") {
            if !path.is_file() { return "Error: File not found".to_string().resp(404) }
            return match self.generator.get_thumb(&PathBuf::from(path.to_owned())) {
                Ok(vec) => { vec.resp(200) }
                Err(e) => { e.to_string().resp(500) }
            }
        }

        // List files in directory
        let read_dir = match fs::read_dir(path) {
            Ok(file) => { file }
            Err(e) => {
                let e_str = format!("Error {e}");
                if e.raw_os_error() == Some(2) { return e_str.resp(404) }
                return e_str.resp(500)
            }
        };

        let paths: Vec<ReturnPath> = read_dir
            .filter_map(|x| x.ok())
            .filter_map(|x| {
                let m = x.metadata().ok()?;
                let mime = if x.path().is_file() { self.generator.get_mime(&x.path()).ok() } else { None };
                Some(ReturnPath {
                    name: x.file_name().to_str()?.to_string(),
                    file_type: x.path().file_type().to_string(),
                    mtime: m.mtime() * 1000,
                    size: m.len(),
                    mime: mime.to_owned(),
                    has_thumb: mime.is_some() && self.generator.thumbnailers.find(&*mime.unwrap()).is_some()
                })
            }).collect();

        match serde_json::to_string(&paths) {
            Ok(json) => { json.resp(200) }
            Err(e) => { e.to_string().resp(500) }
        }
    }
}
