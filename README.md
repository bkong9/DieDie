Personal website for Meng Photography.

## Stack (modern redesign)

- **Bootstrap 5.3** – layout and components (no jQuery)
- **GLightbox 3.2** – image lightbox in album pages (replaces legacy Lightbox)
- **Vanilla JS** – nav loaded via `fetch()` in `js/app.js`; existing `data-lightbox` attributes work with GLightbox
- **CSS** – `css/style.css` uses variables and updated typography (DM Sans, Fraunces)

### Updating remaining album pages

The pattern is shown in `albums/alberta.html`. For each other album and `_CHN` page under `albums/`:

1. Replace the `<head>` with Bootstrap 5 + GLightbox CSS + `../css/style.css` (and fonts).
2. Use `<div id="includedContent" data-nav="album_nav.html" data-base="../"></div>` for the nav.
3. Keep `data-lightbox="…"` on gallery links; `app.js` wires them to GLightbox.
4. At the end of `<body>`, include: Bootstrap bundle, GLightbox script, then `../js/app.js`.
5. Replace the footer with the same `<footer class="footer">…</footer>` as in `alberta.html`.

### Reducing image load times

The site already uses:

- **Lazy loading** – Gallery and album images (everything except the homepage carousel) use `loading="lazy"` and `decoding="async"` via `app.js`, so below-the-fold images load as you scroll.
- **Preload** – The first carousel image is preloaded on the homepage so it appears quickly.
- **Responsive carousel** – `<picture>` on the homepage serves smaller mobile images on narrow viewports.

To reduce load times further (especially on album and category pages), optimize the image files themselves:

1. **Use WebP** – Export photos as WebP (quality 80–85) for 25–35% smaller files than JPEG at similar quality. Use `<picture>` with `<source type="image/webp">` and `<img>` as fallback, or serve WebP to supporting browsers and JPEG otherwise.
2. **Resize to display size** – Thumbnails in the 3-column grids rarely need to be larger than **800–1000px** on the long side. Album lightbox images can be **1600–2000px**. Avoid serving 4000px originals as thumbnails.
3. **Compress JPEGs** – If staying with JPEG, use quality 80–85 and strip metadata (e.g. with ImageMagick, Squoosh, or your editor’s “Save for Web”).
4. **Optional: thumbnails** – For album pages, use smaller thumbnail images in the grid (`src`) and keep full-size only for the lightbox (`href` on the `<a>`), so the grid loads much faster.
