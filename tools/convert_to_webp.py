#!/usr/bin/env python3
"""
convert_to_webp.py: turn the big PNG/JPG images into small WebP files.

Run it from the ROOT of the repo (the folder that contains _config.yml):

    pip install pillow
    python tools/convert_to_webp.py                 # converts Assets/Carousel (what the home page needs)
    python tools/convert_to_webp.py Assets/Projects Assets/Research   # other folders too

For every  photo.png  it writes  photo.webp  next to it (same name, new extension).
The originals are NOT deleted. Check the site, then delete the old PNGs yourself.

Notes
- Images wider than 1600 px are scaled down to 1600 px (plenty for a 900 px carousel).
- Quality 82 is visually identical for screenshots and charts at a fraction of the size.
- If you convert Projects/Research folders, also change the .png/.jpg paths in
  _data/projects.yml and _data/research.yml to .webp.
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is missing. Install it with:  pip install pillow")

MAX_WIDTH = 1600
QUALITY = 82
SOURCE_EXTS = {".png", ".jpg", ".jpeg"}


def convert(path: Path) -> None:
    target = path.with_suffix(".webp")
    if target.exists() and target.stat().st_mtime >= path.stat().st_mtime:
        print(f"skip   {target}  (already up to date)")
        return

    with Image.open(path) as im:
        if im.width > MAX_WIDTH:
            height = round(im.height * MAX_WIDTH / im.width)
            im = im.resize((MAX_WIDTH, height), Image.LANCZOS)
        # keep transparency if the PNG has it, otherwise plain RGB
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
        im.save(target, "WEBP", quality=QUALITY, method=6)

    before = path.stat().st_size / 1024
    after = target.stat().st_size / 1024
    print(f"done   {path.name}: {before:,.0f} KB -> {after:,.0f} KB  ({100 - after / before * 100:.0f}% smaller)")


def main() -> None:
    folders = [Path(p) for p in sys.argv[1:]] or [Path("Assets/Carousel")]
    found = 0
    for folder in folders:
        if not folder.is_dir():
            print(f"missing folder: {folder}")
            continue
        for path in sorted(folder.iterdir()):
            if path.suffix.lower() in SOURCE_EXTS:
                convert(path)
                found += 1
    if not found:
        print("No PNG/JPG images found. Run this from the repo root.")


if __name__ == "__main__":
    main()
