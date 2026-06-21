const GH_OWNER = 'kudelkacris';
const GH_REPO = 'bfast-clothe';
const GH_TOKEN_KEY = 'bfast_admin_token';

let adminProducts = [];
let editingId = null;

async function adminInit() {
  const res = await fetch('data/products.json');
  adminProducts = await res.json();
  renderAdminList();
  updateGhStatus();
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
        <span class="admin-tags">${p.tags.join(', ') || 'sin etiqueta'}</span>
      </div>
      <label style="font-size:11.5px; color:var(--texto-claro); display:flex; flex-direction:column; gap:4px; align-items:center;">
        Stock
        <input type="number" class="admin-row-stock" value="${p.stock}" min="0" onchange="updateStock(${i}, this.value)">
      </label>
      <div class="admin-row-actions">
        <button class="admin-edit" onclick="editProduct(${i})">Editar</button>
        <button class="admin-del" onclick="deleteProduct(${i})">Eliminar</button>
      </div>
    </div>
  `).join('') || '<p>No hay productos cargados.</p>';
}

function updateStock(i, value) {
  adminProducts[i].stock = Math.max(0, Number(value) || 0);
  showAdminToast(`Stock de "${adminProducts[i].name}" actualizado a ${adminProducts[i].stock}. No olvides publicar.`);
}

function deleteProduct(i) {
  if (!confirm(`¿Eliminar "${adminProducts[i].name}"? No olvides publicar después.`)) return;
  adminProducts.splice(i, 1);
  renderAdminList();
}

function editProduct(i) {
  const p = adminProducts[i];
  editingId = p.id;
  const f = document.getElementById('admin-form');
  f.name.value = p.name;
  f.category.value = p.category;
  f.price.value = p.price;
  f.oldPrice.value = p.oldPrice || '';
  f.stock.value = p.stock;
  f.sizes.value = p.sizes.join(', ');
  f.colors.value = p.colors.join(', ');
  f.image.value = p.image;
  f.description.value = p.description;
  f.tagOferta.checked = p.tags.includes('oferta');
  f.tagNuevo.checked = p.tags.includes('nuevo');
  f.tagVendido.checked = p.tags.includes('mas-vendido');

  document.getElementById('form-title').textContent = `Editando: ${p.name}`;
  document.getElementById('form-submit-btn').textContent = 'Guardar cambios';
  document.getElementById('form-cancel-btn').style.display = 'inline-flex';
  f.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelEdit() {
  editingId = null;
  document.getElementById('admin-form').reset();
  document.getElementById('form-title').textContent = 'Agregar producto nuevo';
  document.getElementById('form-submit-btn').textContent = '+ Agregar producto';
  document.getElementById('form-cancel-btn').style.display = 'none';
}

function addProductFromForm(e) {
  e.preventDefault();
  const f = e.target;
  const tags = [];
  if (f.tagOferta.checked) tags.push('oferta');
  if (f.tagNuevo.checked) tags.push('nuevo');
  if (f.tagVendido.checked) tags.push('mas-vendido');

  const data = {
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

  if (editingId !== null) {
    const idx = adminProducts.findIndex(p => p.id === editingId);
    if (idx !== -1) adminProducts[idx] = { id: editingId, ...data };
    cancelEdit();
    showAdminToast('Producto editado. No olvides publicar.');
  } else {
    adminProducts.push({ id: Date.now(), ...data });
    f.reset();
    showAdminToast('Producto agregado. No olvides publicar.');
  }
  renderAdminList();
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(adminProducts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast('Descargado como respaldo.');
}

function showAdminToast(msg) {
  const t = document.getElementById('admin-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ===== Conexión con GitHub =====
function saveGhToken() {
  const val = document.getElementById('gh-token-input').value.trim();
  if (!val) return;
  localStorage.setItem(GH_TOKEN_KEY, val);
  document.getElementById('gh-token-input').value = '';
  updateGhStatus();
  showAdminToast('Token guardado en este navegador.');
}

function clearGhToken() {
  localStorage.removeItem(GH_TOKEN_KEY);
  updateGhStatus();
  showAdminToast('Token borrado de este navegador.');
}

function updateGhStatus() {
  const token = localStorage.getItem(GH_TOKEN_KEY);
  document.getElementById('gh-dot').classList.toggle('ok', !!token);
  document.getElementById('gh-status-text').textContent = token
    ? 'Conectado — ya podés publicar cambios en la tienda.'
    : 'Sin conectar — pegá tu token para poder publicar.';
  document.getElementById('publish-btn').disabled = !token;
}

async function publishToGitHub() {
  const token = localStorage.getItem(GH_TOKEN_KEY);
  if (!token) {
    showAdminToast('Falta conectar el token de acceso.');
    return;
  }
  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.textContent = 'Publicando...';

  try {
    const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        event_type: 'update-products',
        client_payload: { products: adminProducts }
      })
    });

    if (res.status === 204) {
      showAdminToast('¡Publicado! La tienda se actualiza en 1-2 minutos.');
    } else {
      const body = await res.text();
      showAdminToast(`Error al publicar (${res.status}). Revisá el token con Niki.`);
      console.error('Error GitHub dispatch:', res.status, body);
    }
  } catch (err) {
    showAdminToast('Error de conexión. Probá de nuevo en un rato.');
    console.error(err);
  } finally {
    btn.disabled = !localStorage.getItem(GH_TOKEN_KEY);
    btn.textContent = '🚀 Publicar en la tienda';
  }
}

document.addEventListener('DOMContentLoaded', adminInit);
