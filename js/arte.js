// ============================================================
//  VOYARA — Ilustraciones generadas por código
//  Cada destino tiene su propio paisaje en SVG: carga instantánea,
//  funciona sin conexión y no depende de bancos de imágenes.
//  Si algún día quieres fotos reales, añade  foto:'img/roma.jpg'
//  al destino en data.js y se usará esa en lugar del dibujo.
// ============================================================

// Semilla determinista: el mismo destino dibuja siempre igual
function _sem(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h ^= h >>> 13; return ((h >>> 0) % 1000) / 1000; };
}

const _hsl = (h, s, l) => `hsl(${h % 360} ${s}% ${l}%)`;

function arteDestino(d) {
  if (d.foto) return `<img src="${d.foto}" alt="${d.n}" loading="lazy" class="art-img">`;

  const r = _sem(d.id || d.n);
  const t = d.tono ?? 200;
  const p = d.paisaje || 'ciudad';
  const W = 400, H = 260;
  let cielo, capas = '';

  // ---------- CIELO ----------
  const cielos = {
    playa:    [[t, 60, 72], [t + 25, 70, 88]],
    isla:     [[t, 65, 68], [t + 30, 75, 90]],
    ciudad:   [[t + 200, 35, 28], [t + 15, 60, 62]],
    montana:  [[t, 40, 55], [t + 30, 45, 82]],
    nieve:    [[t, 35, 62], [t + 20, 30, 88]],
    desierto: [[t + 5, 70, 62], [t + 30, 85, 84]],
    selva:    [[t + 10, 40, 48], [t + 40, 55, 78]],
    templo:   [[t, 45, 60], [t + 25, 60, 86]]
  };
  const [c1, c2] = cielos[p] || cielos.ciudad;
  cielo = `<linearGradient id="sk${d.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${_hsl(c1[0], c1[1], c1[2])}"/>
      <stop offset="1" stop-color="${_hsl(c2[0], c2[1], c2[2])}"/>
    </linearGradient>`;

  // ---------- SOL / LUNA ----------
  const sx = 60 + r() * 280, sy = 40 + r() * 30;
  const soleado = p !== 'ciudad';
  capas += soleado
    ? `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="26" fill="hsl(45 100% 78%)" opacity=".9"/>
       <circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="40" fill="hsl(45 100% 80%)" opacity=".25"/>`
    : `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="16" fill="hsl(50 90% 92%)" opacity=".85"/>`;

  // ---------- NUBES ----------
  for (let i = 0; i < 3; i++) {
    const x = r() * W, y = 25 + r() * 55, s = 0.5 + r() * 0.7;
    capas += `<g opacity="${(0.18 + r() * 0.22).toFixed(2)}" transform="translate(${x.toFixed(0)},${y.toFixed(0)}) scale(${s.toFixed(2)})">
      <ellipse cx="0" cy="0" rx="34" ry="13" fill="#fff"/>
      <ellipse cx="24" cy="4" rx="26" ry="11" fill="#fff"/>
      <ellipse cx="-22" cy="5" rx="22" ry="10" fill="#fff"/></g>`;
  }

  // ---------- PAISAJE ----------
  if (p === 'ciudad') {
    // Skyline en dos planos
    for (let plano = 0; plano < 2; plano++) {
      const base = plano ? H : H - 22;
      const lum = plano ? 16 : 26;
      let x = -10;
      let path = `M-10,${H} L-10,${base}`;
      while (x < W + 10) {
        const w = 20 + r() * 34, h = 40 + r() * (plano ? 95 : 70);
        path += ` L${x.toFixed(0)},${(base - h).toFixed(0)} L${(x + w).toFixed(0)},${(base - h).toFixed(0)}`;
        x += w + 3 + r() * 6;
      }
      path += ` L${W + 10},${base} L${W + 10},${H} Z`;
      capas += `<path d="${path}" fill="${_hsl(t + 210, 30, lum)}" opacity="${plano ? 1 : .75}"/>`;
    }
    // Ventanas encendidas
    for (let i = 0; i < 46; i++) {
      const x = r() * W, y = H - 20 - r() * 110;
      capas += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="3" height="4" fill="hsl(45 90% 72%)" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`;
    }

  } else if (p === 'playa' || p === 'isla') {
    const mar = H - 95;
    capas += `<rect x="0" y="${mar}" width="${W}" height="${H - mar}" fill="${_hsl(t, 70, 42)}"/>`;
    if (p === 'isla') {
      capas += `<path d="M60,${mar} Q120,${mar - 70} 190,${mar} Z" fill="${_hsl(t + 90, 30, 32)}"/>
                <path d="M170,${mar} Q225,${mar - 48} 285,${mar} Z" fill="${_hsl(t + 90, 28, 26)}"/>`;
    }
    // Olas
    for (let i = 0; i < 5; i++) {
      const y = mar + 12 + i * 15, o = 0.16 + r() * 0.2;
      capas += `<path d="M0,${y} Q${(50 + r() * 40).toFixed(0)},${y - 6} 100,${y} T200,${y} T300,${y} T400,${y}"
        stroke="#fff" stroke-width="2" fill="none" opacity="${o.toFixed(2)}"/>`;
    }
    // Arena
    capas += `<path d="M0,${H} L0,${H - 26} Q200,${H - 44} ${W},${H - 20} L${W},${H} Z" fill="hsl(42 65% 78%)"/>`;
    // Palmera
    if (r() > 0.35) {
      const px = 40 + r() * 60;
      capas += `<g transform="translate(${px.toFixed(0)},${H - 26})">
        <path d="M0,0 Q-6,-40 2,-72" stroke="hsl(28 40% 32%)" stroke-width="6" fill="none" stroke-linecap="round"/>
        ${[0, 1, 2, 3, 4].map(i => {
          const a = -160 + i * 40;
          return `<path d="M2,-72 Q${(Math.cos(a * Math.PI / 180) * 30).toFixed(0)},${(-72 + Math.sin(a * Math.PI / 180) * 20).toFixed(0)} ${(Math.cos(a * Math.PI / 180) * 52).toFixed(0)},${(-64 + Math.sin(a * Math.PI / 180) * 30).toFixed(0)}" stroke="hsl(140 45% 32%)" stroke-width="7" fill="none" stroke-linecap="round"/>`;
        }).join('')}</g>`;
    }

  } else if (p === 'montana' || p === 'nieve') {
    const nieve = p === 'nieve';
    for (let plano = 0; plano < 3; plano++) {
      const base = H - plano * 4;
      const alt = 70 + plano * 45;
      const lum = nieve ? 74 - plano * 14 : 46 - plano * 11;
      const sat = nieve ? 14 : 28;
      let path = `M-10,${H} L-10,${base - 20}`;
      let x = -10;
      while (x < W + 20) {
        const w = 70 + r() * 90;
        path += ` L${(x + w / 2).toFixed(0)},${(base - alt - r() * 40).toFixed(0)} L${(x + w).toFixed(0)},${(base - 20 - r() * 20).toFixed(0)}`;
        x += w;
      }
      path += ` L${W + 20},${H} Z`;
      capas += `<path d="${path}" fill="${_hsl(t + plano * 8, sat, lum)}"/>`;
    }
    if (nieve) {
      for (let i = 0; i < 40; i++) {
        capas += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
      }
    } else {
      capas += `<path d="M0,${H} L0,${H - 30} Q200,${H - 50} ${W},${H - 26} L${W},${H} Z" fill="${_hsl(t + 90, 32, 26)}"/>`;
    }

  } else if (p === 'desierto') {
    for (let i = 0; i < 4; i++) {
      const y = H - 70 + i * 20, l = 62 - i * 7;
      capas += `<path d="M-10,${H} L-10,${y} Q${(80 + r() * 90).toFixed(0)},${(y - 34).toFixed(0)} ${(200 + r() * 60).toFixed(0)},${y}
        T${W + 10},${y - 8} L${W + 10},${H} Z" fill="${_hsl(t + 5, 62, l)}"/>`;
    }
    // Duna con caravana
    capas += `<g transform="translate(${(250 + r() * 80).toFixed(0)},${H - 62})" opacity=".55">
      <path d="M0,0 q4,-12 12,-12 q3,-8 8,-4 q6,-4 8,4 q9,1 10,12 z" fill="hsl(28 45% 22%)"/></g>`;

  } else if (p === 'selva') {
    capas += `<path d="M0,${H} L0,${H - 60} Q120,${H - 100} 240,${H - 62} T${W},${H - 74} L${W},${H} Z" fill="${_hsl(t, 45, 24)}"/>`;
    for (let i = 0; i < 14; i++) {
      const x = r() * W, h = 60 + r() * 90, l = 22 + r() * 18;
      capas += `<g transform="translate(${x.toFixed(0)},${H})">
        <rect x="-3" y="${(-h).toFixed(0)}" width="6" height="${h.toFixed(0)}" fill="hsl(28 35% 22%)"/>
        <ellipse cx="0" cy="${(-h).toFixed(0)}" rx="${(22 + r() * 16).toFixed(0)}" ry="${(16 + r() * 10).toFixed(0)}" fill="${_hsl(t, 50, l)}"/>
        <ellipse cx="${(-14 + r() * 28).toFixed(0)}" cy="${(-h + 12).toFixed(0)}" rx="18" ry="12" fill="${_hsl(t + 15, 45, l + 6)}" opacity=".85"/></g>`;
    }

  } else if (p === 'templo') {
    // Colinas suaves + pagoda / torii
    capas += `<path d="M0,${H} L0,${H - 55} Q140,${H - 95} 260,${H - 58} T${W},${H - 70} L${W},${H} Z" fill="${_hsl(t + 120, 25, 30)}"/>`;
    const tx = 150 + r() * 100;
    capas += `<g transform="translate(${tx.toFixed(0)},${H - 60})">
      ${[0, 1, 2].map(i => {
        const w = 70 - i * 18, y = -i * 30;
        return `<path d="M${-w / 2 - 8},${y} L${w / 2 + 8},${y} L${w / 2},${y - 10} L${-w / 2},${y - 10} Z" fill="${_hsl(t, 55, 38)}"/>
                <rect x="${-w / 2 + 6}" y="${y - 30}" width="${w - 12}" height="20" fill="${_hsl(t + 10, 30, 26)}"/>`;
      }).join('')}
      <rect x="-5" y="-102" width="10" height="14" fill="${_hsl(t, 55, 42)}"/></g>`;
    // Flores de cerezo
    for (let i = 0; i < 18; i++) {
      capas += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(1.5 + r() * 2).toFixed(1)}" fill="hsl(340 80% 82%)" opacity="${(0.3 + r() * 0.5).toFixed(2)}"/>`;
    }
  }

  // ---------- PÁJAROS (toque de vida) ----------
  for (let i = 0; i < 3; i++) {
    const x = 40 + r() * 320, y = 45 + r() * 60, s = 0.6 + r() * 0.6;
    capas += `<path transform="translate(${x.toFixed(0)},${y.toFixed(0)}) scale(${s.toFixed(2)})"
      d="M0,0 q5,-5 10,0 q5,-5 10,0" stroke="rgba(0,0,0,.35)" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  }

  return `<svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${d.n}">
    <defs>${cielo}</defs>
    <rect width="${W}" height="${H}" fill="url(#sk${d.id})"/>
    ${capas}
  </svg>`;
}
