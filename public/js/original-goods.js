/* Own-product links are measured separately from affiliate clicks. */
(function () {
  'use strict';
  if (window.__kmnOriginalGoods) return;
  window.__kmnOriginalGoods = true;
  function blocked() {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true) return true;
    try { return localStorage.getItem('kmnAnalyticsOptOut') === '1'; } catch (_) { return true; }
  }
  function send(name, params) {
    try {
      if (blocked() || typeof window.gtag !== 'function') return;
      if (!['kininarumono.jp', 'kininarumono-techo.web.app'].includes(location.hostname)) return;
      window.gtag('event', name, Object.assign({
        page_location: 'https://kininarumono.jp' + location.pathname,
        page_referrer: '',
        page_kind: location.pathname === '/original-goods' ? 'original_goods' : 'top'
      }, params));
    } catch (_) { /* Measurement must never prevent navigation. */ }
  }
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented) return;
    var link = event.target.closest && event.target.closest('a[data-rb-design],a[data-goods-open]');
    if (!link) return;
    if (link.hasAttribute('data-goods-open')) {
      send('original_goods_open', { placement: 'home' });
      return;
    }
    var id = link.getAttribute('data-rb-design');
    var kind = link.getAttribute('data-rb-product');
    if (!/^[a-z0-9-]{1,40}$/.test(id || '') || !['tshirt', 'sticker'].includes(kind)) return;
    try {
      var destination = new URL(link.href, location.href);
      if (destination.hostname !== 'www.redbubble.com' || !destination.pathname.startsWith('/i/')) return;
    } catch (_) { return; }
    send('redbubble_click', {
      item_id: id, item_brand: 'KokoKikaku',
      item_name: (link.getAttribute('data-rb-name') || '').slice(0, 80),
      item_category: 'original_' + kind
    });
  });
  var filters = Array.from(document.querySelectorAll('[data-goods-filter]'));
  var cards = Array.from(document.querySelectorAll('[data-goods-group]'));
  var count = document.querySelector('[data-goods-count]');
  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-goods-filter');
      if (!['all', 'japan', 'asia'].includes(value)) return;
      filters.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      var visible = 0;
      cards.forEach(function (card) {
        card.hidden = value !== 'all' && card.getAttribute('data-goods-group') !== value;
        if (!card.hidden) visible++;
      });
      if (count) count.textContent = visible + '作品を表示';
    });
  });
})();
