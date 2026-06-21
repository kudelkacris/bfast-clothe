let PRODUCTS = [];
let activeFilter = 'todos';
let activeSort = 'relevancia';
let modalProduct = null;
let modalSize = '';
let modalColor = '';
let modalQty = 1;

// Wishlist persistida en localStorage
let wishlist = JSON.parse(localStorage.getItem('bfast_wishlist') || '[]');

// Mapa de colores a hex para los swatches
const COLOR_MAP = {
  'Beige': '#D4B896', 'Gris': '#A0A0A0', 'Negro': '#2A2A2A',
  'Terracota': '#C98B73', 'Azul claro': '#7CA9D2', 'Azul oscuro': '#2B4F7C',
  'Verde salvia': '#8A9A82', 'Crudo': '#EDE8DC', 'Camel': '#C9A06A',
  'Gris melange': '#B5B5B0', 'Blanco': '#F0EDE8', 'Celeste': '#A8D1E7',
  'Bordo': '#7B2D3A', 'Verde botella': '#3A5E3A', 'Rosa viejo': '#D4A0A0',
  'Rojo': '#B5402F', 'Verde': '#5E8A5E',
};

// Reviews hardcodeadas
const REVIEWS = [
  { name: "Valentina R.", city: "Quilmes", rating: 5, text: "Me enamoré del conjunto oversize. Llegó súper rápido y la calidad es increíble. Ya hice el segundo pedido.", product: "Conjuntos" },
  { name: "Camila S.", city: "Lomas de Zamora", rating: 5, text: "Compré el vestido lencero y quedé re contenta. Mide justo como dice la guía de talles. Hermoso.", product: "Vestidos" },
  { name: "Lucía M.", city: "Lanús", rating: 5, text: "Atención de 10 por WhatsApp. Me ayudaron a elegir el talle y el envío llegó al día siguiente.", product: "Jeans" },
  { name: "Florencia G.", city: "Avellaneda", rating: 5, text: "El sweater trenzado es suavísimo. Llegó en bolsita re copada. Ya compré uno para regalar.", product: "Sweaters" },
  { name: "Agustina P.", city: "Banfield", rating: 5, text: "Primera compra y encantada. Ropa hermosa, buen precio y envío express a zona sur. ¡Gracias BFast!", product: "Blusas" },
];

function skeletonCardHTML() {
  return `
    <div class="skeleton-card">
      <div class="skeleton-img skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-shimmer w-60"></div>
      <div class="skeleton-line skeleton-shimmer w-40"></div>
    </div>`;
}

function renderSkeletons() {
  ['mas-vendidos-grid', 'ofertas-grid', 'nuevos-grid', 'catalogo-grid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = skeletonCardHTML().repeat(4);
  });
}

async function loadProducts() {
  renderSkeletons();
  const res = await fetch('data/products.json');
  PRODUCTS = await res.json();
  renderSection('mas-vendidos-grid', PRODUCTS.filter(p => p.tags.includes('mas-vendido')));
  renderSection('ofertas-grid', PRODUCTS.filter(p => p.tags.includes('oferta')));
  renderSection('nuevos-grid', PRODUCTS.filter(p => p.tags.includes('nuevo')));
  renderCatalogo(PRODUCTS);
  renderReviews();
}

function money(n) {
  return '$' + n.toLocaleString('es-AR');
}

function cardHTML(p, index) {
  const badge = p.tags.includes('oferta') ? '<span class="badge badge-oferta">Oferta</span>'
    : p.tags.includes('nuevo') ? '<span class="badge badge-nuevo">Nuevo</span>'
    : p.tags.includes('mas-vendido') ? '<span class="badge badge-vendido">Más vendido</span>' : '';
  const stockBadge = p.stock <= 6 ? `<div class="stock-badge">¡Últimas ${p.stock}!</div>` : '';
  const oldPrice = p.oldPrice ? `<span class="card-old-price">${money(p.oldPrice)}</span>` : '';
  const discount = p.oldPrice ? `<span class="card-discount">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : '';
  const swatches = p.colors.map(c => {
    const hex = COLOR_MAP[c] || '#ccc';
    return `<span class="color-swatch" style="background:${hex}" title="${c}"></span>`;
  }).join('');
  const isFav = wishlist.includes(p.id);
  return `
    <div class="card" data-id="${p.id}" style="--i:${index}" onclick="openProductModal(${p.id})">
      <div class="card-img-wrap">
        ${badge}
        ${stockBadge}
        <button class="card-fav${isFav ? ' favorited' : ''}" data-fav-id="${p.id}" onclick="toggleWishlist(${p.id}, event)" aria-label="Favorito">${isFav ? '♥' : '♡'}</button>
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="quick-add" onclick="event.stopPropagation(); quickAdd(${p.id}, event)">+ Agregar al carrito</div>
      </div>
      <div class="card-info">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-price-row">
          <span class="card-price">${money(p.price)}</span>
          ${oldPrice}
          ${discount}
        </div>
        <div class="card-swatches">${swatches}</div>
      </div>
    </div>`;
}

function renderSection(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map((p, i) => cardHTML(p, i)).join('') || '<p style="color:#8A7F73">Próximamente.</p>';
  updateWishlistUI();
}

function scrollRow(id, dir) {
  const row = document.getElementById(id);
  if (!row) return;
  const cardWidth = row.querySelector('.card')?.offsetWidth || 260;
  row.scrollBy({ left: dir * (cardWidth + 24) * 2, behavior: 'smooth' });
}

function renderCatalogo(items) {
  const el = document.getElementById('catalogo-grid');
  if (!el) return;
  el.innerHTML = items.map((p, i) => cardHTML(p, i)).join('') || '<p style="color:#8A7F73">No hay productos en esta categoría todavía.</p>';
  updateWishlistUI();
}

function renderReviews() {
  const el = document.getElementById('reviews-grid');
  if (!el) return;
  el.innerHTML = REVIEWS.map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}</div>
      <p class="review-text">${r.text}</p>
      <div class="review-footer">
        <div>
          <div class="review-author">${r.name}</div>
          <div class="review-city">${r.city}</div>
        </div>
        <span class="review-product-tag">${r.product}</span>
      </div>
    </div>
  `).join('');
}

function applySort(items) {
  const sorted = [...items];
  if (activeSort === 'precio-asc') sorted.sort((a, b) => a.price - b.price);
  else if (activeSort === 'precio-desc') sorted.sort((a, b) => b.price - a.price);
  else if (activeSort === 'nuevo') sorted.sort((a, b) => (b.tags.includes('nuevo') ? 1 : 0) - (a.tags.includes('nuevo') ? 1 : 0) || b.id - a.id);
  else if (activeSort === 'vendido') sorted.sort((a, b) => (b.tags.includes('mas-vendido') ? 1 : 0) - (a.tags.includes('mas-vendido') ? 1 : 0));
  return sorted;
}

function getCatalogoItems() {
  const searchQ = document.getElementById('catalog-search-input')?.value.toLowerCase().trim() || '';
  let items = activeFilter === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);
  if (searchQ) items = items.filter(p => p.name.toLowerCase().includes(searchQ) || p.category.toLowerCase().includes(searchQ));
  return applySort(items);
}

function filterCatalogo(cat) {
  activeFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  renderCatalogo(getCatalogoItems());
}

function searchCatalogo() {
  renderCatalogo(getCatalogoItems());
}

function sortCatalogo(value) {
  activeSort = value;
  renderCatalogo(getCatalogoItems());
}

function quickAdd(id, event) {
  const p = PRODUCTS.find(p => p.id === id);
  addToCart(p, p.sizes[0], p.colors[0], 1);
  showToast(`✓ Agregado: ${p.name}`);
  bounceCart();
  const img = event?.target?.closest('.card')?.querySelector('img');
  if (img) flyToCart(img);
}

function bounceCart() {
  const btn = document.querySelector('.cart-btn');
  if (!btn) return;
  btn.classList.remove('bounce');
  void btn.offsetWidth;
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 600);
}

// ===== Wishlist =====
function toggleWishlist(id, event) {
  event.stopPropagation();
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    showToast('♥ Guardado en favoritos');
  } else {
    wishlist.splice(idx, 1);
    showToast('Quitado de favoritos');
  }
  localStorage.setItem('bfast_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  document.querySelectorAll('.card-fav[data-fav-id]').forEach(btn => {
    const id = parseInt(btn.dataset.favId);
    const fav = wishlist.includes(id);
    btn.innerHTML = fav ? '♥' : '♡';
    btn.classList.toggle('favorited', fav);
  });
}

// ===== Modal de producto =====
function openProductModal(id) {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return;
  modalProduct = p;
  modalSize = p.sizes[0];
  modalColor = p.colors[0];
  modalQty = 1;
  document.getElementById('modal-qty').textContent = '1';

  document.getElementById('modal-img').src = p.image;
  document.getElementById('modal-cat').textContent = p.category;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-desc').textContent = p.description;

  let priceHTML = `<span class="card-price">${money(p.price)}</span>`;
  if (p.oldPrice) {
    priceHTML += `<span class="card-old-price">${money(p.oldPrice)}</span>`;
    priceHTML += `<span class="card-discount">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`;
  }
  document.getElementById('modal-price-row').innerHTML = priceHTML;

  document.getElementById('modal-sizes').innerHTML = p.sizes.map(s =>
    `<button class="opt-btn${s === modalSize ? ' active' : ''}" onclick="selectModalSize('${s}')">${s}</button>`
  ).join('');

  document.getElementById('modal-colors').innerHTML = p.colors.map(c => {
    const hex = COLOR_MAP[c] || '#ccc';
    return `<button class="opt-btn opt-btn-color${c === modalColor ? ' active' : ''}" onclick="selectModalColor('${c}')"><span class="color-swatch" style="background:${hex}"></span>${c}</button>`;
  }).join('');

  const wppMsg = `¡Hola! Me interesa *${p.name}* (${money(p.price)}). ¿Tienen disponibilidad?`;
  document.getElementById('modal-wpp-btn').href = `https://wa.me/${WHATSAPP_DUEÑA}?text=${encodeURIComponent(wppMsg)}`;
  document.getElementById('sticky-price').textContent = money(p.price);

  renderRelatedProducts(p);

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderRelatedProducts(p) {
  const wrap = document.getElementById('related-wrap');
  const grid = document.getElementById('related-grid');
  const related = PRODUCTS.filter(o => o.category === p.category && o.id !== p.id).slice(0, 3);
  if (!related.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  grid.innerHTML = related.map(o => `
    <div class="related-card" onclick="openProductModal(${o.id})">
      <img src="${o.image}" alt="${o.name}">
      <div class="rc-name">${o.name}</div>
      <div class="rc-price">${money(o.price)}</div>
    </div>
  `).join('');
}

function changeModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('modal-qty').textContent = modalQty;
}

function shareProduct() {
  if (!modalProduct) return;
  const p = modalProduct;
  const text = `Mirá "${p.name}" de BFast Clothe — ${money(p.price)}`;
  const url = location.href.split('#')[0];
  if (navigator.share) {
    navigator.share({ title: p.name, text, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${text} ${url}`).then(() => showToast('Link copiado, ¡compartilo!'));
  } else {
    showToast('No se pudo compartir en este navegador');
  }
}

function openSizeGuide() {
  document.getElementById('size-guide-wpp').href = `https://wa.me/${WHATSAPP_DUEÑA}?text=${encodeURIComponent('¡Hola! Tengo una duda con los talles 😊')}`;
  document.getElementById('size-guide-overlay').classList.add('open');
  document.getElementById('size-guide-modal').classList.add('open');
}

function closeSizeGuide() {
  document.getElementById('size-guide-overlay').classList.remove('open');
  document.getElementById('size-guide-modal').classList.remove('open');
}

function flyToCart(imgEl) {
  if (!imgEl) return;
  const cartBtn = document.querySelector('.cart-btn');
  if (!cartBtn) return;
  const startRect = imgEl.getBoundingClientRect();
  const endRect = cartBtn.getBoundingClientRect();
  const clone = imgEl.cloneNode();
  clone.className = 'fly-to-cart';
  clone.style.left = startRect.left + 'px';
  clone.style.top = startRect.top + 'px';
  clone.style.width = startRect.width + 'px';
  clone.style.height = startRect.height + 'px';
  document.body.appendChild(clone);
  requestAnimationFrame(() => {
    clone.style.left = endRect.left + endRect.width / 2 - 14 + 'px';
    clone.style.top = endRect.top + endRect.height / 2 - 14 + 'px';
    clone.style.width = '28px';
    clone.style.height = '28px';
    clone.style.opacity = '0.3';
  });
  setTimeout(() => clone.remove(), 700);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function selectModalSize(s) {
  modalSize = s;
  document.querySelectorAll('#modal-sizes .opt-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === s));
}

function selectModalColor(c) {
  modalColor = c;
  document.querySelectorAll('#modal-colors .opt-btn').forEach(b => b.classList.toggle('active', b.querySelector('span') ? b.textContent.trim() === c : b.textContent.trim() === c));
  document.querySelectorAll('#modal-colors .opt-btn').forEach(b => {
    const txt = b.textContent.replace('●', '').trim();
    b.classList.toggle('active', txt === c);
  });
}

function modalAddToCart() {
  if (!modalProduct) return;
  addToCart(modalProduct, modalSize, modalColor, modalQty);
  showToast(`✓ Agregado: ${modalProduct.name}`);
  bounceCart();
  const img = document.getElementById('modal-img');
  if (img) flyToCart(img);
  closeModal();
}

document.addEventListener('DOMContentLoaded', loadProducts);
