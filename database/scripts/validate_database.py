from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

from database_validation import validate_database


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE = ROOT / "database" / "source" / "tarot_cardsSQLite.db"


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate the App Tarot SQLite database.")
    parser.add_argument("database", nargs="?", type=Path, default=DEFAULT_DATABASE)
    args = parser.parse_args()

    database_path = args.database.resolve()
    if not database_path.is_file():
        raise FileNotFoundError(database_path)

    connection = sqlite3.connect(f"file:{database_path.as_posix()}?mode=ro", uri=True)
    try:
        summary = validate_database(connection, ROOT)
    finally:
        connection.close()

    print(
        f"PASS: {database_path} contains {summary['total']} active cards "
        f"({summary['major']} Major + {summary['minor']} Minor), "
        f"{summary['zodiac_signs']} zodiac signs and "
        f"{summary['horoscope_readings']} horoscope readings."
    )


if __name__ == "__main__":
    main()
