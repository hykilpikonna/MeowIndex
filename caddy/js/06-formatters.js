function updateSummary(visibleCount) {
      if (!listSummary) return;
      const allItems = document.querySelectorAll('#fileList .file-item:not([href=".."])');
      const total = allItems.length;

      if (searchOn && searchInp && searchInp.value.trim().length > 0) {
        listSummary.textContent = `Showing ${visibleCount} of ${total} item${total === 1 ? '' : 's'}`;
        return;
      }

      let folders = 0;
      let files = 0;
      allItems.forEach(el => {
        if (el.dataset.isdir === '1') folders++;
        else files++;
      });
      const parts = [];
      if (folders > 0) parts.push(`${folders} folder${folders === 1 ? '' : 's'}`);
      if (files > 0) parts.push(`${files} file${files === 1 ? '' : 's'}`);
      listSummary.textContent = parts.length > 0 ? `${parts.join(', ')} (${total} total)` : 'Directory is empty';
    }
    updateSummary();

    // 7. Search Filter & Keyboard Navigation

    // 9. Relative Timestamps
    function formatRelativeDates() {
      const now = new Date();
      document.querySelectorAll('#fileList time[datetime]').forEach(el => {
        const dt = new Date(el.getAttribute('datetime'));
        if (isNaN(dt.getTime())) return;
        const diff = Math.floor((now - dt) / 1000);
        if (diff < 45) {
          el.textContent = 'a few seconds ago';
        } else if (diff < 90) {
          el.textContent = 'a minute ago';
        } else if (diff < 2700) {
          el.textContent = `${Math.round(diff / 60)} minutes ago`;
        } else if (diff < 5400) {
          el.textContent = 'an hour ago';
        } else if (diff < 79200) {
          el.textContent = `${Math.round(diff / 3600)} hours ago`;
        } else if (diff < 129600) {
          el.textContent = 'yesterday';
        } else if (diff < 2160000) {
          el.textContent = `${Math.round(diff / 86400)} days ago`;
        } else if (diff < 5184000) {
          el.textContent = 'a month ago';
        } else {
          el.textContent = `${Math.round(diff / 2592000)} months ago`;
        }
      });
    }
    formatRelativeDates();
