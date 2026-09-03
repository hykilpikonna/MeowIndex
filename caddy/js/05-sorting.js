function toggleSort(col) {
      if (currentSort.col === col) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.col = col;
        currentSort.dir = (col === 'name') ? 'asc' : 'desc';
      }
      applySort();
    }

    function applySort() {
      ['name', 'size', 'mtime'].forEach(col => {
        const header = document.getElementById(`sort-${col}`);
        const arrow = document.getElementById(`arrow-${col}`);
        if (!header || !arrow) return;
        if (col === currentSort.col) {
          header.classList.add('active');
          arrow.textContent = currentSort.dir === 'asc' ? '▲' : '▼';
        } else {
          header.classList.remove('active');
          arrow.textContent = '';
        }
      });

      const items = Array.from(document.querySelectorAll('#fileList .file-item:not([href=".."])'));
      const goUp = document.querySelector('#fileList .file-item[href=".."]');

      items.sort((a, b) => {
        const isDirA = a.dataset.isdir === '1';
        const isDirB = b.dataset.isdir === '1';
        if (isDirA !== isDirB) return isDirA ? -1 : 1;

        let res = 0;
        if (currentSort.col === 'name') {
          res = (a.dataset.name || '').localeCompare(b.dataset.name || '', undefined, { numeric: true, sensitivity: 'base' });
        } else if (currentSort.col === 'size') {
          const sA = parseInt(a.dataset.size, 10) || 0;
          const sB = parseInt(b.dataset.size, 10) || 0;
          res = sA - sB;
        } else if (currentSort.col === 'mtime') {
          const tA = parseInt(a.dataset.mtime, 10) || 0;
          const tB = parseInt(b.dataset.mtime, 10) || 0;
          res = tA - tB;
        }
        return currentSort.dir === 'asc' ? res : -res;
      });

      if (goUp) fileListEl.appendChild(goUp);
      items.forEach(item => fileListEl.appendChild(item));
      if (noResults) fileListEl.appendChild(noResults);
    }

    // 6. Summary Status Bar
