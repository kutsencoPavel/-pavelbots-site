/* Optional, anonymous event counter. Never sends form fields, tokens, cookies, or IP. */
(function () {
  const endpoint = window.PAVEL_ANALYTICS_ENDPOINT;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) return;
  // Новые страницы начнут учитываться, когда сборщик добавит их в свой список (см. README).
  const allowed = new Set([
    '/', '/telegram/', '/max/', '/vk/', '/whatsapp/',
    '/ai-bots/', '/bot-dlya-zapisi/', '/bot-dlya-zayavok/',
    '/perenos-bota-v-max/', '/bot-dlya-salona-krasoty/', '/bot-dlya-avtoservisa/'
  ]);
  const page = window.location.pathname;
  if (!allowed.has(page)) return;

  // Категорию определяет script.js; набор значений прежний.
  const currentSource = window.pavelSource || 'direct';
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
