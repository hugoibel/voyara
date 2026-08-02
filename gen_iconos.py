"""
Genera los iconos PNG de la PWA y la imagen para redes sociales.
    python gen_iconos.py
Necesita Pillow:  pip install pillow
"""
import os
from PIL import Image, ImageDraw

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(DIR, exist_ok=True)

TURQUESA = (13, 125, 143)
TURQUESA2 = (10, 96, 112)
CORAL = (239, 122, 61)
BLANCO = (255, 255, 255)


def degradado(w, h, c1, c2):
    img = Image.new("RGB", (w, h), c1)
    d = ImageDraw.Draw(img)
    for y in range(h):
        k = y / max(1, h - 1)
        d.line([(0, y), (w, y)],
               fill=tuple(int(c1[i] + (c2[i] - c1[i]) * k) for i in range(3)))
    return img


def avion(d, cx, cy, s, color=BLANCO):
    """Avión estilizado apuntando arriba-derecha."""
    pts = [
        (cx + 0.50 * s, cy - 0.52 * s),   # morro
        (cx + 0.14 * s, cy - 0.06 * s),
        (cx - 0.46 * s, cy - 0.20 * s),   # ala izquierda
        (cx - 0.52 * s, cy - 0.02 * s),
        (cx - 0.04 * s, cy + 0.22 * s),
        (cx - 0.16 * s, cy + 0.46 * s),   # cola
        (cx - 0.02 * s, cy + 0.52 * s),
        (cx + 0.20 * s, cy + 0.28 * s),
        (cx + 0.44 * s, cy + 0.34 * s),
        (cx + 0.52 * s, cy + 0.20 * s),
        (cx + 0.30 * s, cy - 0.10 * s),
    ]
    d.polygon(pts, fill=color)


def icono(tam):
    img = degradado(tam, tam, TURQUESA, TURQUESA2)
    d = ImageDraw.Draw(img, "RGBA")

    # Órbita/horizonte de fondo
    r = tam * 0.40
    d.ellipse([tam / 2 - r, tam / 2 - r, tam / 2 + r, tam / 2 + r],
              outline=(255, 255, 255, 45), width=max(2, tam // 64))

    avion(d, tam * 0.50, tam * 0.50, tam * 0.62)

    # Estela
    d.line([(tam * 0.20, tam * 0.74), (tam * 0.44, tam * 0.60)],
           fill=CORAL + (210,), width=max(3, tam // 42))

    # Esquinas redondeadas
    mascara = Image.new("L", (tam, tam), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, tam, tam], radius=int(tam * 0.22), fill=255)
    salida = Image.new("RGBA", (tam, tam), (0, 0, 0, 0))
    salida.paste(img, (0, 0), mascara)
    return salida


def og():
    """Imagen 1200x630 para cuando compartes el enlace."""
    w, h = 1200, 630
    img = degradado(w, h, TURQUESA, TURQUESA2)
    d = ImageDraw.Draw(img, "RGBA")

    # Montañas de fondo
    d.polygon([(0, h), (280, 300), (520, h)], fill=(255, 255, 255, 22))
    d.polygon([(360, h), (720, 250), (1080, h)], fill=(255, 255, 255, 16))
    d.ellipse([980, 70, 1120, 210], fill=(255, 255, 255, 40))

    avion(d, 250, 300, 250)
    d.line([(90, 430), (185, 370)], fill=CORAL + (230,), width=14)

    try:
        from PIL import ImageFont
        f1 = ImageFont.truetype("segoeuib.ttf", 86)
        f2 = ImageFont.truetype("segoeui.ttf", 38)
    except Exception:
        f1 = f2 = None
    d.text((430, 250), "Voyara", fill=BLANCO, font=f1)
    d.text((434, 360), "Vuelos, hoteles y viajes al mejor precio",
           fill=(255, 255, 255, 220), font=f2)
    return img.convert("RGB")


if __name__ == "__main__":
    for t in (192, 512):
        p = os.path.join(DIR, f"icon-{t}.png")
        icono(t).save(p)
        print("OK", p)
    p = os.path.join(DIR, "og.png")
    og().save(p, quality=92)
    print("OK", p)
