PRAGMA foreign_keys = ON;

CREATE TABLE tarot_cards (
  id              TEXT PRIMARY KEY NOT NULL,
  deck_order      INTEGER NOT NULL UNIQUE
                  CHECK (deck_order BETWEEN 0 AND 77),
  arcana_type     TEXT NOT NULL
                  CHECK (arcana_type IN ('major', 'minor')),
  major_number    INTEGER
                  CHECK (major_number BETWEEN 0 AND 21),
  suit            TEXT
                  CHECK (suit IN ('wands', 'cups', 'swords', 'pentacles')),
  rank_number     INTEGER
                  CHECK (rank_number BETWEEN 1 AND 14),
  name            TEXT NOT NULL CHECK (trim(name) <> ''),
  image_path      TEXT NOT NULL CHECK (trim(image_path) <> ''),
  meaning         TEXT NOT NULL CHECK (trim(meaning) <> ''),
  advice          TEXT NOT NULL CHECK (trim(advice) <> ''),
  yes_no          TEXT NOT NULL
                  CHECK (yes_no IN ('yes', 'no', 'maybe', 'uncertain')),
  yes_no_meaning  TEXT NOT NULL CHECK (trim(yes_no_meaning) <> ''),
  is_active       INTEGER NOT NULL DEFAULT 1
                  CHECK (is_active IN (0, 1)),
  CHECK (
    (arcana_type = 'major'
      AND major_number IS NOT NULL
      AND suit IS NULL
      AND rank_number IS NULL)
    OR
    (arcana_type = 'minor'
      AND major_number IS NULL
      AND suit IS NOT NULL
      AND rank_number IS NOT NULL)
  )
);

CREATE INDEX idx_tarot_cards_active_order
  ON tarot_cards (is_active, deck_order);

CREATE UNIQUE INDEX idx_tarot_cards_major_number
  ON tarot_cards (major_number)
  WHERE arcana_type = 'major';

CREATE UNIQUE INDEX idx_tarot_cards_minor_suit_rank
  ON tarot_cards (suit, rank_number)
  WHERE arcana_type = 'minor';

PRAGMA user_version = 1;
