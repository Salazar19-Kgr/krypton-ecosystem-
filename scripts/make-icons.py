import math
from PIL import Image, ImageDraw, ImageFilter

S = 2048  # se dibuja grande y se reduce para que quede suave


def atom(size, scale):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = size / 2
    rx, ry = size * 0.40 * scale, size * 0.15 * scale
    for ang in (0, 60, 120):
        a = math.radians(ang)
        w = size * 0.011
        for i in range(1440):
            t = math.radians(i / 4)
            x, y = rx * math.cos(t), ry * math.sin(t)
            px, py = c + x * math.cos(a) - y * math.sin(a), c + x * math.sin(a) + y * math.cos(a)
            d.ellipse((px - w, py - w, px + w, py + w), fill=(255, 255, 255, 255))
    r = size * 0.055 * scale
    d.ellipse((c - r, c - r, c + r, c + r), fill=(255, 255, 255, 255))
    return img


def background(size):
    bg = Image.new("RGB", (size, size))
    px = bg.load()
    cx, cy = size * 0.5, size * 0.38
    mx = math.hypot(size, size) * 0.62
    for y in range(0, size, 2):
        for x in range(0, size, 2):
            k = min(1.0, math.hypot(x - cx, y - cy) / mx)
            col = (int(20 + (4 - 20) * k), int(78 + (10 - 78) * k), int(170 + (32 - 170) * k))
            px[x, y] = col
            if x + 1 < size:
                px[x + 1, y] = col
            if y + 1 < size:
                px[x, y + 1] = col
                if x + 1 < size:
                    px[x + 1, y + 1] = col
    return bg


def make(out, size, scale):
    bg = background(S)
    ico = atom(S, scale)
    glow = ico.filter(ImageFilter.GaussianBlur(S * 0.018))
    bg = bg.convert("RGBA")
    bg.alpha_composite(glow)
    bg.alpha_composite(ico)
    bg.convert("RGB").resize((size, size), Image.LANCZOS).save(out, optimize=True)


make("public/icons/icon-512.png", 512, 1.0)
make("public/icons/icon-192.png", 192, 1.0)
make("public/icons/icon-maskable-512.png", 512, 0.72)
make("public/icons/apple-touch-icon.png", 180, 0.85)
print("Íconos creados en public/icons")
