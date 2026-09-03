# Caddy Setup

## 1. Installation

Clone the repository to `/etc/caddy/MeowIndex` (or your preferred directory):

```sh
git clone https://github.com/hykilpikonna/MeowIndex /etc/caddy/MeowIndex
```

*(No build or compile steps needed for Caddy — `docs/meowindex.html` is ready out of the box!)*

---

## 2. Configuration Examples

### Example A: Public Domain with Automatic HTTPS

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

### Example B: Tailscale Node / Private Tailnet

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

### Example C: Subdirectory Hosting (e.g. `example.com/downloads/`)

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

## 3. Customization

* **Change Title via `Caddyfile` (Recommended):** Add `header X-Site-Title "Your Custom Title"` to your Caddyfile block:
  ```caddyfile
  files.yourdomain.com {
      root * /data/file-server
      header X-Site-Title "HyDEV ArchLinux Mirror"
      # ...
  }
  ```
* **Change Title via Template:** Alternatively, edit line 2 in [`caddy/template.html`](../caddy/template.html) or [`docs/meowindex.html`](meowindex.html).
* **Colors & Accents:** Tweak CSS variables under `:root` in [`caddy/css/01-vars.css`](../caddy/css/01-vars.css), then rebuild the template:
  ```sh
  npm run build:caddy
  ```
