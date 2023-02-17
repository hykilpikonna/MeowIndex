use hyper::{Body, http, Response, StatusCode};

pub trait StringExt {
    fn resp(&self, status: u16) -> http::Result<Response<Body>>;
}

impl StringExt for String {
    fn resp(&self, status: u16) -> http::Result<Response<Body>> {
        Response::builder().status(StatusCode::from_u16(status).unwrap()).body(Body::from(self.to_owned()))
    }
}

// fn main() {
//     "a".resp()
// }
