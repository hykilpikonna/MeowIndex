# MeowIndex

A cute, feature-rich file listing module to replace Nginx autoindex/fancyindex and Caddy directory browse.

![image](https://user-images.githubusercontent.com/22280294/219513952-736182cb-a38a-4a49-b9ea-f9160399987c.png)

## Demo

* HyDEV ArchLinux Repo: https://arch.hydev.org/
* HyDEV Backup CDN: https://cdn.hydev.org/backup/

## Features

* [x] List files with cute icons and dark theme
* [x] Clickable, length-safe breadcrumb path
* [x] Live instant file search filter (press `/`)
* [x] Wget recursive clone helper with 1-click copy
* [x] Formatted file sizes & relative timestamps
* [x] Mobile responsive layout
* [x] **Caddy Native Support** (Server-Side Rendered, zero build step needed)
* [x] **Nginx Support** (SolidJS SPA + autoindex JSON)

**Features requiring Rust backend (Nginx mode)**

* [x] Show image/video previews
* [x] Use file binary to determine mime type

---

## Usage with Caddy (Recommended)

Caddy natively renders directory listings on the server using Go templates. No Node.js, build steps, or background processes required!

### 1. Copy or Clone the Template

```sh
git clone https://github.com/hykilpikonna/MeowIndex /etc/caddy/MeowIndex
```

### 2. Configure `Caddyfile`

Add `browse` pointing to [`docs/meowindex.html`](docs/meowindex.html):

```caddyfile
your.domain.com {
    root * /data/file-server

    file_server {
        browse /etc/caddy/MeowIndex/docs/meowindex.html
    }
}
```

---

## Usage with Nginx

### 1. Installation

```sh
cd /etc/nginx
git clone https://github.com/hykilpikonna/MeowIndex
cd MeowIndex
yarn install
yarn build
```

To update, simply run `git pull` and `yarn build`.

### 2. Setup File Listing in Nginx

The following example serves `/data/file-server` on http path `/`:

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

Check out our [example configs](docs/examples) for more configurations.
