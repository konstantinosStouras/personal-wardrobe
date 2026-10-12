# Family profiles

After signing in, open **Family profiles** below the navigation. Create a child or spouse/partner profile, confirm permission, then upload headshots, dressed full-body photos, or both. Each profile has its own name, sizes, optional measurements and notes. The person selector changes Today, collections, pieces, calendar, shopping, purchase checks and profile screens. The account menu continues to identify the account owner.

## Storage and privacy

Existing owner documents and local storage keys are unchanged. Family records use `daywearProfiles/{uid}/members/{uuid}`, with photos in its `photos/{1..9}` subcollection. Rules allow only that authenticated account owner to read or write family records. Application administrator claims do not grant family access; Firebase project operators retain infrastructure-level access.

Profiles and photos are saved in Firebase. Images are resized to JPEG and metadata stripped before upload. The interface accepts up to four headshots and three body photos. Images are loaded into memory, never published in static assets or stored in localStorage. Person changes invalidate pending reads and clear previous images. Sign-out clears private UI.

Wardrobe ownership, votes, piece feedback, checklists, travel preferences and purge decisions remain browser-local under `wardrobe.account.{uid}.member.{uuid}`. They are not cloud-synchronized. Backups contain the selected person's wardrobe, excluding photos.

Member deletion atomically removes its profile and nine possible photo slots, then its local wardrobe on this device. Photo writes require the parent to exist after the transaction. Account deletion removes every member's profile/photos and family local keys; existing backend recursive deletion also covers Auth console deletion. Other-device local copies and exported backups are not removed.

## Recommendations

The catalog remains exactly 30 looks and 40 pieces. Each member's feedback independently influences existing weather-matched suggestions. Today shows their reference photograph and guidance based on actual apparent temperature, rainfall, wind and day type. Unavailable weather is labelled; readings are not invented.

This release does not add women's or children's collections or generate family try-on images. The adult menswear examples are labelled as styling inspiration, with age/size suitability guidance. The account owner's approved model is never used for another member. Family photos are not submitted to the existing owner image studio.

## Validation

`npm test`: 65 tests covering catalog/weather, translations, sizes, account/member namespaces, asynchronous context invalidation and local cleanup. Browser tests use disposable Firebase accounts and synthetic solid-colour images to check child/spouse creation, sizes, uploads, owner-only access, per-person wardrobes, reload persistence, Greek/English, mobile layout, deletion and sign-out. No real family photos are used.
