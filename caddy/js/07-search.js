function getVisibleItems() {
      return Array.from(document.querySelectorAll('#fileList .file-item')).filter(el => el.style.display !== 'none');
    }

    function setSelected(idx) {
      const visible = getVisibleItems();
      visible.forEach(el => el.classList.remove('selected'));
      if (idx >= 0 && idx < visible.length) {
        selectedIdx = idx;
        visible[idx].classList.add('selected');
        visible[idx].scrollIntoView({ block: 'nearest' });
      } else {
        selectedIdx = -1;
      }
    }

    function activateSearch() {
      searchOn = true;
      closeQuickLook();
      if (breadcrumbsWrap) breadcrumbsWrap.style.display = 'none';
      if (searchInp) {
        searchInp.style.display = 'block';
        searchInp.focus();
        searchInp.select();
      }
      setSelected(-1);
    }

    function deactivateSearch() {
      searchOn = false;
      if (searchInp) {
        searchInp.value = '';
        searchInp.style.display = 'none';
      }
      if (breadcrumbsWrap) breadcrumbsWrap.style.display = 'block';
      filterFiles('');
      setSelected(-1);
    }

    function toggleSearch() {
      searchOn ? deactivateSearch() : activateSearch();
    }

    function filterFiles(query) {
      const q = query.trim().toLowerCase();
      const fileItems = document.querySelectorAll('#fileList .file-item:not([href=".."])');
      const goUp = document.querySelector('#fileList .file-item[href=".."]');
      let visible = 0;

      if (goUp) {
        goUp.style.display = q ? 'none' : 'flex';
      }

      fileItems.forEach(el => {
        const name = (el.dataset.name || '').toLowerCase();
        if (!q || name.includes(q)) {
          el.style.display = 'flex';
          visible++;
        } else {
          el.style.display = 'none';
        }
      });

      if (noResults) {
        noResults.style.display = (fileItems.length > 0 && visible === 0 && q) ? 'block' : 'none';
      }
      updateSummary(visible);
      setSelected(-1);
    }

    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        filterFiles(e.target.value);
      });

      searchInp.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          deactivateSearch();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const visible = getVisibleItems();
          if (visible.length > 0) {
            searchInp.blur();
            setSelected(0);
          }
        } else if (e.key === 'Enter') {
          const visible = getVisibleItems();
          if (visible.length === 1) {
            visible[0].click();
          }
        }
      });
    }

    // 8. macOS Quick Look (Hold Space or Quick-Tap Space to Pin, Movable & Resizable)
