PRAGMA foreign_keys = ON;

CREATE TABLE zodiac_signs (
  id                     TEXT PRIMARY KEY NOT NULL,
  display_order          INTEGER NOT NULL UNIQUE
                         CHECK (display_order BETWEEN 1 AND 12),
  name                   TEXT NOT NULL CHECK (trim(name) <> ''),
  symbol                 TEXT NOT NULL CHECK (trim(symbol) <> ''),
  date_range             TEXT NOT NULL CHECK (trim(date_range) <> ''),
  element                TEXT NOT NULL
                         CHECK (element IN ('fire', 'earth', 'air', 'water')),
  ruling_planet          TEXT NOT NULL CHECK (trim(ruling_planet) <> ''),
  modality               TEXT NOT NULL
                         CHECK (modality IN ('cardinal', 'fixed', 'mutable')),
  summary                TEXT NOT NULL CHECK (trim(summary) <> ''),
  origin_story           TEXT NOT NULL CHECK (trim(origin_story) <> ''),
  traits_text            TEXT NOT NULL CHECK (trim(traits_text) <> ''),
  strengths_text         TEXT NOT NULL CHECK (trim(strengths_text) <> ''),
  challenges_text        TEXT NOT NULL CHECK (trim(challenges_text) <> ''),
  compatible_signs_text  TEXT NOT NULL CHECK (trim(compatible_signs_text) <> ''),
  reflection_prompt      TEXT NOT NULL CHECK (trim(reflection_prompt) <> ''),
  is_active              INTEGER NOT NULL DEFAULT 1
                         CHECK (is_active IN (0, 1))
);

CREATE INDEX idx_zodiac_signs_active_order
  ON zodiac_signs (is_active, display_order);

CREATE TABLE horoscope_readings (
  sign_id     TEXT NOT NULL,
  period      TEXT NOT NULL CHECK (period IN ('day', 'week', 'year')),
  overview    TEXT NOT NULL CHECK (trim(overview) <> ''),
  love        TEXT NOT NULL CHECK (trim(love) <> ''),
  career      TEXT NOT NULL CHECK (trim(career) <> ''),
  finance     TEXT NOT NULL CHECK (trim(finance) <> ''),
  wellbeing   TEXT NOT NULL CHECK (trim(wellbeing) <> ''),
  guidance    TEXT NOT NULL CHECK (trim(guidance) <> ''),
  PRIMARY KEY (sign_id, period),
  FOREIGN KEY (sign_id) REFERENCES zodiac_signs(id) ON DELETE CASCADE
);

CREATE INDEX idx_horoscope_readings_period
  ON horoscope_readings (period, sign_id);

PRAGMA user_version = 2;
