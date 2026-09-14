from __future__ import annotations

import json
import shutil
import sqlite3
from pathlib import Path

from database_validation import validate_database


ROOT = Path(__file__).resolve().parents[2]
MIGRATION_FILES = (
    ROOT / "database" / "migrations" / "001_initial.sql",
    ROOT / "database" / "migrations" / "002_zodiac.sql",
    ROOT / "database" / "migrations" / "003_translations.sql",
    ROOT / "database" / "migrations" / "004_expand_locales.sql",
    ROOT / "database" / "migrations" / "005_refresh_translations.sql",
    ROOT / "database" / "migrations" / "006_refresh_translations.sql",
)
SEED_FILES = (
    ROOT / "database" / "seeds" / "001_major_arcana.sql",
    ROOT / "database" / "seeds" / "002_minor_arcana.sql",
    ROOT / "database" / "seeds" / "003_zodiac.sql",
    ROOT / "database" / "seeds" / "004_translations.sql",
)
SOURCE_DB = ROOT / "database" / "source" / "tarot_cardsSQLite.db"
TEMP_DB = SOURCE_DB.with_name("tarot_cardsSQLite.tmp.db")
DEPLOY_DB = ROOT / "app" / "public" / "assets" / "databases" / SOURCE_DB.name
DATABASES_JSON = DEPLOY_DB.parent / "databases.json"


def main() -> None:
    SOURCE_DB.parent.mkdir(parents=True, exist_ok=True)
    DEPLOY_DB.parent.mkdir(parents=True, exist_ok=True)

    if TEMP_DB.exists():
        TEMP_DB.unlink()

    connection = sqlite3.connect(TEMP_DB)
    try:
        for migration_file in MIGRATION_FILES:
            connection.executescript(migration_file.read_text(encoding="utf-8"))
        for seed_file in SEED_FILES:
            connection.executescript(seed_file.read_text(encoding="utf-8"))
        summary = validate_database(connection, ROOT)
    except Exception:
        connection.close()
        if TEMP_DB.exists():
            TEMP_DB.unlink()
        raise
    else:
        connection.close()

    try:
        TEMP_DB.replace(SOURCE_DB)
    except PermissionError:
        # Some Windows file watchers allow writes but deny atomic replacement.
        # The staged database is already validated, so copy it in place and
        # remove the staging artifact as a compatible fallback.
        shutil.copy2(TEMP_DB, SOURCE_DB)
        TEMP_DB.unlink()
    shutil.copy2(SOURCE_DB, DEPLOY_DB)
    DATABASES_JSON.write_text(
        json.dumps({"databaseList": [SOURCE_DB.name]}, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    print(
        "Built and validated "
        f"{summary['total']} cards "
        f"({summary['major']} Major + {summary['minor']} Minor), "
        f"{summary['zodiac_signs']} zodiac signs and "
        f"{summary['horoscope_readings']} horoscope readings."
    )
    print(f"Source database: {SOURCE_DB}")
    print(f"Published asset: {DEPLOY_DB}")


if __name__ == "__main__":
    main()
