// ============================================================
//  VOYARA — Consentimiento de cookies (RGPD / ePrivacy)
//
//  El script de Travelpayouts NO se carga hasta que el visitante
//  acepta. Si rechaza, no se carga nunca (y esa visita no genera
//  comisión: es el precio de cumplir la norma).
//
//  Va aparte de i18n.js a propósito: así funciona igual en
//  index.html y en legal.html, que no comparten el mismo motor.
// ============================================================

(function () {
  'use strict';

  const CLAVE = 'voyara_consent';          // 'si' | 'no'
  const IDIOMAS = ['es', 'en', 'de', 'fr', 'it'];

  // ---------- El script que solo se carga con permiso ----------
  // Es el snippet oficial de Travelpayouts, intacto: no lo edites.
  function cargarTravelpayouts() {
    if (window.__tpCargado) return;
    window.__tpCargado = true;
    var script = document.createElement("script");
    script.async = 1;
    script.setAttribute("data-cmp-ab", "2");
    script.src = 'https://emrldtp.com/NTU3ODIz.js?t=557823';
    document.head.appendChild(script);
  }

  // ---------- Textos ----------
  const T = {
    es: { t:'Cookies',
          d:'Usamos cookies de nuestra red de afiliados con un solo fin: saber que una reserva salió de aquí y cobrar la comisión. No hacemos publicidad ni perfiles. Si las rechazas, la web funciona exactamente igual.',
          si:'Aceptar', no:'Rechazar', mas:'Más información', pref:'Preferencias de cookies',
          ok:'Preferencia guardada' },
    en: { t:'Cookies',
          d:'We use cookies from our affiliate network for one purpose only: to know a booking started here and get the commission. No advertising, no profiling. If you decline, the site works exactly the same.',
          si:'Accept', no:'Decline', mas:'More information', pref:'Cookie preferences',
          ok:'Preference saved' },
    de: { t:'Cookies',
          d:'Wir nutzen Cookies unseres Affiliate-Netzwerks mit einem einzigen Zweck: zu erkennen, dass eine Buchung hier begann, und die Provision zu erhalten. Keine Werbung, keine Profile. Bei Ablehnung funktioniert die Website genauso.',
          si:'Akzeptieren', no:'Ablehnen', mas:'Mehr erfahren', pref:'Cookie-Einstellungen',
          ok:'Auswahl gespeichert' },
    fr: { t:'Cookies',
          d:'Nous utilisons les cookies de notre réseau d\'affiliation dans un seul but : savoir qu\'une réservation est partie d\'ici et percevoir la commission. Aucune publicité, aucun profilage. Si vous refusez, le site fonctionne exactement pareil.',
          si:'Accepter', no:'Refuser', mas:'En savoir plus', pref:'Préférences cookies',
          ok:'Préférence enregistrée' },
    it: { t:'Cookie',
          d:'Usiamo i cookie della nostra rete di affiliazione con un solo scopo: sapere che una prenotazione è partita da qui e ricevere la commissione. Nessuna pubblicità, nessuna profilazione. Se rifiuti, il sito funziona esattamente allo stesso modo.',
          si:'Accetta', no:'Rifiuta', mas:'Maggiori informazioni', pref:'Preferenze cookie',
          ok:'Preferenza salvata' }
  };

  function idioma() {
    const url = new URLSearchParams(location.search).get('lang');
    if (IDIOMAS.includes(url)) return url;
    try {
      const g = JSON.parse(localStorage.getItem('voyara_idioma'));
      if (IDIOMAS.includes(g)) return g;
    } catch {}
    const nav = (navigator.language || 'es').slice(0, 2);
    return IDIOMAS.includes(nav) ? nav : 'es';
  }

  const leer  = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
  const grabar = v => { try { localStorage.setItem(CLAVE, v); } catch {} };

  // ---------- Banner ----------
  function mostrar() {
    if (document.getElementById('ckBanner')) return;
    const x = T[idioma()];
    const legal = location.pathname.includes('legal') ? '#cookies' : 'legal.html#cookies';

    const el = document.createElement('div');
    el.id = 'ckBanner';
    el.className = 'ck';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', x.t);
    el.innerHTML = `
      <div class="ck-txt">
        <strong>${x.t}</strong>
        <p>${x.d} <a href="${legal}">${x.mas}</a></p>
      </div>
      <div class="ck-btns">
        <button type="button" class="btn btn-borde btn-sm" id="ckNo">${x.no}</button>
        <button type="button" class="btn btn-primario btn-sm" id="ckSi">${x.si}</button>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('ver'));

    const decidir = v => {
      grabar(v);
      el.classList.remove('ver');
      setTimeout(() => el.remove(), 280);
      if (v === 'si') cargarTravelpayouts();
      else if (window.__tpCargado) location.reload();   // deshacer un "sí" anterior
      if (typeof window.avisar === 'function') window.avisar(x.ok);
    };
    document.getElementById('ckSi').onclick = () => decidir('si');
    document.getElementById('ckNo').onclick = () => decidir('no');
  }

  // ---------- Enlace para cambiar de opinión ----------
  // Lo añadimos al pie si existe; si no, queda disponible en window.
  function ponerEnlacePreferencias() {
    const lista = document.querySelector('.pie ul');
    const pie = document.querySelectorAll('.pie-rejilla > div');
    const destino = pie.length >= 3 ? pie[2].querySelector('ul') : lista;
    if (!destino) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = T[idioma()].pref;
    a.onclick = e => { e.preventDefault(); mostrar(); };
    li.appendChild(a);
    destino.appendChild(li);
  }
  window.preferenciasCookies = mostrar;

  // ---------- Arranque ----------
  function iniciar() {
    const v = leer();
    if (v === 'si') cargarTravelpayouts();
    else if (v !== 'no') mostrar();
    // Si es 'no' no se carga nada y no se molesta más al visitante.
    setTimeout(ponerEnlacePreferencias, 300);   // tras pintar el pie
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
