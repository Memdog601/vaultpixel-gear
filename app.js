/*
    Project: VaultPixel Gear
    Author: Memphis Mitchell
    Updated: 11/01/2026
    Purpose: Product rendering, persistent cart, inventory, checkout, validation, and coupon discounts.
*/

const products = [
    { id: 1, stock: 8, name: "Pulse 75 Keyboard", category: "Keyboards", price: 89.99, icon: "⌨", description: "Compact hot-swap mechanical keyboard with a clean 75% layout." },
    { id: 2, stock: 10, name: "Nova RGB Desk Mat", category: "Desk Accessories", price: 39.99, icon: "▭", description: "Extended desk mat with stitched edges and USB-powered edge lighting." },
    { id: 3, stock: 6, name: "EchoCore Headset Stand", category: "Audio Accessories", price: 29.99, icon: "◉", description: "Weighted aluminum stand with built-in cable management." },
    { id: 4, stock: 12, name: "Flux Cable Kit", category: "Desk Accessories", price: 19.99, icon: "✦", description: "Reusable clips and sleeves for cleaner cable management." },
    { id: 5, stock: 7, name: "Vector Wireless Mouse", category: "Mice", price: 54.99, icon: "◖", description: "Lightweight wireless gaming mouse with adjustable DPI." },
    { id: 6, stock: 5, name: "Arc Mini Keypad", category: "Keyboards", price: 44.99, icon: "▦", description: "Programmable macro keypad for gaming and productivity shortcuts." },
    { id: 7, stock: 9, name: "Signal USB Hub", category: "Connectivity", price: 34.99, icon: "⌁", description: "Seven-port powered USB hub for desk and gaming accessories." },
    { id: 8, stock: 11, name: "Glide Wrist Rest", category: "Ergonomics", price: 24.99, icon: "▬", description: "Memory-foam wrist support designed for compact keyboards." },
    { id: 9, stock: 6, name: "Pixel Monitor Light", category: "Lighting", price: 49.99, icon: "☼", description: "USB monitor light bar with adjustable brightness and color temperature." },
    { id: 10, stock: 8, name: "Core Controller Dock", category: "Gaming Accessories", price: 32.99, icon: "◫", description: "Dual controller charging dock with status indicators." },
    { id: 11, stock: 4, name: "Vault Mic Arm", category: "Audio Accessories", price: 64.99, icon: "♪", description: "Low-profile boom arm for streaming and voice chat setups." },
    { id: 12, stock: 7, name: "Orbit Laptop Stand", category: "Ergonomics", price: 42.99, icon: "△", description: "Adjustable aluminum laptop stand for better desk posture." }
];

const CART_KEY = "vaultPixelCart";
const STOCK_KEY = "vaultPixelStock";

function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function defaultStock() {
    return Object.fromEntries(products.map(product => [product.id, product.stock]));
}

function loadStock() {
    try { return JSON.parse(localStorage.getItem(STOCK_KEY)) || defaultStock(); }
    catch { return defaultStock(); }
}

function saveStock(stock) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
}

function initializeStore() {
    if (!localStorage.getItem(STOCK_KEY)) saveStock(defaultStock());
    if (!localStorage.getItem(CART_KEY)) saveCart([]);
}

function cartCount(cart = loadCart()) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
    const count = cartCount();
    document.querySelectorAll(".cart-count").forEach(el => el.textContent = count);
}

function flashCartFeedback(productName) {
    // Visual feedback: briefly show and animate a success message after an item is added.
    let feedback = document.getElementById("cartFeedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.id = "cartFeedback";
        feedback.className = "cart-feedback";
        feedback.setAttribute("role", "status");
        feedback.setAttribute("aria-live", "polite");
        document.body.appendChild(feedback);
    }
    feedback.textContent = `${productName} added to cart.`;
    feedback.classList.remove("show");
    void feedback.offsetWidth;
    feedback.classList.add("show");
    setTimeout(() => feedback.classList.remove("show"), 1800);
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    const stock = loadStock();
    if (!product || (stock[productId] ?? 0) <= 0) return;

    const cart = loadCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });

    stock[productId] -= 1;
    saveStock(stock);
    saveCart(cart);
    flashCartFeedback(product.name);
    renderProducts();
}

function changeCartQuantity(productId, delta) {
    const cart = loadCart();
    const stock = loadStock();
    const item = cart.find(entry => entry.id === productId);
    if (!item) return;

    if (delta > 0) {
        if ((stock[productId] ?? 0) <= 0) return;
        item.qty += 1;
        stock[productId] -= 1;
    } else if (delta < 0) {
        item.qty -= 1;
        stock[productId] += 1;
        if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
    }

    saveStock(stock);
    saveCart(cart);
    renderCart();
    renderProducts();
}

function removeFromCart(productId) {
    const cart = loadCart();
    const stock = loadStock();
    const item = cart.find(entry => entry.id === productId);
    if (!item) return;
    stock[productId] += item.qty;
    saveStock(stock);
    saveCart(cart.filter(entry => entry.id !== productId));
    renderCart();
    renderProducts();
}

function clearCart() {
    const cart = loadCart();
    const stock = loadStock();
    for (const item of cart) stock[item.id] += item.qty;
    saveStock(stock);
    saveCart([]);
    renderCart();
    renderProducts();
}

function cartSubtotal(cart = loadCart()) {
    return cart.reduce((sum, item) => {
        const product = products.find(product => product.id === item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);
}

function renderCart() {
    const body = document.getElementById("cartItems");
    if (!body) return;
    const cart = loadCart();
    body.innerHTML = "";

    if (!cart.length) {
        body.innerHTML = '<tr><td colspan="4">Your cart is empty.</td></tr>';
    } else {
        for (const item of cart) {
            const product = products.find(product => product.id === item.id);
            if (!product) continue;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>
                    <div class="quantity-controls">
                        <button type="button" class="qty-button" data-action="decrease" data-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button>
                        <span>${item.qty}</span>
                        <button type="button" class="qty-button" data-action="increase" data-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button>
                    </div>
                </td>
                <td>${money(product.price * item.qty)}</td>
                <td><button type="button" class="remove-button" data-action="remove" data-id="${product.id}">Remove</button></td>`;
            body.appendChild(row);
        }
    }

    const countEl = document.getElementById("cartItemCount");
    const subtotalEl = document.getElementById("cartSubtotal");
    if (countEl) countEl.textContent = cartCount(cart);
    if (subtotalEl) subtotalEl.textContent = money(cartSubtotal(cart));

    body.querySelectorAll("button[data-action]").forEach(button => {
        const id = Number(button.dataset.id);
        if (button.dataset.action === "increase") button.addEventListener("click", () => changeCartQuantity(id, 1));
        if (button.dataset.action === "decrease") button.addEventListener("click", () => changeCartQuantity(id, -1));
        if (button.dataset.action === "remove") button.addEventListener("click", () => removeFromCart(id));
    });
}

function setupCartPage() {
    renderCart();
    const clear = document.getElementById("clearCart");
    if (clear) clear.addEventListener("click", clearCart);
}

const coupons = {
    SAVE10: { percent: 10, minimum: 50 },
    PIXEL15: { percent: 15, minimum: 100 },
    SETUP20: { percent: 20, minimum: 150 }
};

function money(value) {
    return `$${value.toFixed(2)}`;
}

function renderProducts() {
    const container = document.getElementById("productGrid");
    if (!container) return;

    const category = document.getElementById("category");
    const selected = category ? category.value : "All Products";
    const visibleProducts = selected === "All Products"
        ? products
        : products.filter(product => product.category === selected);
    const stock = loadStock();

    container.innerHTML = "";

    for (const product of visibleProducts) {
        const available = stock[product.id] ?? 0;
        const soldOut = available <= 0;
        const article = document.createElement("article");
        article.className = `product-card${soldOut ? " out-of-stock" : ""}`;
        if (soldOut) article.title = "Out of Stock";
        article.innerHTML = `
            <div class="product-art" aria-hidden="true">${product.icon}</div>
            <p class="eyebrow">${product.category}</p>
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p class="price">${money(product.price)}</p>
            <p class="stock ${soldOut ? "stock-empty" : ""}">${soldOut ? "Out of Stock" : `${available} in stock`}</p>
            <div class="product-actions">
                <a class="button secondary" href="product.html?id=${product.id}">View Details</a>
                <button class="add-cart-button" type="button" data-product-id="${product.id}" ${soldOut ? 'disabled title="Out of Stock"' : ""}>${soldOut ? "Out of Stock" : "Add to Cart"}</button>
            </div>`;
        container.appendChild(article);
    }

    container.querySelectorAll(".add-cart-button:not(:disabled)").forEach(button => {
        button.addEventListener("click", () => addToCart(Number(button.dataset.productId)));
    });
}
function populateCategoryFilter() {
    const category = document.getElementById("category");
    if (!category) return;

    const categories = [...new Set(products.map(product => product.category))].sort();
    for (const value of categories) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        category.appendChild(option);
    }

    category.addEventListener("change", renderProducts);
}

function showFieldError(field, message) {
    field.classList.add("input-error");
    const error = field.closest(".field")?.querySelector(".field-error");
    if (error) error.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove("input-error");
    const error = field.closest(".field")?.querySelector(".field-error");
    if (error) error.textContent = "";
}

function validateRequired(field, label) {
    clearFieldError(field);
    if (!field.value.trim()) {
        showFieldError(field, `${label} is required.`);
        return false;
    }
    return true;
}

function validateEmail(field) {
    if (!validateRequired(field, "Email address")) return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(field.value.trim())) {
        showFieldError(field, "Enter a valid email address.");
        return false;
    }
    return true;
}

function validatePhone(field) {
    if (!validateRequired(field, "Phone number")) return false;
    const digits = field.value.replace(/\D/g, "");
    if (digits.length !== 10) {
        showFieldError(field, "Enter a 10-digit phone number.");
        return false;
    }
    return true;
}

function validateZip(field) {
    if (!validateRequired(field, "ZIP code")) return false;
    if (!/^\d{5}(-\d{4})?$/.test(field.value.trim())) {
        showFieldError(field, "Enter a valid ZIP code.");
        return false;
    }
    return true;
}

function validateCardNumber(field) {
    if (!validateRequired(field, "Credit card number")) return false;
    const digits = field.value.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
        showFieldError(field, "Enter a valid 13-19 digit card number.");
        return false;
    }
    return true;
}

function validateSecurityCode(field) {
    if (!validateRequired(field, "Security code")) return false;
    if (!/^\d{3,4}$/.test(field.value.trim())) {
        showFieldError(field, "Enter a 3 or 4 digit security code.");
        return false;
    }
    return true;
}

function validateExpiration(field) {
    if (!validateRequired(field, "Expiration date")) return false;
    const today = new Date();
    const selected = new Date(`${field.value}-01T00:00:00`);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (selected < thisMonth) {
        showFieldError(field, "Expiration date must be in the future.");
        return false;
    }
    return true;
}

function setupContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("contactName");
        const email = document.getElementById("contactEmail");
        const message = document.getElementById("contactMessage");

        const valid = [
            validateRequired(name, "Full name"),
            validateEmail(email),
            validateRequired(message, "Message")
        ].every(Boolean);

        const status = document.getElementById("contactStatus");
        if (valid) {
            status.textContent = "Thanks! Your message passed validation and is ready to send.";
            status.className = "form-status success";
            form.reset();
        } else {
            status.textContent = "Please correct the highlighted fields.";
            status.className = "form-status error";
        }
    });
}

function calculateSubtotal() {
    return cartSubtotal();
}

function renderCheckoutItems() {
    const list = document.getElementById("checkoutItems");
    if (!list) return;
    const cart = loadCart();
    list.innerHTML = "";
    if (!cart.length) {
        list.innerHTML = "<li>Your cart is empty.</li>";
        return;
    }
    for (const item of cart) {
        const product = products.find(product => product.id === item.id);
        if (!product) continue;
        const li = document.createElement("li");
        li.className = "order-line";
        li.innerHTML = `<span>${product.name} × ${item.qty}</span><strong>${money(product.price * item.qty)}</strong>`;
        list.appendChild(li);
    }
}

function applyCoupon(code, subtotal) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { valid: true, percent: 0, amount: 0, message: "No coupon applied." };

    const coupon = coupons[normalized];
    if (!coupon) return { valid: false, percent: 0, amount: 0, message: "Coupon code was not found." };
    if (subtotal < coupon.minimum) {
        return { valid: false, percent: 0, amount: 0, message: `This coupon requires an order of at least ${money(coupon.minimum)}.` };
    }

    const amount = subtotal * (coupon.percent / 100);
    return { valid: true, percent: coupon.percent, amount, message: `${coupon.percent}% discount applied.` };
}

function updateCheckoutSummary() {
    const subtotalEl = document.getElementById("subtotal");
    if (!subtotalEl) return;

    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? 8.00 : 0;
    const couponField = document.getElementById("couponCode");
    const result = applyCoupon(couponField ? couponField.value : "", subtotal);

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("shipping").textContent = money(shipping);
    document.getElementById("discount").textContent = `-${money(result.amount)}`;
    document.getElementById("orderTotal").textContent = money(subtotal + shipping - result.amount);

    const couponStatus = document.getElementById("couponStatus");
    if (couponStatus) {
        couponStatus.textContent = result.message;
        couponStatus.className = `form-status ${result.valid ? "success" : "error"}`;
    }

    return result;
}

function validateCheckoutForm() {
    const validators = [
        () => validateRequired(document.getElementById("cardholderName"), "Cardholder name"),
        () => validateCardNumber(document.getElementById("cardNumber")),
        () => validateExpiration(document.getElementById("expiration")),
        () => validateSecurityCode(document.getElementById("securityCode")),
        () => validateRequired(document.getElementById("shipName"), "Full name"),
        () => validateRequired(document.getElementById("streetAddress"), "Street address"),
        () => validateRequired(document.getElementById("city"), "City"),
        () => validateRequired(document.getElementById("state"), "State"),
        () => validateZip(document.getElementById("zip")),
        () => validatePhone(document.getElementById("phone"))
    ];

    return validators.map(run => run()).every(Boolean);
}

function setupCheckout() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    renderCheckoutItems();
    updateCheckoutSummary();

    document.getElementById("applyCoupon").addEventListener("click", () => {
        updateCheckoutSummary();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const couponResult = updateCheckoutSummary();
        const valid = validateCheckoutForm() && couponResult.valid;
        const status = document.getElementById("checkoutStatus");

        if (valid && loadCart().length > 0) {
            const purchasedCount = cartCount();
            const total = document.getElementById("orderTotal").textContent;
            status.textContent = `Order confirmed! ${purchasedCount} item(s) purchased for ${total}. This class prototype does not process a real payment.`;
            status.className = "form-status success";
            saveCart([]);
            renderCheckoutItems();
            updateCheckoutSummary();
        } else {
            status.textContent = "Please correct the highlighted fields before placing the order.";
            status.className = "form-status error";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeStore();
    updateCartBadge();
    populateCategoryFilter();
    renderProducts();
    setupContactForm();
    setupCartPage();
    setupCheckout();
});
