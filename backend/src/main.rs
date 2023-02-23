#[macro_use]
mod macros;
mod generator;
mod utils;
mod thumbnailer;

use std::convert::Infallible;
use std::{env, fs};
use std::net::SocketAddr;
use std::os::unix::fs::MetadataExt;
use hyper::{Body, http, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};
use path_clean::{clean};
use macros::StringExt;
use crate::macros::PathExt;
use generator::*;

extern crate pretty_env_logger;
#[macro_use] extern crate log;

#[tokio::main]
async fn main() {
    let cwd = env::current_dir().unwrap();
    let addr = SocketAddr::from(([127, 0, 0, 1], 3029));
    info!("Serving {} started on http://127.0.0.1:3029", cwd.display());

    // A `Service` is needed for every connection, so this
    // creates one from our `hello_world` function.
    let make_svc = make_service_fn(|_conn| async {
        // service_fn converts our function into a `Service`
        Ok::<_, Infallible>(service_fn(hello_world))
    });

    let server = Server::bind(&addr).serve(make_svc);

    // Run this server for... forever!
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}

async fn hello_world(_req: Request<Body>) -> http::Result<Response<Body>> {
    let path = format!(".{}", clean(_req.uri().path()));
    println!("Raw path: {} | Sanitized path: {path}", _req.uri().path());

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
        .filter_map(|x| Some(ReturnPath {
            name: x.file_name().to_str()?.to_string(),
            file_type: x.path().file_type().to_string(),
            mtime: x.metadata().ok()?.mtime(),
        })).collect();

    match serde_json::to_string(&paths) {
        Ok(json) => { json.resp(200) }
        Err(e) => { e.to_string().resp(500) }
    }
}
