/*
    Project: VaultPixel Gear
    Author: Memphis Mitchell
    Updated: 10/25/2026
    Purpose: Product rendering, form validation, cart totals, and coupon discounts.
*/

const products = [
    { id: 1, name: "Pulse 75 Keyboard", category: "Keyboards", price: 89.99, icon: "⌨", description: "Compact hot-swap mechanical keyboard with a clean 75% layout." },
    { id: 2, name: "Nova RGB Desk Mat", category: "Desk Accessories", price: 39.99, icon: "▭", description: "Extended desk mat with stitched edges and USB-powered edge lighting." },
    { id: 3, name: "EchoCore Headset Stand", category: "Audio Accessories", price: 29.99, icon: "◉", description: "Weighted aluminum stand with built-in cable management." },
    { id: 4, name: "Flux Cable Kit", category: "Desk Accessories", price: 19.99, icon: "✦", description: "Reusable clips and sleeves for cleaner cable management." },
    { id: 5, name: "Vector Wireless Mouse", category: "Mice", price: 54.99, icon: "◖", description: "Lightweight wireless gaming mouse with adjustable DPI." },
    { id: 6, name: "Arc Mini Keypad", category: "Keyboards", price: 44.99, icon: "▦", description: "Programmable macro keypad for gaming and productivity shortcuts." },
    { id: 7, name: "Signal USB Hub", category: "Connectivity", price: 34.99, icon: "⌁", description: "Seven-port powered USB hub for desk and gaming accessories." },
    { id: 8, name: "Glide Wrist Rest", category: "Ergonomics", price: 24.99, icon: "▬", description: "Memory-foam wrist support designed for compact keyboards." },
    { id: 9, name: "Pixel Monitor Light", category: "Lighting", price: 49.99, icon: "☼", description: "USB monitor light bar with adjustable brightness and color temperature." },
    { id: 10, name: "Core Controller Dock", category: "Gaming Accessories", price: 32.99, icon: "◫", description: "Dual controller charging dock with status indicators." },
    { id: 11, name: "Vault Mic Arm", category: "Audio Accessories", price: 64.99, icon: "♪", description: "Low-profile boom arm for streaming and voice chat setups." },
    { id: 12, name: "Orbit Laptop Stand", category: "Ergonomics", price: 42.99, icon: "△", description: "Adjustable aluminum laptop stand for better desk posture." }
];

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

    container.innerHTML = "";

    for (const product of visibleProducts) {
        const article = document.createElement("article");
        article.className = "product-card";
        article.innerHTML = `
            <div class="product-art" aria-hidden="true">${product.icon}</div>
            <p class="eyebrow">${product.category}</p>
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p class="price">${money(product.price)}</p>
            <a class="button" href="product.html?id=${product.id}">View Details</a>
        `;
        container.appendChild(article);
    }
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

const orderItems = [
    { name: "Pulse 75 Keyboard", price: 89.99, qty: 1 },
    { name: "Nova RGB Desk Mat", price: 39.99, qty: 1 }
];

function calculateSubtotal() {
    return orderItems.reduce((total, item) => total + (item.price * item.qty), 0);
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
    const shipping = 8.00;
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

    updateCheckoutSummary();

    document.getElementById("applyCoupon").addEventListener("click", () => {
        updateCheckoutSummary();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const couponResult = updateCheckoutSummary();
        const valid = validateCheckoutForm() && couponResult.valid;
        const status = document.getElementById("checkoutStatus");

        if (valid) {
            status.textContent = "Checkout validation passed. This class prototype does not process a real payment.";
            status.className = "form-status success";
        } else {
            status.textContent = "Please correct the highlighted fields before placing the order.";
            status.className = "form-status error";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateCategoryFilter();
    renderProducts();
    setupContactForm();
    setupCheckout();
});
