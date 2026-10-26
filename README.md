# FH1 Garage

A lightweight, GitHub Pages-compatible virtual garage for the 61-car Forza Horizon 1 collection. Browse the shop, move cars into your garage, search and sort the collection, and switch between English and Polish descriptions.

## Run locally

Because browsers restrict `fetch()` from local files, serve the folder with any static HTTP server:

```bash
python3 -m http.server
```

Open `http://localhost:8000`.

Purchase state is stored only in the browser under `localStorage`; the source JSON files remain unchanged.

Car artwork is stored in `assets/cars/` and mapped to vehicle records in `car-images.json`. Source images are horizontal WebP files.
