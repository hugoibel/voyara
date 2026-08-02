// ============================================================
//  VOYARA — Lógica de la aplicación
// ============================================================

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('voyara_' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('voyara_' + k, JSON.stringify(v)); } catch {} }
};

// ---------------- ESTADO ----------------
const S = {
  idioma: LS.get('idioma', null) || (navigator.language || 'es').slice(0, 2),
  moneda: LS.get('moneda', 'EUR'),
  tema:   LS.get('tema', null) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'),
  favs:   LS.get('favs', []),
  maleta: LS.get('maleta', []),
  modo:   'vuelos',
  filtroCont: 'todos',
  filtroTipo: 'todos',
  orden: 'popular',
  visibles: 12
};
if (!IDIOMAS_DISPONIBLES.includes(S.idioma)) S.idioma = 'es';

// Idioma por parámetro de URL (?lang=de) — útil para el SEO multiidioma
const _urlLang = new URLSearchParams(location.search).get('lang');
if (_urlLang && IDIOMAS_DISPONIBLES.includes(_urlLang)) S.idioma = _urlLang;

window.MONEDA_ACTUAL = S.moneda;

// ---------------- UTILIDADES ----------------
const t = k => (I18N[S.idioma] && I18N[S.idioma][k]) || I18N.es[k] || k;
const tr = obj => (obj && (obj[S.idioma] || obj.es)) || '';
const pais = c => tr(PAISES[c]) || c;

function precio(eur, dec = 0) {
  const m = CFG.monedas[S.moneda] || CFG.monedas.EUR;
  const v = eur * m.tasa;
  const n = v.toLocaleString(S.idioma, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return m.pos === 'pre' ? `${m.sim}${n}` : `${n} ${m.sim}`;
}

function fecha(masDias) {
  const d = new Date();
  d.setDate(d.getDate() + masDias);
  return d.toISOString().slice(0, 10);
}

function avisar(msg) {
  const a = $('#aviso');
  a.textContent = msg;
  a.classList.add('ver');
  clearTimeout(avisar._t);
  avisar._t = setTimeout(() => a.classList.remove('ver'), 2800);
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

// ---------------- FOTOS ----------------
// Las fotos las descarga fotos.py de Wikimedia Commons a img/dest/.
// Si alguna faltase, se dibuja el paisaje de arte.js como respaldo.
function foto(id, alt, ancho = 'card') {
  if (!(typeof FOTOS !== 'undefined' && FOTOS[id])) {
    const d = DESTINOS.find(x => x.id === id) || PAQUETES.find(x => x.id === id) || { id, n: alt };
    return arteDestino(d);
  }
  const sizes = ancho === 'hero' ? '100vw' : '(max-width: 560px) 100vw, 33vw';
  return `<img src="img/dest/${id}.jpg"
    srcset="img/dest/${id}-sm.jpg 600w, img/dest/${id}.jpg 1200w" sizes="${sizes}"
    alt="${esc(alt)}" loading="${ancho === 'hero' ? 'eager' : 'lazy'}" decoding="async">`;
}

function creditoFoto(id) {
  const f = (typeof FOTOS !== 'undefined') && FOTOS[id];
  if (!f) return '';
  const autor = esc(f.autor);
  return `<span class="credito-foto">${t('foto_de')} ${
    f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener nofollow">${autor}</a>` : autor
  } · ${esc(f.licencia)}</span>`;
}

// ============================================================
//  TRADUCIR LA PÁGINA
// ============================================================
function aplicarIdioma() {
  document.documentElement.lang = S.idioma;
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  document.title = `${CFG.marca} — ${t('claim')}`;
  LS.set('idioma', S.idioma);
  pintarTodo();
}

// ============================================================
//  BUSCADOR
// ============================================================
const CAMPOS_POR_MODO = {
  vuelos: [
    { id:'origen',  lab:'f_origen',   ph:'ph_origen', tipo:'text' },
    { id:'destino', lab:'f_destino',  ph:'ph_destino', tipo:'text' },
    { id:'ida',     lab:'f_ida',      tipo:'date', val: () => fecha(30) },
    { id:'vuelta',  lab:'f_vuelta',   tipo:'date', val: () => fecha(37) },
    { id:'pax',     lab:'f_viajeros', tipo:'number', val: () => 1, min:1, max:9 }
  ],
  hoteles: [
    { id:'destino', lab:'f_ciudad',   ph:'ph_ciudad', tipo:'text' },
    { id:'entrada', lab:'f_entrada',  tipo:'date', val: () => fecha(30) },
    { id:'salida',  lab:'f_salida',   tipo:'date', val: () => fecha(35) },
    { id:'pax',     lab:'f_viajeros', tipo:'number', val: () => 2, min:1, max:12 }
  ],
  coches: [
    { id:'destino', lab:'f_ciudad',  ph:'ph_ciudad', tipo:'text' },
    { id:'entrada', lab:'f_entrada', tipo:'date', val: () => fecha(30) },
    { id:'salida',  lab:'f_salida',  tipo:'date', val: () => fecha(35) }
  ],
  actividades: [
    { id:'destino', lab:'f_ciudad', ph:'ph_ciudad', tipo:'text' }
  ],
  paquetes: [
    { id:'destino', lab:'f_ciudad', ph:'ph_ciudad', tipo:'text' },
    { id:'pax',     lab:'f_viajeros', tipo:'number', val: () => 2, min:1, max:12 }
  ]
};

function pintarBuscador() {
  const campos = CAMPOS_POR_MODO[S.modo];
  $('#campos').innerHTML = campos.map(c => `
    <div class="campo-b">
      <label class="rotulo" for="bq_${c.id}">${t(c.lab)}</label>
      <input id="bq_${c.id}" type="${c.tipo}"
        ${c.ph ? `placeholder="${t(c.ph)}"` : ''}
        ${c.val ? `value="${c.val()}"` : ''}
        ${c.min ? `min="${c.min}"` : ''} ${c.max ? `max="${c.max}"` : ''}>
    </div>`).join('');
}

function lanzarBusqueda(e) {
  e && e.preventDefault();
  const v = id => { const el = $('#bq_' + id); return el ? el.value.trim() : ''; };
  let url, quien;

  if (S.modo === 'vuelos') {
    url = AFF.vuelos({ origen: v('origen'), destino: v('destino'), ida: v('ida'), vuelta: v('vuelta'), pax: v('pax') || 1 });
    quien = 'Aviasales';
  } else if (S.modo === 'hoteles') {
    url = AFF.hoteles({ destino: v('destino'), entrada: v('entrada'), salida: v('salida'), pax: v('pax') || 2 });
    quien = 'Booking.com';
  } else if (S.modo === 'coches') {
    url = AFF.coches({ destino: v('destino'), entrada: v('entrada'), salida: v('salida') });
    quien = 'EconomyBookings';
  } else if (S.modo === 'actividades') {
    url = AFF.actividades({ destino: v('destino') });
    quien = 'GetYourGuide';
  } else {
    // Viajes completos: filtramos nuestro catálogo
    const q = v('destino').toLowerCase();
    document.getElementById('viajes').scrollIntoView({ behavior: 'smooth' });
    if (q) {
      const hit = PAQUETES.find(p => p.n.toLowerCase().includes(q) || p.ruta.some(r => r.l.toLowerCase().includes(q)));
      if (hit) setTimeout(() => abrirPaquete(hit.id), 500);
    }
    return;
  }

  avisar(`${t('buscando_en')} ${quien}…`);
  window.open(url, '_blank', 'noopener');
}

// ============================================================
//  TARJETA DE DESTINO
// ============================================================
function tarjetaDestino(d, oferta) {
  const fav = S.favs.includes(d.id);
  const total = d.vuelo + d.hotel * 5 + d.dia * 5;   // referencia: 5 noches
  const pDto = oferta ? Math.round(total * (1 - oferta.dto / 100)) : total;
  const meses = d.epoca.map(m => MESES[S.idioma][m - 1]).slice(0, 4).join(' · ');

  return `
  <article class="ficha" data-id="${d.id}">
    <div class="ficha-foto">
      ${foto(d.id, d.n)}
      ${oferta ? `<span class="insignia">−${oferta.dto}% ${t('ahorro')}</span>` : ''}
      <button class="fav ${fav ? 'on' : ''}" data-fav="${d.id}" aria-label="${t('b_guardar')}">${fav ? '♥' : '♡'}</button>
    </div>

    <div class="ficha-cab">
      <div>
        <h3>${esc(d.n)}</h3>
        <div class="lugar rotulo">${esc(pais(d.pais))} · ${t('tp_' + d.tipos[0])}</div>
      </div>
      <div class="precio">
        ${oferta ? `<span class="precio-antes">${precio(total)}</span>` : ''}${precio(pDto)}
        <span class="precio-nota rotulo">${t('pp')} · 5 ${t('noches')}</span>
      </div>
    </div>

    <div class="datos">
      <span><span class="dato-t rotulo">${t('mejor_epoca')}</span><span class="dato-v">${meses}</span></span>
      <span><span class="dato-t rotulo">${t('presupuesto')}</span><span class="dato-v">${precio(d.dia)} / ${t('dia')}</span></span>
    </div>

    <div class="acciones">
      <a class="btn btn-primario btn-sm" href="${AFF.vuelos({ destino: d.iata, ida: fecha(30), vuelta: fecha(37) })}" target="_blank" rel="noopener nofollow sponsored">${t('b_vuelos')}</a>
      <a class="btn btn-suave btn-sm" href="${AFF.hoteles({ destino: d.n, entrada: fecha(30), salida: fecha(35) })}" target="_blank" rel="noopener nofollow sponsored">${t('b_hoteles')}</a>
      <a class="btn btn-suave btn-sm" href="${AFF.actividades({ destino: d.n })}" target="_blank" rel="noopener nofollow sponsored">${t('b_actividades')}</a>
    </div>
  </article>`;
}

// ============================================================
//  DESTINOS: filtros y orden
// ============================================================
function destinosFiltrados() {
  let l = DESTINOS.filter(d =>
    (S.filtroCont === 'todos' || d.cont === S.filtroCont) &&
    (S.filtroTipo === 'todos' || d.tipos.includes(S.filtroTipo))
  );
  const coste = d => d.vuelo + d.hotel * 5 + d.dia * 5;
  const ord = {
    popular:     (a, b) => b.pop - a.pop,
    precio_asc:  (a, b) => coste(a) - coste(b),
    precio_desc: (a, b) => coste(b) - coste(a),
    alfa:        (a, b) => a.n.localeCompare(b.n, S.idioma)
  };
  return l.sort(ord[S.orden] || ord.popular);
}

function pintarDestinos() {
  const l = destinosFiltrados();
  const vis = l.slice(0, S.visibles);
  $('#rejillaDestinos').innerHTML = vis.map(d => tarjetaDestino(d)).join('');
  $('#sinResultados').classList.toggle('oculto', l.length > 0);
  const btn = $('#btnMas');
  btn.classList.toggle('oculto', l.length <= 12);
  btn.textContent = S.visibles >= l.length ? t('ver_menos') : t('ver_mas');
}

function pintarFiltros() {
  const conts = ['todos', 'europa', 'asia', 'america', 'africa', 'oceania'];
  $('#filtroCont').innerHTML = conts.map(c =>
    `<button class="chip ${S.filtroCont === c ? 'on' : ''}" data-cont="${c}">${c === 'todos' ? t('filtro_todos') : t('c_' + c)}</button>`
  ).join('');

  const tipos = ['todos', 'playa', 'ciudad', 'cultura', 'aventura', 'naturaleza', 'romantico', 'familia', 'lujo', 'barato', 'montana'];
  $('#filtroTipo').innerHTML = tipos.map(x =>
    `<button class="chip ${S.filtroTipo === x ? 'on' : ''}" data-tipo="${x}">${x === 'todos' ? t('filtro_todos') : t('tp_' + x)}</button>`
  ).join('');

  const sel = $('#orden');
  sel.innerHTML = ['popular', 'precio_asc', 'precio_desc', 'alfa']
    .map(o => `<option value="${o}" ${S.orden === o ? 'selected' : ''}>${t('ord_' + o)}</option>`).join('');
}

// ============================================================
//  OFERTAS
// ============================================================
function pintarOfertas() {
  $('#rejillaOfertas').innerHTML = OFERTAS.map(o => {
    const d = DESTINOS.find(x => x.id === o.destino);
    if (!d) return '';
    // El motivo de la oferta sustituye a los tipos de viaje
    return tarjetaDestino(d, o).replace(
      /(<div class="lugar rotulo">[^·]+· )[^<]*(<\/div>)/,
      `$1${esc(tr(MOTIVOS[o.motivo]))}$2`);
  }).join('');
}

// ============================================================
//  VIAJES ORGANIZADOS
// ============================================================
function tarjetaPaquete(p) {
  const d = DESTINOS.find(x => x.id === p.destino) || {};
  return `
  <article class="ficha">
    <div class="ficha-foto">
      ${foto(p.id, p.n)}
      <span class="insignia">${p.dias} ${t('dias')}</span>
    </div>

    <div class="ficha-cab">
      <div>
        <h3>${esc(p.n)}</h3>
        <div class="lugar rotulo">${esc(pais(d.pais || ''))}</div>
      </div>
      <div class="precio">${precio(p.precio)}
        <span class="precio-nota rotulo">${t('pp')}</span>
      </div>
    </div>

    <div class="datos">
      <span><span class="dato-t rotulo">${t('incluye')}</span>
        <span class="dato-v">${p.incluye.slice(0, 3).map(i => tr(ITEMS_PQ[i])).join(' · ')}</span></span>
    </div>

    <div class="acciones">
      <button class="btn btn-primario btn-sm btn-bloque" data-paquete="${p.id}">${t('b_todo')}</button>
    </div>
  </article>`;
}

function pintarPaquetes() {
  $('#rejillaPaquetes').innerHTML = PAQUETES.sort((a, b) => b.pop - a.pop).map(tarjetaPaquete).join('');
}

function abrirPaquete(id) {
  const p = PAQUETES.find(x => x.id === id);
  if (!p) return;
  const d = DESTINOS.find(x => x.id === p.destino) || {};

  $('#modalHost').innerHTML = `
  <div class="modal" id="modal">
    <div class="modal-caja" role="dialog" aria-modal="true">
      <div class="modal-foto">
        ${foto(p.id, p.n, 'hero')}
        ${creditoFoto(p.id)}
        <button class="modal-cerrar" id="cerrarModal" aria-label="${t('cerrar')}">✕</button>
      </div>
      <div class="modal-cuerpo">
        <span class="rotulo">${esc(pais(d.pais || ''))} · ${p.dias} ${t('dias')}</span>
        <h2 style="margin:8px 0 4px">${esc(p.n)}</h2>
        <p style="color:var(--tinta2)">${t('desde')} <b style="color:var(--bronce)">${precio(p.precio)}</b> ${t('pp')}</p>

        <h3 style="margin-top:34px">${t('itinerario')}</h3>
        ${p.ruta.map((r, i) => `
          <div class="dia">
            <span class="dia-num">${String(i + 1).padStart(2, '0')}</span>
            <p>${esc(tr(ITIN[r.b]).replace('{l}', r.l))}</p>
          </div>`).join('')}

        <div class="util-fila" style="margin-top:34px">
          <div>
            <h4 class="rotulo">${t('incluye')}</h4>
            <ul class="incluye-lista">${p.incluye.map(i => `<li>${tr(ITEMS_PQ[i])}</li>`).join('')}</ul>
          </div>
          <div>
            <h4 class="rotulo">${t('no_incluye')}</h4>
            <ul class="incluye-lista no-incluye">${p.noIncluye.map(i => `<li>${tr(ITEMS_PQ[i])}</li>`).join('')}</ul>
          </div>
        </div>

        <p style="font-size:.85rem;color:var(--tinta2);margin-top:30px;padding-left:16px;border-left:2px solid var(--linea)">${t('pq_nota')}</p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:26px">
          <a class="btn btn-primario" target="_blank" rel="noopener nofollow sponsored"
             href="${AFF.vuelos({ destino: p.iata, ida: fecha(45), vuelta: fecha(45 + p.dias) })}">${t('b_vuelos')}</a>
          <a class="btn btn-suave" target="_blank" rel="noopener nofollow sponsored"
             href="${AFF.hoteles({ destino: p.ruta[0].l, entrada: fecha(45), salida: fecha(45 + p.dias) })}">${t('b_hoteles')}</a>
          <a class="btn btn-suave" target="_blank" rel="noopener nofollow sponsored"
             href="${AFF.actividades({ destino: p.ruta[1] ? p.ruta[1].l : p.n })}">${t('b_actividades')}</a>
          <a class="btn btn-primario" href="#contacto" id="pqContacto">${t('pq_consultar')}</a>
        </div>
      </div>
    </div>
  </div>`;

  const cerrar = () => { $('#modalHost').innerHTML = ''; document.body.style.overflow = ''; };
  document.body.style.overflow = 'hidden';
  $('#cerrarModal').onclick = cerrar;
  $('#modal').onclick = e => { if (e.target.id === 'modal') cerrar(); };
  $('#pqContacto').onclick = () => { cerrar(); $('#conMsg').value = p.n; };
  document.addEventListener('keydown', function esc2(e) {
    if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', esc2); }
  });
}

// ============================================================
//  GUÍAS · OPINIONES · FAQ
// ============================================================
function pintarGuias() {
  $('#rejillaGuias').innerHTML = GUIAS.map(g => `
    <article class="guia">
      <h3>${esc(tr(g.t))}</h3>
      <p>${esc(tr(g.r))}</p>
      <ul>${g.p.map(x => `<li>${esc(tr(x))}</li>`).join('')}</ul>
    </article>`).join('');
}

function pintarOpiniones() {
  $('#rejillaOpiniones').innerHTML = OPINIONES.map(o => {
    const d = DESTINOS.find(x => x.id === o.d);
    return `
    <div class="opinion">
      <div class="estrellas">${'★'.repeat(o.e)}${'☆'.repeat(5 - o.e)}</div>
      <p>«${esc(tr(o.t))}»</p>
      <div class="opinion-pie"><b>${esc(o.n)}</b> · <span>${d ? esc(d.n) : ''}</span></div>
    </div>`;
  }).join('');
}

function pintarFaq() {
  $('#faqLista').innerHTML = [1, 2, 3, 4, 5, 6].map(i => `
    <details>
      <summary>${t('faq' + i + '_p')}</summary>
      <div class="faq-r">${t('faq' + i + '_r')}</div>
    </details>`).join('');
}

// ============================================================
//  HERRAMIENTAS
// ============================================================
function pintarConversor() {
  const ms = Object.keys(CFG.monedas);
  const opt = sel => ms.map(m => `<option value="${m}" ${m === sel ? 'selected' : ''}>${m}</option>`).join('');
  if (!$('#convDe').options.length) {
    $('#convDe').innerHTML = opt('EUR');
    $('#convA').innerHTML = opt(S.moneda === 'EUR' ? 'USD' : S.moneda);
  }
  calcularConversor();
}

function calcularConversor() {
  const c = parseFloat($('#convCant').value) || 0;
  const de = CFG.monedas[$('#convDe').value], a = CFG.monedas[$('#convA').value];
  const r = (c / de.tasa) * a.tasa;
  $('#convRes').textContent = r.toLocaleString(S.idioma, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + a.sim;
}

function pintarPresupuesto() {
  const sel = $('#presuDest');
  if (sel.options.length !== DESTINOS.length) {
    sel.innerHTML = [...DESTINOS].sort((a, b) => a.n.localeCompare(b.n))
      .map(d => `<option value="${d.id}">${d.n} — ${pais(d.pais)}</option>`).join('');
  }
  calcularPresupuesto();
}

function calcularPresupuesto() {
  const d = DESTINOS.find(x => x.id === $('#presuDest').value) || DESTINOS[0];
  const dias = Math.max(1, parseInt($('#presuDias').value) || 1);
  const pax  = Math.max(1, parseInt($('#presuPax').value) || 1);
  const k    = parseFloat($('#presuEstilo').value) || 1;
  const noches = Math.max(1, dias - 1);

  const vuelo = d.vuelo * pax;
  const aloj  = d.hotel * k * noches * Math.ceil(pax / 2);
  const comida= d.dia * 0.42 * k * dias * pax;
  const act   = d.dia * 0.33 * k * dias * pax;
  const trans = d.dia * 0.25 * k * dias * pax;
  const sub   = vuelo + aloj + comida + act + trans;
  const extra = sub * 0.10;
  const total = sub + extra;

  $('#presuTotal').textContent = precio(total);
  $('#presuDesglose').innerHTML = [
    [t('presu_vuelo'), vuelo], [t('presu_aloj'), aloj], [t('presu_comida'), comida],
    [t('presu_act'), act], [t('presu_trans'), trans], [t('presu_extra'), extra],
    [t('presu_total'), total]
  ].map(([k2, v]) => `<div><span>${k2}</span><b>${precio(v)}</b></div>`).join('');
}

function pintarMaleta() {
  $('#maletaLista').innerHTML = Object.entries(EQUIPAJE).map(([grupo, items]) => `
    <div class="maleta-grupo">
      <h4>${t('maleta_' + grupo)}</h4>
      ${items.map(i => {
        const on = S.maleta.includes(i);
        return `<label class="check ${on ? 'hecho' : ''}">
          <input type="checkbox" data-eq="${i}" ${on ? 'checked' : ''}>
          <span>${tr(EQ_TXT[i])}</span></label>`;
      }).join('')}
    </div>`).join('');
  actualizarBarraMaleta();
}

function actualizarBarraMaleta() {
  const total = Object.values(EQUIPAJE).flat().length;
  const pct = Math.round(S.maleta.length / total * 100);
  $('#maletaBarra').style.width = pct + '%';
}

function pintarEpocas() {
  const sel = $('#epocaCont');
  if (!sel.options.length) {
    sel.innerHTML = ['todos', 'europa', 'asia', 'america', 'africa', 'oceania']
      .map(c => `<option value="${c}">${c === 'todos' ? t('filtro_todos') : t('c_' + c)}</option>`).join('');
  }
  const c = sel.value || 'todos';
  const l = DESTINOS.filter(d => c === 'todos' || d.cont === c).slice(0, 40);
  $('#epocaLista').innerHTML = l.map(d => `
    <div class="epoca-fila">
      <strong>${esc(d.n)}</strong> <span style="color:var(--tinta2);font-size:.83rem">${esc(pais(d.pais))}</span>
      <div class="meses">
        ${MESES[S.idioma].map((m, i) => `<div class="mes ${d.epoca.includes(i + 1) ? 'bueno' : ''}">${m}</div>`).join('')}
      </div>
    </div>`).join('');
}

// ============================================================
//  FAVORITOS
// ============================================================
function abrirFavoritos() {
  const l = DESTINOS.filter(d => S.favs.includes(d.id));
  $('#modalHost').innerHTML = `
  <div class="modal" id="modal">
    <div class="modal-caja">
      <div class="modal-cuerpo">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="margin:0">♥ ${t('favoritos')}</h2>
          <button class="btn-icono" id="cerrarModal">✕</button>
        </div>
        ${l.length
          ? `<div class="rejilla">${l.map(d => tarjetaDestino(d)).join('')}</div>`
          : `<p style="color:var(--tinta2);text-align:center;padding:30px 0">${t('fav_vacio')}</p>`}
      </div>
    </div>
  </div>`;
  document.body.style.overflow = 'hidden';
  const cerrar = () => { $('#modalHost').innerHTML = ''; document.body.style.overflow = ''; };
  $('#cerrarModal').onclick = cerrar;
  $('#modal').onclick = e => { if (e.target.id === 'modal') cerrar(); };
}

function alternarFav(id) {
  const i = S.favs.indexOf(id);
  if (i >= 0) S.favs.splice(i, 1); else S.favs.push(id);
  LS.set('favs', S.favs);
  $('#btnFav').textContent = S.favs.length ? `♥${S.favs.length}` : '♡';
  $$(`[data-fav="${id}"]`).forEach(b => {
    const on = S.favs.includes(id);
    b.classList.toggle('on', on);
    b.textContent = on ? '♥' : '♡';
  });
}

// ============================================================
//  TASAS DE CAMBIO (opcional, con red)
// ============================================================
async function refrescarTasas() {
  if (!CFG.refrescarTasas) return;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/EUR', { cache: 'no-store' });
    const j = await r.json();
    if (j && j.rates) {
      Object.keys(CFG.monedas).forEach(m => {
        if (j.rates[m]) CFG.monedas[m].tasa = j.rates[m];
      });
      pintarTodo();
    }
  } catch { /* sin conexión: se usan las tasas embarcadas */ }
}

// ============================================================
//  PINTAR TODO
// ============================================================
function pintarTodo() {
  pintarBuscador();
  pintarFiltros();
  pintarDestinos();
  pintarOfertas();
  pintarPaquetes();
  pintarGuias();
  pintarOpiniones();
  pintarFaq();
  pintarConversor();
  pintarPresupuesto();
  pintarMaleta();
  pintarEpocas();
}

// ============================================================
//  ARRANQUE
// ============================================================
function iniciar() {
  // Marca
  $('#marca').textContent = CFG.marca;
  $('#marca2').textContent = CFG.marca;
  $$('.marca-txt').forEach(e => e.textContent = CFG.marca);
  $('#anio').textContent = new Date().getFullYear();
  $('#pieVersion').textContent = 'v' + CFG.version;

  // Tema
  document.documentElement.dataset.tema = S.tema;
  $('#btnTema').textContent = S.tema === 'oscuro' ? '☀️' : '🌙';

  // Selectores
  $('#selIdioma').innerHTML = IDIOMAS_DISPONIBLES
    .map(l => `<option value="${l}" ${l === S.idioma ? 'selected' : ''}>${BANDERAS[l]} ${I18N[l].idioma_nombre}</option>`).join('');

  // En móvil el selector de idioma no cabe en la cabecera: va dentro del menú
  const idiomasMovil = document.createElement('div');
  idiomasMovil.className = 'idiomas-movil';
  idiomasMovil.innerHTML = IDIOMAS_DISPONIBLES
    .map(l => `<button data-lang="${l}" class="${l === S.idioma ? 'on' : ''}">${BANDERAS[l]} ${I18N[l].idioma_nombre}</button>`).join('');
  idiomasMovil.onclick = e => {
    const b = e.target.closest('[data-lang]'); if (!b) return;
    S.idioma = b.dataset.lang;
    $('#selIdioma').value = S.idioma;
    $$('.idiomas-movil button').forEach(x => x.classList.toggle('on', x.dataset.lang === S.idioma));
    $('#nav').classList.remove('abierto');
    aplicarIdioma();
  };
  $('#nav').appendChild(idiomasMovil);
  $('#selMoneda').innerHTML = Object.keys(CFG.monedas)
    .map(m => `<option value="${m}" ${m === S.moneda ? 'selected' : ''}>${m}</option>`).join('');
  $('#btnFav').textContent = S.favs.length ? `♥${S.favs.length}` : '♡';

  // Foto de portada: cambia cada día, pero es la misma para todos los visitantes
  const dHero = DESTINOS[new Date().getDate() % DESTINOS.length];
  $('#heroFoto').innerHTML = foto(dHero.id, dHero.n, 'hero');
  const cred = (typeof FOTOS !== 'undefined') && FOTOS[dHero.id];
  if (cred) $('#heroCredito').textContent = `${dHero.n} · ${cred.autor} · ${cred.licencia}`;

  // WhatsApp
  if (CFG.whatsapp) {
    const url = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent('Hola, me interesa un viaje')}`;
    $('#btnWa').href = url; $('#btnWa').classList.remove('oculto');
    $('#btnWa2').href = url;
  } else {
    $('#btnWa2').classList.add('oculto');
  }

  // Redes en el pie
  const soc = [];
  if (CFG.instagram) soc.push(`<li><a href="https://instagram.com/${CFG.instagram}" target="_blank" rel="noopener">Instagram</a></li>`);
  if (CFG.telegram)  soc.push(`<li><a href="https://t.me/${CFG.telegram}" target="_blank" rel="noopener">Telegram</a></li>`);
  soc.push(`<li><a href="mailto:${CFG.email}">${CFG.email}</a></li>`);
  $('#pieSocial').innerHTML = soc.join('');

  aplicarIdioma();
  refrescarTasas();

  // ---------- EVENTOS ----------
  $('#tabs').onclick = e => {
    const b = e.target.closest('.tab'); if (!b) return;
    $$('.tab').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    S.modo = b.dataset.modo;
    pintarBuscador();
  };
  $('#formBusca').onsubmit = lanzarBusqueda;

  $('#filtroCont').onclick = e => {
    const b = e.target.closest('[data-cont]'); if (!b) return;
    S.filtroCont = b.dataset.cont; S.visibles = 12; pintarFiltros(); pintarDestinos();
  };
  $('#filtroTipo').onclick = e => {
    const b = e.target.closest('[data-tipo]'); if (!b) return;
    S.filtroTipo = b.dataset.tipo; S.visibles = 12; pintarFiltros(); pintarDestinos();
  };
  $('#orden').onchange = e => { S.orden = e.target.value; pintarDestinos(); };
  $('#btnLimpiar').onclick = () => {
    S.filtroCont = 'todos'; S.filtroTipo = 'todos'; S.orden = 'popular'; S.visibles = 12;
    pintarFiltros(); pintarDestinos();
  };
  $('#btnMas').onclick = () => {
    S.visibles = S.visibles >= destinosFiltrados().length ? 12 : 999;
    pintarDestinos();
    if (S.visibles === 12) $('#destinos').scrollIntoView({ behavior: 'smooth' });
  };

  // Favoritos y paquetes (delegación global)
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]');
    if (f) { alternarFav(f.dataset.fav); return; }
    const p = e.target.closest('[data-paquete]');
    if (p) { abrirPaquete(p.dataset.paquete); }
  });

  // Cabecera
  $('#btnTema').onclick = () => {
    S.tema = S.tema === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = S.tema;
    $('#btnTema').textContent = S.tema === 'oscuro' ? '☀️' : '🌙';
    LS.set('tema', S.tema);
  };
  $('#btnFav').onclick = abrirFavoritos;
  $('#btnMenu').onclick = () => $('#nav').classList.toggle('abierto');
  $('#nav').onclick = e => { if (e.target.tagName === 'A') $('#nav').classList.remove('abierto'); };

  $('#selIdioma').onchange = e => {
    S.idioma = e.target.value;
    $$('.idiomas-movil button').forEach(x => x.classList.toggle('on', x.dataset.lang === S.idioma));
    aplicarIdioma();
  };
  $('#selMoneda').onchange = e => {
    S.moneda = e.target.value; window.MONEDA_ACTUAL = S.moneda; LS.set('moneda', S.moneda); pintarTodo();
  };

  // Herramientas
  ['#convCant', '#convDe', '#convA'].forEach(s => { $(s).oninput = calcularConversor; $(s).onchange = calcularConversor; });
  ['#presuDest', '#presuDias', '#presuPax', '#presuEstilo'].forEach(s => {
    $(s).oninput = calcularPresupuesto; $(s).onchange = calcularPresupuesto;
  });
  $('#epocaCont').onchange = pintarEpocas;
  $('#maletaLista').onchange = e => {
    const k = e.target.dataset.eq; if (!k) return;
    const i = S.maleta.indexOf(k);
    if (e.target.checked && i < 0) S.maleta.push(k);
    if (!e.target.checked && i >= 0) S.maleta.splice(i, 1);
    LS.set('maleta', S.maleta);
    e.target.closest('.check').classList.toggle('hecho', e.target.checked);
    actualizarBarraMaleta();
  };
  $('#maletaReset').onclick = () => { S.maleta = []; LS.set('maleta', []); pintarMaleta(); };

  // Formularios
  $('#formNews').onsubmit = e => {
    e.preventDefault();
    const v = $('#newsEmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) return avisar(t('news_mal'));
    const lista = LS.get('suscritos', []);
    if (!lista.includes(v)) lista.push(v);
    LS.set('suscritos', lista);
    avisar(t('news_ok'));
    $('#newsEmail').value = '';
  };

  $('#formContacto').onsubmit = e => {
    e.preventDefault();
    const n = $('#conNombre').value, m = $('#conEmail').value, x = $('#conMsg').value;
    const asunto = encodeURIComponent(`[${CFG.marca}] ${n}`);
    const cuerpo = encodeURIComponent(`${x}\n\n---\n${n} · ${m}`);
    location.href = `mailto:${CFG.email}?subject=${asunto}&body=${cuerpo}`;
    avisar(t('con_ok'));
    e.target.reset();
  };
}

// PWA
if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

document.addEventListener('DOMContentLoaded', iniciar);
