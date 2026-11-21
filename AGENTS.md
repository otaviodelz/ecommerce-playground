# Architecture & Engineering Standards

This repository simulates a **large-scale production e-commerce operated by multiple independent squads** (e.g., Platform/Design System, Catalog/Search, PDP, Cart/Checkout, Account, CMS).

## Guiding Principles

- **Production-grade, market-standard architecture:** Always prefer battle-tested industry patterns and tooling designed for multi-squad scale, maintainability, strict boundaries, and Core Web Vitals performance — avoid shortcuts or toy setups that wouldn't hold up in a large organization.
- **Clear package & ownership boundaries:** Shared foundations (`packages/design-system`, shared configs, tokens) must stay decoupled from storefront runtime apps (`apps/web`, `apps/server`). Documentation/showcase tooling must not leak into production storefront bundles or routes.
- **Design System governance:** Components live in `@playground/design-system`, built on `@ui-sdk/*` behaviors with strict WAI-ARIA accessibility, keyboard navigation, agent-readiness, and WCAG contrast compliance. Storefront squads consume tokens and components rather than duplicating global CSS or hand-rolling interactive primitives.
- **Verification:** Every architectural or component change must be verified with typechecks, automated tests (including agent tests where applicable), and production builds.
