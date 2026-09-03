const fullPath = window.location.pathname;
    const cleanPath = fullPath.endsWith('/') ? fullPath : `${fullPath}/`;
    const cutDirs = Math.max(0, cleanPath.split('/').filter(Boolean).length);
    const wgetCommand = `wget -r -np -nH -e robots=off -nc --cut-dirs=${cutDirs} ${window.location.origin}${cleanPath}`;
    if (wgetCmdEl) wgetCmdEl.textContent = wgetCommand;

    function copyWget() {
      navigator.clipboard.writeText(wgetCommand).then(() => {
        if (wgetBtn && wgetIcon && wgetLabel) {
          wgetBtn.classList.add('copied');
          wgetIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
          wgetLabel.style.display = 'inline';
          
          setTimeout(() => {
            wgetBtn.classList.remove('copied');
            wgetIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`;
            wgetLabel.style.display = 'none';
          }, 1200);
        }

        if (drawerCopyBtn) {
          drawerCopyBtn.textContent = 'Copied';
          setTimeout(() => drawerCopyBtn.textContent = 'Copy', 1200);
        }
      });
    }

    function handleWgetClick(e) {
      if (e.shiftKey || e.altKey) {
        if (wgetDrawer) wgetDrawer.classList.toggle('active');
      } else {
        copyWget();
      }
    }

    // 5. Column Sorting (Name / Size / Date)
