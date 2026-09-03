# Nginx Setup

## 1. Installation

You can install from source by cloning the repository:

```sh
cd /etc/nginx
git clone https://github.com/hykilpikonna/MeowIndex
cd MeowIndex
yarn install
yarn build
```

To update, simply do `git pull` and `yarn build` in the same directory.

## 2. Setup File Listing in Nginx

This module uses the json file listing api in nginx. If you already have an autoindex file server set up, you can make the following changes. If you're new to nginx, you can check out our [example configs](examples).

The following example serves `/data/file-server` on http path `/`

```nginx
# ...
server_name your.domain.com;

set $title "Meow Index";
set $dir_path /data/file-server;
include "/etc/nginx/MeowIndex/docs/nginx.conf";

location / {
    try_files $uri $uri/index.html /__meowindex__/index.html;
}
```

## Advanced Usage

TODO
