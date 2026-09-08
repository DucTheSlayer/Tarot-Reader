# Tarot and zodiac database

The app ships an offline SQLite database containing 78 Tarot cards, 12 zodiac profiles, and 36 static horoscope readings. The source database can be opened with **DB Browser for SQLite**; the SQL schema and seeds remain the reviewable source of truth in Git.

## Files

- `migrations/001_initial.sql`: schema version 1.
- `migrations/002_zodiac.sql`: schema version 2 with zodiac tables.
- `migrations/003_translations.sql`: schema version 3, Vietnamese translation tables with foreign keys.
- `seeds/001_major_arcana.sql`: 22 Major Arcana cards.
- `seeds/002_minor_arcana.sql`: 56 Minor Arcana cards.
- `seeds/003_zodiac.sql`: 12 profiles and 36 Day/Week/Year readings.
- `translations/*.vi.json`: editable Vietnamese card, zodiac and period copy.
- `seeds/004_translations.sql`: generated translation seed, shared by fresh installs and v3 upgrades.
- `source/tarot_cardsSQLite.db`: source database for DB Browser.
- `../app/public/assets/databases/tarot_cardsSQLite.db`: deployable copy used by Capacitor/jeep-sqlite.

## Build and validate

Run from the repository root:

```powershell
python database/scripts/build_translations.py
python database/scripts/build_database.py
python database/scripts/validate_database.py
cd app
npm run db:validate:web
npm run db:validate:parity
```

`build_database.py` recreates both `.db` artifacts from the committed schema and seeds. It intentionally replaces the generated source DB, so save DB Browser edits into SQL before rebuilding.

## DB Browser workflow

1. Open `database/source/tarot_cardsSQLite.db`.
2. Use **Browse Data** to inspect `tarot_cards`, `zodiac_signs`, and `horoscope_readings`.
3. Draft changes in DB Browser and click **Write Changes**.
4. Record the same change in a versioned SQL migration. Before the first release, correcting the v1 seed is acceptable; after release, never rewrite a shipped migration.
5. Run `validate_database.py` against the edited source DB.
6. After the source DB and migration agree, copy/publish by running the build script, then run the app build and `npx cap sync android`.

DB Browser is an authoring and inspection tool, not a server. Installed apps use their own SQLite copy; later content changes require `DB_VERSION` and a migration in `app/src/database/upgrades.ts`.

## Required invariants

- 78 active cards: 22 Major + 56 Minor.
- Minor Arcana has exactly 14 Wands, 14 Cups, 14 Swords, and 14 Pentacles.
- `deck_order` contains every integer from 0 through 77 exactly once.
- Every card has non-empty meaning/advice/Yes-No content and an existing local image path.
- Zodiac has exactly 12 active signs ordered from 1 through 12.
- Horoscope has exactly 36 rows: 12 each for Day, Week, and Year.
- V3 has 78 card, 12 zodiac and 36 horoscope translations for `vi`, with complete nonempty fields.
- English rows and IDs are never rewritten by the translation migration.
- Run `npm test` in `app` to exercise the actual Capacitor upgrade statements with sql.js, including v1 → v2 → v3 and preservation of all original fields.

Edit Vietnamese JSON, regenerate the seed, then rebuild both database assets. The card tuples contain name, meaning, advice, and an optional Major Arcana yes/no explanation. Minor Arcana verdict explanations and horoscope copy are generated with the same structure as the English seeds.

Once v3 is shipped, subsequent copy edits require a new versioned migration, not merely a regenerated bundled database. Existing installations keep their database and only run newer upgrade statements.
