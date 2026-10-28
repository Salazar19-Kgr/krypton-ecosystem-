"""Busca en tu teléfono la foto de la nebulosa verde, te la muestra para confirmar y prepara el fondo del chat."""
import os
import subprocess
import sys

from PIL import Image

root = os.path.expanduser("~/storage/shared")
exts = (".jpg", ".jpeg", ".png", ".webp")
skip_dirs = {"android", ".thumbnails", ".cache", ".trash", "screenshots", "screenrecorder"}
skip_names = ("screenshot", "screen_shot", "captura", "screen-")

files = []
for base, dirs, names in os.walk(root):
    dirs[:] = [d for d in dirs if d.lower() not in skip_dirs]
    for name in names:
        low = name.lower()
        if low.endswith(exts) and not any(word in low for word in skip_names):
            path = os.path.join(base, name)
            try:
                files.append((os.path.getmtime(path), os.path.getsize(path), path))
            except OSError:
                pass
files.sort(reverse=True)

found = []
for _, size, path in files[:1200]:
    if size < 40_000 or size > 15_000_000:
        continue
    try:
        with Image.open(path) as im:
            w, h = im.size
            if w < 500 or not (1.5 <= h / w <= 2.4):
                continue
            im.draft("RGB", (128, 128))
            data = im.convert("RGB").resize((90, 160)).tobytes()
    except Exception:
        continue
    pixels = list(zip(data[0::3], data[1::3], data[2::3]))
    n = len(pixels)
    bright_green = sum(1 for r, g, b in pixels if g > 90 and g > r * 1.6) / n
    dark = sum(1 for r, g, b in pixels if (r + g + b) / 3 < 45) / n
    # la nebulosa: fondo muy oscuro con zonas de verde brillante
    if dark >= 0.45 and bright_green >= 0.12:
        found.append((bright_green, path, w, h))

found.sort(reverse=True)
if not found:
    sys.exit('No encontré la foto. Mira tus archivos con: ls -t ~/storage/downloads | head -20   y usa: python3 scripts/make-chat-bg.py "RUTA"')

chosen = None
for _, path, w, h in found[:6]:
    print(f"\nPosible foto: {path} ({w}x{h})")
    try:
        subprocess.run(["termux-open", path], check=False)
    except FileNotFoundError:
        pass
    answer = input("¿Es la nebulosa verde? Escribe s o n y pulsa Enter: ").strip().lower()
    if answer.startswith("s"):
        chosen = path
        break

if not chosen:
    sys.exit("Listo, no elegiste ninguna. Si la foto no salió, dime su ruta y la usamos.")

subprocess.run([sys.executable, "scripts/make-chat-bg.py", chosen], check=True)
try:
    subprocess.run(["termux-open", "public/krypton-chat-bg.webp"], check=False)
except FileNotFoundError:
    pass
print("\nMira cómo quedó el fondo. Si se ve bien, continúa con el siguiente paso.")
