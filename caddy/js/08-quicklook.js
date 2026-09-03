function isMobile() {
      return window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
    }

    const extLangMap = {
      go: 'go', py: 'python', rs: 'rust',
      js: 'javascript', mjs: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
      json: 'json', html: 'xml', xml: 'xml', css: 'css', scss: 'scss',
      sh: 'bash', bash: 'bash', zsh: 'bash',
      md: 'markdown', markdown: 'markdown',
      yaml: 'yaml', yml: 'yaml', toml: 'ini',
      c: 'c', cpp: 'cpp', h: 'c', java: 'java', sql: 'sql'
    };

    function copyQuickLookContents(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (!currentQuickLookText) return;
      navigator.clipboard.writeText(currentQuickLookText).then(() => {
        if (quickLookCopyBtn && quickLookCopyLabel) {
          quickLookCopyBtn.classList.add('copied');
          quickLookCopyLabel.textContent = 'Copied!';
          setTimeout(() => {
            quickLookCopyBtn.classList.remove('copied');
            quickLookCopyLabel.textContent = 'Copy';
          }, 1200);
        }
      });
    }

    function showQuickLook(el, pinned = false) {
      if (isMobile() || !el || !quickLookModal || !quickLookBody) return;
      currentPreviewItem = el;

      const isDir = el.dataset.isdir === '1';
      const name = el.dataset.name || '';
      const url = el.getAttribute('href') || '';
      const sizeEl = el.querySelector('.file-size');
      const sizeText = sizeEl ? sizeEl.textContent.trim() : '';
      const sp = name.split('.');
      const ext = sp.length > 1 ? sp[sp.length - 1].toLowerCase() : '';

      quickLookTitle.textContent = name;
      quickLookMeta.textContent = isDir ? 'Folder' : (sizeText !== '-' ? sizeText : '');
      quickLookBody.innerHTML = '';

      const images = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif', 'ico'];
      const videos = ['mp4', 'webm', 'mov', 'm4v'];
      const audios = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
      const texts = ['txt', 'md', 'json', 'py', 'js', 'ts', 'css', 'html', 'log', 'sh', 'yaml', 'yml', 'toml', 'rs', 'go', 'c', 'cpp', 'java', 'sql'];

      if (isDir) {
        if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'none';
        currentQuickLookText = '';
        quickLookBody.innerHTML = `
          <div class="quicklook-folder-preview">
            <img src="/mime/folder.svg" alt="folder" />
            <span style="color: var(--color-emp); font-weight: 700; font-size: 1.1rem;">${name}</span>
            <span style="color: var(--color-sub); font-size: 0.8rem;">Folder</span>
          </div>
        `;
      } else if (images.includes(ext)) {
        if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'none';
        currentQuickLookText = '';
        const img = document.createElement('img');
        img.src = url;
        img.alt = name;
        quickLookBody.appendChild(img);
      } else if (videos.includes(ext)) {
        if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'none';
        currentQuickLookText = '';
        const vid = document.createElement('video');
        vid.src = url;
        vid.autoplay = true;
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.controls = true;
        quickLookBody.appendChild(vid);
      } else if (audios.includes(ext)) {
        if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'none';
        currentQuickLookText = '';
        const aud = document.createElement('audio');
        aud.src = url;
        aud.autoplay = true;
        aud.controls = true;
        quickLookBody.appendChild(aud);
      } else if (texts.includes(ext)) {
        if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'inline-flex';
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = 'hljs';
        code.textContent = 'Loading preview...';
        pre.appendChild(code);
        quickLookBody.appendChild(pre);

        fetch(url)
          .then(r => r.text())
          .then(t => {
            currentQuickLookText = t;
            const lang = extLangMap[ext];
            if (window.hljs && lang) {
              try {
                code.innerHTML = hljs.highlight(t.slice(0, 30000), { language: lang, ignoreIllegals: true }).value;
                return;
              } catch (e) {}
            }
            if (window.hljs) {
              try {
                code.innerHTML = hljs.highlightAuto(t.slice(0, 30000)).value;
                return;
              } catch (e) {}
            }
            code.textContent = t.slice(0, 30000);
          })
          .catch(() => {
            code.textContent = 'Failed to load preview.';
            currentQuickLookText = '';
          });
      } else {
        if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'none';
        currentQuickLookText = '';
        quickLookBody.innerHTML = `
          <div class="quicklook-folder-preview">
            <img src="/mime/application-blank.svg" alt="" onerror="this.src='/mime/folder.svg'" />
            <span style="color: var(--color-emp); font-weight: 700;">${name}</span>
            <span style="color: var(--color-sub); font-size: 0.8rem;">${ext.toUpperCase()} File (${sizeText})</span>
          </div>
        `;
      }

      quickLookModal.classList.add('active');
      if (pinned) {
        pinQuickLook();
      } else if (!isPinned) {
        quickLookWindow.classList.remove('is-pinned');
      }
    }

    function pinQuickLook() {
      isPinned = true;
      if (quickLookWindow) {
        quickLookWindow.classList.add('is-pinned');
      }
    }

    function hideQuickLook() {
      currentPreviewItem = null;
      currentQuickLookText = '';
      if (quickLookCopyBtn) quickLookCopyBtn.style.display = 'none';
      if (quickLookModal) {
        quickLookModal.classList.remove('active');
      }
      if (quickLookBody) {
        const media = quickLookBody.querySelectorAll('video, audio');
        media.forEach(m => { m.pause(); m.src = ''; });
        quickLookBody.innerHTML = '';
      }
    }

    function closeQuickLook(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      isPinned = false;
      currentPreviewItem = null;
      if (quickLookWindow) {
        quickLookWindow.classList.remove('is-pinned');
        // Reset custom position/size on full close
        if (hasCustomPosition) {
          quickLookWindow.style.position = '';
          quickLookWindow.style.left = '';
          quickLookWindow.style.top = '';
          quickLookWindow.style.width = '';
          quickLookWindow.style.height = '';
          quickLookWindow.style.maxWidth = '';
          quickLookWindow.style.maxHeight = '';
          quickLookWindow.style.margin = '';
          quickLookWindow.style.transform = '';
          hasCustomPosition = false;
        }
      }
      hideQuickLook();
    }

    // Drag to Move Quick Look Window
