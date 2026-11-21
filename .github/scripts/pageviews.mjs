function countPageview(websiteId, allowedPaths) {
  const production = 'https://subtlesayak.github.io';
  const page = new URL(location.href);
  const path = page.pathname.replace(/\/index\.html$/, '/');
  if (page.origin !== production || !allowedPaths.includes(path)) return;

  let referrer = '';
  try {
    const source = new URL(document.referrer);
    if (/^https?:$/.test(source.protocol) && source.origin !== production) referrer = source.origin;
  } catch {}

  const tracker = document.createElement('script');
  tracker.src = 'https://cloud.umami.is/script.js';
  tracker.referrerPolicy = 'no-referrer';
  tracker.dataset.websiteId = websiteId;
  tracker.dataset.autoTrack = 'false';
  tracker.dataset.domains = page.hostname;
  tracker.dataset.excludeSearch = 'true';
  tracker.dataset.excludeHash = 'true';
  tracker.addEventListener('load', () => {
    try {
      window.umami?.track(defaults => ({
        website: websiteId,
        hostname: page.hostname,
        url: path,
        referrer,
        screen: defaults.screen,
        language: defaults.language,
      }))?.catch?.(() => {});
    } catch {}
  }, {once: true});
  document.head.append(tracker);
}
