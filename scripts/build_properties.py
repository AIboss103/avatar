#!/usr/bin/env python3
"""Build the full WhaleHome catalog (whalehome.io/properties/) from CPanama export folders.

Input: one or more folders (or .zip files) with one sub-folder per listing:
    <listing>/listing.md   title, price, area, beds, baths, size, type, URL, description, features
    <listing>/photos/*     photos in gallery order
Output (in panama-crypto-homes/):
    properties.json            all listings, cheapest first, prices rounded to $10k
    img/props/<slug>-<n>.webp  up to PHOTOS photos per listing, 960x640

The main page keeps its own short list (HOMES in index.html); this catalog loads only on /properties/.

    python3 scripts/build_properties.py ~/Downloads/CPanama_all_part1of4.zip ... [--keep]
--keep merges into the existing properties.json instead of replacing it.
"""
import io, json, pathlib, re, sys, tempfile, zipfile
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent / "panama-crypto-homes"
OUT_IMG = ROOT / "img" / "props"
PHOTOS = 4
SIZE = (960, 640)


def field(md, name):
    m = re.search(r"^- \*\*" + re.escape(name) + r":\*\*\s*(.+)$", md, re.M)
    return m.group(1).strip() if m else ""


def section(md, title):
    m = re.search(r"^## " + re.escape(title) + r"[^\n]*\n(.*?)(?=^## |^---|\Z)", md, re.M | re.S)
    return m.group(1).strip() if m else ""


def price(s):
    nums = [int(x.replace(",", "")) for x in re.findall(r"\$\s?([\d,]{4,})", s)]
    if not nums:
        return None, False
    p = min(nums)
    return int((p + 5000) // 10000 * 10000) or p, bool(re.search(r"start|from|desde|от", s, re.I)) or len(nums) > 1


def num(s):
    m = re.findall(r"\d+(?:\.\d+)?", s.replace(",", ""))
    return [float(x) for x in m]


def kind(title, typ, desc):
    t = f"{title} {typ}".lower()
    if "penthouse" in t or re.search(r"\bph\b", t):
        return "penthouse"
    if any(w in t for w in ("villa", "house", "casa ", "home in", "residence in")) and "apartment" not in t:
        return "house"
    if "lot" in t.split() or "land" in t or "terreno" in t:
        return "land"
    if "pre-construction" in t or "pre construction" in t:
        return "new"
    return "apartment"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "home"


def listing(folder):
    md = (folder / "listing.md").read_text(encoding="utf-8", errors="ignore")
    title = (re.search(r"^# (.+)$", md, re.M) or [None, folder.name])[1].strip()
    url = field(md, "URL")
    slug = slugify(url.rstrip("/").split("/")[-1] if url else folder.name)
    p, frm = price(field(md, "Price"))
    beds = num(field(md, "Bedrooms"))
    baths = num(field(md, "Bathrooms"))
    size = num(field(md, "Size"))
    typ = field(md, "Type")
    desc = section(md, "Description")
    desc = re.sub(r"\s*\n\s*", "\n", desc).strip()
    desc = re.sub(r"([a-z\)])([A-Z][a-z])", r"\1\n\2", desc)  # CPanama glues list items: "poolGym" -> "pool\nGym"
    feats = [x.strip("-• ").strip() for x in section(md, "Features").splitlines() if x.strip().startswith(("-", "•"))]
    photos = sorted(x for x in (folder / "photos").glob("*") if x.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
    return dict(
        k=slug, t=title, a=field(md, "Area"), p=p, from_=frm, status=field(md, "Status"),
        beds=[int(min(beds)), int(max(beds))] if beds else None,
        baths=max(baths) if baths else None,
        m2=int(min(size)) if size else None,
        type=kind(title, typ, desc), typeRaw=typ, url=url, d=desc[:1500],
    ), photos


def save_photos(slug, photos):
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    n = 0
    for src in photos[:PHOTOS]:
        try:
            im = ImageOps.fit(Image.open(src).convert("RGB"), SIZE, method=Image.LANCZOS)
        except Exception:
            continue
        n += 1
        im.save(OUT_IMG / f"{slug}-{n}.webp", quality=72, method=6)
    return n


def folders(paths, tmp):
    for p in map(pathlib.Path, paths):
        if p.suffix == ".zip":
            d = pathlib.Path(tempfile.mkdtemp(dir=tmp))
            with zipfile.ZipFile(p) as z:
                for m in z.namelist():  # keep extraction inside d
                    if ".." not in pathlib.PurePosixPath(m).parts and not m.startswith("/"):
                        z.extract(m, d)
            p = d
        for md in p.rglob("listing.md"):
            yield md.parent


def main(argv):
    keep = "--keep" in argv
    srcs = [a for a in argv if a != "--keep"]
    if not srcs:
        sys.exit(__doc__)
    out = ROOT / "properties.json"
    items = {h["k"]: h for h in json.loads(out.read_text())} if keep and out.exists() else {}
    with tempfile.TemporaryDirectory() as tmp:
        for f in folders(srcs, tmp):
            try:
                h, photos = listing(f)
            except Exception as e:
                print("skip", f, e)
                continue
            if not h["p"]:
                print("skip (no price)", h["t"])
                continue
            h["n"] = save_photos(h["k"], photos)
            if not h["n"]:
                print("skip (no photos)", h["t"])
                continue
            h["from"] = h.pop("from_")
            items[h["k"]] = h
    data = sorted(items.values(), key=lambda h: h["p"])
    out.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    print(f"properties.json: {len(data)} listings, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1:])
