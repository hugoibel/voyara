/**
 * Comprueba que el aviso de cookies cumple lo que promete:
 * que el script de Travelpayouts NO se carga sin consentimiento.
 *
 *     npm install jsdom      (única dependencia, y solo para este test)
 *     node test_cookies.js
 *
 * Ejecútalo siempre que toques js/cookies.js: es la parte legal.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const CK = fs.readFileSync('C:/Users/TechTablet/voyara/js/cookies.js', 'utf8');
const esperar = ms => new Promise(r => setTimeout(r, ms));

async function abrir(consentPrevio) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body><div class="pie"><div class="pie-rejilla">
       <div></div><div><ul></ul></div><div><ul></ul></div><div><ul></ul></div></div></div></body></html>`,
    { url: 'https://hugoibel.github.io/voyara/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  if (consentPrevio) w.localStorage.setItem('voyara_consent', consentPrevio);
  w.eval(CK);
  await esperar(600);                       // dejamos que arranque de verdad
  w.drive  = () => [...w.document.querySelectorAll('script[src]')].filter(s => s.src.includes('emrldtp.com')).length;
  w.banner = () => !!w.document.getElementById('ckBanner');
  return w;
}

const ok = b => b ? '✅' : '❌';
let fallos = 0;
function comprobar(nombre, cond, detalle) {
  if (!cond) fallos++;
  console.log(` ${ok(cond)} ${nombre}${detalle ? '  → ' + detalle : ''}`);
}

(async () => {
  console.log('\n== Visitante nuevo, sin decidir ==');
  let w = await abrir(null);
  comprobar('Se muestra el aviso', w.banner());
  comprobar('El script de Travelpayouts NO se ha cargado', w.drive() === 0, `scripts=${w.drive()}`);
  comprobar('Los dos botones existen y pesan igual',
    !!w.document.getElementById('ckSi') && !!w.document.getElementById('ckNo'));

  console.log('\n== Pulsa ACEPTAR ==');
  w = await abrir(null);
  w.document.getElementById('ckSi').dispatchEvent(new w.Event('click'));
  await esperar(400);   // el aviso se retira tras la animacion (280ms)
  comprobar('Ahora sí se carga el script', w.drive() === 1, `scripts=${w.drive()}`);
  comprobar('Queda guardado como "si"', w.localStorage.getItem('voyara_consent') === 'si');
  comprobar('El aviso desaparece', !w.banner());

  console.log('\n== Pulsa RECHAZAR ==');
  w = await abrir(null);
  w.document.getElementById('ckNo').dispatchEvent(new w.Event('click'));
  await esperar(400);   // el aviso se retira tras la animacion (280ms)
  comprobar('El script sigue SIN cargarse', w.drive() === 0, `scripts=${w.drive()}`);
  comprobar('Queda guardado como "no"', w.localStorage.getItem('voyara_consent') === 'no');

  console.log('\n== Vuelve alguien que ya había aceptado ==');
  w = await abrir('si');
  comprobar('Carga el script sin volver a preguntar', w.drive() === 1, `scripts=${w.drive()}`);
  comprobar('No se le muestra el aviso otra vez', !w.banner());

  console.log('\n== Vuelve alguien que ya había rechazado ==');
  w = await abrir('no');
  comprobar('No carga el script', w.drive() === 0, `scripts=${w.drive()}`);
  comprobar('No se le vuelve a molestar', !w.banner());
  const enlaces = [...w.document.querySelectorAll('.pie a')].map(a => a.textContent);
  comprobar('Puede cambiar de opinión desde el pie', enlaces.length === 1, enlaces.join(','));
  w.preferenciasCookies();
  await esperar(60);
  comprobar('Ese enlace reabre el aviso', w.banner());

  console.log('\n== Idiomas ==');
  for (const [lang, esperado] of [['de','Ablehnen'],['fr','Refuser'],['it','Rifiuta'],['en','Decline']]) {
    const d = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>',
      { url: `https://hugoibel.github.io/voyara/?lang=${lang}`, runScripts: 'outside-only', pretendToBeVisual: true });
    d.window.eval(CK);
    await esperar(400);
    const txt = d.window.document.getElementById('ckNo');
    comprobar(`Aviso en ${lang}`, txt && txt.textContent === esperado, txt ? txt.textContent : 'sin banner');
  }

  console.log(fallos ? `\n${fallos} COMPROBACIONES FALLIDAS` : '\nTodo correcto: sin consentimiento no se carga nada.');
  process.exit(fallos ? 1 : 0);
})();
