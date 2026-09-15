# Joyería Lezcano — Project Context

## 1. Project overview

This is the official ecommerce website for Joyería Lezcano, an existing jewelry business located in Paysandú, Uruguay.

The business is mainly operated by one person, who:
- repairs jewelry;
- sells factory-made products;
- creates artisan pieces;
- accepts custom and made-to-order work;
- maintains direct and personalized communication with customers.

The website must improve visibility, organize the catalog and facilitate purchases and consultations, but it must NOT replace the owner's direct relationship with customers.

The website must feel like a real jewelry business and workshop, not like a generic ecommerce template.

---

## 2. Main objectives

The website must eventually provide:

- Public presentation of the jewelry.
- Product catalog.
- Product categories.
- Product detail pages.
- Customer registration and authentication.
- Shopping cart.
- Checkout.
- Mercado Pago payments.
- Customer order history.
- Saved addresses.
- Shipping throughout Uruguay.
- Free local pickup.
- Manual shipping-cost confirmation.
- Repairs and restoration information.
- Custom jewelry information.
- Made-to-order products through direct consultation.
- Gallery of completed works.
- Admin dashboard.
- Product and stock management.
- Order management.
- Customer management.
- Consultation management.
- Basic website content management.

The first version should be complete and functional without unnecessary advanced features.

---

## 3. Technology stack

Use the following architecture unless explicitly instructed otherwise:

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router
- Supabase
  - PostgreSQL
  - Authentication
  - Storage
  - Row Level Security
- Mercado Pago
- GitHub
- Vercel for deployment

Google Sheets may be used as an auxiliary tool for imports, exports, reports or simple administrative workflows.

Google Sheets must NOT become the transactional source of truth for products, stock, orders or payments.

---

## 4. Architecture rules

Follow a simple, maintainable architecture.

Browser/mobile
→ Next.js frontend
→ Next.js server-side logic / server actions / API routes where appropriate
→ Supabase

Mercado Pago must be integrated through secure server-side logic.

Never expose secret Mercado Pago credentials to the browser.

Never trust payment status based only on client-side redirects.

The server must verify payment status independently.

Do not introduce additional infrastructure, databases, frameworks or services unless there is a clear technical reason and the change is explicitly approved.

Avoid overengineering.

---

## 5. Existing database

The Supabase database has already been created.

Current tables:

- categories
- products
- product_images
- profiles
- addresses
- orders
- order_items
- payments
- stock_movements
- consultations
- completed_works
- completed_work_images
- site_content

Initial product categories:

- Anillos
- Pulseras
- Cadenas
- Dijes
- Joyería artesanal
- Bombillas
- Cabos
- Boquillas
- Otros

Do not recreate these tables or categories.

Do not casually rename database tables or columns.

If a database schema change is necessary, explain the migration before implementing it.

---

## 6. Product rules

Products may be:

1. Direct sale
2. Unique piece
3. Consultation / made-to-order / custom-related

Product fields currently include:

- name
- slug
- description
- category
- material
- price
- stock
- product type
- active/inactive status
- images

Do not invent product characteristics such as weight, metal purity or measurements unless the business later provides that information.

Products with zero stock must not appear as buyable products in the public catalog.

Unique products are not automatically replicable or reorderable.

A unique product is unavailable once its stock reaches zero.

---

## 7. Inventory rules

These rules are critical.

Adding a product to the shopping cart does NOT reduce stock.

Creating a pending order does NOT reduce stock.

A rejected payment does NOT reduce stock.

A cancelled payment does NOT reduce stock.

Stock is reduced only after a payment is independently confirmed as approved.

Before confirming a sale, the server/database must recheck stock.

The system must prevent two customers from successfully purchasing the same last unit simultaneously.

Stock changes must be traceable through stock_movements.

Do not implement stock reduction exclusively in frontend code.

---

## 8. Order rules

Orders must preserve historical information.

An order item must preserve at least:

- product name at the time of purchase;
- unit price at the time of purchase;
- quantity;
- subtotal.

Changing the current product name or price must NOT modify historical orders.

Current order statuses include:

- pending_confirmation
- pending_payment
- payment_confirmed
- preparing
- ready_for_pickup
- shipped
- completed
- cancelled
- payment_rejected

Do not allow nonsensical status transitions.

---

## 9. Delivery rules

There are two delivery methods:

### Local pickup

- Free.
- Customer collects the order at the jewelry business.
- Payment can proceed once the order total is known.

### Shipping

- Available throughout Uruguay.
- Shipping method is determined case by case.
- Shipping cost is calculated manually by the owner or person responsible for shipping.
- Customer provides the complete delivery address.
- The final total must be confirmed before payment.

Do not invent fixed shipping prices.

Do not implement an automatic shipping-price calculator unless explicitly requested later.

---

## 10. Custom and made-to-order work

Custom work, repairs, restorations and made-to-order pieces are primarily handled through direct communication with the owner.

Examples include:

- custom rings;
- esclava-style bracelets;
- custom bombillas;
- custom cabos;
- artisan pieces;
- repairs;
- restorations;
- modifications.

Do not create an automatic quotation engine.

Do not create a complex ticketing system.

The main call to action is WhatsApp.

WhatsApp consultation should open a general conversation with a simple initial message such as:

"Hola, quisiera realizar una consulta."

Do not automatically generate long product-specific messages.

Custom/made-to-order work is not necessarily a normal ecommerce purchase.

A deposit/seña may be required depending on the work and is agreed privately with the owner.

Do not invent deposit percentages, deadlines or warranty policies.

---

## 11. Customer accounts

Customers may:

- browse without registering;
- view the catalog without registering;
- contact the business without registering.

Registration/login is required when purchasing.

Customer authentication must support:

- registration;
- login;
- logout;
- password recovery;
- personal information;
- order history;
- saved addresses.

Customers must never be able to access another customer's private information.

---

## 12. Administrators

There are two administrators:

- the owner;
- the project administrator/user.

Both have the same administrative permissions.

Each administrator must have their own account.

Do NOT create a shared admin password.

Administrators can eventually:

- create/edit products;
- change prices;
- manage stock;
- upload/delete product images;
- activate/deactivate products;
- manage categories;
- manage orders;
- update order statuses;
- manage shipping information;
- view customers;
- manage consultations;
- manage completed works;
- edit basic website content.

Admin permissions must be enforced server-side and through Supabase RLS where appropriate.

Never rely only on hiding UI elements to protect admin functionality.

---

## 13. Security

Security is a first-class requirement.

Use Supabase Row Level Security correctly.

Public users may read only information intentionally exposed publicly.

Customers may access only their own:

- profile;
- addresses;
- orders;
- order items;
- relevant payment information.

Administrators may access administrative data according to their permissions.

Never expose:

- service-role keys;
- Mercado Pago secret credentials;
- private environment variables;
- private customer information.

Never put secret credentials in client components.

Validate important data server-side.

Do not trust prices, stock quantities, payment statuses or user roles supplied by the browser.

---

## 14. Design direction

The visual identity should be:

- elegant;
- minimalist;
- artisanal;
- premium but accessible;
- black and white as the primary visual language;
- subtle silver and gold accents;
- strong use of jewelry/workshop photography;
- generous whitespace;
- clear typography;
- restrained animations.

The existing Joyería Lezcano logo and visual identity should be respected.

The website should NOT look like a generic dropshipping store.

It should communicate craftsmanship, trust and personalized attention.

The site must be responsive and mobile-first.

---

## 15. Public site structure

Main public pages:

- Inicio
- Catálogo
- Categorías
- Producto
- Servicios
- Trabajos realizados
- La joyería
- Contacto

Services include:

- Arreglos
- Personalizados
- Encargos

There does not need to be a separate "Por encargo" ecommerce page.

---

## 16. Home page direction

The home page should eventually contain:

1. Header/navigation.
2. Hero section.
3. Joyería Lezcano identity.
4. Main call to action.
5. Product categories.
6. Featured products.
7. Services.
8. Completed works.
9. Short history of the jewelry/workshop.
10. Contact/location/hours.
11. Footer.

Primary actions should be clear:

- "Ver catálogo"
- "Comprar"
- "Consultar por WhatsApp"

---

## 17. Product catalog

The catalog should eventually support:

- category filtering;
- search;
- sorting;
- availability;
- product detail pages.

Possible sorting:

- featured/newest;
- price low to high;
- price high to low;
- name.

Product cards should show relevant information without clutter.

Out-of-stock products should not be presented as purchasable products.

Consultation products should show a consultation action instead of a normal purchase action.

---

## 18. Completed works

"Trabajos realizados" is separate from the active product catalog.

It can include:

- sold unique pieces;
- artisan work;
- custom pieces;
- repairs;
- restorations;
- made-to-order work.

Completed works do not need:

- price;
- stock;
- purchase button.

They should primarily showcase craftsmanship.

---

## 19. WhatsApp

WhatsApp is an important communication channel.

Use it prominently but tastefully.

Possible locations:

- hero;
- services;
- product consultation;
- contact;
- mobile navigation;
- completed works;
- footer.

The general WhatsApp action should open a conversation with the owner.

Do not build an internal chat system.

---

## 20. Code quality

Write production-quality code.

Prefer:

- small reusable components;
- clear naming;
- strong TypeScript typing;
- server-side validation where required;
- accessible HTML;
- responsive layouts;
- reusable UI primitives where appropriate;
- clear separation between public, customer and admin functionality.

Avoid:

- duplicated logic;
- unnecessary dependencies;
- huge components;
- hardcoded business rules scattered across the application;
- unnecessary abstraction;
- placeholder architecture that will have to be rewritten later.

---

## 21. Next.js instructions

The repository also contains AGENTS.md generated by Next.js.

Read and follow AGENTS.md.

IMPORTANT:

This project uses the installed version of Next.js, which may contain APIs and conventions different from older versions.

Before implementing Next.js-specific functionality, consult the relevant local Next.js documentation under:

node_modules/next/dist/docs/

Do not assume APIs from older versions.

---

## 22. Working rules for Claude

Before modifying code:

1. Understand the existing project structure.
2. Read relevant files.
3. Check existing dependencies.
4. Check the current implementation.
5. Do not overwrite working functionality unnecessarily.
6. Follow the existing architecture.
7. Consider security and RLS implications.
8. Consider responsive behavior.
9. Consider accessibility.
10. Consider error and loading states.

When a task requires multiple files, implement the complete coherent change rather than stopping halfway.

Do not ask the user unnecessary questions.

If a decision has already been defined in this document, follow it.

If a requirement is genuinely ambiguous and materially affects architecture, explain the ambiguity and propose the safest option.

Do not invent business policies.

Do not invent prices, shipping costs, warranties, return policies, schedules or contact information.

Use placeholders or configurable content when the real business information has not yet been provided.

---

## 23. Definition of done

A feature is not considered complete merely because the page renders.

Where applicable, verify:

- TypeScript compilation;
- linting;
- responsive behavior;
- loading states;
- error states;
- empty states;
- authentication behavior;
- authorization;
- RLS;
- server-side validation;
- accessibility;
- security;
- database consistency.

Before declaring a task complete, run the relevant checks available in the project and report any remaining issues.

---

## 24. Development priorities

Prioritize in this order:

1. Correctness.
2. Security.
3. Data integrity.
4. Maintainability.
5. User experience.
6. Visual polish.
7. Performance.
8. Extra features.

Do not add advanced features simply because they are technically possible.

The goal is to launch a reliable, professional ecommerce website with the minimum necessary complexity.
