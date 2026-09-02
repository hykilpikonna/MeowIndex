# MeowIndex

A cute, feature-rich file listing theme and module for **Caddy** and **Nginx**.

![image](https://user-images.githubusercontent.com/22280294/219513952-736182cb-a38a-4a49-b9ea-f9160399987c.png)

## Demo

* HyDEV ArchLinux Repo: https://arch.hydev.org/
* HyDEV Backup CDN: https://cdn.hydev.org/backup/

## Features

* [x] **Original Dark Palette:** Warm aesthetic with `#ebadb6` pastel accents
* [x] **1,300+ WhiteSur Icons:** Rich SVG icons for images, audio, video, code, archives, and documents
* [x] **Length-Safe Breadcrumbs:** Clickable directory breadcrumbs with hostname root
* [x] **Live Instant Search:** Filter files in real-time by pressing `/` or clicking the search icon
* [x] **Streamlined Wget Helper:** 1-click clipboard copy for recursive `wget` commands with toast confirmation
* [x] **Formatted Timestamps & Sizes:** Relative timestamps (`a few seconds ago`, `2 hours ago`) and humanized file sizes
* [x] **Caddy Native (SSR):** Blazing fast, zero Node.js/Vite build steps, standard Caddy template
* [x] **Nginx Support:** SolidJS SPA + autoindex JSON mode

---

## Usage Guide (Caddy)

### 1. Installation

Clone the repository to `/etc/caddy/MeowIndex` (or your preferred directory):

```sh
git clone https://github.com/hykilpikonna/MeowIndex /etc/caddy/MeowIndex
```

*(No build or compile steps needed for Caddy!)*

---

### 2. Configuration Examples

#### Example A: Public Domain with Automatic HTTPS

```caddyfile
files.yourdomain.com {
    root * /data/file-server

    # Serve WhiteSur MIME icons
    handle /mime/* {
        root * /etc/caddy/MeowIndex/public
        file_server
    }

    # Serve directory browsing with MeowIndex template
    handle {
        file_server {
            browse /etc/caddy/MeowIndex/docs/meowindex.html
        }
    }

    # Enable compression
    encode zstd gzip
}
```

#### Example B: Tailscale Node / Private Tailnet

```caddyfile
your-node.tailnet-name.ts.net {
    root * /data/file-server

    handle /mime/* {
        root * /etc/caddy/MeowIndex/public
        file_server
    }

    handle {
        file_server {
            browse /etc/caddy/MeowIndex/docs/meowindex.html
        }
    }
}
```

#### Example C: Subdirectory Hosting (e.g. `example.com/downloads/`)

```caddyfile
example.com {
    handle_path /downloads/* {
        root * /data/file-server

        handle /mime/* {
            root * /etc/caddy/MeowIndex/public
            file_server
        }

        handle {
            file_server {
                browse /etc/caddy/MeowIndex/docs/meowindex.html
            }
        }
    }
}
```

---

### 3. How to Use & Shortcuts

| Action | How to Trigger | Description |
| :--- | :--- | :--- |
| **Search / Filter** | Press <kbd>/</kbd> anywhere or click 🔍 | Filter files in real-time. Press <kbd>Esc</kbd> to exit. |
| **Keyboard Nav** | <kbd>↓</kbd> / <kbd>↑</kbd> (or <kbd>j</kbd> / <kbd>k</kbd>) + <kbd>Enter</kbd> | Move focus highlight through files and press Enter to open. |
| **Column Sorting** | Click **Name**, **Size**, or **Date** header | Sort by filename, numeric byte size, or modification date. Folders stay pinned at the top. |
| **Quick Look** | Hold <kbd>Space</kbd> + move mouse (or arrow keys) | macOS-style Quick Look preview for images, videos, audio, text/code, and folders. Release to close. |
| **Copy Wget Clone** | Click **`>_`** in the toolbar | Copies recursive `wget` command to clipboard with inline `✓ Copied` feedback. |
| **Inspect Wget** | <kbd>Shift</kbd> + Click **`>_`** | Toggles collapsible command drawer. |
| **Breadcrumbs** | Click any path segment | Jump up to parent directories. Auto-scrolls and supports mouse-wheel. |

---

### 4. Customization

* **Change Title via `Caddyfile` (Recommended):** Add `header X-Site-Title "Your Custom Title"` to your Caddyfile block:
  ```caddyfile
  files.yourdomain.com {
      root * /data/file-server
      header X-Site-Title "HyDEV ArchLinux Mirror"
      # ...
  }
  ```
* **Change Title via Template:** Alternatively, edit line 2 in [`docs/meowindex.html`](docs/meowindex.html).
* **Colors & Accents:** Tweak CSS variables under `:root` in [`docs/meowindex.html`](docs/meowindex.html) (`--color-emp`, `--color-main`, `--bg-dark-800`).

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

### 2. Setup File Listing in Nginx

```nginx
server_name your.domain.com;

set $title "Meow Index";
set $dir_path /data/file-server;
include "/etc/nginx/MeowIndex/docs/nginx.conf";

location / {
    try_files $uri $uri/index.html /__meowindex__/index.html;
}
```
