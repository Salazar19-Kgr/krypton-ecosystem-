"""Prepara el fondo del chat: lo agranda con el mejor filtro y le da enfoque para que se vea nítido."""
import os
import sys

from PIL import Image, ImageFilter

src = sys.argv[1] if len(sys.argv) > 1 else "public/krypton-chat-bg-src.jpg"
img = Image.open(src).convert("RGB")
w, h = img.size

# Las pantallas de teléfono son más grandes que la foto: se agranda aquí (con calidad) y no en el navegador
if w < 1000:
    img = img.resize((round(w * 1.5), round(h * 1.5)), Image.LANCZOS)
img = img.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))

img.save("public/krypton-chat-bg.webp", "WEBP", quality=93, method=6)
kb = os.path.getsize("public/krypton-chat-bg.webp") // 1024
print(f"Fondo listo: {img.size[0]}x{img.size[1]} ({kb} KB)")
