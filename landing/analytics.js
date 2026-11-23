/* Optional, anonymous event counter. Never sends form fields, tokens, cookies, or IP. */
(function () {
  const endpoint = window.PAVEL_ANALYTICS_ENDPOINT;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) return;
  const allowed = new Set([
    '/', '/telegram/', '/max/', '/vk/', '/whatsapp/',
    '/ai-bots/', '/bot-dlya-zapisi/', '/bot-dlya-zayavok/'
  ]);
  const page = window.location.pathname;
  if (!allowed.has(page)) return;

  function source() {
    if (!document.referrer) return 'direct';
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host === location.hostname) return 'direct';
      if (host === 'google.com' || host.endsWith('.google.com') || host.startsWith('google.')) return 'google';
      if (host === 'yandex.ru' || host.endsWith('.yandex.ru') || host.startsWith('yandex.')) return 'yandex';
      if (host === 'bing.com' || host.endsWith('.bing.com')) return 'bing';
      if (/^(t\.me|telegram\.org|vk\.com|m\.vk\.com|instagram\.com|l\.instagram\.com|facebook\.com|m\.facebook\.com)$/.test(host)) return 'social';
      return 'other';
    } catch (_) {
      return 'other';
    }
  }

  const currentSource = source();
  function track(event) {
    if (!['page_view', 'telegram_click', 'brief_copy'].includes(event)) return;
    const body = JSON.stringify({ event, page, source: currentSource });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(
        endpoint, new Blob([body], { type: 'text/plain' })
      )) return;
    } catch (_) { /* best-effort analytics must never interrupt ordering */ }
    try {
      fetch(endpoint, {
        method: 'POST', mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain' },
        body, keepalive: true
      }).catch(() => {});
    } catch (_) { /* tracking is optional */ }
  }

  window.pavelTrack = track;
  track('page_view');

  document.addEventListener('click', function (event) {
    const element = event.target?.closest?.('a[href]');
    if (!element) return;
    try {
      const url = new URL(element.href);
      if (url.hostname === 't.me' && url.pathname === '/pavel_chatbots_bot') {
        track('telegram_click');
      }
    } catch (_) { /* invalid link does not affect navigation */ }
  });
})();
