"""
Genera una página propia para cada destino y cada idioma.

    python paginas.py

Por qué: la web es una sola página, así que Google solo puede indexar dos
direcciones. Con esto pasa a 180 (36 destinos × 5 idiomas), y cada una compite
por sus propias búsquedas ("mejor época para viajar a Bali", "presupuesto Japón").

Cada página se genera con DATOS REALES del destino (precios, meses, tipo de
viaje). No inventa descripciones: si no hay dato, no se escribe.

Salida: destinos/<idioma>/<id>.html  +  sitemap.xml actualizado
"""
import io, json, os, re, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE = os.path.dirname(os.path.abspath(__file__))
SITIO = 'https://hugoibel.github.io/voyara'
IDIOMAS = ['es', 'en', 'de', 'fr', 'it']


# ---------------------------------------------------------------
#  Leemos los datos de los .js sin duplicarlos aquí
# ---------------------------------------------------------------
def bloque_js(archivo, nombre):
    s = io.open(os.path.join(BASE, archivo), encoding='utf-8').read()
    i = s.index('const ' + nombre)
    i = s.index('[', i) if nombre in ('DESTINOS',) else s.index('{', i)
    cierre = ']' if nombre in ('DESTINOS',) else '}'
    prof, fin = 0, i
    for j in range(i, len(s)):
        if s[j] in '[{': prof += 1
        elif s[j] in ']}': prof -= 1
        if prof == 0:
            fin = j + 1
            break
    txt = s[i:fin]
    txt = re.sub(r'//[^\n]*', '', txt)                       # comentarios
    txt = re.sub(r'([{,]\s*)(\w+):', r'\1"\2":', txt)        # claves sin comillas
    txt = txt.replace("'", '"')
    txt = re.sub(r',(\s*[}\]])', r'\1', txt)                 # comas finales
    return json.loads(txt)


DESTINOS = bloque_js('js/data.js', 'DESTINOS')
PAISES = bloque_js('js/i18n.js', 'PAISES')
MESES = bloque_js('js/i18n.js', 'MESES')
_f = io.open(os.path.join(BASE, 'js/fotos.js'), encoding='utf-8').read()
FOTOS = json.loads(_f[_f.index('{', _f.index('const FOTOS')):_f.rindex('}') + 1])

# ---------------------------------------------------------------
#  Textos de las plantillas
# ---------------------------------------------------------------
T = {
 'es': dict(titulo='Viajar a {d}', sub='Precios, mejor época y qué reservar',
   meta='Cuánto cuesta viajar a {d} ({p}): vuelos, hotel y gasto diario. Mejor época del año, presupuesto y dónde reservar al mejor precio.',
   cuesta='Cuánto cuesta', vuelo='Vuelo ida y vuelta', hotel='Hotel por noche',
   diario='Gasto diario', total='Total orientativo, 5 noches', pp='por persona',
   cuando='Cuándo viajar', mejores='Los mejores meses son', tipo='Tipo de viaje',
   reservar='Reservar tu viaje a {d}', vuelos='Buscar vuelos', hoteles='Buscar hoteles',
   actividades='Qué hacer', otros='Otros destinos que te pueden gustar',
   volver='Ver todos los destinos', inicio='Inicio', destinos='Destinos',
   aviso='Precios orientativos calculados sobre valores habituales; el precio final lo ves en el buscador del proveedor. Esta web contiene enlaces de afiliado: si reservas a través de ellos recibimos una comisión sin coste extra para ti.',
   incluye='El total incluye vuelo, 5 noches de hotel y el gasto diario estimado.'),
 'en': dict(titulo='Travel to {d}', sub='Prices, best time to go and what to book',
   meta='How much a trip to {d} ({p}) costs: flights, hotel and daily spend. Best time of year, budget and where to book at the best price.',
   cuesta='What it costs', vuelo='Return flight', hotel='Hotel per night',
   diario='Daily spend', total='Indicative total, 5 nights', pp='per person',
   cuando='When to go', mejores='The best months are', tipo='Type of trip',
   reservar='Book your trip to {d}', vuelos='Find flights', hoteles='Find hotels',
   actividades='Things to do', otros='Other destinations you may like',
   volver='See all destinations', inicio='Home', destinos='Destinations',
   aviso='Indicative prices based on typical values; you see the final price in the provider\'s search engine. This site contains affiliate links: if you book through them we receive a commission at no extra cost to you.',
   incluye='The total includes flight, 5 nights of hotel and the estimated daily spend.'),
 'de': dict(titulo='Reisen nach {d}', sub='Preise, beste Reisezeit und was du buchen solltest',
   meta='Was eine Reise nach {d} ({p}) kostet: Flüge, Hotel und Tagesbudget. Beste Reisezeit, Budget und wo du am günstigsten buchst.',
   cuesta='Was es kostet', vuelo='Hin- und Rückflug', hotel='Hotel pro Nacht',
   diario='Tagesausgaben', total='Richtwert gesamt, 5 Nächte', pp='pro Person',
   cuando='Beste Reisezeit', mejores='Die besten Monate sind', tipo='Reiseart',
   reservar='Deine Reise nach {d} buchen', vuelos='Flüge suchen', hoteles='Hotels suchen',
   actividades='Was tun', otros='Weitere Ziele, die dir gefallen könnten',
   volver='Alle Reiseziele ansehen', inicio='Start', destinos='Reiseziele',
   aviso='Richtpreise auf Basis üblicher Kosten; den Endpreis siehst du in der Suche des Anbieters. Diese Seite enthält Affiliate-Links: Buchst du darüber, erhalten wir eine Provision ohne Mehrkosten für dich.',
   incluye='Der Gesamtpreis umfasst Flug, 5 Hotelnächte und die geschätzten Tagesausgaben.'),
 'fr': dict(titulo='Voyager à {d}', sub='Prix, meilleure période et quoi réserver',
   meta='Combien coûte un voyage à {d} ({p}) : vols, hôtel et budget quotidien. Meilleure période, budget et où réserver au meilleur prix.',
   cuesta='Combien ça coûte', vuelo='Vol aller-retour', hotel='Hôtel par nuit',
   diario='Dépense quotidienne', total='Total indicatif, 5 nuits', pp='par personne',
   cuando='Quand partir', mejores='Les meilleurs mois sont', tipo='Type de voyage',
   reservar='Réserver votre voyage à {d}', vuelos='Chercher des vols', hoteles='Chercher des hôtels',
   actividades='Que faire', otros='D\'autres destinations qui pourraient vous plaire',
   volver='Voir toutes les destinations', inicio='Accueil', destinos='Destinations',
   aviso='Prix indicatifs calculés sur des valeurs habituelles ; le prix final s\'affiche chez le prestataire. Ce site contient des liens d\'affiliation : si vous réservez via ces liens, nous percevons une commission sans coût supplémentaire pour vous.',
   incluye='Le total comprend le vol, 5 nuits d\'hôtel et la dépense quotidienne estimée.'),
 'it': dict(titulo='Viaggiare a {d}', sub='Prezzi, periodo migliore e cosa prenotare',
   meta='Quanto costa un viaggio a {d} ({p}): voli, hotel e spesa giornaliera. Periodo migliore, budget e dove prenotare al prezzo più basso.',
   cuesta='Quanto costa', vuelo='Volo andata e ritorno', hotel='Hotel a notte',
   diario='Spesa giornaliera', total='Totale indicativo, 5 notti', pp='a persona',
   cuando='Quando andare', mejores='I mesi migliori sono', tipo='Tipo di viaggio',
   reservar='Prenota il tuo viaggio a {d}', vuelos='Cerca voli', hoteles='Cerca hotel',
   actividades='Cosa fare', otros='Altre destinazioni che potrebbero piacerti',
   volver='Vedi tutte le destinazioni', inicio='Home', destinos='Destinazioni',
   aviso='Prezzi indicativi calcolati su valori abituali; il prezzo finale lo vedi nel motore del fornitore. Questo sito contiene link di affiliazione: se prenoti tramite essi riceviamo una commissione senza costi aggiuntivi per te.',
   incluye='Il totale comprende volo, 5 notti di hotel e la spesa giornaliera stimata.'),
}

TIPOS = {
 'playa':     dict(es='Playa', en='Beach', de='Strand', fr='Plage', it='Mare'),
 'ciudad':    dict(es='Ciudad', en='City', de='Städtereise', fr='Ville', it='Città'),
 'montana':   dict(es='Montaña', en='Mountains', de='Berge', fr='Montagne', it='Montagna'),
 'aventura':  dict(es='Aventura', en='Adventure', de='Abenteuer', fr='Aventure', it='Avventura'),
 'cultura':   dict(es='Cultura', en='Culture', de='Kultur', fr='Culture', it='Cultura'),
 'romantico': dict(es='Romántico', en='Romantic', de='Romantisch', fr='Romantique', it='Romantico'),
 'familia':   dict(es='En familia', en='Family', de='Familie', fr='En famille', it='Famiglia'),
 'lujo':      dict(es='Lujo', en='Luxury', de='Luxus', fr='Luxe', it='Lusso'),
 'barato':    dict(es='Económico', en='Budget', de='Günstig', fr='Petit budget', it='Economico'),
 'naturaleza':dict(es='Naturaleza', en='Nature', de='Natur', fr='Nature', it='Natura'),
 'desierto':  dict(es='Desierto', en='Desert', de='Wüste', fr='Désert', it='Deserto'),
}

MARCA = 'Voyara'
esc = lambda s: (str(s).replace('&', '&amp;').replace('<', '&lt;')
                 .replace('>', '&gt;').replace('"', '&quot;'))


def enlace_vuelos(d):
    return f'https://www.aviasales.com/search?destination_iata={d["iata"]}&adults=1&currency=eur&marker=759569'

def enlace_hoteles(d):
    from urllib.parse import quote
    return f'https://www.booking.com/searchresults.html?ss={quote(d["n"])}&group_adults=2&no_rooms=1&selected_currency=EUR'

def enlace_actividades(d):
    from urllib.parse import quote
    return f'https://www.getyourguide.com/s/?q={quote(d["n"])}'


def pagina(d, idi):
    t = T[idi]
    nombre = d['n']
    pais = PAISES[d['pais']][idi]
    total = d['vuelo'] + d['hotel'] * 5 + d['dia'] * 5
    meses_ok = [MESES[idi][m - 1] for m in d['epoca']]
    tipos = ' · '.join(TIPOS[x][idi] for x in d['tipos'])
    foto = FOTOS.get(d['id'], {})
    titulo = t['titulo'].format(d=nombre)
    meta = t['meta'].format(d=nombre, p=pais)

    # Destinos relacionados: mismo continente, los más populares (enlazado interno)
    rel = sorted([x for x in DESTINOS if x['cont'] == d['cont'] and x['id'] != d['id']],
                 key=lambda x: -x['pop'])[:4]

    alt = '\n'.join(
        f'<link rel="alternate" hreflang="{i}" href="{SITIO}/destinos/{i}/{d["id"]}.html">'
        for i in IDIOMAS)

    calendario = ''.join(
        f'<div class="mes{" bueno" if (m + 1) in d["epoca"] else ""}">{MESES[idi][m]}</div>'
        for m in range(12))

    relacionados = ''.join(f'''
      <a class="ficha" href="{r['id']}.html">
        <div class="ficha-foto"><img src="../../img/dest/{r['id']}-sm.jpg" alt="{esc(r['n'])}" loading="lazy"></div>
        <div class="ficha-cab"><div><h3>{esc(r['n'])}</h3>
          <div class="lugar rotulo">{esc(PAISES[r['pais']][idi])}</div></div></div>
      </a>''' for r in rel)

    schema = json.dumps({
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "TouristDestination", "name": nombre,
             "description": meta,
             "url": f"{SITIO}/destinos/{idi}/{d['id']}.html",
             "image": f"{SITIO}/img/dest/{d['id']}.jpg",
             "touristType": [TIPOS[x][idi] for x in d['tipos']],
             "containedInPlace": {"@type": "Country", "name": pais}},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": t['inicio'], "item": f"{SITIO}/"},
                {"@type": "ListItem", "position": 2, "name": t['destinos'], "item": f"{SITIO}/#destinos"},
                {"@type": "ListItem", "position": 3, "name": nombre}]}
        ]}, ensure_ascii=False)

    credito = ''
    if foto:
        autor = esc(foto.get('autor', ''))
        foto_de = {'es': 'Foto de', 'en': 'Photo by', 'de': 'Foto von',
                   'fr': 'Photo de', 'it': 'Foto di'}[idi]
        url_foto = esc(foto.get('url', ''))
        licencia = esc(foto.get('licencia', ''))
        credito = (f'<span class="credito-foto">{foto_de} '
                   f'<a href="{url_foto}" target="_blank" rel="noopener nofollow">{autor}</a>'
                   f' · {licencia}</span>')

    return f'''<!DOCTYPE html>
<html lang="{idi}" data-tema="claro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(titulo)} — {esc(t['sub'])} | {MARCA}</title>
<meta name="description" content="{esc(meta)}">
<link rel="canonical" href="{SITIO}/destinos/{idi}/{d['id']}.html">
{alt}
<link rel="alternate" hreflang="x-default" href="{SITIO}/destinos/es/{d['id']}.html">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(titulo)}">
<meta property="og:description" content="{esc(meta)}">
<meta property="og:image" content="{SITIO}/img/dest/{d['id']}.jpg">
<meta property="og:url" content="{SITIO}/destinos/{idi}/{d['id']}.html">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1f4d47">
<link rel="stylesheet" href="../../css/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%231f4d47'/><text y='72' x='50' font-size='58' text-anchor='middle'>✈</text></svg>">
<script type="application/ld+json">{schema}</script>
</head>
<body>

<header class="cab">
  <div class="contenedor cab-in">
    <a href="../../index.html?lang={idi}" class="logo"><span>{MARCA}</span><span class="punto">.</span></a>
    <nav class="nav"><a href="../../index.html?lang={idi}#destinos">{esc(t['destinos'])}</a></nav>
  </div>
</header>

<section class="hero hero-destino">
  <div class="hero-foto"><img src="../../img/dest/{d['id']}.jpg" alt="{esc(nombre)}"></div>
  {credito}
  <div class="contenedor hero-in" style="padding-top:60px;padding-bottom:38px">
    <nav class="rotulo miga" style="margin-bottom:14px">
      <a href="../../index.html?lang={idi}">{esc(t['inicio'])}</a> ·
      <a href="../../index.html?lang={idi}#destinos">{esc(t['destinos'])}</a> · {esc(pais)}
    </nav>
    <h1 style="font-size:clamp(2.2rem,5vw,3.6rem)">{esc(titulo)}</h1>
    <p class="sub">{esc(t['sub'])} · {esc(tipos)}</p>
  </div>
</section>

<main class="contenedor" style="padding-top:64px;padding-bottom:20px">

  <section style="margin-bottom:64px">
    <span class="rotulo">{esc(t['cuesta'])}</span>
    <h2>{esc(t['cuesta'])} {esc(nombre)}</h2>
    <div class="desglose" style="max-width:520px;margin-top:22px">
      <div><span>{esc(t['vuelo'])}</span><b>{d['vuelo']} €</b></div>
      <div><span>{esc(t['hotel'])}</span><b>{d['hotel']} €</b></div>
      <div><span>{esc(t['diario'])}</span><b>{d['dia']} €</b></div>
      <div><span>{esc(t['total'])}</span><b>{total} € {esc(t['pp'])}</b></div>
    </div>
    <p style="color:var(--tinta2);font-size:.88rem;margin-top:14px">{esc(t['incluye'])}</p>
  </section>

  <section style="margin-bottom:64px">
    <span class="rotulo">{esc(t['cuando'])}</span>
    <h2>{esc(t['cuando'])}</h2>
    <p>{esc(t['mejores'])} <b>{esc(', '.join(meses_ok))}</b>.</p>
    <div class="meses" style="max-width:640px">{calendario}</div>
  </section>

  <section style="margin-bottom:64px">
    <h2>{esc(t['reservar'].format(d=nombre))}</h2>
    <div class="acciones" style="max-width:640px;margin-top:20px">
      <a class="btn btn-primario" href="{enlace_vuelos(d)}" target="_blank" rel="noopener nofollow sponsored">{esc(t['vuelos'])}</a>
      <a class="btn btn-suave" href="{enlace_hoteles(d)}" target="_blank" rel="noopener nofollow sponsored">{esc(t['hoteles'])}</a>
      <a class="btn btn-suave" href="{enlace_actividades(d)}" target="_blank" rel="noopener nofollow sponsored">{esc(t['actividades'])}</a>
    </div>
  </section>

  <section style="margin-bottom:64px">
    <h2 style="font-size:1.6rem">{esc(t['otros'])}</h2>
    <div class="rejilla" style="margin-top:26px">{relacionados}</div>
  </section>

  <p style="margin-bottom:60px"><a class="btn btn-suave" href="../../index.html?lang={idi}#destinos">{esc(t['volver'])}</a></p>
</main>

<footer class="pie">
  <div class="contenedor">
    <div class="aviso-afiliados">{esc(t['aviso'])}</div>
    <div class="pie-abajo">
      <span>© {MARCA}</span>
      <span><a href="../../legal.html?lang={idi}">Legal</a></span>
    </div>
  </div>
</footer>
</body>
</html>
'''


def main():
    hechas = []
    for idi in IDIOMAS:
        carpeta = os.path.join(BASE, 'destinos', idi)
        os.makedirs(carpeta, exist_ok=True)
        for d in DESTINOS:
            ruta = os.path.join(carpeta, d['id'] + '.html')
            io.open(ruta, 'w', encoding='utf-8').write(pagina(d, idi))
            hechas.append(f'destinos/{idi}/{d["id"]}.html')
        print(f'  {idi}: {len(DESTINOS)} páginas')

    # ---- sitemap con todo ----
    urls = [f'''  <url>
    <loc>{SITIO}/</loc>
    <changefreq>weekly</changefreq><priority>1.0</priority>
{chr(10).join(f'    <xhtml:link rel="alternate" hreflang="{i}" href="{SITIO}/?lang={i}"/>' for i in IDIOMAS)}
    <xhtml:link rel="alternate" hreflang="x-default" href="{SITIO}/"/>
  </url>''']
    for d in DESTINOS:
        for idi in IDIOMAS:
            alts = '\n'.join(
                f'    <xhtml:link rel="alternate" hreflang="{i}" href="{SITIO}/destinos/{i}/{d["id"]}.html"/>'
                for i in IDIOMAS)
            urls.append(f'''  <url>
    <loc>{SITIO}/destinos/{idi}/{d['id']}.html</loc>
    <changefreq>monthly</changefreq><priority>0.8</priority>
{alts}
  </url>''')
    urls.append(f'  <url>\n    <loc>{SITIO}/legal.html</loc>\n    <changefreq>yearly</changefreq><priority>0.3</priority>\n  </url>')

    io.open(os.path.join(BASE, 'sitemap.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n'
        + '\n\n'.join(urls) + '\n\n</urlset>\n')

    print(f'\n{len(hechas)} páginas generadas · sitemap.xml con {len(urls)} direcciones')


if __name__ == '__main__':
    main()
