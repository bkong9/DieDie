/**
 * Meng Photography - shared app script
 * Loads nav via fetch (no jQuery), initializes GLightbox with data-lightbox compat
 */
(function () {
  'use strict';

  function navHrefPrefix() {
    try {
      var path = decodeURIComponent(window.location.pathname || '').replace(/\\/g, '/');
      if (path.indexOf('/albums/') >= 0) return '../';
    } catch (e) {}
    return '';
  }

  function isExternalOrSpecialUrl(url) {
    if (!url) return true;
    var u = String(url);
    if (u[0] === '#') return true;
    if (/^(?:[a-z]+:)?\/\//i.test(u)) return true; // http(s)://, protocol-relative, etc.
    if (/^(?:mailto:|tel:|javascript:)/i.test(u)) return true;
    return false;
  }

  /**
   * When a shared nav file is loaded from a nested page (e.g. /albums/*),
   * rewrite relative src/href so they continue to resolve correctly.
   */
  function rewriteRelativeUrls(container, prefix) {
    if (!container || !container.querySelectorAll) return;
    var p = typeof prefix === 'string' ? prefix : '';
    if (!p) return;

    container.querySelectorAll('[href]').forEach(function (el) {
      var href = el.getAttribute('href');
      if (isExternalOrSpecialUrl(href)) return;
      if (/^\//.test(href)) return; // absolute-from-site-root
      if (href.indexOf(p) === 0) return;
      el.setAttribute('href', p + href.replace(/^\.\//, ''));
    });

    container.querySelectorAll('img[src]').forEach(function (img) {
      var src = img.getAttribute('src');
      if (isExternalOrSpecialUrl(src)) return;
      if (/^\//.test(src)) return;
      if (src.indexOf(p) === 0) return;
      img.setAttribute('src', p + src.replace(/^\.\//, ''));
    });
  }

  /** Strip optional .htm / .html for comparison with pathname (clean URLs) or nav hrefs. */
  function stripHtmlExt(seg) {
    return String(seg || '').replace(/\.html?$/i, '');
  }

  /** Mark Home / About / Albums dropdown / Journal based on current pathname + link hrefs. */
  function highlightSiteNav(container, prefix) {
    if (!container || !container.querySelector) return;

    container.querySelectorAll('.nav-item.active').forEach(function (li) {
      li.classList.remove('active');
    });

    var path = '';
    try {
      path = decodeURIComponent(window.location.pathname || '').replace(/\\/g, '/');
    } catch (e) {
      path = (window.location.pathname || '').replace(/\\/g, '/');
    }

    var inAlbumFolder = path.indexOf('/albums/') >= 0;
    var basename = '';
    try {
      var parts = path.split('/').filter(Boolean);
      basename = parts.length ? parts[parts.length - 1] : '';
    } catch (e) {
      basename = '';
    }

    basename = basename.split('?')[0].split('#')[0];
    basename = stripHtmlExt(basename);
    var pageKey = basename || 'index';

    // Albums landing pages should highlight dropdown even from root
    var albumLanding =
      pageKey === 'urban' ||
      pageKey === 'urban_CHN' ||
      pageKey === 'nature' ||
      pageKey === 'nature_CHN' ||
      pageKey === 'commercial' ||
      pageKey === 'commercial_CHN';

    // Find the Albums dropdown container (li.nav-item.dropdown that contains the dropdown toggle)
    var albumDropdown = null;
    container.querySelectorAll('li.nav-item.dropdown').forEach(function (li) {
      var toggle = li.querySelector('a.nav-link.dropdown-toggle');
      if (toggle) albumDropdown = li;
    });

    if (inAlbumFolder || albumLanding) {
      if (albumDropdown) albumDropdown.classList.add('active');
      return;
    }

    // Match a top-level nav link by its href stem (clean URL or legacy .html)
    var p = typeof prefix === 'string' ? prefix : '';

    container.querySelectorAll('#navRight a.nav-link').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (isExternalOrSpecialUrl(href)) return;
      href = href.split('?')[0].split('#')[0];
      if (p && href.indexOf(p) === 0) href = href.slice(p.length);
      href = href.replace(/^\.\//, '');
      var linkKey = stripHtmlExt(href);
      if (!linkKey || linkKey === 'index') linkKey = 'index';

      if (linkKey === pageKey) {
        var li = a.closest('li.nav-item');
        if (li) li.classList.add('active');
      }
    });
  }

  function loadNav() {
    var el = document.getElementById('includedContent');
    if (!el) return;
    var nav = el.getAttribute('data-nav');
    if (!nav) return;
    var base = el.getAttribute('data-base') || '';
    var explicitPrefix = el.getAttribute('data-nav-prefix');
    var prefix = explicitPrefix !== null ? explicitPrefix : navHrefPrefix();
    var url = base + nav;
    fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        el.innerHTML = html;
        rewriteRelativeUrls(el, prefix);
        highlightSiteNav(el, prefix);
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
