BEGIN;

-- Translation rows are app-owned reference data. Refresh them so upgrades from
-- v5 receive the same expanded locale set as a fresh install.
DELETE FROM card_translations;
DELETE FROM zodiac_translations;
DELETE FROM horoscope_translations;

PRAGMA user_version = 6;
COMMIT;
