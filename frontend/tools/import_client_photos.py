"""Build the 2026 client-approved photo library from the public Drive inventory.

Every source image is represented once, with a display asset and a small grid
thumbnail. The original, much larger Drive images are never shipped to the site.
"""

import concurrent.futures
import io
import json
import re
import subprocess
import threading
from collections import Counter
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "media" / "client-2026"
GALLERY_MANIFEST = ROOT / "public" / "data" / "gallery.json"
SOURCE_INVENTORY = Path(__file__).resolve().parent / "drive_inventory.json"

LABELS = {
    "postulency": "Postulency",
    "novices": "Novices",
    "aspirancy": "Aspirancy",
    "pcci-meet": "PCCI Meet",
    "pentionaries": "PENTIONARIES - Photos",
    "pp-2024": "PP - 2024",
    "pp-2025": "PP - 2025",
    "pp-2026": "PP - 2026",
    "lay-collaboration": "Lay Collaboration 25.07.2026",
    "thanksgiving-pc": "Thanksgiving - PC (10.11.2024)",
    "youth-fest-2025": "Youth Fest - 2025",
    "assessment-teams": "ASSESSMENT TEAMS 18.02.2025",
}

source = json.loads(SOURCE_INVENTORY.read_text())
planned = []
for folder in source:
    slug = folder["slug"]
    files = [f for f in folder["files"] if f["mimeType"].startswith("image/")]
    files.sort(key=lambda f: (
        f["relativeFolder"].casefold(),
        tuple(int(p) if p.isdigit() else p.casefold() for p in re.split(r"(\d+)", f["name"])),
        f["id"],
    ))
    for number, file in enumerate(files, 1):
        planned.append((slug, number, file))

print(f"Preparing {len(planned)} unique approved photographs.", flush=True)
if len(planned) != sum(folder["imageCount"] for folder in source):
    raise RuntimeError("Source inventory folder counts disagree with their photo entries")
if len({f["id"] for _, _, f in planned}) != len(planned):
    raise RuntimeError("The approved image inventory contains duplicate file IDs")

lock = threading.Lock()
finished = 0


def prepare_photo(record):
    global finished
    slug, number, source_photo = record
    item_id = source_photo["id"]
    out_dir = OUTPUT / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    large_path = out_dir / f"{item_id}.webp"
    thumb_path = out_dir / f"{item_id}-thumb.webp"

    def is_valid(path):
        try:
            if not path.is_file() or path.stat().st_size < 100:
                return False
            with Image.open(path) as cached:
                cached.verify()
            return True
        except (OSError, ValueError):
            return False

    if is_valid(large_path) and is_valid(thumb_path):
        with Image.open(large_path) as cached:
            width, height = cached.size
        return {"record": record, "width": width, "height": height}

    url = f"https://drive.google.com/thumbnail?id={item_id}&sz=w1800"
    download = subprocess.run(
        ["curl", "-fsSL", "--retry", "4", "--retry-delay", "2", "--connect-timeout", "15", "--max-time", "100", url],
        capture_output=True,
        timeout=150,
    )
    if download.returncode:
        raise RuntimeError(f"Failed {item_id}: {download.stderr.decode(errors='replace')[:250]}")

    try:
        with Image.open(io.BytesIO(download.stdout)) as original:
            rgb = ImageOps.exif_transpose(original).convert("RGB")
    except Exception as error:
        raise RuntimeError(f"Invalid image from Drive for {item_id}") from error

    rgb.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    width, height = rgb.size
    def checked_save(image, path, quality):
        temp = path.with_suffix(".temporary.webp")
        image.save(temp, "WEBP", quality=quality, method=3)
        if not is_valid(temp):
            raise RuntimeError(f"WebP encoder produced an invalid image: {temp}")
        temp.replace(path)

    checked_save(rgb, large_path, 80)
    rgb.thumbnail((500, 500), Image.Resampling.LANCZOS)
    checked_save(rgb, thumb_path, 72)

    with lock:
        finished += 1
        if finished % 25 == 0 or finished == len(planned):
            print(f"Prepared {finished}/{len(planned)} photographs", flush=True)
    return {"record": record, "width": width, "height": height}


with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    prepared = list(executor.map(prepare_photo, planned))

images = []
for result in prepared:
    slug, number, file = result["record"]
    label = LABELS[slug]
    name = Path(file["name"]).stem
    generic = bool(re.match(r"^(IMG|DSC|DSCN|DSCF|VID|WA|WhatsApp Image|PXL)[-_\s\d]", name, re.I))
    title = f"{label} — Photo {number}" if generic else name.replace("_", " ").strip()
    if slug == "aspirancy":
        title = f"{file['relativeFolder']} — {title}"
    base = f"/media/client-2026/{slug}/{file['id']}"
    images.append({
        "id": f"{slug}-{file['id']}",
        "title": title,
        "alt": f"{label} — photograph {number}",
        "category": slug,
        "categoryLabel": label,
        "src": f"{base}.webp",
        "thumbnail": f"{base}-thumb.webp",
        "width": result["width"],
        "height": result["height"],
    })

counts = Counter(image["category"] for image in images)
categories = [
    {"id": slug, "label": label, "count": counts[slug]}
    for slug, label in LABELS.items()
]
GALLERY_MANIFEST.write_text(
    json.dumps({"categories": categories, "images": images}, indent=2, ensure_ascii=False) + "\n"
)

large = sum(p.stat().st_size for p in OUTPUT.rglob("*.webp") if not p.name.endswith("-thumb.webp"))
small = sum(p.stat().st_size for p in OUTPUT.rglob("*-thumb.webp"))
print(f"Created gallery.json with {len(images)} photos, {len(categories)} filters", flush=True)
print(f"Optimized assets: full {large / 1048576:.1f} MiB; thumbs {small / 1048576:.1f} MiB", flush=True)
