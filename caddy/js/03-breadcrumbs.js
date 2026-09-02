const hostRoot = document.querySelector('#breadcrumbsInner .host-root');
    if (hostRoot) {
      hostRoot.textContent = window.location.host;
    }

    function updateBreadcrumbsMask() {
      if (!breadcrumbsWrap) return;
      const sl = breadcrumbsWrap.scrollLeft;
      const maxScroll = breadcrumbsWrap.scrollWidth - breadcrumbsWrap.clientWidth;
      if (maxScroll <= 5) {
        breadcrumbsWrap.classList.remove('is-scrolled-left', 'is-scrolled-end');
      } else if (sl > 10 && sl < maxScroll - 10) {
        breadcrumbsWrap.classList.add('is-scrolled-left');
        breadcrumbsWrap.classList.remove('is-scrolled-end');
      } else if (sl >= maxScroll - 10) {
        breadcrumbsWrap.classList.remove('is-scrolled-left');
        breadcrumbsWrap.classList.add('is-scrolled-end');
      } else {
        breadcrumbsWrap.classList.remove('is-scrolled-left', 'is-scrolled-end');
      }
    }

    const scrollToEnd = () => {
      if (breadcrumbsWrap) {
        breadcrumbsWrap.scrollLeft = breadcrumbsWrap.scrollWidth - breadcrumbsWrap.clientWidth;
        updateBreadcrumbsMask();
      }
    };
    scrollToEnd();
    requestAnimationFrame(scrollToEnd);
    setTimeout(scrollToEnd, 100);

    if (breadcrumbsWrap) {
      breadcrumbsWrap.addEventListener('scroll', updateBreadcrumbsMask);
      breadcrumbsWrap.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && !e.shiftKey) {
          e.preventDefault();
          breadcrumbsWrap.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // 4. Wget Command & Inline Copy Feedback
