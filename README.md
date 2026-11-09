# VaultPixel Gear - Grand Opening

VaultPixel Gear is a responsive e-commerce class project for gaming accessories and desk-setup gear. The Grand Opening version completes the planned customer flow from browsing products through a simulated checkout and adds a local Network Connection Test page.

## Pages
- `index.html` - Store homepage and primary call to action
- `shop.html` - JavaScript-rendered catalog with 12 products and category filtering
- `product.html` - Dynamic product details based on the selected product ID
- `cart.html` - Persistent shopping cart with quantity and removal controls
- `checkout.html` - Shipping/payment-form validation, coupons, totals, and simulated order confirmation
- `contact.html` - Contact form with client-side validation
- `network.html` - Local network connection test and last-launch display

## Current Features
- Responsive shared layout and VaultPixel Gear brand theme
- 12 JavaScript product records rendered dynamically
- Category filtering on the shop page
- Product-specific detail pages using URL product IDs
- Persistent cart stored in `localStorage`
- Add, remove, increase, decrease, and clear-cart controls
- Live cart badge, item count, subtotal, shipping, discount, and total
- Inventory synchronized with cart changes
- Out-of-stock products disabled and labeled with an `Out of Stock` tooltip
- Immediate visual feedback when an item is added
- Contact form validation
- Checkout validation for shipping and class-prototype payment fields
- Coupon codes: `SAVE10`, `PIXEL15`, and `SETUP20`
- Simulated order confirmation; no real payment is processed
- Network Connection Test showing local host name, communication port, transmission protocol, and last launch
- `lastUplink` cookie stores the timestamp of successful local-server launches
- Manual network-test refresh button

## Local Testing
Run the project through a local server such as VS Code Live Server. Open `network.html` and verify that it reports the local host, port, protocol, and a recognized network connection. Refresh once to verify that the previous launch timestamp is displayed from the `lastUplink` cookie.

Opening the files directly with `file:///` is intentionally identified as static/offline mode on the Network Connection Test page.

## Project Files
- HTML pages are stored at the project root.
- `styles.css` contains shared responsive and component styling.
- `app.js` contains product data, cart/inventory storage, validation, checkout, product-detail rendering, and network diagnostics.

## Security / Scope
This is a front-end class prototype. It does not transmit or process real payment information. A production store would validate prices, inventory, authentication, and payments on a trusted server.

## Author
Memphis Mitchell (`memmit6084`)
