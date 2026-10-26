# FH1 Garage

A lightweight, GitHub Pages-compatible virtual garage for the 61-car Forza Horizon 1 collection. Browse the shop, move cars into your garage, search and sort the collection, and switch between English and Polish descriptions.

## Run locally

Because browsers restrict `fetch()` from local files, serve the folder with any static HTTP server:

```bash
python3 -m http.server
```

Open `http://localhost:8000`.

Purchase state is stored only in the browser under `localStorage`; the source JSON files remain unchanged.

Car artwork is stored locally in `assets/cars/` and mapped in `car-images.json`. Images use the earliest verified Horizon artwork available for the matching model. Transparent renders are identified in the manifest and shown on a custom garage backdrop; in-game screenshots retain their original scene background. Image and vehicle-page sources are recorded in the manifest. Vehicles without a verified matching image use a placeholder.
