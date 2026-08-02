/**
 * Auditoría funcional de la web: la abre en un navegador de verdad y prueba
 * todo lo que un visitante podría tocar.
 *
 *     npm install puppeteer      (solo para esta prueba)
 *     python -m http.server 8099        # en otra ventana, dentro de la carpeta
 *     node auditar.js
 *
 * Para auditar la web PUBLICADA, cambia URL por https://hugoibel.github.io/voyara/
 */
const puppeteer = require('puppeteer');
const URL = 'http://127.0.0.1:8099/';
const ok = [], mal = [], avisos = [];
const chk = (c, n, d = '') => (c ? ok : mal).push(n + (d ? ' -> ' + d : ''));
const esperar = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errJS = [], err404 = [];
  p.on('pageerror', e => errJS.push(e.message.slice(0, 120)));
  p.on('console', m => { if (m.type() === 'error' && !m.text().includes('emrldtp')) errJS.push(m.text().slice(0, 120)); });
  p.on('requestfailed', r => { if (r.url().includes('hugoibel')) err404.push(r.url().split('voyara/')[1]); });
  // Partimos SIEMPRE de tema claro: el navegador headless pide oscuro por
  // defecto y eso invertia la comprobacion del boton de tema.
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await p.setViewport({ width: 1440, height: 950 });

  const t0 = Date.now();
  await p.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  const carga = Date.now() - t0;
  await esperar(1500);

  // 1. CARGA
  chk(carga < 6000, 'Carga en ' + (carga / 1000).toFixed(1) + 's', carga >= 6000 ? 'LENTO' : '');
  chk(errJS.length === 0, 'Sin errores de JavaScript', errJS.slice(0, 2).join(' | '));
  chk(err404.length === 0, 'Sin recursos rotos', err404.slice(0, 3).join(', '));

  // 2. COOKIES
  chk(await p.$('#ckBanner') !== null, 'Sale el aviso de cookies');
  const tpAntes = await p.evaluate(() => [...document.scripts].some(s => s.src.includes('emrldtp')));
  chk(!tpAntes, 'Travelpayouts NO carga sin consentimiento');
  await p.evaluate(() => document.getElementById('ckSi').click());
  await esperar(900);
  const tpDespues = await p.evaluate(() => [...document.scripts].some(s => s.src.includes('emrldtp')));
  chk(tpDespues, 'Travelpayouts carga tras aceptar');

  // 3. CONTENIDO
  const n = await p.evaluate(() => ({
    destinos: document.querySelectorAll('#rejillaDestinos .ficha').length,
    ofertas: document.querySelectorAll('#rejillaOfertas .ficha').length,
    viajes: document.querySelectorAll('#rejillaPaquetes .ficha').length,
    guias: document.querySelectorAll('#rejillaGuias .guia').length,
    opiniones: document.querySelectorAll('.opinion').length,
    faq: document.querySelectorAll('.faq details').length,
    sinAlt: [...document.querySelectorAll('img')].filter(i => !i.alt).length
  }));
  chk(n.destinos === 12, 'Destinos en portada: ' + n.destinos);
  chk(n.ofertas === 6, 'Ofertas: ' + n.ofertas);
  chk(n.viajes === 6, 'Viajes organizados: ' + n.viajes);
  chk(n.guias === 4, 'Guias: ' + n.guias);
  chk(n.opiniones === 6, 'Opiniones: ' + n.opiniones);
  chk(n.faq === 6, 'Preguntas frecuentes: ' + n.faq);
  chk(n.sinAlt === 0, 'Todas las imagenes con texto alternativo', n.sinAlt + ' sin alt');

  // 4. ENLACES DE AFILIADO
  const af = await p.evaluate(() => {
    const a = [...document.querySelectorAll('a[href*="aviasales"],a[href*="booking.com"],a[href*="getyourguide"],a[href*="economybookings"]')];
    return {
      total: a.length,
      conMarker: a.filter(x => x.href.includes('marker=759569')).length,
      aviasales: a.filter(x => x.href.includes('aviasales')).length,
      sinRel: a.filter(x => !x.rel.includes('nofollow') || !x.rel.includes('sponsored')).length,
      sinBlank: a.filter(x => x.target !== '_blank').length
    };
  });
  chk(af.total > 30, 'Enlaces de afiliado: ' + af.total);
  chk(af.conMarker === af.aviasales && af.aviasales > 0, 'Vuelos con tu marker: ' + af.conMarker + '/' + af.aviasales);
  chk(af.sinRel === 0, 'Marcados rel=nofollow sponsored', af.sinRel + ' sin marcar');
  chk(af.sinBlank === 0, 'Abren en pestana nueva', af.sinBlank + ' no');

  // 5. FILTROS Y ORDEN
  await p.evaluate(() => document.querySelector('[data-cont="asia"]').click());
  await esperar(400);
  const asia = await p.evaluate(() => document.querySelectorAll('#rejillaDestinos .ficha').length);
  chk(asia === 10, 'Filtro Asia devuelve ' + asia + ' destinos');
  await p.evaluate(() => document.querySelector('[data-tipo="playa"]').click());
  await esperar(400);
  const asiaPlaya = await p.evaluate(() => document.querySelectorAll('#rejillaDestinos .ficha').length);
  chk(asiaPlaya > 0 && asiaPlaya < asia, 'Filtros combinados Asia+playa: ' + asiaPlaya);
  await p.evaluate(() => document.getElementById('btnLimpiar').click());
  await esperar(400);
  chk(await p.evaluate(() => document.querySelectorAll('#rejillaDestinos .ficha').length) === 12, 'Limpiar filtros restaura');

  await p.select('#orden', 'precio_asc');
  await esperar(400);
  const precios = await p.evaluate(() => [...document.querySelectorAll('#rejillaDestinos .precio')]
    .map(e => parseInt(e.textContent.replace(/[^0-9]/g, '').slice(0, 5))));
  chk(precios.every((v, i, a) => i === 0 || a[i - 1] <= v), 'Ordenar por precio funciona');

  // 6. VER MAS
  await p.evaluate(() => document.getElementById('btnMas').click());
  await esperar(600);
  const todos = await p.evaluate(() => document.querySelectorAll('#rejillaDestinos .ficha').length);
  chk(todos === 36, 'Ver mas destinos muestra los ' + todos);

  // 7. FAVORITOS
  await p.evaluate(() => document.querySelector('[data-fav]').click());
  await esperar(300);
  const favN = await p.evaluate(() => document.getElementById('btnFav').textContent);
  chk(favN.includes('1'), 'Guardar favorito, contador: ' + favN);
  await p.evaluate(() => document.getElementById('btnFav').click());
  await esperar(600);
  chk(await p.$('#modal') !== null, 'Se abre el panel de favoritos');
  chk(await p.evaluate(() => document.querySelectorAll('#modal .ficha').length) === 1, 'El favorito aparece dentro');
  await p.evaluate(() => document.getElementById('cerrarModal').click());
  await esperar(400);

  // 8. VIAJE ORGANIZADO
  await p.evaluate(() => document.querySelector('[data-paquete]').click());
  await esperar(900);
  const modal = await p.evaluate(() => ({
    abierto: !!document.getElementById('modal'),
    dias: document.querySelectorAll('#modal .dia').length,
    incluye: document.querySelectorAll('#modal .incluye-lista li').length,
    credito: !!document.querySelector('#modal .credito-foto'),
    botones: document.querySelectorAll('#modal .btn').length
  }));
  chk(modal.abierto && modal.dias >= 7, 'Itinerario con ' + modal.dias + ' etapas');
  chk(modal.incluye >= 6, 'Incluye/no incluye: ' + modal.incluye + ' lineas');
  chk(modal.credito, 'Credito de la foto visible');
  chk(modal.botones >= 4, 'Botones de reserva: ' + modal.botones);
  await p.keyboard.press('Escape');
  await esperar(400);
  chk(await p.$('#modal') === null, 'Se cierra con Escape');

  // 9. HERRAMIENTAS
  const conv = await p.evaluate(() => {
    document.getElementById('convCant').value = '200';
    document.getElementById('convCant').dispatchEvent(new Event('input'));
    return document.getElementById('convRes').textContent;
  });
  chk(/[0-9]/.test(conv) && !conv.includes('NaN'), 'Conversor: 200 EUR = ' + conv);

  const presu = await p.evaluate(() => {
    document.getElementById('presuDias').value = '10';
    document.getElementById('presuDias').dispatchEvent(new Event('input'));
    return { total: document.getElementById('presuTotal').textContent,
             lineas: document.querySelectorAll('#presuDesglose div').length };
  });
  chk(!presu.total.includes('NaN') && presu.lineas === 7, 'Presupuesto: ' + presu.total + ' con ' + presu.lineas + ' lineas');

  const maleta = await p.evaluate(() => {
    const c = document.querySelector('#maletaLista input');
    c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true }));
    return document.getElementById('maletaBarra').style.width;
  });
  chk(maleta !== '0%' && maleta !== '', 'Checklist marca progreso: ' + maleta);
  chk(await p.evaluate(() => document.querySelectorAll('.epoca-fila').length) > 10, 'Calendario de temporadas');

  // 10. IDIOMAS
  const SONDAS = [['en', 'Your next trip'], ['de', 'Deine'], ['fr', 'Votre prochain'], ['it', 'Il tuo prossimo']];
  for (const [lang, esperado] of SONDAS) {
    await p.select('#selIdioma', lang);
    await esperar(700);
    const h1 = await p.evaluate(() => document.querySelector('.hero h1').textContent);
    chk(h1.includes(esperado), 'Idioma ' + lang + ': "' + h1.slice(0, 26) + '"');
    const resto = await p.evaluate(() => {
      const t = document.body.innerText;
      const pistas = ['Ver vuelos', 'Ver hoteles', 'Que hacer', 'Limpiar filtros', 'Mas populares'];
      return pistas.filter(x => t.includes(x));
    });
    if (resto.length) avisos.push('En ' + lang + ' queda castellano: ' + resto.join(', '));
  }
  await p.select('#selIdioma', 'es');
  await esperar(600);

  // 11. MONEDA
  await p.select('#selMoneda', 'USD');
  await esperar(700);
  const usd = await p.evaluate(() => document.querySelector('.precio').textContent.trim().slice(0, 14));
  chk(usd.includes('$'), 'Cambio de moneda: ' + usd);
  chk(await p.evaluate(() => document.querySelector('a[href*="aviasales"]').href.includes('marker=759569')),
      'El marker sobrevive al cambio de moneda');
  await p.select('#selMoneda', 'EUR');
  await esperar(400);

  // 12. TEMA (ida y vuelta)
  const temaIni = await p.evaluate(() => document.documentElement.dataset.tema);
  await p.evaluate(() => document.getElementById('btnTema').click());
  await esperar(400);
  const temaAlt = await p.evaluate(() => document.documentElement.dataset.tema);
  await p.evaluate(() => document.getElementById('btnTema').click());
  await esperar(300);
  const temaVuelta = await p.evaluate(() => document.documentElement.dataset.tema);
  chk(temaIni !== temaAlt && temaVuelta === temaIni, 'Cambio de tema ' + temaIni + ' -> ' + temaAlt + ' -> ' + temaVuelta);

  // 13. FORMULARIOS
  const news = await p.evaluate(() => {
    document.getElementById('newsEmail').value = 'malformado';
    document.getElementById('formNews').dispatchEvent(new Event('submit', { cancelable: true }));
    return document.getElementById('aviso').textContent;
  });
  chk(news.length > 0, 'El boletin valida el correo: "' + news + '"');

  // 14. BUSCADOR: comprobamos la URL que genera, sin abrirla
  const urlBusqueda = await p.evaluate(() => {
    document.querySelector('[data-modo="hoteles"]').click();
    return new Promise(res => setTimeout(() => {
      document.getElementById('bq_destino').value = 'Lisboa';
      const abrir = window.open;
      let capturada = '';
      window.open = u => { capturada = u; return null; };
      document.getElementById('formBusca').dispatchEvent(new Event('submit', { cancelable: true }));
      window.open = abrir;
      res(capturada);
    }, 400));
  });
  chk(urlBusqueda.includes('booking.com') && urlBusqueda.includes('Lisboa'),
      'Buscador de hoteles genera URL correcta');

  // 15. MOVIL
  await p.setViewport({ width: 390, height: 844 });
  await p.reload({ waitUntil: 'networkidle2' });
  await esperar(1500);
  const movil = await p.evaluate(() => ({
    desborde: document.documentElement.scrollWidth > window.innerWidth + 2,
    menu: getComputedStyle(document.getElementById('btnMenu')).display !== 'none',
    cols: getComputedStyle(document.getElementById('rejillaDestinos')).gridTemplateColumns.split(' ').length
  }));
  chk(!movil.desborde, 'Sin desbordamiento horizontal en movil');
  chk(movil.menu, 'Menu hamburguesa visible en movil');
  chk(movil.cols === 1, 'Una columna en movil');

  // 16. PAGINA LEGAL
  await p.setViewport({ width: 1440, height: 950 });
  await p.goto(URL + 'legal.html', { waitUntil: 'networkidle2' });
  await esperar(1200);
  const legal = await p.evaluate(() => ({
    secciones: document.querySelectorAll('main section').length,
    creditos: document.querySelectorAll('#listaFotos div').length,
    datos: document.body.innerText.includes('[TUS DATOS')
  }));
  chk(legal.secciones === 5, 'Pagina legal con ' + legal.secciones + ' secciones');
  chk(legal.creditos === 42, 'Creditos de las 42 fotos: ' + legal.creditos);
  if (legal.datos) avisos.push('legal.html sigue con [TUS DATOS] sin rellenar (obligatorio antes de facturar)');

  console.log('=== CORRECTO (' + ok.length + ') ===');
  ok.forEach(x => console.log('  OK  ' + x));
  if (avisos.length) { console.log('\n=== AVISOS (' + avisos.length + ') ==='); avisos.forEach(x => console.log('  !   ' + x)); }
  if (mal.length) { console.log('\n=== FALLOS (' + mal.length + ') ==='); mal.forEach(x => console.log('  MAL ' + x)); }
  await b.close();
})();
