let adminProducts = [];

async function adminInit() {
  const res = await fetch('data/products.json');
  adminProducts = await res.json();
  renderAdminList();
}

function money(n) {
  return '$' + n.toLocaleString('es-AR');
}

function renderAdminList() {
  const el = document.getElementById('admin-list');
  el.innerHTML = adminProducts.map((p, i) => `
    <div class="admin-row">
      <img src="${p.image}" alt="${p.name}">
      <div class="admin-row-info">
        <strong>${p.name}</strong>
        <span>${p.category} · ${money(p.price)} ${p.oldPrice ? '(antes ' + money(p.oldPrice) + ')' : ''}</span>
        <span class="admin-tags">${p.tags.join(', ') || 'sin etiqueta'} · stock: ${p.stock}</span>
      </div>
      <button class="admin-del" onclick="deleteProduct(${i})">Eliminar</button>
    </div>
  `).join('') || '<p>No hay productos cargados.</p>';
}

function deleteProduct(i) {
  if (!confirm('¿Eliminar este producto?')) return;
  adminProducts.splice(i, 1);
  renderAdminList();
}

function addProductFromForm(e) {
  e.preventDefault();
  const f = e.target;
  const tags = [];
  if (f.tagOferta.checked) tags.push('oferta');
  if (f.tagNuevo.checked) tags.push('nuevo');
  if (f.tagVendido.checked) tags.push('mas-vendido');

  const newProduct = {
    id: Date.now(),
    name: f.name.value.trim(),
    category: f.category.value.trim().toLowerCase(),
    price: Number(f.price.value),
    oldPrice: f.oldPrice.value ? Number(f.oldPrice.value) : null,
    sizes: f.sizes.value.split(',').map(s => s.trim()).filter(Boolean),
    colors: f.colors.value.split(',').map(s => s.trim()).filter(Boolean),
    tags,
    stock: Number(f.stock.value) || 0,
    image: f.image.value.trim() || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=750&fit=crop',
    description: f.description.value.trim()
  };

  adminProducts.push(newProduct);
  renderAdminList();
  f.reset();
  showAdminToast('Producto agregado. No olvides "Descargar products.json" para guardarlo.');
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(adminProducts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast('Descargando products.json — reemplazá el archivo en la carpeta data/.');
}

function showAdminToast(msg) {
  const t = document.getElementById('admin-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

document.addEventListener('DOMContentLoaded', adminInit);
