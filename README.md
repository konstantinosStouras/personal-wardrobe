# Daywear

A small, buildless personal wardrobe app inspired by the supplied monochrome catalog reference. Exactly **30 looks** share **40 pieces**: seven for each season, one gym uniform and one lounge uniform.

## Run locally

Requires Node.js 20 or newer. No package installation or build step is needed. Firebase Authentication loads its pinned official JavaScript SDK from Google’s CDN; the public project configuration is included.

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Run `npm test` to verify the capsule and weather rules. Deploy the contents of `dist/` to any static host; hash routes support subdirectories and GitHub Pages. The Sites mirror is deployed separately through a private server checkout; do not deploy this static archive over that server.

## Features

- On each load, request fresh apparent temperature, rain, wind and daily precipitation from Open-Meteo for the selected city. The default is the device’s current location, requested through browser permission on page load. If device access is denied, unsupported or times out, BigDataCloud resolves an approximate city from the calling browser’s IP. The page labels this explicitly and offers city correction. If both methods fail, city search remains available.
- Choose a travel city anywhere in the world, keep up to eight recent destinations, and switch back to current location. Travel mode persists across reloads; current mode gets a fresh device fix on each visit. Destinations show today’s local weather, not future-trip forecasts.
- Select one existing outfit, explain the choice, and offer an existing rain or colder-weather alternative.
- Browse all seasons and look details, check off today’s garments, search/filter pieces, and confirm ownership.
- Rank confirmed shopping gaps by reuse. Search links are generic, not verified products or stock claims.
- Four-week seasonal calendars; only today is weather-adjusted. Future dates remain a plan.
- Record sell/donate/recycle/trash decisions. Nothing is actually disposed of.
- Save profile, ownership, checklists and purge decisions in browser localStorage, with JSON export/import.

## Personalisation and provenance

The public repository provides a complete 30-look guest image set. A separate private server holds the 30 personal looks. Signed-out visitors and accounts without a personal model see Daywear's slim fictional male catalog model. The owner's existing Firebase user ID selects his photo-based model throughout Today, season covers, look cards, Pieces, Shopping and Rotation. Signing out restores the default collection. The server verifies the Firebase ID token with Firebase on every private catalog/image request, then checks the authorized account. Unauthorized direct image requests fail. Personal pixels are fetched with an Authorization header, kept as in-memory blob URLs, and revoked on sign-out; they are excluded from this repository and its static deployment.

The personal model follows the supplied photos, self-reported 191 cm height and 120 kg weight, accepted natural body proportions and slimmer arms, and the latest requested slimmer face, smoother skin, dark hair and black beard. AI likeness can vary and is not a measured fitting. Original photos and date of birth are not stored in the app. Guests start with a neutral editable profile; no city, garment sizes, ownership, budget or specific product match is assumed. All garments start **To confirm**, then can become **Owned** or **Buy**. The visual palette and relaxed smart-casual styling follow the reference images. Individual piece cards reuse a photograph of the item within a complete look and label that fact.

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
- `dist/assets/`: fictional guest catalog images only, committed for static hosting.
- `IMAGE-PROMPTS.md`: prompts and generation provenance.
- `tests/wardrobe.test.mjs` and `tests/location.test.mjs`: inventory, weather and location invariants.

## Privacy and services

Firebase manages registered accounts, display names, email addresses and authentication sessions. Passwords are sent directly to Firebase over HTTPS and are never stored by application code. Session persistence is the default; users can explicitly choose to stay signed in. Wardrobe preferences remain in browser storage, isolated by Firebase user ID, with a separate guest profile. Cross-device wardrobe sync is not implemented. Signing out leaves the account’s local preferences available for its next sign-in. Deleting an account removes its Firebase identity and local preferences on that device, but not copies on other devices or exported backups. No payments, analytics or third-party fonts. Open-Meteo receives city searches and weather coordinates. With browser permission, current-location coordinates are rounded to two decimal places before being sent to BigDataCloud for a city name and Open-Meteo for weather. Device coordinates are not saved to localStorage or backups. Explicit travel cities are saved locally. The client-side IP fallback is labelled approximate in the page and explained in location controls; VPNs and mobile networks can return a different city. Neither device nor approximate coordinates are stored. Shopping search links open Google only when clicked. The GitHub repository and hosted site are public. Original reference photos are not committed or published.

Weather attribution and API documentation: [Open-Meteo](https://open-meteo.com/), [forecast API](https://open-meteo.com/en/docs), [geocoding API](https://open-meteo.com/en/docs/geocoding-api). Forecast data are subject to Open-Meteo’s terms and attribution requirements.

City-name lookup: [BigDataCloud client-side reverse geocoding](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api). Calls originate in the browser for the device’s current location only. If naming fails, weather continues with the label “your current location”.

## Registration & deployment

Primary website: https://www.stouras.com/daywear/

Firebase project: `stouras-personal-wardrobe`. Email/password and Google are enabled. The Firebase console is at https://console.firebase.google.com/project/stouras-personal-wardrobe/overview. Registration includes a 10–128 character server-enforced password policy, password confirmation, verification email/resend, password reset, sign-out and user-initiated account deletion. Email enumeration protection is enabled. No account is silently linked to another provider.

Facebook and Apple are deferred at the owner’s request. `enabledProviders` in `dist/firebase-config.js` exposes only configured providers. Facebook needs a Meta developer app, app ID/secret, approved login configuration and its Firebase callback URL. Apple needs an Apple Developer membership, Service ID, Team ID, signing key and callback configuration. Store provider secrets only in Firebase/provider consoles, never in this public repository. Instagram is not a built-in Firebase consumer authentication provider; Meta’s current Instagram Login targets professional accounts and is not a general substitute for Facebook/Google sign-in.

The public Firebase API key is a browser project identifier, not an admin credential. Authorized domains include www.stouras.com, stouras.com and the existing Sites URL. Only the 30 fictional guest looks are public static images. Personal images use the authenticated server at the Sites domain. The UI account check is not the security boundary. The server has no public route for its source or image bundle.

The GitHub Pages copy is the contents of `dist/` at `daywear/` in `konstantinosStouras/konstantinosStouras.github.io`, branch `master`. Preserve that repository’s Jekyll configuration and other pages. Do not add a root `.nojekyll` file. Subsequent updates should copy the complete final `dist/` content into `daywear/`, commit and push normally. The source repository remains `konstantinosStouras/personal-wardrobe`. No repository link is displayed in the product.

Validation: automated tests cover wardrobe, weather, location and authentication policy. A disposable synthetic account verified real Firebase registration, sign-in, password enforcement and generic invalid-login responses and was removed afterwards. Google sign-in and sign-out were exercised in the browser. Facebook/Apple have not been enabled or tested.


## Sizes and optional model measurements

The profile offers size dropdowns, explicit trouser sizing systems and custom-size options. Existing free-text sizes are retained without conversion. Optional height, weight, chest, waist, hips, shoulder width, relaxed upper-arm circumference, inseam, thigh, neck and sleeve measurements use labelled cm/kg units. Appearance/fit notes and a downloadable model brief can guide future photo-based generation; saving does not regenerate catalog images. No circumference or facial likeness is inferred from height/weight. All fields remain in the account-isolated browser profile and its user-exported backup; no measurement data is sent to Firebase or an image service. Save feedback is visible inside the dialog, and failed storage writes preserve the form for retry without reporting success.

## Protected image delivery

`dist/private-models.js` obtains the signed-in Firebase ID token in memory, sends it over HTTPS in an Authorization header, and turns the authenticated image payload into temporary blob URLs. It clears all URLs and cancels pending loads on account changes. No personal pixels, tokens, or image URLs are written to localStorage. A failed private fetch shows retry controls, never someone else’s model. Both the catalog endpoint and individual image endpoints authenticate independently. Signing out cannot erase screenshots or copies previously saved by an authorized viewer. Older public deployment/history copies predate this private delivery change.
