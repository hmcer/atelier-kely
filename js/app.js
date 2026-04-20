// ===================== SUPABASE CONFIG =====================
const SUPABASE_URL = 'https://jgnzbtmekbpziyzilgyz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbnpidG1la2Jweml5emlsZ3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjYzMTgsImV4cCI6MjA5MjIwMjMxOH0.BF7CHU93fLstN1Zc-CFIHjAbxL0X7Tzo3nNHWOWeCxY';

const db = {
  async get(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

// ===================== APP STATE =====================
const WHATSAPP_NUMBER = '573017255825';
const ADMIN_PASSWORD = 'kely2024';

let state = {
  isAdmin: false,
  cart: [],
  products: [],
  categories: new Set(['todos']),
};

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  renderCatalog();
  updateCartUI();
  loadContactInfo();
  loadBio();

  const aboutPhoto = document.getElementById('aboutPhoto');
  if (aboutPhoto) {
    aboutPhoto.addEventListener('error', () => {
      aboutPhoto.style.display = 'none';
      document.getElementById('imgPlaceholder').style.display = 'flex';
    });
    if (!aboutPhoto.src || aboutPhoto.src === window.location.href) {
      aboutPhoto.style.display = 'none';
    }
  }
});

// ===================== LOAD PRODUCTS =====================
async function loadProducts() {
  try {
    showToast('Cargando catalogo...');
    const data = await db.get('products');
    if (Array.isArray(data)) {
      state.products = data.map(p => ({
        ...p,
        colors: p.colors || [],
        desc: p.description,
      }));
      state.categories = new Set(['todos', ...state.products.map(p => p.category)]);
    }
  } catch (e) {
    console.error('Error cargando productos:', e);
  }
}

// ===================== NAVIGATION =====================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('navLinks').classList.remove('open');
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ===================== ADMIN =====================
function toggleAdminLogin() {
  const panel = document.getElementById('adminLoginPanel');
  panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  panel.style.flexDirection = 'column';
}

function loginAdmin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASSWORD) {
    state.isAdmin = true;
    document.getElementById('adminLoginPanel').style.display = 'none';
    document.getElementById('adminIcon').className = 'fas fa-lock-open';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminAbout').style.display = 'block';
    document.getElementById('adminContact').style.display = 'block';
    document.getElementById('adminPass').value = '';
    renderCatalog();
    showToast('Bienvenida, Kely!');
  } else {
    showToast('Contrasena incorrecta');
  }
}

// ===================== PRODUCTS =====================
async function addProduct() {
  const name = document.getElementById('prodName').value.trim();
  const price = document.getElementById('prodPrice').value;
  const category = document.getElementById('prodCategory').value.trim();
  const colors = document.getElementById('prodColors').value.trim();
  const stock = document.getElementById('prodStock').value;
  const desc = document.getElementById('prodDesc').value.trim();
  const imgInput = document.getElementById('prodImg');

  if (!name || !price || !category) {
    showToast('Completa nombre, precio y categoria');
    return;
  }

  const product = {
    name,
    price: parseInt(price),
    category,
    colors: colors ? colors.split(',').map(c => c.trim()) : [],
    stock: parseInt(stock) || 0,
    description: desc,
    img: null,
  };

  if (imgInput.files && imgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      product.img = e.target.result;
      await finalizeAddProduct(product);
    };
    reader.readAsDataURL(imgInput.files[0]);
  } else {
    await finalizeAddProduct(product);
  }
}

async function finalizeAddProduct(product) {
  try {
    showToast('Guardando prenda...');
    const result = await db.insert('products', product);
    if (Array.isArray(result) && result[0]) {
      const saved = { ...result[0], desc: result[0].description, colors: result[0].colors || [] };
      state.products.unshift(saved);
      state.categories.add(saved.category);
      renderCatalog();
      clearProductForm();
      showToast('Prenda agregada al catalogo');
    } else {
      showToast('Error al guardar, intenta de nuevo');
    }
  } catch (e) {
    console.error(e);
    showToast('Error de conexion');
  }
}

function clearProductForm() {
  ['prodName','prodPrice','prodCategory','prodColors','prodStock','prodDesc'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('prodImg').value = '';
  document.getElementById('imgPreview').style.display = 'none';
}

function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('imgPreview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ===================== CATALOG RENDER =====================
function renderCatalog(filter = 'todos') {
  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('emptyCatalog');
  const filtersEl = document.getElementById('catalogFilters');

  filtersEl.innerHTML = '';
  const allCategories = ['todos', ...Array.from(state.categories).filter(c => c !== 'todos')];
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === filter ? ' active' : '');
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.onclick = () => filterCatalog(cat, btn);
    filtersEl.appendChild(btn);
  });

  const filtered = filter === 'todos' ? state.products : state.products.filter(p => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        ${p.img
          ? `<img src="${p.img}" alt="${p.name}" />`
          : `<div class="product-no-img"><i class="fas fa-tshirt"></i></div>`
        }
        <div class="product-badge">${p.category}</div>
      </div>
      <div class="product-info">
        <h4>${p.name}</h4>
        <p class="product-price">${formatPrice(p.price)}</p>
        <div class="product-colors">
          ${(p.colors || []).map(c => `<div class="color-dot" style="background:${colorToHex(c)};" title="${c}"></div>`).join('')}
        </div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
          Agregar al carrito
        </button>
        ${state.isAdmin ? `<button class="btn-admin" style="margin-top:8px; width:100%;" onclick="event.stopPropagation(); deleteProduct(${p.id})">Eliminar</button>` : ''}
      </div>
    </div>
  `).join('');
}

function filterCatalog(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderCatalog(cat);
}

async function deleteProduct(id) {
  if (!confirm('Eliminar esta prenda del catalogo?')) return;
  try {
    await db.delete('products', id);
    state.products = state.products.filter(p => p.id !== id);
    state.categories = new Set(['todos', ...state.products.map(p => p.category)]);
    renderCatalog();
    showToast('Prenda eliminada');
  } catch (e) {
    showToast('Error al eliminar');
  }
}

// ===================== MODAL =====================
function openModal(id) {
  const p = state.products.find(pr => pr.id === id);
  if (!p) return;

  const content = document.getElementById('modalContent');
  content.innerHTML = `
    ${p.img
      ? `<img src="${p.img}" alt="${p.name}" class="modal-img" />`
      : `<div class="modal-img-placeholder"><i class="fas fa-tshirt"></i></div>`
    }
    <h2 class="modal-title">${p.name}</h2>
    <p class="modal-price">${formatPrice(p.price)}</p>
    ${p.desc || p.description ? `<p class="modal-desc">${p.desc || p.description}</p>` : ''}
    <div class="modal-meta">
      ${(p.colors || []).length ? `<span>Colores</span><p>${p.colors.join(', ')}</p>` : ''}
      <span style="margin-top:10px; display:block;">Disponibilidad</span>
      <p>${p.stock > 0 ? `${p.stock} unidades disponibles` : 'Disponible bajo pedido'}</p>
    </div>
    <button class="btn-primary" style="width:100%; justify-content:center;" onclick="addToCart(${p.id}); closeModal();">
      <i class="fas fa-shopping-bag"></i> Agregar al carrito
    </button>
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('productModal').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('productModal').classList.remove('open');
}

// ===================== CART =====================
function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
  showToast(`${product.name} agregada al carrito`);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(c => c.id !== id);
  updateCartUI();
}

function changeQty(id, delta) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCartUI();
}

function updateCartUI() {
  const count = state.cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (state.cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Tu bolsa esta vacia</p></div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  const total = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cartTotal').textContent = formatPrice(total);

  itemsEl.innerHTML = state.cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${c.img ? `<img src="${c.img}" alt="${c.name}" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--brown-light);font-size:1.5rem;"><i class="fas fa-tshirt"></i></div>`}
      </div>
      <div class="cart-item-info">
        <h5>${c.name}</h5>
        <p>${formatPrice(c.price)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${c.id}, -1)">-</button>
        <span style="font-size:0.9rem; font-weight:600;">${c.qty}</span>
        <button class="qty-btn" onclick="changeQty(${c.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  const panel = document.getElementById('cartPanel');
  const overlay = document.getElementById('cartOverlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
}

function checkoutWhatsApp() {
  if (state.cart.length === 0) return;
  const lines = state.cart.map(c => `- ${c.name} x${c.qty}: ${formatPrice(c.price * c.qty)}`).join('\n');
  const total = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const msg = encodeURIComponent(`Hola Kely! Me gustaria hacer el siguiente pedido:\n\n${lines}\n\nTotal: ${formatPrice(total)}\n\nQuedo atenta a tu confirmacion.`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// ===================== ORDERS =====================
function sendOrder(e) {
  e.preventDefault();
  const name = document.getElementById('orderName').value;
  const phone = document.getElementById('orderPhone').value;
  const type = document.getElementById('orderType').value;
  const desc = document.getElementById('orderDesc').value;
  const medidas = document.getElementById('orderMedidas').value;

  const msg = encodeURIComponent(
    `Hola Kely! Soy ${name} (${phone}) y quiero hacer un pedido personalizado.\n\n` +
    `Tipo de prenda: ${type || 'No especificado'}\n\n` +
    `Descripcion: ${desc}\n\n` +
    (medidas ? `Medidas: ${medidas}\n\n` : '') +
    `Quedo atenta a tu respuesta!`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

// ===================== ABOUT =====================
function saveBio() {
  const bio = document.getElementById('bioEdit').value.trim();
  if (!bio) return;
  localStorage.setItem('kely_bio', bio);
  const bioEl = document.getElementById('aboutBio');
  bioEl.innerHTML = bio.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
  showToast('Descripcion guardada');
}

function loadBio() {
  const bio = localStorage.getItem('kely_bio');
  if (bio) {
    const bioEl = document.getElementById('aboutBio');
    bioEl.innerHTML = bio.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
    document.getElementById('bioEdit').value = bio;
  }
}

// ===================== CONTACT =====================
function saveContact() {
  const ig = document.getElementById('editInstagram').value.trim();
  const fb = document.getElementById('editFacebook').value.trim();
  const em = document.getElementById('editEmail').value.trim();

  if (ig) {
    document.getElementById('instagramHandle').textContent = ig;
    document.getElementById('linkInstagram').href = `https://instagram.com/${ig.replace('@','')}`;
    localStorage.setItem('kely_ig', ig);
  }
  if (fb) {
    document.getElementById('facebookHandle').textContent = fb;
    localStorage.setItem('kely_fb', fb);
  }
  if (em) {
    document.getElementById('emailHandle').textContent = em;
    document.getElementById('linkEmail').href = `mailto:${em}`;
    localStorage.setItem('kely_email', em);
  }
  showToast('Contacto guardado');
}

function loadContactInfo() {
  const ig = localStorage.getItem('kely_ig');
  const fb = localStorage.getItem('kely_fb');
  const em = localStorage.getItem('kely_email');
  if (ig) { document.getElementById('instagramHandle').textContent = ig; document.getElementById('linkInstagram').href = `https://instagram.com/${ig.replace('@','')}`; }
  if (fb) { document.getElementById('facebookHandle').textContent = fb; }
  if (em) { document.getElementById('emailHandle').textContent = em; document.getElementById('linkEmail').href = `mailto:${em}`; }
}

// ===================== UTILS =====================
function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO') + ' COP';
}

function colorToHex(colorName) {
  const map = {
    'negro': '#1a1a1a', 'blanco': '#f5f5f5', 'rojo': '#e53935',
    'azul': '#1e88e5', 'verde': '#43a047', 'amarillo': '#fdd835',
    'rosado': '#f06292', 'rosa': '#f06292', 'morado': '#8e24aa',
    'naranja': '#fb8c00', 'gris': '#757575', 'beige': '#d7c9aa',
    'cafe': '#6d4c41', 'marron': '#6d4c41', 'turquesa': '#26c6da',
    'lila': '#ce93d8', 'coral': '#ff7043', 'dorado': '#fbc02d',
    'plateado': '#bdbdbd',
  };
  const lower = colorName.toLowerCase().trim();
  return map[lower] || '#a0673a';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
