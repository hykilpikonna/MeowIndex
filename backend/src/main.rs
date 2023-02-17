#[macro_use]
mod macros;

use std::convert::Infallible;
use std::{env, fs};
use std::net::SocketAddr;
use std::os::unix::fs::MetadataExt;
use hyper::{Body, http, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};
use serde::{Deserialize, Serialize};
use path_clean::{clean};
use macros::StringExt;

#[tokio::main]
async fn main() {
    let cwd = env::current_dir().unwrap();
    let addr = SocketAddr::from(([127, 0, 0, 1], 3029));
    println!("Serving {} started on http://127.0.0.1:3029", cwd.display());

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

#[derive(Serialize, Deserialize)]
struct ReturnPath {
    name: String,
    file_type: String,
    mtime: i64
}

async fn hello_world(_req: Request<Body>) -> http::Result<Response<Body>> {
    let path = format!(".{}", clean(_req.uri().path()));
    println!("{path}");

    // List files in directory
    let read_dir = match fs::read_dir(path) {
        Ok(file) => {file}
        Err(e) => {
            let e_str = format!("Error {e}");
            if e.raw_os_error() == Some(2) { return e_str.resp(404) }
            return e_str.resp(500)
        }
    };

    let paths: Vec<ReturnPath> = read_dir
        .map(|x| x.unwrap())
        .map(|x| ReturnPath {
            name: x.file_name().to_str().unwrap().parse().unwrap(),
            file_type: if x.path().is_file() { "file" } else { "directory" }.parse().unwrap(),
            mtime: x.metadata().unwrap().mtime(),
        }).collect();

    serde_json::to_string(&paths).unwrap().resp(200)
}
