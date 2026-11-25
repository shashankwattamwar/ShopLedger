# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a small Node/Express application. `server.js` creates the app and mounts API routes. Keep HTTP handlers in `routes/`: `products.js`, `orders.js`, `customers.js`, and `reports.js`. Put reusable business rules in `lib/`, grouped by concern: pricing and GST, inventory, Khata ledger, orders, reports, invoice rendering, dates, coupons, and JSON storage.

The browser application lives in `public/` (`index.html`, `js/app.js`, and `css/style.css`). Runtime data is stored in `data/db.json`; treat it as business data, not a generated artifact. Configuration, including shop details, tax slabs, and coupons, is in `config.js`.

## Build, Test, and Development Commands

- `npm install` installs Express and body-parser.
- `npm start` runs `node server.js` and serves the app on `http://localhost:3000` unless `PORT` is set.
- `npm test` currently exits with “no test specified”; do not describe it as a passing test suite.

There is no build step, formatter, linter, or automated test framework in this repository.

## Coding Style & Naming Conventions

Use the existing CommonJS and ES5-style conventions: `var`, `require(...)`, `exports.name = function (...) {}`, and two-space indentation. Keep filenames lowercase and singular/plural as established (`lib/pricing.js`, `routes/orders.js`). Name route files after their API resource and library files after their business domain.

Resolve client-supplied product data against `db.products` in the route before calculating or saving an order. Keep money calculations rounded through the established `round2` helpers.

## Testing Guidelines

When adding behavior, add a focused automated test setup before relying on manual verification. Cover pricing and tax combinations, coupon thresholds/caps, stock movement, Khata limits, cancellation, and invoice-to-order reconciliation. Use descriptive test names such as `rejects an order when sellable stock is insufficient`.

## Commit & Pull Request Guidelines

Use short, imperative, lowercase commit subjects matching the repository history, for example: `support hsn gst slabs and coupon maxDiscount caps`. Keep each commit focused on one behavior.

Pull requests should state the business behavior changed, list affected routes and `lib/` modules, note any `data/db.json` migration or fixture change, and include screenshots for browser or printable-invoice changes. Call out pricing, GST, coupon, inventory, or Khata effects explicitly.

## Security & Configuration

Do not add secrets to `config.js` or URLs. Treat customer details and `data/db.json` as sensitive. Keep admin and export access controls out of query strings when modifying those endpoints.
