from __future__ import annotations

import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CARDS_TS = ROOT / "app" / "src" / "data" / "cards.ts"
DATABASE = ROOT / "database" / "source" / "tarot_cardsSQLite.db"

PATTERN = re.compile(
    r"\{\s*id: '([^']+)',\s*number: (\d+),\s*name: '([^']+)',\s*"
    r"image: '([^']+)',\s*meaning: '([^']+)',\s*advice: '([^']+)',\s*"
    r"yesNo: '([^']+)',\s*yesNoMeaning:\s*'([^']+)'\s*\}",
    re.MULTILINE,
)


def main() -> None:
    legacy_cards = {
        match.group(1): (
            int(match.group(2)),
            match.group(3),
            match.group(4),
            match.group(5),
            match.group(6),
            match.group(7),
            match.group(8),
        )
        for match in PATTERN.finditer(CARDS_TS.read_text(encoding="utf-8"))
    }
    if len(legacy_cards) != 22:
        raise RuntimeError(f"Expected 22 legacy Major cards, found {len(legacy_cards)}")

    connection = sqlite3.connect(f"file:{DATABASE.as_posix()}?mode=ro", uri=True)
    try:
        database_cards = {
            row[0]: row[1:]
            for row in connection.execute(
                "SELECT id, major_number, name, image_path, meaning, advice, yes_no, yes_no_meaning "
                "FROM tarot_cards WHERE arcana_type = 'major' ORDER BY major_number"
            )
        }
    finally:
        connection.close()

    if legacy_cards != database_cards:
        mismatches = sorted(set(legacy_cards) | set(database_cards))
        mismatches = [card_id for card_id in mismatches if legacy_cards.get(card_id) != database_cards.get(card_id)]
        raise RuntimeError(f"Major Arcana parity mismatch: {', '.join(mismatches)}")

    print("PASS: all 22 Major Arcana fields match the legacy TypeScript data.")


if __name__ == "__main__":
    main()
