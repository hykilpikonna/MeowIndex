# MeowIndex

A cute, feature-rich file listing module to replace nginx's autoindex / fancyindex.

## How to use

### 1. Installation

You can install from source by cloning the repository:

```sh
cd /etc/nginx
git clone https://github.com/hykilpikonna/MeowIndex
cd MeowIndex
yarn install
yarn build
```

To update, simply do `git pull` and `yarn build` in the same directory.

### 2. Setup File API in Nginx

This module uses the json file listing api in nginx. If you already have an autoindex file server set up, you can make the following changes. If you're new to nginx, you can check out our [full example config](docs/example.nginx.conf).

The following example serves `/data/file-server` on http path `/`

```diff
- location ^~ / {
-     alias "/data/file-server";
-     fancyindex on;
-     fancyindex_exact_size off;
- }

+ location ^~ /api {
+     alias "/data/file-server";
+     autoindex on;
+     autoindex_format json;
+     add_header Access-Control-Allow-Origin *;
+ }
```

### 3. Setup File Listing UI

You can setup the file listing web UI in three different ways.  

* If you want to deploy on a standalone domain (e.g. `https://files.example.com`), follow Option 1.  
* If you want to deploy on a sub-path of an existing domain (e.g. `https://example.com/files`), follow Option 2.

#### Option 1: Deploying to a standalone domain

Add the following location block to the same server block as your file api.

```nginx.conf
location ^~ / {
    alias /etc/nginx/MeowIndex/dist;

    # Use sub_filter to configure the app
    sub_filter_types application/javascript;
    sub_filter_once on;
    sub_filter "{HOST-PLACEHOLDER}" "/api";

    # Serve index.html on other 404 paths as well
    try_files $uri $uri/ /index.html;
}
```

#### Option 2: Deploying to a path of an existing domain

Add the following location block to the same server block as your file api, and replace the following:

* Replace `/data` with the path you want to deploy to
* Replace `/api` with your api endpoint

```nginx.conf
location ^~ /data {
    alias /etc/nginx/MeowIndex/dist;

    # Use sub_filter to configure the app
    sub_filter_types application/javascript;
    sub_filter_once off;
    sub_filter "{DEPLOY-PATH-PLACEHOLDER}" "/data";
    sub_filter "{HOST-PLACEHOLDER}" "/api";
    sub_filter "\"/assets" "\"/data/assets";

    # Serve index.html on other 404 paths as well
    try_files $uri $uri/ /data/index.html;
}
```