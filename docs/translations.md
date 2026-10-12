# Photo guidance translations

Photo upload guidance, consent and upload labels must be available in every language registered in `dist/language-policy.js`. Keep translations inclusive of gender, body type, hairstyle and hair length.

`dist/photo-guidance-languages.js` is the shared catalog, keyed by the English text displayed in `photosSection()` in `dist/profile-photos.js`. `translateText()` uses this catalog for every language, including English and Greek. It preserves surrounding whitespace and the existing language switcher preserves entered profile values and filenames.

When adding a language or changing a guidance sentence, update the catalog for every registered language. Do not insert English placeholders for missing translations. Run `npm test`; the coverage test discovers current languages and guidance messages, and fails if a translation is absent, blank or copied from English. The publishing repository runs the same coverage checker against its copy of the site.

New languages still require actual translations. The check prevents unnoticed omissions; it does not generate translations automatically. Check the rendered layout, including right-to-left text when applicable.
