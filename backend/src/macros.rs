use std::path::PathBuf;
use hyper::{Body, header, http, Response, StatusCode};

pub trait StringExt {
    fn resp(&self, status: u16) -> http::Result<Response<Body>>;
}

impl StringExt for String {
    fn resp(&self, status: u16) -> http::Result<Response<Body>> {
        Response::builder().header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
            .status(StatusCode::from_u16(status).unwrap()).body(Body::from(self.to_owned()))
    }
}

pub trait PathExt {
    fn file_type(&self) -> &str;
}

impl PathExt for PathBuf {
    fn file_type(&self) -> &str {
        if self.is_file() { return "file" }
        if self.is_dir() { return "directory" }
        if self.is_symlink() { return "link" }
        "unknown"
    }
}
