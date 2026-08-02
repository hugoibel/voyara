"""
Genera el kit para Pinterest: una imagen vertical por destino más el texto
listo para pegar.

    python pinterest.py

Pinterest funciona como buscador visual y NO depende de la autoridad de tu
dominio: es la vía más rápida a tráfico real para una web nueva. Premia el
formato vertical 2:3 (1000x1500).

Salida:
  pinterest/img/<id>.jpg     la imagen para subir
  pinterest/publicar.csv     título, descripción y enlace de cada una
  pinterest/GUIA.md          cómo publicarlas y con qué ritmo
"""
import csv, io, json, os, re, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(BASE, 'pinterest')
SITIO = 'https://hugoibel.github.io/voyara'
W, H = 1000, 1500

sys.path.insert(0, BASE)
from paginas import DESTINOS, PAISES, MESES, TIPOS, T   # reutilizamos los datos ya cargados


def fuente(nombres, tam):
    for n in nombres:
        for ruta in (f'C:/Windows/Fonts/{n}', n):
            try:
                return ImageFont.truetype(ruta, tam)
            except Exception:
                continue
    return ImageFont.load_default()


F_TIT = ['georgiab.ttf', 'Georgia Bold.ttf', 'timesbd.ttf']
F_TXT = ['segoeui.ttf', 'arial.ttf']
F_TXTB = ['segoeuib.ttf', 'arialbd.ttf']


def ajustar(draw, texto, fnt, ancho):
    """Parte el texto en líneas que quepan."""
    palabras, lineas, act = texto.split(), [], ''
    for p in palabras:
        prueba = (act + ' ' + p).strip()
        if draw.textlength(prueba, font=fnt) <= ancho:
            act = prueba
        else:
            if act:
                lineas.append(act)
            act = p
    if act:
        lineas.append(act)
    return lineas


def pin(d, idi='es'):
    src = os.path.join(BASE, 'img', 'dest', d['id'] + '.jpg')
    foto = Image.open(src).convert('RGB')

    # Recorte vertical centrado
    escala = max(W / foto.width, H / foto.height)
    foto = foto.resize((int(foto.width * escala + 1), int(foto.height * escala + 1)), Image.LANCZOS)
    izq, arr = (foto.width - W) // 2, (foto.height - H) // 2
    img = foto.crop((izq, arr, izq + W, arr + H))

    # Velo oscuro arriba y abajo para que el texto se lea siempre
    velo = Image.new('L', (1, H))
    for y in range(H):
        if y < H * 0.42:
            v = int(150 * (1 - y / (H * 0.42)) + 40)
        elif y > H * 0.52:
            v = int(215 * ((y - H * 0.52) / (H * 0.48)))
        else:
            v = 40
        velo.putpixel((0, y), min(235, v))
    capa = Image.new('RGB', (W, H), (10, 14, 16))
    img = Image.composite(capa, img, velo.resize((W, H)))

    d2 = ImageDraw.Draw(img)
    t = T[idi]
    pais = PAISES[d['pais']][idi]
    total = d['vuelo'] + d['hotel'] * 5 + d['dia'] * 5
    meses = ', '.join(MESES[idi][m - 1] for m in d['epoca'][:4])

    # --- Arriba: país ---
    f_pais = fuente(F_TXTB, 30)
    d2.text((70, 88), pais.upper(), font=f_pais, fill=(255, 255, 255, 230))
    d2.line([(70, 140), (70 + d2.textlength(pais.upper(), font=f_pais), 140)], fill=(255, 255, 255), width=2)

    # --- Nombre del destino ---
    f_tit = fuente(F_TIT, 104)
    lineas = ajustar(d2, d['n'], f_tit, W - 140)
    y = 190
    for ln in lineas:
        d2.text((70, y), ln, font=f_tit, fill=(255, 255, 255))
        y += 112

    # --- Reclamo ---
    f_sub = fuente(F_TXT, 38)
    sub = {'es': 'Precios, mejor época y qué reservar',
           'en': 'Prices, best time to go and what to book'}[('es' if idi == 'es' else 'en')]
    for ln in ajustar(d2, sub, f_sub, W - 140)[:2]:
        d2.text((72, y + 10), ln, font=f_sub, fill=(255, 255, 255, 220))
        y += 48

    # --- Abajo: los datos que hacen que se guarde el pin ---
    f_dato = fuente(F_TXTB, 46)
    f_et = fuente(F_TXT, 26)
    base_y = H - 340
    filas = [
        ({'es': 'DESDE', 'en': 'FROM'}[('es' if idi == 'es' else 'en')], f'{total} €'),
        ({'es': 'MEJOR ÉPOCA', 'en': 'BEST TIME'}[('es' if idi == 'es' else 'en')], meses),
    ]
    for et, val in filas:
        d2.text((70, base_y), et, font=f_et, fill=(255, 255, 255, 190))
        d2.text((70, base_y + 34), val, font=f_dato, fill=(255, 255, 255))
        base_y += 118

    # --- Marca ---
    f_marca = fuente(F_TIT, 40)
    d2.text((70, H - 92), 'Voyara', font=f_marca, fill=(255, 255, 255))
    d2.text((70 + d2.textlength('Voyara', font=f_marca) + 3, H - 92), '.',
            font=f_marca, fill=(150, 205, 195))

    return img


DESCRIPCION = {
 'es': ('{d}, {p}: cuánto cuesta el viaje, la mejor época del año para ir y dónde reservar '
        'vuelo y hotel al mejor precio. Presupuesto orientativo desde {t} € por persona '
        '(vuelo + 5 noches). Guía gratuita, sin registro. #viajar #{tag} #viajes #{tag2}'),
}


def main():
    os.makedirs(os.path.join(SALIDA, 'img'), exist_ok=True)
    filas = []
    for i, d in enumerate(DESTINOS, 1):
        img = pin(d)
        ruta = os.path.join(SALIDA, 'img', d['id'] + '.jpg')
        img.save(ruta, 'JPEG', quality=86, optimize=True)

        total = d['vuelo'] + d['hotel'] * 5 + d['dia'] * 5
        pais = PAISES[d['pais']]['es']
        tag = re.sub(r'[^a-záéíóúñ]', '', d['n'].lower())
        tag2 = re.sub(r'[^a-záéíóúñ]', '', pais.lower())
        filas.append({
            'imagen': f'pinterest/img/{d["id"]}.jpg',
            'titulo': f'{d["n"]}: precios, mejor época y qué reservar',
            'descripcion': DESCRIPCION['es'].format(d=d['n'], p=pais, t=total, tag=tag, tag2=tag2),
            'enlace': f'{SITIO}/destinos/es/{d["id"]}.html',
            'tablero_sugerido': {'europa': 'Viajes por Europa', 'asia': 'Viajes por Asia',
                                 'america': 'Viajes por América', 'africa': 'Viajes por África',
                                 'oceania': 'Viajes por Oceanía'}[d['cont']],
        })
        print(f'  [{i:>2}/{len(DESTINOS)}] {d["id"]}')

    with io.open(os.path.join(SALIDA, 'publicar.csv'), 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0].keys()), delimiter=';')
        w.writeheader()
        w.writerows(filas)

    io.open(os.path.join(SALIDA, 'GUIA.md'), 'w', encoding='utf-8').write(GUIA)
    print(f'\n{len(filas)} pines listos en pinterest/')
    print('  · imágenes en pinterest/img/')
    print('  · textos en pinterest/publicar.csv (ábrelo con Excel)')
    print('  · instrucciones en pinterest/GUIA.md')


GUIA = '''# Kit de Pinterest

36 imágenes verticales (1000×1500, el formato que Pinterest premia) con el texto
ya escrito. Solo tienes que subirlas.

## Por qué Pinterest y no otra red

Pinterest **no es una red social, es un buscador visual**. Eso cambia todo para ti:

- No necesitas seguidores. Un pin nuevo puede aparecer en búsquedas desde el primer día.
- **No depende de la autoridad de tu dominio**, que es tu punto débil ahora mismo.
- Los pines siguen trayendo visitas **meses o años** después de publicarlos, al revés
  que un post de Instagram, que muere en 24 horas.
- Los viajes son de los nichos más buscados: más de mil millones de búsquedas al año.

## Preparación (una vez, 15 minutos)

1. Crea una **cuenta de empresa** en pinterest.com/business/create (gratis).
   La de empresa da estadísticas y permite reclamar la web; la personal no.
2. **Reclama tu sitio web**: Ajustes → Cuentas reclamadas → añade
   `hugoibel.github.io/voyara`. Te dará una etiqueta que hay que pegar en el HTML;
   pásamela y la pongo.
3. Crea **5 tableros**, uno por continente (la columna `tablero_sugerido` del CSV te
   dice a cuál va cada pin):
   - Viajes por Europa · Viajes por Asia · Viajes por América · Viajes por África · Viajes por Oceanía

## Publicar

Abre `publicar.csv` con Excel. Cada fila es un pin:

| Columna | Qué hacer con ella |
|---|---|
| `imagen` | la subes |
| `titulo` | al campo Título |
| `descripcion` | al campo Descripción |
| `enlace` | al campo "Enlace de destino" — **este es el que trae la visita** |
| `tablero_sugerido` | en qué tablero guardarlo |

**El campo del enlace es el importante.** Sin él, el pin es bonito pero no te
trae a nadie.

## Ritmo

**3-5 pines al día, no los 36 de golpe.** Pinterest penaliza las subidas masivas de
una cuenta nueva; prefiere constancia. Con 36 imágenes tienes para 8-10 días.
Puedes programarlos desde el propio Pinterest.

Cuando se te acaben, vuelve a ejecutar `python pinterest.py` tras añadir destinos
nuevos, o repite los mismos destinos con otra foto.

## Qué esperar

No es inmediato: Pinterest tarda **entre 4 y 8 semanas** en empezar a distribuir bien
una cuenta nueva. A partir de ahí crece solo. No abandones a las dos semanas: es
justo el error que hace que la mayoría no vea resultados.

## Lo que NO debes hacer

- Poner el enlace de afiliado directamente en el pin. Pinterest lo penaliza y algunos
  programas lo prohíben. **Enlaza siempre a tu web**, que es donde están tus enlaces.
- Repetir el mismo pin exacto muchas veces.
- Comprar seguidores: no sirven de nada en un buscador visual.
'''


if __name__ == '__main__':
    main()
