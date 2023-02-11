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

This module uses the json file listing api in nginx. If you already have an autoindex file server set up, you can make the following changes. If you're new to nginx, you can check out our [example configs](docs/examples).

The following example serves `/data/file-server` on http path `/`

```nginx.conf
server_name your.domain.com;

root /your/file/server/location;

# Serve an index file for your home page (if you want one)
location = / {
    index index.html;
}

include "/etc/nginx/MeowIndex/docs/nginx.conf";
```

### 3. Setup File Listing UI

You can setup the file listing web UI in two different ways.  

* If you want to deploy on a standalone domain (e.g. `https://files.example.com`), follow Option 1.  
* If you want to deploy on a sub-path of an existing domain (e.g. `https://example.com/files`), follow Option 2.

#### Option 1: Deploying to a standalone domain

Add the following location block to the same server block as your file api.

```diff
- location / {
-     fancyindex on;
-     fancyindex_exact_size off;
- }

+ # If no file is found on any path, serve meowindex 
+ location / {
+     try_files $uri /__meowindex__/index.html;
+ }
```

#### Option 2: Deploying to a path of an existing domain

Add the following location block to the same server block as your file api, and replace `/data` with the path you want to deploy to.

```diff
- location /data {
-     fancyindex on;
-     fancyindex_exact_size off;
- }

+ # If no file is found on any path, serve meowindex 
+ location /data {
+     try_files $uri /__meowindex__/index.html;
+ }
```