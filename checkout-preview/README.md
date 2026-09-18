# Checkout UI Preview

Static UI-only checkout mock. No cart, payment, or form logic.

## Run

From the repo root:

```bash
npx --yes serve checkout-preview -p 5173
```

Open [http://localhost:5173](http://localhost:5173).

Alternate (Python):

```bash
cd checkout-preview
python -m http.server 5173
```

Then open the same URL. A local server is required because components load via `fetch`.
