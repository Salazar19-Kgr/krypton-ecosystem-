"""Busca en tu teléfono la foto de la nebulosa verde y prepara el fondo del chat."""
import os
import subprocess
import sys

from PIL import Image

root = os.path.expanduser("~/storage/shared")
exts = (".jpg", ".jpeg", ".png", ".webp")
skip = {"Android", ".thumbnails", ".cache", ".trash"}

files = []
for base, dirs, names in os.walk(root):
    dirs[:] = [d for d in dirs if d not in skip]
    for name in names:
        if name.lower().endswith(exts):
            path = os.path.join(base, name)
            try:
                files.append((os.path.getmtime(path), os.path.getsize(path), path))
            except OSError:
                pass
files.sort(reverse=True)

found = []
for _, size, path in files[:800]:  # solo las más recientes
    if size < 40_000 or size > 15_000_000:
        continue
    try:
        with Image.open(path) as im:
            w, h = im.size
            if w < 500 or not (1.5 <= h / w <= 2.4):
                continue
            im.draft("RGB", (96, 96))
            small = im.convert("RGB").resize((24, 24))
    except Exception:
        continue
    px = list(small.getdata())
    r = sum(p[0] for p in px) / len(px)
    g = sum(p[1] for p in px) / len(px)
    b = sum(p[2] for p in px) / len(px)
    # nebulosa verde y azulada: poco rojo, mucho verde, oscura en conjunto
    if g > r * 1.4 and g >= b * 0.85 and (r + g + b) / 3 < 130:
        found.append((path, w, h))

if not found:
    sys.exit('No encontré la foto. Mira tus archivos con: ls ~/storage/downloads | head   y usa: python3 scripts/make-chat-bg.py "RUTA"')

for path, w, h in found[:3]:
    print(f"Candidata: {path} ({w}x{h})")
best = found[0][0]
print("Usando:", best)
subprocess.run([sys.executable, "scripts/make-chat-bg.py", best], check=True)
