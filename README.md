# Konstantinos’s Wardrobe

A small, dependency-free personal wardrobe app inspired by the supplied monochrome catalog reference. Exactly **30 looks** share **40 pieces**: seven for each season, one gym uniform and one lounge uniform.

## Run locally

Requires Node.js 20 or newer. No packages, API keys or build step are needed.

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Run `npm test` to verify the capsule and weather rules. Deploy the contents of `dist/` to any static host; hash routes support subdirectories and GitHub Pages. The `.openai/hosting.json` manifest also supports private Sites hosting.

## Features

- On each load, request fresh apparent temperature, rain, wind and daily precipitation from Open-Meteo for the selected city. The default is the device’s current location, requested through browser permission on page load. If access is denied or unavailable, choose a city manually.
- Choose a travel city anywhere in the world, keep up to eight recent destinations, and switch back to current location. Travel mode persists across reloads; current mode gets a fresh device fix on each visit. Destinations show today’s local weather, not future-trip forecasts.
- Select one existing outfit, explain the choice, and offer an existing rain or colder-weather alternative.
- Browse all seasons and look details, check off today’s garments, search/filter pieces, and confirm ownership.
- Rank confirmed shopping gaps by reuse. Search links are generic, not verified products or stock claims.
- Four-week seasonal calendars; only today is weather-adjusted. Future dates remain a plan.
- Record sell/donate/recycle/trash decisions. Nothing is actually disposed of.
- Save profile, ownership, checklists and purge decisions in browser localStorage, with JSON export/import.

## Personalisation and provenance

User-provided: height 191 cm, weight 120 kg, former water-polo player, broad developed chest. A late-30s fictional male stand-in represents these proportions. **No personal face photos or closet photos were provided**, so generated photos are neither a verified likeness nor a measured virtual fitting. Date of birth is intentionally not stored or displayed.

The default first name came from the connected GitHub display name and is editable. No city, garment sizes, ownership, budget or specific product match is assumed. All garments start **To confirm**, then can become **Owned** or **Buy**. The visual palette and relaxed smart-casual styling are inferred from the reference images. Individual piece cards reuse a photograph of the item within a complete look and label that fact.

Fit guidance: fit shoulders and chest first, check upper-arm and thigh room, confirm torso/sleeve/inseam length, and tailor the waist only after the upper body fits. Statistics alone cannot establish a clothing size.

## Weather mapping

| Apparent temperature / condition | Rule |
| --- | --- |
| 20°C or warmer | Summer; use its protected outfit when wet |
| 15°C to below 20°C | Spring in March–May, fall in September–November; nearest season otherwise |
| 8°C to below 15°C | Fall; prefer an existing mid-layer |
| Below 8°C | Winter |
| Current precipitation > 0 or daily precipitation >= 1 mm | A jacket and dark waterproof closed shoes; no white trainers |
| Wind >= 25 km/h | Prefer a layer |
| Gym / lounge | Their fixed uniform; add an existing capsule layer only at <= 10°C |

Fractional temperatures use continuous bands so there are no gaps. January and July ties go to spring; August and December go to fall. Southern hemisphere shoulder-season months shift by six months. Lounge is explicitly an indoor uniform. Temperature eligibility for everyday weather overrides never generates an outfit outside the 30. The rotation deliberately keeps its selected seven-look pool.

Weather failures show an error and no invented reading or weather recommendation. The collection remains browsable. Weather is not silently replaced with stale cached readings.

## Files

- `dist/data.js`: the full piece inventory and 30 looks.
- `dist/weather.js`: weather client and deterministic selection logic.
- `dist/location.js`: device location, city-name lookup, travel preferences and history.
- `dist/app.js`, `dist/styles.css`: interface and browser-local persistence.
- `dist/assets/`: generated catalog images, committed for self-contained hosting.
- `IMAGE-PROMPTS.md`: prompts and generation provenance.
- `tests/wardrobe.test.mjs` and `tests/location.test.mjs`: inventory, weather and location invariants.

## Privacy and services

No backend account, payments, analytics or third-party fonts. Name and wardrobe state stay in the browser. Open-Meteo receives city searches and weather coordinates. With browser permission, current-location coordinates are rounded to two decimal places before being sent to BigDataCloud for a city name and Open-Meteo for weather. Device coordinates are not saved to localStorage or backups. Explicit travel cities are saved locally. There is no silent IP-location fallback when permission is denied. Shopping search links open Google only when clicked. The GitHub repository is public. Sites hosting retains its separate access settings.

Weather attribution and API documentation: [Open-Meteo](https://open-meteo.com/), [forecast API](https://open-meteo.com/en/docs), [geocoding API](https://open-meteo.com/en/docs/geocoding-api). Forecast data are subject to Open-Meteo’s terms and attribution requirements.

City-name lookup: [BigDataCloud client-side reverse geocoding](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api). Calls originate in the browser for the device’s current location only. If naming fails, weather continues with the label “your current location”.
