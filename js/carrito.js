/*
  CARRITO — BFast Clothe
  Checkout actual: genera mensaje de WhatsApp con el pedido y lo manda a la dueña.
  Migración futura a Tienda Nube: reemplazar checkoutWhatsApp() por una llamada
  a la API de Tienda Nube (crear orden) — ver Elios/santacla_api.py como referencia
  de cliente API ya construido en otro proyecto.
*/

// ⚠️ REEMPLAZAR por el número real de la dueña (formato: 54 9 + cod area + número, sin espacios ni +)
const WHATSAPP_DUEÑA = '5492230000000';

let cart = JSON.parse(localStorage.getItem('bfast_cart') || '[]');

function saveCart() {
  localStorage.setItem('bfast_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product, size, color, qty = 1) {
  const existing = cart.find(i => i.id === product.id && i.size === size && i.color === color);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size, color, qty
    });
  }
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function money(n) {
  return '$' + n.toLocaleString('es-AR');
}

function updateCartUI() {
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount());

  const itemsEl = document.getElementById('cart-items');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío.<br>Elegí algo lindo del catálogo ✨</div>';
  } else {
    itemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item-swipe-bg">Quitar →</div>
        <div class="cart-item-swipe-content">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">Talle ${item.size} · ${item.color}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
              <span class="cart-item-price">${money(item.price * item.qty)}</span>
            </div>
            <div class="cart-item-remove" onclick="removeFromCart(${i})">Quitar</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  const totalEl = document.getElementById('cart-total');
  if (totalEl) {
    const newTotal = money(cartTotal());
    if (totalEl.textContent !== newTotal) {
      totalEl.textContent = newTotal;
      totalEl.classList.remove('flip');
      void totalEl.offsetWidth;
      totalEl.classList.add('flip');
    }
  }
}

function toggleCart(open) {
  document.getElementById('cart-overlay').classList.toggle('open', open);
  document.getElementById('cart-drawer').classList.toggle('open', open);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast('Tu carrito está vacío');
    return;
  }
  let msg = `¡Hola! Quiero hacer este pedido en *BFast Clothe* 🛍️\n\n`;
  cart.forEach(item => {
    msg += `• ${item.name} — Talle ${item.size}, color ${item.color} — x${item.qty} — ${money(item.price * item.qty)}\n`;
  });
  msg += `\n*Total: ${money(cartTotal())}*\n\nMi nombre es: \nMi dirección de envío es: `;

  const url = `https://wa.me/${WHATSAPP_DUEÑA}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', updateCartUI);
