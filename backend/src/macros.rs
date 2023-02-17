macro_rules! resp {
    ($status:expr) => {
        Response::builder().status($status)
    };
}

macro_rules! ok {
    () => {
        resp!(StatusCode::OK)
    };
}
