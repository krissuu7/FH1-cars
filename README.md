# FH1 Garage

A lightweight, GitHub Pages-compatible virtual garage for the 61-car Forza Horizon 1 collection. Browse the shop, move cars into your garage, search and sort the collection, and switch between English and Polish descriptions.

## Run locally

Because browsers restrict `fetch()` from local files, serve the folder with any static HTTP server:

```bash
python3 -m http.server
```

Open `http://localhost:8000`.

Purchase state is stored only in the browser under `localStorage`; the source JSON files remain unchanged.

Car artwork is stored locally in `assets/cars/` and mapped in `car-images.json`. Images are matched to Forza Horizon 1-specific artwork on the [Forza Wiki car list](https://forza.fandom.com/wiki/Forza_Horizon/Cars); cars without a verified FH1 image use a placeholder instead of unrelated artwork. The detail view links to the image file and source list.
