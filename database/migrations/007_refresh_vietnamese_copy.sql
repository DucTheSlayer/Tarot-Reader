BEGIN;

-- App-owned translation rows are refreshed with the revised Vietnamese copy.
-- The shared seed restores all published locales after this migration.
DELETE FROM card_translations;
DELETE FROM zodiac_translations;
DELETE FROM horoscope_translations;

PRAGMA user_version = 7;
COMMIT;
