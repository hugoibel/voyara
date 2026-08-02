// ============================================================
//  VOYARA — Configuración de marca y programas de afiliados
//  ⬇⬇ ESTO ES LO ÚNICO QUE TIENES QUE TOCAR PARA GANAR DINERO ⬇⬇
// ============================================================

const CFG = {
  // ---------- MARCA ----------
  marca: 'Voyara',
  dominio: 'hugoibel.github.io/voyara',   // cámbialo cuando compres el dominio propio
  email: 'hola@voyara.com',
  whatsapp: '',                   // ej: '34600112233' (sin +, sin espacios). Vacío = oculta el botón
  instagram: '',                  // ej: 'voyara.viajes'
  telegram: '',                   // ej: 'voyaraofertas'

  // ---------- AFILIADOS ----------
  // Pon aquí tus IDs cuando te den de alta. Mientras estén vacíos la web
  // funciona igual, pero los enlaces NO generan comisión.
  //
  // 👉 ATAJO: date de alta SOLO en Travelpayouts (travelpayouts.com).
  //    Con una sola cuenta tienes vuelos, hoteles, coches, seguros y eSIM.
  afiliados: {
    marker: '759569',      // ✅ Travelpayouts (Partner ID de la cuenta) — vuelos, hoteles, coches, seguros, eSIM
                           //    OJO: NO es el 557823 del nombre del script de Drive (js/cookies.js);
                           //    ese identifica la instalación de Drive, no tu cuenta. Son distintos.
    booking_aid: '',       // Booking.com Partner: tu AID
    gyg_partner: '',       // GetYourGuide: tu partner_id
    civitatis_id: '',      // Civitatis: tu código de afiliado
    amazon_tag: '',        // Amazon Asociados: tu tag (para la tienda de equipaje)
    heymondo_id: '',       // HeyMondo / seguros de viaje
    airalo_id: ''          // Airalo eSIM
  },

  // ---------- MONEDAS ----------
  monedaBase: 'EUR',
  monedas: {
    EUR: { sim: '€', pos: 'post', tasa: 1 },
    USD: { sim: '$', pos: 'pre',  tasa: 1.08 },
    GBP: { sim: '£', pos: 'pre',  tasa: 0.85 },
    MXN: { sim: '$', pos: 'pre',  tasa: 19.6 },
    CHF: { sim: 'CHF', pos: 'post', tasa: 0.95 }
  },

  // ---------- AJUSTES ----------
  refrescarTasas: true,   // intenta actualizar las tasas al abrir (si falla, usa las de arriba)
  version: '1.3'
};

// ============================================================
//  CONSTRUCTORES DE ENLACES DE AFILIADO
//  Si no hay ID configurado devuelven la URL normal del partner
//  (la web sigue siendo útil, simplemente no cobras comisión).
// ============================================================

const AFF = {

  // ---- VUELOS (Aviasales / Travelpayouts) ----
  vuelos({ origen = '', destino = '', ida = '', vuelta = '', pax = 1 }) {
    const m = CFG.afiliados.marker;
    const p = new URLSearchParams();
    if (origen)  p.set('origin_iata', origen.toUpperCase());
    if (destino) p.set('destination_iata', destino.toUpperCase());
    if (ida)     p.set('depart_date', ida);
    if (vuelta)  p.set('return_date', vuelta);
    p.set('adults', pax);
    p.set('currency', (window.MONEDA_ACTUAL || 'eur').toLowerCase());
    if (m) p.set('marker', m);
    return 'https://www.aviasales.com/search?' + p.toString();
  },

  // ---- HOTELES (Booking.com) ----
  hoteles({ destino = '', entrada = '', salida = '', pax = 2 }) {
    const p = new URLSearchParams();
    if (destino) p.set('ss', destino);
    if (entrada) p.set('checkin', entrada);
    if (salida)  p.set('checkout', salida);
    p.set('group_adults', pax);
    p.set('no_rooms', Math.max(1, Math.ceil(pax / 2)));
    p.set('selected_currency', window.MONEDA_ACTUAL || 'EUR');
    if (CFG.afiliados.booking_aid) p.set('aid', CFG.afiliados.booking_aid);
    return 'https://www.booking.com/searchresults.html?' + p.toString();
  },

  // ---- COCHES DE ALQUILER ----
  coches({ destino = '', entrada = '', salida = '' }) {
    const p = new URLSearchParams();
    if (destino) p.set('location', destino);
    if (entrada) p.set('pickupDate', entrada);
    if (salida)  p.set('dropDate', salida);
    if (CFG.afiliados.marker) p.set('marker', CFG.afiliados.marker);
    return 'https://www.economybookings.com/?' + p.toString();
  },

  // ---- ACTIVIDADES Y EXCURSIONES ----
  actividades({ destino = '' }) {
    const id = CFG.afiliados.gyg_partner;
    const q = encodeURIComponent(destino);
    if (id) return `https://www.getyourguide.com/s/?q=${q}&partner_id=${id}&cmp=voyara`;
    return `https://www.getyourguide.com/s/?q=${q}`;
  },

  civitatis({ destino = '' }) {
    const base = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(destino)}`;
    return CFG.afiliados.civitatis_id ? `${base}&aid=${CFG.afiliados.civitatis_id}` : base;
  },

  // ---- SEGURO DE VIAJE ----
  seguro() {
    return CFG.afiliados.heymondo_id
      ? `https://www.heymondo.com/?ref=${CFG.afiliados.heymondo_id}`
      : 'https://www.heymondo.com/';
  },

  // ---- eSIM / INTERNET EN EL EXTRANJERO ----
  esim({ pais = '' }) {
    const base = 'https://www.airalo.com/' + (pais ? encodeURIComponent(pais.toLowerCase().replace(/\s+/g, '-')) + '-esim' : '');
    return CFG.afiliados.airalo_id ? `${base}?ref=${CFG.afiliados.airalo_id}` : base;
  },

  // ---- TIENDA (equipaje, accesorios) ----
  amazon(busqueda) {
    const t = CFG.afiliados.amazon_tag;
    const q = encodeURIComponent(busqueda);
    return `https://www.amazon.es/s?k=${q}` + (t ? `&tag=${t}` : '');
  }
};

// Aviso solo para ti (el visitante no lo ve)
(function avisarSinIds() {
  const a = CFG.afiliados;
  const vacios = Object.keys(a).filter(k => !a[k]);
  if (vacios.length) {
    console.info(
      `%c[${CFG.marca}] Modo sin comisión`,
      'background:#0e7490;color:#fff;padding:2px 6px;border-radius:4px',
      `\nFaltan IDs de afiliado: ${vacios.join(', ')}` +
      `\nLos enlaces funcionan, pero NO generan comisión.` +
      `\nPégalos en js/config.js → CFG.afiliados`
    );
  }
})();
