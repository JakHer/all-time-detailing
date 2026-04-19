export function scrollPageToTop() {
  if (typeof window === 'undefined') {
    return;
  }

  const applyScroll = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  window.requestAnimationFrame(() => {
    applyScroll();
    window.setTimeout(applyScroll, 0);
  });
}
