"""Prepara las imágenes del cielo del chat: así el teléfono ya no tiene que aplicar filtros y máscaras en cada cuadro."""
from PIL import Image, ImageEnhance

SRC = "public/krypton-nebula.webp"
img = Image.open(SRC).convert("RGB")
w, h = img.size

# 1) Nebulosa más viva, con los bordes difuminados (antes lo hacían filtros y máscaras de CSS)
vivid = ImageEnhance.Color(img).enhance(1.55)
vivid = ImageEnhance.Contrast(vivid).enhance(1.12)
vivid = ImageEnhance.Brightness(vivid).enhance(1.08)

sw, sh = max(w // 4, 1), max(h // 4, 1)
mask = Image.new("L", (sw, sh))
for y in range(sh):
    for x in range(sw):
        dx = (x / (sw - 1) - 0.5) / 0.60
        dy = (y / (sh - 1) - 0.5) / 0.58
        d = (dx * dx + dy * dy) ** 0.5
        a = 1.0 if d <= 0.52 else max(0.0, (1.0 - d) / 0.48)
        mask.putpixel((x, y), int(a * 255))
vivid.putalpha(mask.resize((w, h), Image.BILINEAR))
vivid.save("public/krypton-nebula-fx.webp", "WEBP", quality=86, method=6)

# 2) Fondo difuminado: una imagen diminuta que el navegador estira (queda borrosa sola)
base = ImageEnhance.Color(img).enhance(1.8)
base = ImageEnhance.Brightness(base).enhance(0.8)
base = base.resize((48, max(int(48 * h / w), 1)), Image.LANCZOS)
base.save("public/krypton-nebula-base.webp", "WEBP", quality=80)
print("Imágenes del cielo creadas")
