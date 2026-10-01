from __future__ import annotations

import sqlite3
import json
from pathlib import Path
from typing import TypedDict


class ValidationSummary(TypedDict):
    total: int
    major: int
    minor: int
    zodiac_signs: int
    horoscope_readings: int


def validate_database(connection: sqlite3.Connection, root: Path) -> ValidationSummary:
    if connection.execute("PRAGMA user_version").fetchone()[0] != 9:
        raise RuntimeError("Expected database version 9")
    translation_fields = {
        "card_translations": (78, ["name", "meaning", "advice", "yesNoMeaning"]),
        "zodiac_translations": (12, ["name", "dateRange", "rulingPlanet", "summary", "originStory", "traits", "strengths", "challenges", "compatibleSigns", "reflectionPrompt"]),
        "horoscope_translations": (36, ["overview", "love", "career", "finance", "wellbeing", "guidance"]),
    }
    locale_sets = {
        table: {row[0] for row in connection.execute(f"SELECT DISTINCT locale FROM {table}")}
        for table in translation_fields
    }
    if any(locales != locale_sets["card_translations"] for locales in locale_sets.values()):
        raise RuntimeError(f"Translation tables have different locale coverage: {locale_sets}")
    if "vi" not in locale_sets["card_translations"]:
        raise RuntimeError("Vietnamese database translations are required")
    for locale in sorted(locale_sets["card_translations"]):
        for table, (expected, fields) in translation_fields.items():
            rows = connection.execute(
                f"SELECT payload FROM {table} WHERE locale = ?", (locale,)
            ).fetchall()
            if len(rows) != expected:
                raise RuntimeError(f"Expected {expected} {locale} rows in {table}, found {len(rows)}")
            for (raw,) in rows:
                content = json.loads(raw)
                if set(content) != set(fields):
                    raise RuntimeError(f"Unexpected translation fields in {table} for {locale}")
                for field in fields:
                    value = content[field]
                    values = value if isinstance(value, list) else [value]
                    if not values or not all(isinstance(item, str) and item.strip() for item in values):
                        raise RuntimeError(f"Empty translation in {table}.{field} for {locale}")
    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    if integrity != "ok":
        raise RuntimeError(f"SQLite integrity_check failed: {integrity}")

    foreign_key_errors = connection.execute("PRAGMA foreign_key_check").fetchall()
    if foreign_key_errors:
        raise RuntimeError(f"SQLite foreign_key_check failed: {foreign_key_errors}")

    total = connection.execute(
        "SELECT COUNT(*) FROM tarot_cards WHERE is_active = 1"
    ).fetchone()[0]
    arcana_counts = dict(
        connection.execute(
            "SELECT arcana_type, COUNT(*) "
            "FROM tarot_cards WHERE is_active = 1 GROUP BY arcana_type"
        ).fetchall()
    )
    suit_counts = dict(
        connection.execute(
            "SELECT suit, COUNT(*) FROM tarot_cards "
            "WHERE is_active = 1 AND arcana_type = 'minor' GROUP BY suit"
        ).fetchall()
    )
    orders = [
        row[0]
        for row in connection.execute(
            "SELECT deck_order FROM tarot_cards WHERE is_active = 1 ORDER BY deck_order"
        )
    ]

    if total != 78:
        raise RuntimeError(f"Expected 78 active cards, found {total}")
    if arcana_counts != {"major": 22, "minor": 56}:
        raise RuntimeError(f"Unexpected arcana counts: {arcana_counts}")
    if suit_counts != {"cups": 14, "pentacles": 14, "swords": 14, "wands": 14}:
        raise RuntimeError(f"Unexpected suit counts: {suit_counts}")
    if orders != list(range(78)):
        raise RuntimeError("deck_order must contain every integer from 0 through 77")
    english_meanings = json.loads(
        (root / "database" / "translations" / "cards.en.json").read_text(encoding="utf-8")
    )
    database_meanings = dict(connection.execute("SELECT id, meaning FROM tarot_cards"))
    if database_meanings != english_meanings:
        raise RuntimeError("English Tarot meanings differ from cards.en.json")
    if any(len(meaning) < 180 for meaning in database_meanings.values()):
        raise RuntimeError("An English Tarot meaning is unexpectedly short")
    for locale in sorted(locale_sets["card_translations"]):
        source = json.loads(
            (root / "database" / "translations" / f"cards.{locale}.json").read_text(encoding="utf-8")
        )
        compiled = dict(connection.execute(
            "SELECT card_id, payload FROM card_translations WHERE locale = ?", (locale,)
        ))
        if set(source) != set(compiled):
            raise RuntimeError(f"Tarot meaning IDs differ for {locale}")
        min_length = 60 if locale in {"ja", "ko"} else 140
        if locale == "vi":
            min_length = 180
        for card_id, raw_payload in compiled.items():
            meaning = json.loads(raw_payload)["meaning"]
            expected = source[card_id][1] if locale == "vi" else source[card_id]["meaning"]
            if meaning != expected or len(meaning) < min_length:
                raise RuntimeError(f"Tarot meaning mismatch or truncation: {locale}.{card_id}")

    missing_images = []
    for (image_path,) in connection.execute(
        "SELECT image_path FROM tarot_cards WHERE is_active = 1"
    ):
        asset_path = root / "app" / "public" / image_path.lstrip("/")
        if not asset_path.is_file():
            missing_images.append(image_path)
    if missing_images:
        raise RuntimeError(f"Missing image assets: {', '.join(missing_images)}")

    zodiac_signs = connection.execute(
        "SELECT COUNT(*) FROM zodiac_signs WHERE is_active = 1"
    ).fetchone()[0]
    horoscope_readings = connection.execute(
        "SELECT COUNT(*) FROM horoscope_readings"
    ).fetchone()[0]
    zodiac_orders = [
        row[0]
        for row in connection.execute(
            "SELECT display_order FROM zodiac_signs "
            "WHERE is_active = 1 ORDER BY display_order"
        )
    ]
    period_counts = dict(
        connection.execute(
            "SELECT period, COUNT(*) FROM horoscope_readings GROUP BY period"
        ).fetchall()
    )

    if zodiac_signs != 12:
        raise RuntimeError(f"Expected 12 active zodiac signs, found {zodiac_signs}")
    if zodiac_orders != list(range(1, 13)):
        raise RuntimeError("display_order must contain every integer from 1 through 12")
    if horoscope_readings != 36:
        raise RuntimeError(
            f"Expected 36 horoscope readings, found {horoscope_readings}"
        )
    if period_counts != {"day": 12, "week": 12, "year": 12}:
        raise RuntimeError(f"Unexpected horoscope period counts: {period_counts}")

    return {
        "total": total,
        "major": arcana_counts["major"],
        "minor": arcana_counts["minor"],
        "zodiac_signs": zodiac_signs,
        "horoscope_readings": horoscope_readings,
    }
