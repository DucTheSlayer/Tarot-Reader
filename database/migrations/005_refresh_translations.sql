BEGIN;

-- Translation rows are app-owned reference data. Refresh them so upgrades from
-- v4 receive the same reviewed locale set as a fresh install.
DELETE FROM card_translations;
DELETE FROM zodiac_translations;
DELETE FROM horoscope_translations;

PRAGMA user_version = 5;
COMMIT;
