"""Create a complete first-pass locale pack from the English source content.

This uses a selected public web translation endpoint and is intended for QA
drafts only. Every generated locale still requires native-speaker review.
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DATABASE = ROOT / "database" / "source" / "tarot_cardsSQLite.db"
APP_LOCALES = ROOT / "app" / "src" / "locales"
DB_TRANSLATIONS = ROOT / "database" / "translations"
CACHE_PATH = ROOT / ".verify" / "translation-cache.json"
TARGETS = {
    "es-419": "es",
    "pt-BR": "pt",
    "id": "id",
    "hi": "hi",
    "th": "th",
    "fr": "fr",
    "de": "de",
    "ja": "ja",
    "ko": "ko",
}
TRANSLATION_ENDPOINTS = (
    "https://translate.googleapis.com/translate_a/single",
    "https://translate.google.com/translate_a/single",
)
PLACEHOLDER = re.compile(r"\{\w+\}")
# Private-use characters are much less likely to be translated than a word-like token.
SEPARATOR = "\ue000\ue001\ue002"
BING_SEPARATOR = "<<<ZXQSEP>>>"
BING_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 Chrome/140.0 Safari/537.36"
)
_bing_credentials: tuple[str, str, str, str, str] | None = None


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def protect(text: str) -> tuple[str, dict[str, str]]:
    tokens: dict[str, str] = {}

    def replace(match: re.Match[str]) -> str:
        token = f"ZXQPH{len(tokens)}QXZ"
        tokens[token] = match.group(0)
        return token

    return PLACEHOLDER.sub(replace, text), tokens


def restore(text: str, tokens: dict[str, str]) -> str:
    for token, original in tokens.items():
        text = re.sub(re.escape(token), original, text, flags=re.IGNORECASE)
    return text.strip()


def request_google_translation(text: str, target: str) -> str:
    body = urllib.parse.urlencode({
        "client": "gtx",
        "sl": "en",
        "tl": target,
        "dt": "t",
        "q": text,
    }).encode("utf-8")
    last_error: Exception | None = None
    for attempt in range(8):
        endpoint = TRANSLATION_ENDPOINTS[attempt % len(TRANSLATION_ENDPOINTS)]
        endpoint_name = urllib.parse.urlparse(endpoint).netloc
        request = urllib.request.Request(
            endpoint,
            data=body,
            headers={
                "Accept": "application/json,text/plain,*/*",
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode("utf-8"))
            return "".join(part[0] for part in payload[0] if part[0])
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code == 429:
                retry_after = error.headers.get("Retry-After")
                delay = int(retry_after) if retry_after and retry_after.isdigit() else 12 * (attempt + 1)
                delay = min(delay, 48)
                next_endpoint = urllib.parse.urlparse(
                    TRANSLATION_ENDPOINTS[(attempt + 1) % len(TRANSLATION_ENDPOINTS)]
                ).netloc
                print(
                    f"Rate limited by {endpoint_name}; waiting {delay}s, then trying "
                    f"{next_endpoint} ({attempt + 1}/8)..."
                )
                time.sleep(delay)
            else:
                time.sleep(min(2 * (attempt + 1), 12))
        except (OSError, ValueError) as error:
            last_error = error
            time.sleep(min(2 * (attempt + 1), 12))
    raise RuntimeError(f"Translation request failed after retries: {last_error}")


def get_bing_credentials(force_refresh: bool = False) -> tuple[str, str, str, str, str]:
    global _bing_credentials
    if _bing_credentials is not None and not force_refresh:
        return _bing_credentials

    request = urllib.request.Request(
        "https://www.bing.com/translator",
        headers={"User-Agent": BING_USER_AGENT},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        page = response.read().decode("utf-8", errors="replace")
        page_url = response.geturl()

    # Bing currently emits the IG key without JSON quotes (IG:"..."); accept
    # both that form and the older quoted form used by earlier page versions.
    ig_match = re.search(r'"?IG"?:"([A-Fa-f0-9]+)"', page)
    iid_matches = re.findall(r'data-iid="([^"]+)"', page)
    auth_match = re.search(
        r'params_AbusePreventionHelper\s*=\s*\[(\d+),"([^"]+)"',
        page,
    )
    if not ig_match or not iid_matches or not auth_match:
        raise RuntimeError("Could not read Bing Translator session credentials")

    base_url = f"{urllib.parse.urlsplit(page_url).scheme}://{urllib.parse.urlsplit(page_url).netloc}"
    _bing_credentials = (
        base_url,
        ig_match.group(1),
        iid_matches[-1],
        auth_match.group(1),
        auth_match.group(2),
    )
    return _bing_credentials


def request_bing_translation(text: str, target: str) -> str:
    last_error: Exception | None = None
    for attempt in range(6):
        try:
            base_url, ig, iid, key, token = get_bing_credentials(force_refresh=attempt > 0)
            query = urllib.parse.urlencode({"isVertical": "1", "IG": ig, "IID": iid})
            body = urllib.parse.urlencode({
                "fromLang": "en",
                "to": target,
                "text": text,
                "token": token,
                "key": key,
            }).encode("utf-8")
            request = urllib.request.Request(
                f"{base_url}/ttranslatev3?{query}",
                data=body,
                headers={
                    "Accept": "application/json,text/plain,*/*",
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    "Origin": base_url,
                    "Referer": f"{base_url}/translator",
                    "User-Agent": BING_USER_AGENT,
                },
            )
            with urllib.request.urlopen(request, timeout=45) as response:
                payload = json.loads(response.read().decode("utf-8"))
            translated = payload[0]["translations"][0]["text"]
            if not isinstance(translated, str) or not translated.strip():
                raise ValueError("Bing returned an empty translation")
            return translated
        except urllib.error.HTTPError as error:
            last_error = error
            delay = min(10 * (attempt + 1), 40)
            print(f"Bing Translator returned HTTP {error.code}; waiting {delay}s ({attempt + 1}/6)...")
            time.sleep(delay)
        except (OSError, ValueError, KeyError, IndexError, RuntimeError) as error:
            last_error = error
            delay = min(5 * (attempt + 1), 20)
            print(f"Bing Translator request failed; waiting {delay}s ({attempt + 1}/6): {error}")
            time.sleep(delay)
    raise RuntimeError(f"Bing translation request failed after retries: {last_error}")


def request_translation(text: str, target: str, provider: str) -> str:
    if provider == "bing":
        return request_bing_translation(text, target)
    return request_google_translation(text, target)


def translate_group(
    items: list[tuple[str, dict[str, str]]], target: str, provider: str
) -> list[str]:
    separator = BING_SEPARATOR if provider == "bing" else SEPARATOR
    combined = f"\n{separator}\n".join(item[0] for item in items)
    translated = request_translation(combined, target, provider)
    parts = re.split(rf"\s*{re.escape(separator)}\s*", translated, flags=re.IGNORECASE)
    if len(parts) == len(items):
        return parts
    if len(items) == 1:
        return [translated]

    # If a provider response drops a separator, retry two smaller batches instead
    # of immediately issuing one request per string and triggering HTTP 429.
    midpoint = len(items) // 2
    time.sleep(2)
    return translate_group(items[:midpoint], target, provider) + translate_group(
        items[midpoint:], target, provider
    )


def translate_unique(strings: set[str], locale: str, provider: str) -> dict[str, str]:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    cache = read_json(CACHE_PATH) if CACHE_PATH.exists() else {}
    locale_cache: dict[str, str] = cache.setdefault(locale, {})
    pending = [text for text in sorted(strings) if text not in locale_cache]
    target = TARGETS[locale]
    batch_limit = 850 if provider == "bing" else 2800
    separator = BING_SEPARATOR if provider == "bing" else SEPARATOR
    batches: list[list[str]] = []
    current: list[str] = []
    current_size = 0
    for text in pending:
        protected, _ = protect(text)
        added = len(protected) + len(separator) + 2
        if current and current_size + added > batch_limit:
            batches.append(current)
            current, current_size = [], 0
        current.append(text)
        current_size += added
    if current:
        batches.append(current)

    for number, batch in enumerate(batches, start=1):
        protected_items = [protect(text) for text in batch]
        parts = translate_group(protected_items, target, provider)
        for source, output, (_, tokens) in zip(batch, parts, protected_items):
            restored = restore(output, tokens)
            if not restored or set(PLACEHOLDER.findall(restored)) != set(PLACEHOLDER.findall(source)):
                raise RuntimeError(f"Invalid translated placeholders for {locale}: {source!r} -> {restored!r}")
            locale_cache[source] = restored
        CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{locale}: translated batch {number}/{len(batches)} ({len(locale_cache)} cached strings)")
        # Keep a conservative pace because the public endpoints rate-limit bursts.
        delay = 3 if provider == "bing" else 8
        time.sleep(delay)
        cooldown_interval = 15 if provider == "bing" else 5
        if number % cooldown_interval == 0:
            print("Cooling down for 15s to avoid the public translation rate limit...")
            time.sleep(15)
    return locale_cache


def collect_strings(value: Any, output: set[str]):
    if isinstance(value, str):
        output.add(value)
    elif isinstance(value, list):
        for item in value:
            collect_strings(item, output)
    elif isinstance(value, dict):
        for item in value.values():
            collect_strings(item, output)


def translated_tree(value: Any, translations: dict[str, str]):
    if isinstance(value, str):
        return translations[value]
    if isinstance(value, list):
        return [translated_tree(item, translations) for item in value]
    if isinstance(value, dict):
        return {key: translated_tree(item, translations) for key, item in value.items()}
    return value


def source_content():
    interface = read_json(APP_LOCALES / "en.json")
    reading_sources = list(read_json(APP_LOCALES / "reading.vi.json").keys())
    cards: dict[str, dict[str, str]] = {}
    signs: dict[str, dict[str, Any]] = {}
    horoscopes: dict[str, dict[str, dict[str, str]]] = {}
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    for row in connection.execute(
        "SELECT id, name, meaning, advice, yes_no_meaning FROM tarot_cards ORDER BY deck_order"
    ):
        cards[row["id"]] = {
            "name": row["name"],
            "meaning": row["meaning"],
            "advice": row["advice"],
            "yesNoMeaning": row["yes_no_meaning"],
        }
    for row in connection.execute(
        "SELECT id, name, date_range, ruling_planet, summary, origin_story, traits_text, "
        "strengths_text, challenges_text, compatible_signs_text, reflection_prompt "
        "FROM zodiac_signs ORDER BY display_order"
    ):
        signs[row["id"]] = {
            "name": row["name"],
            "dateRange": row["date_range"],
            "rulingPlanet": row["ruling_planet"],
            "summary": row["summary"],
            "originStory": row["origin_story"],
            "traits": row["traits_text"].split("|"),
            "strengths": row["strengths_text"].split("|"),
            "challenges": row["challenges_text"].split("|"),
            "compatibleSigns": row["compatible_signs_text"].split("|"),
            "reflectionPrompt": row["reflection_prompt"],
        }
    for row in connection.execute(
        "SELECT sign_id, period, overview, love, career, finance, wellbeing, guidance "
        "FROM horoscope_readings ORDER BY sign_id, period"
    ):
        horoscopes.setdefault(row["sign_id"], {})[row["period"]] = {
            field: row[field] for field in ("overview", "love", "career", "finance", "wellbeing", "guidance")
        }
    connection.close()
    return interface, reading_sources, cards, signs, horoscopes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("locales", nargs="+", choices=TARGETS)
    parser.add_argument(
        "--provider",
        choices=("google", "bing"),
        default="google",
        help="Public translation provider used for the QA draft (default: google)",
    )
    args = parser.parse_args()
    interface, reading_sources, cards, signs, horoscopes = source_content()
    strings: set[str] = set(reading_sources)
    for value in (interface, cards, signs, horoscopes):
        collect_strings(value, strings)

    for locale in args.locales:
        translations = translate_unique(strings, locale, args.provider)
        write_json(APP_LOCALES / f"{locale}.json", translated_tree(interface, translations))
        write_json(APP_LOCALES / f"reading.{locale}.json", {
            source: translations[source] for source in reading_sources
        })
        write_json(DB_TRANSLATIONS / f"cards.{locale}.json", translated_tree(cards, translations))
        write_json(DB_TRANSLATIONS / f"zodiac.{locale}.json", translated_tree(signs, translations))
        write_json(DB_TRANSLATIONS / f"horoscope.{locale}.json", translated_tree(horoscopes, translations))
        print(f"{locale}: wrote complete UI, reading, Tarot and zodiac locale pack")


if __name__ == "__main__":
    main()
