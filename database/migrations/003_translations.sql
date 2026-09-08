-- English remains in the original tables. Translations never change card IDs.
CREATE TABLE IF NOT EXISTS card_translations (
  card_id TEXT NOT NULL REFERENCES tarot_cards(id),
  locale TEXT NOT NULL CHECK (locale = 'vi'),
  payload TEXT NOT NULL,
  PRIMARY KEY (card_id, locale)
);
CREATE TABLE IF NOT EXISTS zodiac_translations (
  sign_id TEXT NOT NULL REFERENCES zodiac_signs(id),
  locale TEXT NOT NULL CHECK (locale = 'vi'),
  payload TEXT NOT NULL,
  PRIMARY KEY (sign_id, locale)
);
CREATE TABLE IF NOT EXISTS horoscope_translations (
  sign_id TEXT NOT NULL,
  period TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale = 'vi'),
  payload TEXT NOT NULL,
  PRIMARY KEY (sign_id, period, locale),
  FOREIGN KEY (sign_id, period) REFERENCES horoscope_readings(sign_id, period)
);
PRAGMA user_version = 3;
