/**
 * Align a homepage section using real layout, not off-screen height estimates
 * or the fixed header's pre-hydration fallback dimensions.
 */
export function scrollToAnchor(id, behavior = 'smooth') {
  const target = document.getElementById(id);
  if (!target) return false;

  if (id === 'home') {
    delete document.documentElement.dataset.anchorNavigation;
  } else {
    document.documentElement.dataset.anchorNavigation = id;
  }

  const topbar = document.querySelector('.topbar');
  const header = document.querySelector('header');
  if (topbar && header) {
    const topbarHeight = topbar.offsetHeight;
    const headerHeight = header.offsetHeight;
    if (topbarHeight + headerHeight > 0) {
      document.documentElement.style.setProperty('--topbar-h', `${topbarHeight}px`);
      document.documentElement.style.setProperty('--header-h', `${headerHeight}px`);
      document.documentElement.style.setProperty('--stack-h', `${topbarHeight + headerHeight}px`);
    }
  }

  target.scrollIntoView({ behavior, block: 'start' });
  return true;
}
