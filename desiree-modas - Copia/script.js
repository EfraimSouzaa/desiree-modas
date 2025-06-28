// Função para buscar produtos do localStorage
function getStoredProducts() {
  try {
    const data = localStorage.getItem('products');
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    console.warn('Erro ao ler produtos do localStorage.');
    return [];
  }
}

// Função para salvar produtos no localStorage (use no admin)
function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

// Função para buscar o carrinho do localStorage
function getCart() {
  try {
    const data = localStorage.getItem('cart');
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    console.warn('Erro ao ler carrinho do localStorage.');
    return [];
  }
}

// Salvar carrinho
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Adicionar ao carrinho
function addToCart(product) {
  const cart = getCart();
  cart.push(product);
  saveCart(cart);
  alert(`${product.name} adicionado ao carrinho!`);
}

// Formatar preço no padrão brasileiro
function formatPrice(price) {
  return Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Renderizar produtos por categoria no container #category-grid
function renderProductsByCategory() {
  const products = getStoredProducts();
  if (products.length === 0) {
    document.getElementById('category-grid').innerHTML = '<p>Nenhum produto cadastrado.</p>';
    return;
  }

  // Agrupar produtos por categoria
  const categories = {};
  products.forEach((p) => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  const container = document.getElementById('category-grid');
  container.innerHTML = '';

  for (const category in categories) {
    const catDiv = document.createElement('div');
    catDiv.classList.add('category-section');

    // Título da categoria
    const title = document.createElement('h3');
    title.textContent = category;
    catDiv.appendChild(title);

    // Grid de produtos da categoria
    const grid = document.createElement('div');
    grid.classList.add('product-list');

    categories[category].forEach((prod) => {
      const card = document.createElement('div');
      card.classList.add('product-card');

      const img = document.createElement('img');
      img.src = prod.image;
      img.alt = prod.name;
      card.appendChild(img);

      const name = document.createElement('h4');
      name.textContent = prod.name;
      card.appendChild(name);

      const price = document.createElement('div');
      price.classList.add('price');
      price.textContent = formatPrice(prod.price);
      card.appendChild(price);

      const btnSeeMore = document.createElement('button');
      btnSeeMore.textContent = 'VER MAIS';
      btnSeeMore.classList.add('btn-see-more');
      btnSeeMore.setAttribute('aria-label', `Ver mais sobre ${prod.name}`);
      btnSeeMore.addEventListener('click', () => openModal(prod));
      card.appendChild(btnSeeMore);

      const btnBuy = document.createElement('button');
      btnBuy.textContent = 'COMPRAR';
      btnBuy.classList.add('btn-buy');
      btnBuy.setAttribute('aria-label', `Comprar ${prod.name}`);
      btnBuy.addEventListener('click', () => redirectToWhatsApp(prod));
      card.appendChild(btnBuy);

      const btnAddCart = document.createElement('button');
      btnAddCart.textContent = 'ADICIONAR AO CARRINHO';
      btnAddCart.classList.add('btn-add-cart');
      btnAddCart.setAttribute('aria-label', `Adicionar ${prod.name} ao carrinho`);
      btnAddCart.addEventListener('click', () => addToCart(prod));
      card.appendChild(btnAddCart);

      grid.appendChild(card);
    });

    catDiv.appendChild(grid);
    container.appendChild(catDiv);
  }
}

// Modal para descrição detalhada
const modal = document.getElementById('product-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');

function openModal(product) {
  modalImg.src = product.image;
  modalImg.alt = product.name;
  modalName.textContent = product.name;
  modalDesc.textContent = product.description || 'Descrição não disponível.';
  modalPrice.textContent = formatPrice(product.price);
  modal.classList.add('active');
}

modalCloseBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
  }
});

// Redirecionar para WhatsApp com produto
function redirectToWhatsApp(product) {
  const phoneNumber = '558296984137'; // Substitua pelo seu número do WhatsApp
  const message = `Olá! Tenho interesse no produto: ${product.name} - ${formatPrice(product.price)}.`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Carrinho → WhatsApp com itens
document.querySelector('.cart-icon').addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  const message = cart.map(p => `• ${p.name} - ${formatPrice(p.price)}`).join('\n');
  const url = `https://wa.me/558296984137?text=${encodeURIComponent('Olá! Gostaria de comprar os seguintes itens:\n' + message)}`;
  window.open(url, '_blank');
});

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  renderProductsByCategory();
});
