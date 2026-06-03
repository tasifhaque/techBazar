# Operating Procedures

## 1. Routing Structure (STRICT)
* The Product Details Page (PDP) MUST follow this exact dynamic route pattern:
  `/products/[category]/[brand]/[model]`
* Implement `loading.tsx` files with skeleton loaders for all dynamic routes and product grids.

## 2. Global Layout Requirements
* **Navbar:** Must include Home, About, Products, Global Search, and a Cart icon (showing item count, only if authenticated).
* **Auth State:** Unauthenticated users see Login/Signup. Authenticated users see a dropdown with their name, anime avatar, Theme toggle, Profile link, and Logout.
* **Footer:** Contact info, About summary, and a public feedback form.

## 3. Page Specifics
* **Home:** Auto-sliding Framer Motion Hero Carousel (product image, price, discount, Add to Cart, Buy Now), followed by promo banners and an About section.
* **Profile:** Must include forms to update display name, regenerate anime avatar, and a destructive Account Deletion zone.

## 4. State & Animations
* Zustand must be configured with persistence for the Cart and Theme.
* All page transitions and hover states must utilize Framer Motion.