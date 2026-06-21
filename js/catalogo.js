let PRODUCTS = [];
let activeFilter = 'todos';

async function loadProducts() {
  const res = await fetch('data/products.json');
  PRODUCTS = await res.json();
  renderSection('mas-vendidos-grid', PRODUCTS.filter(p => p.tags.includes('mas-vendido')));
  renderSection('ofertas-grid', PRODUCTS.filter(p => p.tags.includes('oferta')));
  renderSection('nuevos-grid', PRODUCTS.filter(p => p.tags.includes('nuevo')));
  renderCatalogo(PRODUCTS);
}

function money(n) {
  return '$' + n.toLocaleString('es-AR');
}

function cardHTML(p) {
  const badge = p.tags.includes('oferta') ? '<span class="badge badge-oferta">Oferta</span>'
    : p.tags.includes('nuevo') ? '<span class="badge badge-nuevo">Nuevo</span>'
    : p.tags.includes('mas-vendido') ? '<span class="badge badge-vendido">Más vendido</span>' : '';
  const oldPrice = p.oldPrice ? `<span class="card-old-price">${money(p.oldPrice)}</span>` : '';
  const discount = p.oldPrice ? `<span class="card-discount">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : '';
  return `
    <div class="card" data-id="${p.id}">
      <div class="card-img-wrap">
        ${badge}
        <button class="card-fav" onclick="event.stopPropagation()" aria-label="Favorito">♡</button>
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="quick-add" onclick="quickAdd(${p.id})">+ Agregar al carrito</div>
      </div>
      <div class="card-info">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-price-row">
          <span class="card-price">${money(p.price)}</span>
          ${oldPrice}
          ${discount}
        </div>
      </div>
    </div>`;
}

function renderSection(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.slice(0, 4).map(cardHTML).join('') || '<p style="color:#8A7F73">Próximamente.</p>';
}

function renderCatalogo(items) {
  const el = document.getElementById('catalogo-grid');
  if (!el) return;
  el.innerHTML = items.map(cardHTML).join('') || '<p style="color:#8A7F73">No hay productos en esta categoría todavía.</p>';
}

function filterCatalogo(cat) {
  activeFilter = cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  const items = cat === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
  renderCatalogo(items);
}

function quickAdd(id) {
  const p = PRODUCTS.find(p => p.id === id);
  addToCart(p, p.sizes[0], p.colors[0], 1);
  showToast(`Agregado: ${p.name}`);
}

document.addEventListener('DOMContentLoaded', loadProducts);
