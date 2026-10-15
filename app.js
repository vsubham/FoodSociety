const menu = [
  { id: 'pasta', name: 'Sunday pesto pasta', category: 'Bowls & plates', price: 16, rating: '4.9', time: '15 min', tag: 'HOUSE FAVORITE', description: 'Basil pesto, sweet peas, parmesan, a little lemon.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=85' },
  { id: 'salmon', name: 'Honey-glazed salmon', category: 'Bowls & plates', price: 19, rating: '4.8', time: '20 min', tag: 'FEEL-GOOD PICK', description: 'Flaky salmon, herby grains, crisp greens.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=85' },
  { id: 'burger', name: 'The big little burger', category: 'Sandwiches', price: 15, rating: '4.9', time: '15 min', tag: 'CROWD PLEASER', description: 'Grass-fed beef, sharp cheddar, onion jam.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=85' },
  { id: 'salad', name: 'Green goddess bowl', category: 'Salads', price: 14, rating: '4.7', time: '10 min', tag: 'PLANT POWER', description: 'Avocado, cucumber, herbs, crunchy chickpeas.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85' },
  { id: 'pizza', name: 'Hot honey margherita', category: 'Bowls & plates', price: 17, rating: '4.8', time: '18 min', tag: 'A LITTLE SPICY', description: 'Slow tomatoes, torn mozzarella, hot honey.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=85' },
  { id: 'toast', name: 'Avocado sunshine toast', category: 'Breakfast', price: 12, rating: '4.9', time: '8 min', tag: 'MORNING MOOD', description: 'Sourdough, smashed avocado, chili crunch.', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=85' },
  { id: 'soup', name: 'Tomato & basil soup', category: 'Soups & sides', price: 9, rating: '4.8', time: '8 min', tag: 'COZY CLASSIC', description: 'Roasted tomatoes, fresh basil, warm focaccia.', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85' },
  { id: 'cookie', name: 'Big soft-baked cookie', category: 'Something sweet', price: 6, rating: '5.0', time: '5 min', tag: 'JUST BECAUSE', description: 'Brown butter, dark chocolate, flaky salt.', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85' },
];

const categories = ['Everything', 'Bowls & plates', 'Salads', 'Sandwiches', 'Breakfast', 'Soups & sides', 'Something sweet'];
const state = { category: 'Everything', query: '', cart: [], selectedItem: null, selectedQuantity: 1, toastTimer: null, trackingTimer: null };
const $ = (selector) => document.querySelector(selector);
const money = (amount) => `$${amount.toFixed(2)}`;
const dialog = $('#app-dialog');
const dialogContent = $('#dialog-content');

function renderCategories() {
  $('#category-list').innerHTML = categories.map((category) => `
    <button class="category-button" type="button" aria-pressed="${state.category === category}" data-category="${category}">${category}</button>
  `).join('');
}

function renderMenu() {
  const query = state.query.trim().toLowerCase();
  const filtered = menu.filter((item) => (state.category === 'Everything' || item.category === state.category)
    && (!query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query)));
  $('#menu-grid').innerHTML = filtered.map((item) => `
    <article class="menu-card">
      <button class="menu-card-image" type="button" data-open-item="${item.id}" aria-label="Customize ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <span class="item-tag">${item.tag}</span>
        <span class="add-item-button" aria-hidden="true">+</span>
      </button>
      <div class="menu-card-copy">
        <div class="menu-card-title-row"><h3>${item.name}</h3><span class="menu-card-price">$${item.price}</span></div>
        <p class="menu-card-description">${item.description}</p>
        <div class="menu-card-meta"><span class="menu-card-rating"><span>★</span> ${item.rating}</span><span>·</span><span>${item.time}</span></div>
      </div>
    </article>
  `).join('');
  $('#empty-state').hidden = filtered.length > 0;
  $('#menu-grid').hidden = filtered.length === 0;
  $('#result-count').textContent = query || state.category !== 'Everything' ? `${filtered.length} good ${filtered.length === 1 ? 'thing' : 'things'} to eat` : 'Everything, made fresh';
}

function cartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 25 ? 0 : 2.5;
  return { subtotal, delivery, total: subtotal + delivery, count: state.cart.reduce((sum, item) => sum + item.quantity, 0) };
}

function renderCart() {
  const { subtotal, delivery, total, count } = cartTotals();
  const hasItems = count > 0;
  $('#header-count').textContent = count;
  $('#bag-count-label').textContent = `(${count})`;
  $('#bag-items').innerHTML = hasItems ? state.cart.map((item) => `
    <div class="bag-item">
      <div><div class="bag-item-name">${item.name}</div><div class="bag-item-detail">${item.size}${item.note ? ` · ${item.note}` : ''}</div>
        <div class="bag-item-controls"><button class="qty-button" type="button" aria-label="Decrease ${item.name}" data-quantity="-1" data-key="${item.key}">−</button><span>${item.quantity}</span><button class="qty-button" type="button" aria-label="Increase ${item.name}" data-quantity="1" data-key="${item.key}">+</button><button class="remove-button" type="button" data-remove="${item.key}">Remove</button></div>
      </div><span class="bag-item-price">${money(item.price * item.quantity)}</span>
    </div>
  `).join('') : '<div class="bag-empty"><span aria-hidden="true">▱</span><p>Your next good meal<br />starts right here.</p></div>';
  $('#bag-summary').hidden = !hasItems;
  $('#bag-empty-prompt').hidden = hasItems;
  $('#subtotal').textContent = money(subtotal);
  $('#delivery-fee').textContent = delivery === 0 ? 'On us' : money(delivery);
  $('#total').textContent = money(total);
  $('#free-delivery-note').innerHTML = subtotal >= 25 ? 'Your delivery is <strong>on us</strong>. Nice.' : `Add <strong>${money(25 - subtotal)}</strong> for free delivery`;
  $('#mobile-bag-bar').hidden = !hasItems;
  $('#mobile-count').textContent = count;
  $('#mobile-total').innerHTML = `${money(total)} <span aria-hidden="true">→</span>`;
}

function openItem(itemId) {
  const item = menu.find((entry) => entry.id === itemId);
  if (!item) return;
  state.selectedItem = item;
  state.selectedQuantity = 1;
  dialogContent.innerHTML = `
    <button class="dialog-close" type="button" aria-label="Close">×</button>
    <img class="dialog-image" src="${item.image}" alt="${item.name}" />
    <div class="dialog-body">
      <p class="dialog-kicker">${item.tag} · ★ ${item.rating}</p><h2 id="dialog-title">${item.name}</h2><p class="dialog-description">${item.description} Made fresh for you, every time.</p>
      <span class="dialog-label">Make it yours</span>
      <div class="size-options"><label class="size-option"><span><input type="radio" name="size" value="Regular" checked /> Regular</span><strong>$${item.price}</strong></label><label class="size-option"><span><input type="radio" name="size" value="Large" /> Large</span><strong>+$3</strong></label></div>
      <label class="dialog-label" for="item-note">A little note for the kitchen <span style="color:#8a958b;font-weight:400">(optional)</span></label><textarea class="dialog-textarea" id="item-note" maxlength="100" placeholder="Extra lemon, please..."></textarea>
      <div class="dialog-actions"><div class="quantity-stepper"><button type="button" data-modal-quantity="-1" aria-label="Decrease quantity">−</button><span id="modal-quantity">1</span><button type="button" data-modal-quantity="1" aria-label="Increase quantity">+</button></div><button class="primary-action" id="add-to-bag" type="button"><span>Add to bag</span><span id="modal-price">$${item.price}</span></button></div>
    </div>`;
  dialog.showModal();
}

function updateModalPrice() {
  const size = dialogContent.querySelector('input[name="size"]:checked')?.value ?? 'Regular';
  const price = state.selectedItem.price + (size === 'Large' ? 3 : 0);
  $('#modal-quantity').textContent = state.selectedQuantity;
  $('#modal-price').textContent = money(price * state.selectedQuantity);
}

function addSelectedItem() {
  const item = state.selectedItem;
  const size = dialogContent.querySelector('input[name="size"]:checked')?.value ?? 'Regular';
  const note = $('#item-note').value.trim();
  const price = item.price + (size === 'Large' ? 3 : 0);
  const key = `${item.id}:${size}:${note.toLowerCase()}`;
  const existing = state.cart.find((entry) => entry.key === key);
  if (existing) existing.quantity += state.selectedQuantity;
  else state.cart.push({ key, id: item.id, name: item.name, size, note, price, quantity: state.selectedQuantity });
  dialog.close();
  renderCart();
  showToast(`${item.name} added to your bag`);
}

function changeQuantity(key, delta) {
  const item = state.cart.find((entry) => entry.key === key);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) state.cart = state.cart.filter((entry) => entry.key !== key);
  renderCart();
}

function openCheckout() {
  if (!state.cart.length) return;
  const { subtotal, delivery, total } = cartTotals();
  const itemSummary = state.cart.map((item) => `${item.quantity} × ${item.name} (${item.size})`).join('<br />');
  dialogContent.innerHTML = `
    <button class="dialog-close" type="button" aria-label="Close">×</button>
    <div class="dialog-body checkout-body"><p class="dialog-kicker">ONE LAST THING</p><h2 id="dialog-title">Make it yours.</h2><p class="dialog-description">A few details, then the good stuff is on its way.</p>
      <div class="checkout-items">${itemSummary}<div class="checkout-total"><span>Subtotal ${delivery ? `+ ${money(delivery)} delivery` : '· delivery on us'}</span><strong>${money(total)}</strong></div></div>
      <form id="checkout-form">
        <div class="form-grid"><label class="form-field">Your name<input name="name" autocomplete="name" required placeholder="Jamie Rivera" /></label><label class="form-field">Phone number<input name="phone" type="tel" autocomplete="tel" required placeholder="(555) 123-4567" /></label>
        <label class="form-field full">Where should we bring it?<input name="address" autocomplete="street-address" required placeholder="Street address, apartment" /></label></div>
        <div class="fulfillment-options"><label class="fulfillment-option"><input type="radio" name="fulfillment" value="Delivery" checked /> Bring it to me</label><label class="fulfillment-option"><input type="radio" name="fulfillment" value="Pickup" /> I'll pick it up</label></div>
        <label class="form-field">Paying with<select name="payment"><option>Card ·•••• 4242</option><option>Cash at the door</option></select></label>
        <button class="primary-action" type="submit"><span>Place my order</span><span>${money(total)} →</span></button><p class="demo-note">Sample checkout · no payment will be processed.</p>
      </form>
    </div>`;
  const address = dialogContent.querySelector('[name="address"]');
  dialogContent.querySelectorAll('[name="fulfillment"]').forEach((option) => option.addEventListener('change', () => {
    const pickup = dialogContent.querySelector('[name="fulfillment"]:checked').value === 'Pickup';
    address.required = !pickup;
    address.disabled = pickup;
    address.placeholder = pickup ? 'Pickup at Food Society, Brooklyn' : 'Street address, apartment';
  }));
  dialogContent.querySelector('#checkout-form').addEventListener('submit', placeOrder);
  dialog.showModal();
}

function placeOrder(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const { total, count } = cartTotals();
  const fulfillment = form.get('fulfillment');
  const order = { number: `FS-${Math.floor(10000 + Math.random() * 90000)}`, name: form.get('name'), address: fulfillment === 'Pickup' ? 'Food Society, Brooklyn' : form.get('address'), fulfillment, total, count };
  state.cart = [];
  clearTimeout(state.trackingTimer);
  renderCart();
  renderConfirmation(order, 0);
  state.trackingTimer = setTimeout(() => renderConfirmation(order, 1), 5500);
}

function renderConfirmation(order, activeStep) {
  const steps = ['Confirmed', 'Preparing', order.fulfillment === 'Pickup' ? 'Ready' : 'On the way', 'Enjoy!'];
  dialogContent.innerHTML = `
    <div class="confirmation-top"><div class="confirmation-mark" aria-hidden="true">✓</div><p class="eyebrow">THAT'S A GOOD CHOICE</p><h2 id="dialog-title">Order confirmed.</h2><p>${order.name}, something delicious is in the works.</p></div>
    <div class="confirmation-body"><div class="order-number"><span>YOUR ORDER</span><strong>${order.number}</strong></div><p class="tracking-title">${order.fulfillment === 'Pickup' ? 'Pickup' : 'On its way'} · about 25–35 min</p>
      <div class="tracking-list">${steps.map((step, index) => `<div class="tracking-step ${index < activeStep ? 'is-done' : ''} ${index === activeStep ? 'is-current' : ''}"><span>${index < activeStep ? '✓' : index + 1}</span><span>${step}</span></div>`).join('')}</div>
      <div class="confirmation-details"><strong>${order.fulfillment === 'Pickup' ? 'Pick up at' : 'Delivering to'}</strong><br />${order.address}<br /><strong>${order.count} items · ${money(order.total)}</strong></div>
      <button class="primary-action" id="done-button" type="button" style="width:100%;margin-top:15px"><span>Back to the menu</span><span>→</span></button>
    </div>`;
  if (!dialog.open) dialog.showModal();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

$('#category-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  renderCategories();
  renderMenu();
});
$('#menu-search').addEventListener('input', (event) => { state.query = event.target.value; renderMenu(); });
$('#menu-grid').addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-item]');
  if (button) openItem(button.dataset.openItem);
});
$('#dialog-content').addEventListener('click', (event) => {
  if (event.target.closest('.dialog-close')) dialog.close();
  const quantityButton = event.target.closest('[data-modal-quantity]');
  if (quantityButton) {
    state.selectedQuantity = Math.max(1, Math.min(20, state.selectedQuantity + Number(quantityButton.dataset.modalQuantity)));
    updateModalPrice();
  }
  const addButton = event.target.closest('#add-to-bag');
  if (addButton) addSelectedItem();
  const doneButton = event.target.closest('#done-button');
  if (doneButton) dialog.close();
});
$('#dialog-content').addEventListener('change', (event) => {
  if (event.target.matches('input[name="size"]')) updateModalPrice();
});
$('#bag-items').addEventListener('click', (event) => {
  const quantityButton = event.target.closest('[data-quantity]');
  if (quantityButton) changeQuantity(quantityButton.dataset.key, Number(quantityButton.dataset.quantity));
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) { state.cart = state.cart.filter((item) => item.key !== removeButton.dataset.remove); renderCart(); }
});
$('#checkout-button').addEventListener('click', openCheckout);
$('#mobile-bag-button').addEventListener('click', () => {
  $('#bag-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (window.matchMedia('(max-width: 680px)').matches) openCheckout();
});
$('#header-cart').addEventListener('click', () => {
  if (window.matchMedia('(max-width: 680px)').matches && state.cart.length) openCheckout();
  else $('#bag-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#feature-button').addEventListener('click', () => openItem('pasta'));
$('#address-button').addEventListener('click', () => showToast('Delivery available across Brooklyn, NY'));
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    event.preventDefault();
    $('#menu-search').focus();
  }
});

renderCategories();
renderMenu();
renderCart();