// Script de grabación de demo — BFast Clothe
// Recorre la tienda como lo haría una clienta real: scroll, filtros, modal, carrito.
const { chromium } = require('playwright');

const SITE = process.env.DEMO_URL || 'http://localhost:8743/index.html';
const OUT_DIR = 'demo-video';

async function pause(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  await page.goto(SITE);
  await page.waitForSelector('.card');
  await pause(1200);

  // Scroll suave por el hero y el marquee
  await page.mouse.wheel(0, 500);
  await pause(900);
  await page.mouse.wheel(0, 500);
  await pause(900);

  // Categorías visuales
  await page.mouse.wheel(0, 500);
  await pause(1000);

  // Más vendidos — usar las flechas del carrusel
  const arrowNext = page.locator('#mas-vendidos').locator('.carousel-arrow-next');
  if (await arrowNext.count() && await arrowNext.isVisible()) {
    await arrowNext.scrollIntoViewIfNeeded();
    await pause(800);
    await arrowNext.click();
    await pause(1000);
  }

  // Bajar a Catálogo
  await page.locator('a[href="#catalogo"]').first().scrollIntoViewIfNeeded();
  await page.locator('#catalogo').scrollIntoViewIfNeeded();
  await pause(1000);

  // Tocar un filtro de categoría
  const filterVestidos = page.locator('.filter-chip[data-cat="vestidos"]');
  await filterVestidos.click();
  await pause(1200);

  // Abrir el modal del primer producto
  const firstCard = page.locator('#catalogo-grid .card').first();
  await firstCard.click();
  await pause(1200);

  // Elegir un talle distinto y sumar cantidad
  const sizeBtn = page.locator('#modal-sizes .opt-btn').nth(1);
  if (await sizeBtn.count()) { await sizeBtn.click(); await pause(600); }
  await page.locator('.qty-selector-modal .qty-btn').nth(1).click(); // +
  await pause(500);
  await page.locator('.qty-selector-modal .qty-btn').nth(1).click(); // +
  await pause(700);

  // Agregar al carrito (dispara la animación "vuela al carrito")
  await page.locator('.modal-actions .btn-primary').click();
  await pause(1500);

  // Abrir el carrito
  await page.locator('.cart-btn').click();
  await pause(1500);

  // Cerrar carrito, volver arriba
  await page.locator('.cart-close').click();
  await pause(600);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(1500);

  await context.close();
  await browser.close();
  console.log('Video listo en ./' + OUT_DIR);
})();
