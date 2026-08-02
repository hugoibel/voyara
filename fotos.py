"""
Descarga las fotos de los destinos desde Wikimedia Commons y genera js/fotos.js
con los créditos (obligatorios: casi todas son Creative Commons).

    pip install pillow
    python fotos.py            # solo las que falten
    python fotos.py --todas    # vuelve a bajarlas todas

Solo busca entre imágenes marcadas como "Quality images" o "Featured pictures",
que son las revisadas por la comunidad: se nota mucho en el resultado.

Si una foto no te gusta, cambia su término de búsqueda aquí abajo y vuelve a
ejecutarlo con --todas, o mete tu propio archivo en img/dest/<id>.jpg y añade
el id a MANUALES para que el script no lo pise.
"""
import io, json, os, re, sys, time, urllib.parse, urllib.request

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
DIR_IMG = os.path.join(BASE, 'img', 'dest')
UA = {'User-Agent': 'VoyaraPhotoFetch/1.0 (https://hugoibel.github.io/voyara/; hugoibel91@gmail.com)'}

GRANDE = (1200, 800)     # para el hero y las fichas
PEQUE = (600, 400)      # para las tarjetas en móvil

# Fotos que gestionas tú a mano: el script no las toca
MANUALES = set()

# Cuando la búsqueda no acierta, aquí mandas tú: pon el nombre EXACTO del
# archivo tal y como aparece en commons.wikimedia.org y se usará ese.
ARCHIVO_FIJO = {
    'roma': 'Colosseum of Rome and Roman forum.jpg',
}

# ---------------------------------------------------------------
#  Qué buscar para cada destino. Cuanto más icónico, mejor sale.
# ---------------------------------------------------------------
BUSQUEDAS = {
    # --- Europa ---
    'roma':        'Roman Forum Rome ruins',
    'paris':       'Eiffel Tower Paris',
    'santorini':   'Oia Santorini Greece',
    'lisboa':      'Lisbon Alfama tram Portugal',
    'islandia':    'Iceland Skogafoss waterfall',
    'amsterdam':   'Amsterdam canal houses Netherlands',
    'praga':       'Charles Bridge Prague',
    'dubrovnik':   'Dubrovnik old town Croatia',
    'noruega':     'Geirangerfjord Norway',
    'alpes':       'Matterhorn Switzerland Alps',
    'londres':     'Tower Bridge London',
    'canarias':    'Maspalomas dunes Gran Canaria',
    # --- Asia ---
    'tokio':       'Tokyo Shibuya street city Japan',
    'bali':        'Bali rice terrace Indonesia',
    'bangkok':     'Wat Arun Bangkok Thailand',
    'maldivas':    'Maldives beach island lagoon',
    'dubai':       'Dubai skyline Burj Khalifa',
    'vietnam':     'Halong Bay karst islands boats',
    'kioto':       'Fushimi Inari Kyoto torii',
    'srilanka':    'Sigiriya Sri Lanka',
    'petra':       'Petra Treasury Jordan',
    'india':       'Hawa Mahal Jaipur Rajasthan',
    # --- América ---
    'nyc':         'Empire State Building Manhattan skyline',
    'cancun':      'Tulum beach Mexico Caribbean',
    'machupicchu': 'Machu Picchu Peru',
    'patagonia':   'Fitz Roy Patagonia Argentina',
    'rio':         'Sugarloaf Mountain Rio de Janeiro bay',
    'costarica':   'Arenal Volcano',
    'habana':      'Havana Cuba classic car street',
    'cartagena':   'Cartagena Colombia colorful street balconies',
    # --- África ---
    'marrakech':   'Marrakech Koutoubia medina Morocco',
    'egipto':      'Great Pyramid Khafre Giza Egypt',
    'safari':      'Lions Serengeti Tanzania savanna',
    'ciudadcabo':  'Cape Town Table Mountain city South Africa',
    # --- Oceanía ---
    'sidney':      'Sydney Opera House harbour',
    'nuevazelanda':'Milford Sound New Zealand',
    # --- Viajes organizados ---
    'pq_japon':    'Kyoto temple autumn Japan',
    'pq_bali':     'Tanah Lot temple Bali sunset',
    'pq_peru':     'Sacred Valley Cusco Peru',
    'pq_islandia': 'Jokulsarlon icebergs lagoon Iceland',
    'pq_marruecos':'Erg Chebbi Sahara dunes Morocco',
    'pq_italia':   'Venice Grand Canal Italy',
}


def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def limpiar(html):
    """Los créditos vienen con HTML dentro; nos quedamos con el texto."""
    if not html:
        return ''
    txt = re.sub(r'<[^>]+>', '', html)
    txt = (txt.replace('&amp;', '&').replace('&quot;', '"')
              .replace('&#039;', "'").replace('&nbsp;', ' ').replace('&lt;', '<').replace('&gt;', '>'))
    return ' '.join(txt.split())[:80]


def por_nombre(archivo):
    """Trae un archivo concreto de Commons, sin buscar."""
    r = api({'action': 'query', 'format': 'json', 'titles': 'File:' + archivo,
             'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': GRANDE[0]})
    for p in (r.get('query', {}).get('pages') or {}).values():
        if 'imageinfo' not in p:
            continue
        ii = p['imageinfo'][0]
        m = ii.get('extmetadata', {})
        return [{'archivo': archivo,
                 'thumb': ii.get('thumburl') or ii.get('url'),
                 'pagina': ii.get('descriptionurl', ''),
                 'autor': limpiar(m.get('Artist', {}).get('value', '')) or 'Wikimedia Commons',
                 'licencia': m.get('LicenseShortName', {}).get('value', 'CC'),
                 'ratio': ii['width'] / ii['height']}]
    return []


def buscar(termino):
    """Devuelve candidatas apaisadas, mejor valoradas primero."""
    candidatas = []
    for filtro in ('incategory:"Featured pictures"', 'incategory:"Quality images"', ''):
        try:
            r = api({'action': 'query', 'format': 'json', 'generator': 'search',
                     'gsrsearch': f'{termino} filetype:bitmap {filtro}'.strip(),
                     'gsrnamespace': 6, 'gsrlimit': 8,
                     'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size',
                     'iiurlwidth': GRANDE[0]})
        except Exception as e:
            print('    aviso: fallo la busqueda:', e)
            continue

        for p in (r.get('query', {}).get('pages') or {}).values():
            ii = p.get('imageinfo', [{}])[0]
            if not ii:
                continue
            w, h = ii.get('width', 0), ii.get('height', 0)
            if w < 1400 or h < 800:
                continue
            ratio = w / h
            if not (1.25 < ratio < 2.4):        # descartamos verticales y panorámicas extremas
                continue
            # Entre las "Featured pictures" hay mucha foto técnica o de detalle
            # (satélites, mapas, primeros planos de una escultura). No venden un viaje.
            titulo = p['title'].lower()
            if any(x in titulo for x in (
                    'satellite', 'sentinel', 'landsat', 'iss0', 'from space', 'orbit',
                    'map ', 'map_', 'diagram', 'plan of', 'panorama of the', 'closeup',
                    'close-up', 'detail', 'statue of', 'sculpture', 'fresco', 'painting',
                    'engraving', 'coat of arms', 'stamp', 'banknote', 'aerial view of the')):
                continue
            m = ii.get('extmetadata', {})
            candidatas.append({
                'archivo': p['title'].replace('File:', ''),
                'thumb': ii.get('thumburl') or ii.get('url'),
                'pagina': ii.get('descriptionurl', ''),
                'autor': limpiar(m.get('Artist', {}).get('value', '')) or 'Wikimedia Commons',
                'licencia': m.get('LicenseShortName', {}).get('value', 'CC'),
                'ratio': ratio,
            })
        if candidatas:
            break
    # la que más se acerque a 3:2, que es el formato de las tarjetas
    candidatas.sort(key=lambda c: abs(c['ratio'] - 1.5))
    return candidatas


def recortar(img, destino):
    """Recorta al centro y redimensiona sin deformar."""
    dw, dh = destino
    escala = max(dw / img.width, dh / img.height)
    nueva = (max(dw, int(img.width * escala + 0.5)), max(dh, int(img.height * escala + 0.5)))
    img = img.resize(nueva, Image.LANCZOS)
    izq = (img.width - dw) // 2
    arr = (img.height - dh) // 2
    return img.crop((izq, arr, izq + dw, arr + dh))


def descargar(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return Image.open(io.BytesIO(r.read())).convert('RGB')


def main():
    todas = '--todas' in sys.argv
    os.makedirs(DIR_IMG, exist_ok=True)
    creditos, fallos = {}, []

    # Conservamos los créditos de las fotos que no volvemos a bajar
    js = os.path.join(BASE, 'js', 'fotos.js')
    if os.path.exists(js) and not todas:
        try:
            txt = io.open(js, encoding='utf-8').read()
            creditos = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
        except Exception:
            creditos = {}

    for i, (dest, termino) in enumerate(BUSQUEDAS.items(), 1):
        salida = os.path.join(DIR_IMG, f'{dest}.jpg')
        if dest in MANUALES:
            print(f'[{i:>2}/{len(BUSQUEDAS)}] {dest:<14} (tuya, no se toca)')
            continue
        if os.path.exists(salida) and not todas and dest in creditos:
            print(f'[{i:>2}/{len(BUSQUEDAS)}] {dest:<14} ya estaba')
            continue

        fijo = ARCHIVO_FIJO.get(dest)
        print(f'[{i:>2}/{len(BUSQUEDAS)}] {dest:<14} '
              + (f'archivo fijo "{fijo[:40]}"…' if fijo else f'buscando "{termino}"…'),
              end=' ', flush=True)
        try:
            cands = por_nombre(fijo) if fijo else buscar(termino)
            if not cands:
                print('SIN RESULTADOS')
                fallos.append(dest)
                continue

            elegida, img = None, None
            for c in cands[:3]:
                try:
                    img = descargar(c['thumb'])
                    elegida = c
                    break
                except Exception:
                    continue
            if not elegida:
                print('NO SE PUDO DESCARGAR')
                fallos.append(dest)
                continue

            recortar(img, GRANDE).save(salida, 'JPEG', quality=82, optimize=True, progressive=True)
            recortar(img, PEQUE).save(os.path.join(DIR_IMG, f'{dest}-sm.jpg'),
                                      'JPEG', quality=80, optimize=True, progressive=True)

            creditos[dest] = {'autor': elegida['autor'], 'licencia': elegida['licencia'],
                              'titulo': elegida['archivo'], 'url': elegida['pagina']}
            kb = os.path.getsize(salida) // 1024
            print(f'OK ({kb} KB) · {elegida["licencia"]}')
            time.sleep(0.4)                      # no martilleamos su API
        except Exception as e:
            print('ERROR:', e)
            fallos.append(dest)

    cab = ('// ============================================================\n'
           '//  VOYARA — Créditos de las fotos (generado por fotos.py)\n'
           '//  NO editar a mano: se regenera al ejecutar  python fotos.py\n'
           '//  Las fotos son de Wikimedia Commons. La atribución es\n'
           '//  OBLIGATORIA en las licencias CC BY / CC BY-SA: se muestra\n'
           '//  en legal.html y sobre cada foto ampliada.\n'
           '// ============================================================\n\n'
           'const FOTOS = ')
    io.open(js, 'w', encoding='utf-8').write(
        cab + json.dumps(creditos, ensure_ascii=False, indent=2) + ';\n')

    print(f'\n{len(creditos)} fotos listas · js/fotos.js actualizado')
    if fallos:
        print('SIN FOTO:', ', '.join(fallos), '\n  → cambia su término en BUSQUEDAS y repite')


if __name__ == '__main__':
    main()
