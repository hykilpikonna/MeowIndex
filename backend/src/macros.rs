use std::collections::HashMap;
use std::path::PathBuf;
use duplicate::duplicate_item;
use hyper::{Body, header, http, Request, Response, StatusCode};

pub trait Resp {
    fn resp(&self, status: u16) -> http::Result<Response<Body>>;
}

#[duplicate_item(name; [String]; [Vec<u8>])]
impl Resp for name {
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

pub trait RequestExt {
    fn params(&self) -> HashMap<String, String>;
}

impl <T> RequestExt for Request<T> {
    fn params(&self) -> HashMap<String, String> {
        self.uri().query()
            .map(|v| url::form_urlencoded::parse(v.as_bytes()).into_owned().collect())
            .unwrap_or_else(HashMap::new)
    }
}
