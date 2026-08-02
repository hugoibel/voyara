/**
 * Comprueba la web antes de publicarla.
 *     node verificar.js
 *
 * Carga los archivos de datos de verdad (no adivina con expresiones regulares)
 * y avisa de traducciones que faltan, destinos mal referenciados y archivos rotos.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE = __dirname;
const IDIOMAS = ['es', 'en', 'de', 'fr', 'it'];
const fallos = [], avisos = [];
const leer = p => fs.readFileSync(path.join(BASE, p), 'utf8');

// --- Cargamos los scripts en un contexto simulado (sin navegador) ---
// Van concatenados en un solo script: las `const` de cada archivo solo son
// visibles entre sí si comparten ámbito, y al final las exportamos al contexto.
const ARCHIVOS = ['js/config.js', 'js/i18n.js', 'js/data.js', 'js/contenido.js', 'js/arte.js', 'js/fotos.js'];
const EXPORTAR = ['I18N', 'PAISES', 'MESES', 'IDIOMAS_DISPONIBLES', 'BANDERAS', 'DESTINOS',
                  'PAQUETES', 'ITIN', 'ITEMS_PQ', 'OFERTAS', 'MOTIVOS', 'GUIAS', 'OPINIONES',
                  'EQUIPAJE', 'EQ_TXT', 'CFG', 'AFF', 'arteDestino', 'FOTOS'];

const ctx = vm.createContext({ window: {}, console: { info() {}, log() {} }, navigator: { language: 'es' } });
try {
  vm.runInContext(
    ARCHIVOS.map(leer).join('\n;\n') + `\n;globalThis.__x = { ${EXPORTAR.join(', ')} };`,
    ctx, { filename: 'voyara' });
} catch (e) {
  console.log('❌ Un archivo de datos no se puede ejecutar:\n  ', e.message);
  process.exit(1);
}
const { I18N, PAISES, MESES, DESTINOS, PAQUETES, ITIN, ITEMS_PQ,
        OFERTAS, MOTIVOS, GUIAS, OPINIONES, EQUIPAJE, EQ_TXT, CFG, arteDestino, FOTOS } = ctx.__x;

// ============ 1. Los 5 idiomas tienen las mismas claves ============
const base = new Set(Object.keys(I18N.es));
for (const id of IDIOMAS) {
  if (!I18N[id]) { fallos.push(`Falta el idioma '${id}' en I18N`); continue; }
  const k = new Set(Object.keys(I18N[id]));
  const faltan = [...base].filter(x => !k.has(x));
  const sobran = [...k].filter(x => !base.has(x));
  if (faltan.length) fallos.push(`[${id}] faltan ${faltan.length} traducciones: ${faltan.slice(0, 8).join(', ')}`);
  if (sobran.length) avisos.push(`[${id}] tiene claves que no están en 'es': ${sobran.slice(0, 8).join(', ')}`);
  // Traducciones vacías o dejadas en español
  const vacias = [...k].filter(x => !String(I18N[id][x]).trim());
  if (vacias.length) fallos.push(`[${id}] traducciones vacías: ${vacias.slice(0, 6).join(', ')}`);
  if (id !== 'es') {
    const iguales = [...k].filter(x => I18N[id][x] === I18N.es[x] && String(I18N.es[x]).length > 14);
    if (iguales.length > 3) avisos.push(`[${id}] ${iguales.length} textos largos idénticos al español (¿sin traducir?): ${iguales.slice(0, 4).join(', ')}`);
  }
}
if (!MESES || IDIOMAS.some(i => !MESES[i] || MESES[i].length !== 12))
  fallos.push('MESES debe tener 12 entradas en cada idioma');

// ============ 2. Claves usadas en la página ============
const html = leer('index.html'), app = leer('js/app.js');
const usadas = new Set([
  ...[...html.matchAll(/data-i18n(?:-ph)?="([\w_]+)"/g)].map(m => m[1]),
  ...[...app.matchAll(/\bt\('([\w_]+)'\)/g)].map(m => m[1]),
  ...[...app.matchAll(/(?:lab|ph):\s*'([\w_]+)'/g)].map(m => m[1])
]);
// Claves que se componen en tiempo de ejecución
const dinamicas = [
  ...['europa', 'asia', 'america', 'africa', 'oceania'].map(x => 'c_' + x),
  ...['playa', 'ciudad', 'montana', 'aventura', 'cultura', 'romantico', 'familia',
      'lujo', 'barato', 'naturaleza', 'desierto'].map(x => 'tp_' + x),
  ...['popular', 'precio_asc', 'precio_desc', 'alfa'].map(x => 'ord_' + x),
  ...Object.keys(EQUIPAJE).map(x => 'maleta_' + x),
  ...[1, 2, 3, 4, 5, 6].flatMap(i => [`faq${i}_p`, `faq${i}_r`])
];
dinamicas.forEach(k => usadas.add(k));

const huerfanas = [...usadas].filter(k => !base.has(k));
if (huerfanas.length) fallos.push('Claves usadas que NO existen en i18n.js: ' + huerfanas.join(', '));

const sinUsar = [...base].filter(k => !usadas.has(k) && k !== 'idioma_nombre');
if (sinUsar.length) avisos.push(`${sinUsar.length} traducciones sin usar: ${sinUsar.slice(0, 12).join(', ')}`);

// ============ 3. Destinos ============
const TIPOS_OK = new Set(['playa', 'ciudad', 'montana', 'aventura', 'cultura', 'romantico',
                          'familia', 'lujo', 'barato', 'naturaleza', 'desierto']);
const CONTS_OK = new Set(['europa', 'asia', 'america', 'africa', 'oceania']);
const PAISAJES_OK = new Set(['playa', 'ciudad', 'montana', 'desierto', 'selva', 'nieve', 'isla', 'templo']);
const ids = new Set();

for (const d of DESTINOS) {
  if (ids.has(d.id)) fallos.push(`ID de destino repetido: '${d.id}'`);
  ids.add(d.id);
  if (!PAISES[d.pais]) fallos.push(`Destino '${d.id}': el país '${d.pais}' no está en PAISES (i18n.js)`);
  else IDIOMAS.forEach(i => { if (!PAISES[d.pais][i]) fallos.push(`País '${d.pais}' sin traducir al '${i}'`); });
  if (!CONTS_OK.has(d.cont)) fallos.push(`Destino '${d.id}': continente '${d.cont}' no válido`);
  d.tipos.forEach(x => { if (!TIPOS_OK.has(x)) fallos.push(`Destino '${d.id}': tipo '${x}' sin traducción tp_${x}`); });
  if (!PAISAJES_OK.has(d.paisaje)) fallos.push(`Destino '${d.id}': paisaje '${d.paisaje}' no existe en arte.js`);
  if (!d.epoca.length || d.epoca.some(m => m < 1 || m > 12)) fallos.push(`Destino '${d.id}': meses de 'epoca' fuera de rango`);
  if (!d.iata || d.iata.length !== 3) avisos.push(`Destino '${d.id}': código IATA sospechoso ('${d.iata}')`);
  ['vuelo', 'hotel', 'dia', 'pop'].forEach(k => {
    if (typeof d[k] !== 'number' || d[k] < 0) fallos.push(`Destino '${d.id}': '${k}' debe ser un número positivo`);
  });
  if (d.pop > 100) avisos.push(`Destino '${d.id}': popularidad ${d.pop} > 100`);
}

// ============ 4. Viajes organizados ============
for (const p of PAQUETES) {
  if (!ids.has(p.destino)) fallos.push(`Paquete '${p.id}' apunta al destino '${p.destino}', que no existe`);
  if (p.dest2 && !ids.has(p.dest2)) avisos.push(`Paquete '${p.id}': destino secundario '${p.dest2}' no existe`);
  if (!PAISAJES_OK.has(p.paisaje)) fallos.push(`Paquete '${p.id}': paisaje '${p.paisaje}' no existe`);
  p.ruta.forEach(r => {
    if (!ITIN[r.b]) fallos.push(`Paquete '${p.id}': bloque de itinerario '${r.b}' no está en ITIN`);
    else IDIOMAS.forEach(i => { if (!ITIN[r.b][i]) fallos.push(`Bloque '${r.b}' sin traducir al '${i}'`); });
  });
  [...p.incluye, ...p.noIncluye].forEach(it => {
    if (!ITEMS_PQ[it]) fallos.push(`Paquete '${p.id}': item '${it}' no está en ITEMS_PQ`);
    else IDIOMAS.forEach(i => { if (!ITEMS_PQ[it][i]) fallos.push(`Item '${it}' sin traducir al '${i}'`); });
  });
  if (p.ruta.length > p.dias) avisos.push(`Paquete '${p.id}': ${p.ruta.length} etapas para ${p.dias} días`);
}

// ============ 5. Ofertas, guías, opiniones y equipaje ============
for (const o of OFERTAS) {
  if (!ids.has(o.destino)) fallos.push(`Oferta sobre '${o.destino}', que no es un destino existente`);
  if (!MOTIVOS[o.motivo]) fallos.push(`Motivo de oferta '${o.motivo}' no está en MOTIVOS`);
  if (o.dto < 1 || o.dto > 90) avisos.push(`Oferta de '${o.destino}': descuento del ${o.dto}% poco creíble`);
}
for (const g of GUIAS) {
  IDIOMAS.forEach(i => {
    if (!g.t[i]) fallos.push(`Guía '${g.id}': título sin traducir al '${i}'`);
    if (!g.r[i]) fallos.push(`Guía '${g.id}': resumen sin traducir al '${i}'`);
    g.p.forEach((x, n) => { if (!x[i]) fallos.push(`Guía '${g.id}', punto ${n + 1}: falta '${i}'`); });
  });
}
for (const o of OPINIONES) {
  if (!ids.has(o.d)) avisos.push(`Opinión de ${o.n} sobre '${o.d}', que no es un destino existente`);
  IDIOMAS.forEach(i => { if (!o.t[i]) fallos.push(`Opinión de ${o.n} sin traducir al '${i}'`); });
  if (o.e < 1 || o.e > 5) fallos.push(`Opinión de ${o.n}: ${o.e} estrellas fuera de rango`);
}
for (const [grupo, items] of Object.entries(EQUIPAJE)) {
  if (!base.has('maleta_' + grupo)) fallos.push(`Grupo de equipaje '${grupo}' sin traducción 'maleta_${grupo}'`);
  items.forEach(it => {
    if (!EQ_TXT[it]) fallos.push(`Item de equipaje '${it}' no está en EQ_TXT`);
    else IDIOMAS.forEach(i => { if (!EQ_TXT[it][i]) fallos.push(`Equipaje '${it}' sin traducir al '${i}'`); });
  });
}

// ============ 5b. Fotos ============
// Cada destino y cada viaje debe tener su foto descargada y con crédito,
// o se cae al dibujo de respaldo y la web vuelve a parecer barata.
for (const x of [...DESTINOS, ...PAQUETES]) {
  const f = FOTOS[x.id];
  if (!f) { fallos.push(`'${x.id}' no tiene foto — ejecuta: python fotos.py`); continue; }
  if (!f.autor || !f.licencia) fallos.push(`Foto de '${x.id}' sin autor o sin licencia (la atribución es obligatoria)`);
  for (const suf of ['', '-sm']) {
    const ruta = `img/dest/${x.id}${suf}.jpg`;
    if (!fs.existsSync(path.join(BASE, ruta))) fallos.push(`Falta el archivo ${ruta}`);
  }
}
const huerfanasFoto = Object.keys(FOTOS).filter(id =>
  ![...DESTINOS, ...PAQUETES].some(x => x.id === id));
if (huerfanasFoto.length) avisos.push(`Fotos que ya no usa nadie: ${huerfanasFoto.join(', ')}`);

// ============ 6. Archivos y versión ============
const sw = leer('sw.js');
[...sw.matchAll(/'\.\/([\w/.]+)'/g)].map(m => m[1]).forEach(f => {
  if (f && !fs.existsSync(path.join(BASE, f))) fallos.push(`sw.js cachea './${f}' pero ese archivo no existe`);
});
const vSw = (sw.match(/VERSION = '([^']+)'/) || [])[1];
if (vSw && CFG.version && !vSw.includes(CFG.version))
  avisos.push(`La versión de sw.js (${vSw}) no coincide con la de config.js (${CFG.version})`);

[...html.matchAll(/(?:src|href)="((?!http|data:|mailto:|#)[^"]+)"/g)]
  .map(m => m[1].split('#')[0])          // quitamos el ancla: legal.html#cookies → legal.html
  .filter(Boolean)
  .forEach(f => {
    if (!fs.existsSync(path.join(BASE, f))) fallos.push(`index.html enlaza '${f}', que no existe`);
  });

// Los IDs que app.js busca en el DOM deben existir en el HTML
const idsHtml = new Set([...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
const idsJs = new Set([...app.matchAll(/\$\('#([\w-]+)'\)/g)].map(m => m[1]));
const CREADOS_EN_JS = new Set(['modal', 'cerrarModal', 'pqContacto']);   // salen del modal
[...idsJs].filter(i => !idsHtml.has(i) && !CREADOS_EN_JS.has(i))
  .forEach(i => fallos.push(`app.js busca #${i} pero no existe en index.html`));

// ============ RESULTADO ============
console.log(`Destinos: ${DESTINOS.length} · Viajes: ${PAQUETES.length} · Fotos: ${Object.keys(FOTOS).length} · Ofertas: ${OFERTAS.length} · ` +
            `Guías: ${GUIAS.length} · Claves de idioma: ${base.size} × ${IDIOMAS.length} idiomas\n`);
if (avisos.length) {
  console.log(`⚠  ${avisos.length} aviso(s) (no rompen nada):`);
  avisos.slice(0, 15).forEach(a => console.log('   -', a));
  console.log();
}
if (fallos.length) {
  console.log(`❌ ${fallos.length} fallo(s):`);
  fallos.forEach(f => console.log('   -', f));
  process.exit(1);
}
console.log('✅ Todo correcto.');
