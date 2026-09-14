-- Remove the original Vietnamese-only CHECK constraints while preserving data.
CREATE TABLE card_translations_v4 (
  card_id TEXT NOT NULL REFERENCES tarot_cards(id),
  locale TEXT NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (card_id, locale)
);
INSERT INTO card_translations_v4 SELECT card_id, locale, payload FROM card_translations;
DROP TABLE card_translations;
ALTER TABLE card_translations_v4 RENAME TO card_translations;

CREATE TABLE zodiac_translations_v4 (
  sign_id TEXT NOT NULL REFERENCES zodiac_signs(id),
  locale TEXT NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (sign_id, locale)
);
INSERT INTO zodiac_translations_v4 SELECT sign_id, locale, payload FROM zodiac_translations;
DROP TABLE zodiac_translations;
ALTER TABLE zodiac_translations_v4 RENAME TO zodiac_translations;

CREATE TABLE horoscope_translations_v4 (
  sign_id TEXT NOT NULL,
  period TEXT NOT NULL,
  locale TEXT NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (sign_id, period, locale),
  FOREIGN KEY (sign_id, period) REFERENCES horoscope_readings(sign_id, period)
);
INSERT INTO horoscope_translations_v4 SELECT sign_id, period, locale, payload FROM horoscope_translations;
DROP TABLE horoscope_translations;
ALTER TABLE horoscope_translations_v4 RENAME TO horoscope_translations;

PRAGMA user_version = 4;
