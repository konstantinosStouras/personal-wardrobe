# WearWell

Family profiles: one account can manage separate child and spouse/partner profiles, private reference photos, sizes and local wardrobe choices. See [FAMILY-PROFILES.md](FAMILY-PROFILES.md) for usage, access rules and catalog limitations.

A small, buildless personal wardrobe app inspired by the supplied monochrome catalog reference. Exactly **30 looks** share **40 pieces**: seven for each season, one gym uniform and one lounge uniform.

## Run locally

Requires Node.js 20 or newer. No package installation or build step is needed. Firebase Authentication loads its pinned official JavaScript SDK from Google’s CDN; the public project configuration is included.

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Run `npm test` to verify the capsule and weather rules. Deploy the contents of `dist/` to any static host; hash routes support subdirectories and GitHub Pages. The Sites mirror is deployed separately through a private server checkout; do not deploy this static archive over that server.

## Features

- Signed-out visitors start on an informative public homepage with fictional lifestyle imagery, feature explanations, registration and an openly browsable sample wardrobe. It explicitly identifies the current catalog as menswear; the inclusive landing photography does not imply that additional collections or personal models already exist. Signed-in users start on Today.
- Four primary destinations: Discover (Today when signed in), Wardrobe, Calendar and Shopping. Wardrobe contains the season selector, gym/lounge looks, Pieces and the unused-clothes review. Shopping contains Before you buy. Language controls remain public, beside the account button.
- The header shows current local temperature, wind and humidity with a WMO-based day/night weather illustration. The detailed Today card includes feels-like temperature, daily high/low, rainfall, source and update time. Missing readings stay unavailable; recommendations continue to use apparent temperature.
- Like or dislike the **combination** on Today, collection cards and look details. “Not for me” opens optional Like / Not for me votes for every piece; rejected pieces offer ten reasons in a checkbox dropdown with multiple selection. English and Greek include all prompts and reasons. Whole-look votes never imply a preference for every individual garment or colour. Explicit piece votes provide a modest tie-break between weather-suitable looks; objections about coordination or occasion alone do not penalize a piece in another combination. Votes cannot override rain, wind, temperature, hemisphere or fixed gym/lounge uniforms. Account-isolated browser storage and backup import/export include piece votes and reasons; this is not cloud synchronization. Changing or undoing the combination vote clears its piece feedback, and changing a piece to Like or undoing its vote clears its reasons. Storage failures roll back the change and show an error.
- **Before you buy** (`#consider`): signed-in users can open a JPEG, PNG or WebP photo (up to 8 MB), select its closest capsule counterpart and colour, and compare existing looks with confirmed Owned companions. Similar owned pieces are flagged; missing pieces and uncertain palettes are disclosed. This is a manual, rule-based comparison, not automatic image recognition or virtual try-on. Photos exist only as temporary in-memory blob URLs, never enter a server, browser storage or backups, and are revoked on navigation or account changes. The original 30 looks and 40 pieces remain unchanged.
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

Firebase manages registered accounts, display names, email addresses and authentication sessions. Passwords are sent directly to Firebase over HTTPS and are never stored by application code. Session persistence is the default; users can explicitly choose to stay signed in. Wardrobe preferences remain in browser storage, isolated by Firebase user ID, with a separate guest profile. Cross-device wardrobe sync is not implemented. Signing out leaves the account’s local preferences available for its next sign-in. The application deletion flow removes its Firebase identity, cloud profile, uploaded reference photos, submitted feedback and screenshots, and local preferences on that device; it does not remove copies on other devices, exported backups or private model source files. No payments, analytics or third-party fonts. Open-Meteo receives city searches and weather coordinates. With browser permission, current-location coordinates are rounded to two decimal places before being sent to BigDataCloud for a city name and Open-Meteo for weather. Device coordinates are not saved to localStorage or backups. Explicit travel cities are saved locally. The client-side IP fallback is labelled approximate in the page and explained in location controls; VPNs and mobile networks can return a different city. Neither device nor approximate coordinates are stored. Shopping search links open Google only when clicked. The GitHub repository and hosted site are public. Original reference photos are not committed or published.

Weather attribution and API documentation: [Open-Meteo](https://open-meteo.com/), [forecast API](https://open-meteo.com/en/docs), [geocoding API](https://open-meteo.com/en/docs/geocoding-api). Forecast data are subject to Open-Meteo’s terms and attribution requirements.

City-name lookup: [BigDataCloud client-side reverse geocoding](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api). Calls originate in the browser for the device’s current location only. If naming fails, weather continues with the label “your current location”.

## Registration & deployment

Primary website: https://www.stouras.com/wearwell/

DayWear has independent validation: this source repository runs `DayWear tests`, and the publishing repository runs `WearWell website checks` for `wearwell/`, the legacy `daywear/` directory and its own checker/workflow. The general site checks exclude DayWear-only updates. WearWell has no dependency on SEMFE code or checks. The public address continues to use the shared stouras.com GitHub Pages hosting; DayWear uses its own Firebase project and code.

Firebase project: `stouras-personal-wardrobe`. Email/password and Google are enabled. The Firebase console is at https://console.firebase.google.com/project/stouras-personal-wardrobe/overview. Registration includes a 10–128 character server-enforced password policy, password confirmation, verification email/resend, password reset, sign-out and user-initiated account deletion. Email enumeration protection is enabled. No account is silently linked to another provider.

Facebook and Apple are deferred at the owner’s request. `enabledProviders` in `dist/firebase-config.js` exposes only configured providers. Facebook needs a Meta developer app, app ID/secret, approved login configuration and its Firebase callback URL. Apple needs an Apple Developer membership, Service ID, Team ID, signing key and callback configuration. Store provider secrets only in Firebase/provider consoles, never in this public repository. Instagram is not a built-in Firebase consumer authentication provider; Meta’s current Instagram Login targets professional accounts and is not a general substitute for Facebook/Google sign-in.

The public Firebase API key is a browser project identifier, not an admin credential. Authorized domains include www.stouras.com, stouras.com and the existing Sites URL. Only the 30 fictional guest looks and the fictional welcome-page lifestyle photographs are public static images. Personal images use the authenticated server at the Sites domain. The UI account check is not the security boundary. The server has no public route for its source or image bundle.

The GitHub Pages copy is the contents of `dist/` at `wearwell/` in `konstantinosStouras/konstantinosStouras.github.io`, branch `master`. Preserve that repository’s Jekyll configuration and other pages. Do not add a root `.nojekyll` file. Subsequent updates should copy the complete final `dist/` content into `wearwell/`, commit and push normally. The source repository remains `konstantinosStouras/personal-wardrobe`. No repository link is displayed in the product.

Validation: automated tests cover wardrobe, weather, location and authentication policy. A disposable synthetic account verified real Firebase registration, sign-in, password enforcement and generic invalid-login responses and was removed afterwards. Google sign-in and sign-out were exercised in the browser. Facebook/Apple have not been enabled or tested.


## Sizes and optional model measurements

The profile offers size dropdowns, explicit trouser sizing systems and custom-size options. Existing free-text sizes are retained without conversion. Optional height, weight, chest, waist, hips, shoulder width, relaxed upper-arm circumference, inseam, thigh, neck and sleeve measurements use labelled cm/kg units. Appearance/fit notes and a downloadable model brief can guide future photo-based generation; saving does not regenerate catalog images. No circumference or facial likeness is inferred from height/weight. Profile fields and optional measurements are saved to the private Firebase account profile, with a local account-isolated copy and user-exported backup. Optional reference photos and submitted feedback use authenticated cloud storage. The tester disclosure explains administrator access to these submissions. Wardrobe ownership, outfit votes and checklists remain browser-local. Save feedback is visible on the profile page; failed saves preserve the form for retry without reporting success.

## Protected image delivery

Personal images now come from authenticated Firestore documents after owner approval. The preferred headshot, three posture candidates, natural retouching options, approval process, private desktop workflow and server-side API configuration are documented in [MODEL-STUDIO.md](MODEL-STUDIO.md). The previous hard-coded personal catalog is no longer requested. Private pixels stay in memory and are cleared on sign-out. Wardrobe choices remain browser-local.

## WearWell identity and languages

The public brand is WearWell, with the tagline “Your style. Every occasion.” The canonical public address is `/wearwell/`. The former `/daywear/` entry point redirects there while preserving query parameters and hash routes. The Firebase project, account data collections and browser storage namespaces remain stable. The catalog still has 30 complete looks and 40 pieces, but marketing describes the benefit rather than repeating inventory counts.

A native public dropdown offers English, Greek, German, Russian, Spanish, French, Portuguese, Arabic, Mandarin (Simplified Chinese) and Cantonese (Traditional characters). Static dictionaries ship with the site; no visitor text or photos are sent to a translation service. Arabic uses right-to-left layout. Editable names, notes and size values are preserved. New visitors default to Automatic: country/subdivision codes from the existing location lookup select a supported local language, with English for unsupported countries or failed detection. Manual choices persist and take priority. A saved travel-weather city is not used as the visitor’s actual location. In multilingual locations, supported browser preferences can resolve country-level ambiguity; the dropdown remains the way to choose a preferred language.

The WearWell wordmark, W favicon, home-screen icons, web manifest and 1200×630 share image are public brand assets. Open Graph, Twitter card and WebSite structured data are present in the initial HTML so crawlers do not need JavaScript. Platform-specific preview rendering and caches remain controlled by each social app.

## Automatic weather refresh

Weather is requested from Open-Meteo every 60 seconds while visible and online. Returning to a suspended tab or reconnecting checks immediately when overdue. Manual refreshes and city changes restart the timer. Requests time out after 15 seconds and bypass the browser cache. Failed requests clear readings and recommendations and retry on the next minute. Background updates preserve forms and non-weather pages.

Open-Meteo combines suitable models from national weather services. Current conditions use 15-minute model data, so a request every minute does not mean new observations every minute. The weather card shows the provider’s data time.

## WearWell address migration

Publish the app to `wearwell/`. Keep `daywear/index.html` as the compatibility redirect; do not copy the application back over it. Existing legacy assets remain available for already-open tabs and old image links. The old entry point is marked noindex, and canonical and social metadata point to `/wearwell/`. The manifest uses relative paths, so new installations open `/wearwell/`. Both paths share the same origin and unchanged Firebase and local-storage identifiers, preserving accounts and browser-local wardrobe data. The website check validates the new directory and the legacy query/hash redirect.
