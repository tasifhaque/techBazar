The Master Prompt
Role & Objective:
You are an Expert Full-Stack Developer specializing in the modern TypeScript ecosystem. Your task is to architect and build a dynamic, animated e-commerce platform for technology products (smartphones, laptops, monitors, PC components, etc.).

1. Project Architecture & Setup

Monorepo Structure: Create a unified workspace containing /frontend and /backend directories.

Single-Command Execution: Configure the root package.json using Bun workspaces or concurrently so that a single command (e.g., bun run dev) spins up both the frontend and backend servers simultaneously.

2. Technology Stack

Frontend: Next.js (App Router), Bun, Tailwind CSS, Zustand (global state management), Framer Motion (animations/transitions), Lucide-React (icons).

Backend: Hono (Node.js/Bun adapter), Better-Auth (authentication), JWT, bcrypt (password hashing), Zod (schema validation), cookie-parser, dotenv.

Database: MongoDB via Mongoose.

3. Database Schema Rules

Global Mongoose Rules: Every schema MUST strictly include { toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }.

User Schema: Fields for name, email, password, gender (enum: male/female), avatarUrl, and role.

Product Schema: Fields for title, description, price, discountPercentage, category, brand, model, images (array), and stock count.

Comment Schema: Fields for user reference, comment text, and timestamp.

4. Authentication & User Flow

Signup: Collect Name, Email, Password, and Gender.

Dynamic Avatars: Upon registration, automatically assign a random anime avatar URL based on the user's selected gender (male/female) using a public avatar API.

Session Management: Implement secure, HTTP-only cookie-based authentication via Better-Auth and JWT.

5. Frontend Navigation & Global Layout

Header/Navbar:

Links: Home, About, Products.

Global Search Bar to query products.

Cart Link/Icon: Displays the current item count. (Rendered only if the user is authenticated).

User Dropdown (Authenticated): Displays the user's name and anime avatar. Contains a theme toggle (Dark/Light mode via Zustand/Tailwind), a link to the Profile page, and a Logout action.

Auth Buttons (Unauthenticated): Login and Signup links.

Footer:

Company contact information (Email, Phone, Location).

An "About Us" summary block.

A public comment/feedback form for visitors.

6. Page Specifications

Home Page (/):

Hero Carousel: An auto-sliding, Framer Motion-animated carousel featuring mixed products. Each slide must include the product image, price, discount indicator, "Add to Cart", and "Buy Now" buttons.

Promo Section: Two highly visual discount posters/banners directly below the carousel.

About Section: A dedicated section expanding on the brand's mission.

Products Page (/products):

A responsive grid displaying all tech products.

Include filtering or sorting by category (e.g., Mobile, Laptop, Keyboard).

Dynamic Product Details (/products/[category]/[brand]/[model]):

Implement this exact dynamic URL routing structure (e.g., /products/mobile/apple/iphone-15-pro).

Display comprehensive product specifications, high-quality images, pricing, and an "Add to Cart" action.

Profile Page (/profile):

Forms allowing the user to update their display name and cycle/regenerate their anime avatar.

A destructive "Delete Account" action zone.

7. Developer Directives & UX Best Practices

Animations: Use Framer Motion extensively for smooth page transitions, carousel sliding, hover states, and micro-interactions.

State Persistence: Utilize Zustand to persist the shopping cart contents and user theme preference across browser reloads.

Loading States: Implement Next.js loading.tsx files with skeleton loaders for dynamic routes and product grids to ensure a seamless perceived performance.

Data Validation: Enforce strict Zod validation on both the frontend (form inputs) and backend (API request payloads).

Please generate the complete directory structure, the root configuration files, the Mongoose models, the Hono backend initialization, and the primary Next.js pages and components to fulfill these requirements.
