# Translation source format

English content lives in the original SQLite tables. Vietnamese keeps the compact reviewed files already in this directory.

For every additional locale `<locale>`, add all three files together:

- `cards.<locale>.json`: 78 card IDs, each containing `name`, `meaning`, `advice`, and `yesNoMeaning`.
- `zodiac.<locale>.json`: 12 sign IDs with the same ten fields as `zodiac.vi.json`.
- `horoscope.<locale>.json`: 12 sign IDs; every sign contains `day`, `week`, and `year`, and every period contains `overview`, `love`, `career`, `finance`, `wellbeing`, and `guidance`.

Interface catalogues live in `app/src/locales/<locale>.json`; source-keyed reading UI catalogues live in `app/src/locales/reading.<locale>.json`. Preserve every `{placeholder}` exactly.

Run `python database/scripts/build_translations.py` and `npm run verify` from the documented directories. The generator rejects unknown locales, missing IDs, missing periods, extra fields, and empty strings. Add a locale to `PUBLISHED_LOCALES` only after all catalogues pass native layout QA.
