"""Build small library previews while keeping the full card SVGs for readings."""

import base64
import io
import re
from pathlib import Path

from PIL import Image


PUBLIC = Path(__file__).resolve().parents[1] / "public"
SOURCE = PUBLIC / "cards"
TARGET = PUBLIC / "card-thumbnails"
EMBEDDED_JPEG = re.compile(rb"data:image/jpeg;base64,([A-Za-z0-9+/=]+)")
MAX_SIZE = (480, 672)


def main() -> None:
    count = 0
    original_bytes = 0
    thumbnail_bytes = 0

    for source in sorted(SOURCE.rglob("*.svg")):
        svg = source.read_bytes()
        match = EMBEDDED_JPEG.search(svg)
        if match is None:
            continue  # The card back has no embedded artwork.

        artwork = base64.b64decode(match.group(1), validate=True)
        with Image.open(io.BytesIO(artwork)) as image:
            image = image.convert("RGB")
            image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=76, optimize=True)

        preview = svg[:match.start(1)] + base64.b64encode(output.getvalue()) + svg[match.end(1):]
        destination = TARGET / source.relative_to(SOURCE)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(preview)

        count += 1
        original_bytes += len(svg)
        thumbnail_bytes += len(preview)

    if count != 78:
        raise RuntimeError(f"Expected 78 card previews, generated {count}")
    print(f"Generated {count} previews: {original_bytes:,} -> {thumbnail_bytes:,} bytes")


if __name__ == "__main__":
    main()
