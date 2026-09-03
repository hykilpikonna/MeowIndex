if (quickLookHeader) {
      quickLookHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.quicklook-close')) return;
        if (!isPinned) pinQuickLook();

        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;

        const rect = quickLookWindow.getBoundingClientRect();
        winStartX = rect.left;
        winStartY = rect.top;

        quickLookWindow.style.position = 'fixed';
        quickLookWindow.style.left = `${winStartX}px`;
        quickLookWindow.style.top = `${winStartY}px`;
        quickLookWindow.style.margin = '0';
        quickLookWindow.style.transform = 'none';
        quickLookHeader.style.cursor = 'grabbing';
        hasCustomPosition = true;

        e.preventDefault();
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        const newLeft = Math.max(8, Math.min(winStartX + dx, window.innerWidth - quickLookWindow.offsetWidth - 8));
        const newTop = Math.max(8, Math.min(winStartY + dy, window.innerHeight - quickLookWindow.offsetHeight - 8));
        quickLookWindow.style.left = `${newLeft}px`;
        quickLookWindow.style.top = `${newTop}px`;
      } else if (isResizing && resizeDir && resizeStartRect) {
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;
        let { left, top, width, height, right, bottom } = resizeStartRect;

        // Horizontal resizing
        if (resizeDir.includes('e')) {
          width = Math.max(320, Math.min(width + dx, window.innerWidth - left - 10));
        } else if (resizeDir.includes('w')) {
          const maxLeftShift = right - 320;
          const proposedLeft = Math.max(8, Math.min(left + dx, maxLeftShift));
          width = right - proposedLeft;
          left = proposedLeft;
        }

        // Vertical resizing
        if (resizeDir.includes('s')) {
          height = Math.max(220, Math.min(height + dy, window.innerHeight - top - 10));
        } else if (resizeDir.includes('n')) {
          const maxTopShift = bottom - 220;
          const proposedTop = Math.max(8, Math.min(top + dy, maxTopShift));
          height = bottom - proposedTop;
          top = proposedTop;
        }

        quickLookWindow.style.left = `${left}px`;
        quickLookWindow.style.top = `${top}px`;
        quickLookWindow.style.width = `${width}px`;
        quickLookWindow.style.height = `${height}px`;
        quickLookWindow.style.maxWidth = 'none';
        quickLookWindow.style.maxHeight = 'none';
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (quickLookHeader) quickLookHeader.style.cursor = 'grab';
      }
      if (isResizing) {
        isResizing = false;
        resizeDir = null;
        resizeStartRect = null;
      }
    });

    // 8-Direction Resize Handles Event Binding
    document.querySelectorAll('.ql-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        if (!isPinned) pinQuickLook();
        isResizing = true;
        resizeDir = handle.dataset.dir;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;

        const rect = quickLookWindow.getBoundingClientRect();
        resizeStartRect = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        };

        if (!hasCustomPosition) {
          quickLookWindow.style.position = 'fixed';
          quickLookWindow.style.left = `${rect.left}px`;
          quickLookWindow.style.top = `${rect.top}px`;
          quickLookWindow.style.margin = '0';
          quickLookWindow.style.transform = 'none';
          hasCustomPosition = true;
        }

        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Track mouseover across file items for dynamic preview update while Space is held
