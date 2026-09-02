# MeowIndex

A cute, feature-rich file listing theme and module for **Caddy** and **Nginx**.

![image](https://user-images.githubusercontent.com/22280294/219513952-736182cb-a38a-4a49-b9ea-f9160399987c.png)

## Demo

* HyDEV ArchLinux Repo: https://arch.hydev.org/
* HyDEV Backup CDN: https://cdn.hydev.org/backup/

## Features

* [x] List files
* [x] Show file icons
* [x] Clickable, length-safe breadcrumb path
* [x] Quick Look previews (Space)
* [x] Search
* [x] Sort by name, size, or date
* [x] Streamlined wget helper
* [x] Relative timestamps and formatted sizes
* [x] Fix mobile view
* [x] Both Caddy and Nginx support

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
| **Search / Filter** | Press <kbd>Ctrl</kbd>+<kbd>F</kbd>, <kbd>Cmd</kbd>+<kbd>F</kbd>, <kbd>/</kbd>, or click 🔍 | Filter files in real-time. Press <kbd>Esc</kbd> to exit. |
| **Keyboard Nav** | <kbd>↓</kbd> / <kbd>↑</kbd> (or <kbd>j</kbd> / <kbd>k</kbd>) + <kbd>Enter</kbd> | Move focus highlight through files and press Enter to open. |
| **Column Sorting** | Click **Name**, **Size**, or **Date** header | Sort by filename, numeric byte size, or modification date. Folders stay pinned at the top. |
| **Quick Look** | Tap <kbd>Space</kbd> (pin) or Hold <kbd>Space</kbd> (scan) | Quick-tap Space to open a persistent, movable, and resizable preview window (close via <kbd>&times;</kbd>, <kbd>Esc</kbd>, or <kbd>Space</kbd>). Hold Space and move mouse or arrow keys to scan previews dynamically. |
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
