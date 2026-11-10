#!/usr/bin/env python3
"""
Generate a .webp sibling for every PNG/JPG in /public and write the manifest
the image loader uses to swap local paths to their WebP version.

Run from the repo root whenever you add or replace an image in /public:

    python3 scripts/convert-images-webp.py

Originals are kept (OG/schema/apple-icon references and old links still work).
src/lib/localWebp.json lists every converted path; src/lib/cloudinaryLoader.ts
only rewrites paths in that list, so an image without a .webp never 404s.
A .webp is only kept when it's actually smaller than the original.
Requires Pillow (pip install Pillow).
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
MANIFEST = os.path.join(ROOT, 'src', 'lib', 'localWebp.json')
EXTS = ('.png', '.jpg', '.jpeg')


def convert(path: str) -> bool:
    out = os.path.splitext(path)[0] + '.webp'
    with Image.open(path) as im:
        has_alpha = im.mode in ('RGBA', 'LA', 'P') and (
            im.mode != 'P' or 'transparency' in im.info
        )
        im = im.convert('RGBA' if has_alpha else 'RGB')
        # The wordmark renders at most ~330px wide (h-24), so 1300px covers
        # 3x/4x screens; photos are capped at 1600px on the long edge.
        cap = 1300 if 'wordmark' in os.path.basename(path) else 1600
        if max(im.size) > cap:
            im.thumbnail((cap, cap), Image.LANCZOS)
        im.save(out, 'WEBP', quality=82, method=6)
    if os.path.getsize(out) >= os.path.getsize(path):
        os.remove(out)
        return False
    return True


def main() -> int:
    converted = []
    before = after = 0
    for dirpath, _, files in os.walk(PUBLIC):
        for name in sorted(files):
            if not name.lower().endswith(EXTS):
                continue
            src = os.path.join(dirpath, name)
            if convert(src):
                rel = '/' + os.path.relpath(src, PUBLIC).replace(os.sep, '/')
                converted.append(rel)
                before += os.path.getsize(src)
                after += os.path.getsize(os.path.splitext(src)[0] + '.webp')
    converted.sort()
    with open(MANIFEST, 'w') as f:
        json.dump(converted, f, indent=2)
        f.write('\n')
    print(f'{len(converted)} images -> WebP: {before / 1024:.0f}KB -> {after / 1024:.0f}KB')
    return 0


if __name__ == '__main__':
    sys.exit(main())
