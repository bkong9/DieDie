/**
 * Meng Photography - shared app script
 * Loads nav via fetch (no jQuery), initializes GLightbox with data-lightbox compat
 */
(function () {
  'use strict';

  function loadNav() {
    var el = document.getElementById('includedContent');
    if (!el) return;
    var nav = el.getAttribute('data-nav');
    if (!nav) return;
    var base = el.getAttribute('data-base') || '';
    var url = base + nav;
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        el.innerHTML = html;
      })
      .catch(function () {
        el.innerHTML = '<p class="p-3 text-muted">Navigation could not be loaded.</p>';
      });
  }

  function initLightbox() {
    var hasLightbox = document.querySelectorAll('[data-lightbox]').length > 0;
    if (!hasLightbox || typeof GLightbox === 'undefined') return;
    document.querySelectorAll('[data-lightbox]').forEach(function (a) {
      a.classList.add('glightbox');
      a.setAttribute('data-gallery', a.getAttribute('data-lightbox'));
    });
    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      openEffect: 'fade',
      closeEffect: 'fade',
      cssEffects: { fade: { in: 'fadeIn', out: 'fadeOut' } }
    });
  }

  /** Lazy-load images outside the carousel to reduce initial load time */
  function initLazyImages() {
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      if (img.closest('.carousel')) return;
      img.loading = 'lazy';
      img.decoding = 'async';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadNav();
      initLightbox();
      initLazyImages();
    });
  } else {
    loadNav();
    initLightbox();
    initLazyImages();
  }
})();
