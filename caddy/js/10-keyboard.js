if (fileListEl) {
      fileListEl.addEventListener('mouseover', (e) => {
        if (isMobile()) return;
        const item = e.target.closest('.file-item');
        if (item && item.getAttribute('href') !== '..') {
          if (currentHoveredItem !== item) {
            currentHoveredItem = item;
            if (isSpaceDown) {
              hasSwitchedSubject = true;
              showQuickLook(item, isPinned);
            }
          }
        }
      });

      fileListEl.addEventListener('mouseout', (e) => {
        const related = e.relatedTarget ? e.relatedTarget.closest('.file-item') : null;
        if (!related) {
          currentHoveredItem = null;
        }
      });
    }

    // Global Key Handlers for Space Quick Look and Navigation
    window.addEventListener('keydown', (e) => {
      // Ctrl+F / Cmd+F activates file search filter
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        activateSearch();
        return;
      }

      // Space Quick Look
      if (e.key === ' ' || e.code === 'Space') {
        if (isMobile() || searchOn || document.activeElement === searchInp) {
          return; // Let user type spaces in search input or skip on mobile
        }
        e.preventDefault(); // Prevent browser window scroll
        if (e.repeat) return; // Prevent repeat triggers while holding

        const visible = getVisibleItems().filter(el => el.getAttribute('href') !== '..');
        const target = currentHoveredItem || (selectedIdx >= 0 ? getVisibleItems()[selectedIdx] : null);

        // When the preview window is already open:
        if (quickLookModal && quickLookModal.classList.contains('active')) {
          if (target && target !== currentPreviewItem) {
            // Hovering over something else: show that something else's preview instead of closing!
            spacePressTime = performance.now();
            hasSwitchedSubject = false;
            isSpaceDown = true;
            showQuickLook(target, isPinned);
            return;
          } else {
            // Space pressed while hovering over the same file (or hovering over nothing): close it!
            closeQuickLook();
            return;
          }
        }

        // Preview window is not open: open it!
        spacePressTime = performance.now();
        hasSwitchedSubject = false;
        isSpaceDown = true;

        const openTarget = target || (visible.length > 0 ? visible[0] : null);
        if (openTarget) {
          showQuickLook(openTarget, false);
        }
        return;
      }

      // Escape closes Quick Look if active
      if (e.key === 'Escape') {
        if (quickLookModal && quickLookModal.classList.contains('active')) {
          closeQuickLook();
          return;
        }
      }

      // Arrow navigation
      if (!searchOn) {
        if (e.key === '/') {
          e.preventDefault();
          activateSearch();
        } else if (e.key === 'ArrowDown' || e.key === 'j') {
          e.preventDefault();
          const visible = getVisibleItems();
          if (visible.length > 0) {
            setSelected(Math.min(selectedIdx + 1, visible.length - 1));
            if ((isSpaceDown || isPinned) && visible[selectedIdx]) {
              hasSwitchedSubject = true;
              showQuickLook(visible[selectedIdx], isPinned);
            }
          }
        } else if (e.key === 'ArrowUp' || e.key === 'k') {
          e.preventDefault();
          const visible = getVisibleItems();
          if (visible.length > 0) {
            if (selectedIdx <= 0) {
              setSelected(0);
            } else {
              setSelected(selectedIdx - 1);
            }
            if ((isSpaceDown || isPinned) && visible[selectedIdx]) {
              hasSwitchedSubject = true;
              showQuickLook(visible[selectedIdx], isPinned);
            }
          }
        } else if (e.key === 'Enter' && selectedIdx >= 0) {
          e.preventDefault();
          const visible = getVisibleItems();
          if (visible[selectedIdx]) visible[selectedIdx].click();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        if (searchOn || document.activeElement === searchInp) {
          return;
        }
        const elapsed = performance.now() - spacePressTime;
        isSpaceDown = false;

        // If the window is pinned, it stays open!
        if (isPinned) {
          return;
        }

        // Quick press & release (< 250ms) without switching files: PIN the window!
        if (elapsed < 250 && !hasSwitchedSubject && quickLookModal.classList.contains('active')) {
          pinQuickLook();
        } else {
          // Long press / hold: close when Space is released
          hideQuickLook();
        }
      }
    });

    window.addEventListener('scroll', () => {
      if (isSpaceDown && !isPinned) {
        isSpaceDown = false;
        hideQuickLook();
      }
    }, { passive: true });

    window.addEventListener('blur', () => {
      if (isSpaceDown && !isPinned) {
        isSpaceDown = false;
        hideQuickLook();
      }
    });
