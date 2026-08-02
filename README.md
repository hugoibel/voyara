# Voyara — Portal de viajes de afiliados

Web de viajes en **5 idiomas** (español, inglés, alemán, francés, italiano) que compara vuelos,
hoteles, coches y experiencias, y gana dinero por **comisión de afiliado**.

**No eres una agencia de viajes**: no vendes el viaje, no cobras al cliente y no necesitas
licencia ni seguro de agencia. Mandas al viajero a Booking / Skyscanner / GetYourGuide y ellos
te pagan por traerlo. El cliente paga lo mismo.

---

## 1. Cómo empezar a ganar dinero (lo único imprescindible)

Todo se configura en **`js/config.js`**. Sin IDs la web funciona igual, pero **no cobras**.

### El atajo: Travelpayouts (una sola alta)

1. Entra en **travelpayouts.com** y crea la cuenta (gratis, aceptan a particulares).
2. Copia tu **marker** (un número).
3. Pégalo en `js/config.js`:

```js
afiliados: {
  marker: '123456',     // ← tu número de Travelpayouts
  ...
}
```

Con eso ya cobras **vuelos, coches, seguros y eSIM**.

### Los otros programas (opcionales, mejores comisiones)

| Programa | Dónde darse de alta | Qué campo rellenar | Comisión típica |
|---|---|---|---|
| **Booking.com** | partner.booking.com | `booking_aid` | 4-6 % de la reserva |
| **GetYourGuide** | partner.getyourguide.com | `gyg_partner` | 8 % de la actividad |
| **Civitatis** | civitatis.com/es/afiliados | `civitatis_id` | 8-10 % |
| **HeyMondo** (seguros) | heymondo.com/afiliados | `heymondo_id` | 30-40 % 💰 |
| **Airalo** (eSIM) | airalo.com/partners | `airalo_id` | 10-15 % |
| **Amazon** (equipaje) | afiliados.amazon.es | `amazon_tag` | 3-8 % |

> **Ojo con Amazon**: te dan de baja si no haces 3 ventas en 180 días. Déjalo para
> cuando ya tengas visitas.

**Los seguros de viaje son lo más rentable** (30-40 % de comisión sobre ~60 € = ~20 € por venta),
muy por encima de un hotel. Merece la pena empujarlos.

### Personaliza tu marca

En el mismo `js/config.js`:

```js
marca: 'Voyara',            // el nombre que se ve en toda la web
dominio: 'voyara.com',
email: 'hola@voyara.com',
whatsapp: '34600112233',    // sin +, sin espacios. Vacío = no sale el botón
instagram: 'voyara.viajes',
telegram: 'voyaraofertas',
```

---

## 2. Publicar la web gratis (GitHub Pages)

Igual que MotoSportPro y Metales Pro:

```bash
cd C:\Users\TechTablet\voyara
git init
git add -A
git commit -m "Voyara v1.0"
gh repo create voyara --public --source=. --push
```

Luego en GitHub: **Settings → Pages → Branch: master → /(root) → Save**.
En 1-2 minutos estará en `https://TUUSUARIO.github.io/voyara/`.

Para actualizar después de cualquier cambio:

```bash
git add -A && git commit -m "lo que hayas cambiado" && git push
```

### Con dominio propio

1. Compra el dominio (Namecheap, Porkbun… unos 10 €/año).
2. Crea un archivo `CNAME` en la carpeta con una sola línea: `voyara.com`.
3. En tu proveedor de dominio, apunta los DNS a GitHub Pages.
4. Cambia `voyara.com` por tu dominio en `index.html` (etiquetas `canonical`, `og:` y `hreflang`),
   en `sitemap.xml` y en `robots.txt`.

---

## 3. Qué tiene la web

**Buscador de 5 pestañas** — vuelos, hoteles, coches, experiencias y viajes completos.
Cada búsqueda construye la URL con tu ID y abre el socio en otra pestaña.

**36 destinos** con foto real, precio orientativo, mejor época, presupuesto diario, filtros por
continente y por tipo de viaje (playa, ciudad, cultura, aventura, lujo, económico…) y ordenación.

**Ofertas de la semana** — destinos con descuento y precio tachado.

**6 viajes organizados** con itinerario día a día, qué incluye y qué no, y botones para
reservar cada parte por separado.

**4 herramientas** que hacen que la gente vuelva (y son lo mejor para el SEO):
conversor de moneda, calculadora de presupuesto real del viaje, checklist de equipaje
que se guarda sola y calendario de mejor época por destino.

**4 guías** con consejos de verdad, opiniones, FAQ, newsletter y formulario de contacto.

**Además**: modo oscuro, favoritos, 5 idiomas, 5 monedas, PWA instalable en el móvil,
funciona sin conexión, SEO con `hreflang` y datos estructurados, y página legal completa
en los 5 idiomas.

---

## 4. Añadir o cambiar contenido

### Un destino nuevo — `js/data.js`

```js
{ id:'oslo', n:'Oslo', pais:'no', cont:'europa', iata:'OSL',
  tipos:['ciudad','naturaleza'],
  vuelo:140,     // vuelo ida y vuelta orientativo, en euros
  hotel:130,     // por noche
  dia:70,        // gasto diario sin vuelo ni hotel
  epoca:[6,7,8], // meses buenos
  pop:70,        // 0-100, ordena la portada
  paisaje:'montana', tono:200 },
```

Después añade su término de búsqueda en **`fotos.py`** y ejecuta `python fotos.py`: baja la foto
de Wikimedia Commons, la recorta y anota el crédito. `paisaje` solo se usa como respaldo si esa
foto faltara.

### Cambiar una foto que no te gusta

En `fotos.py`:
- **Opción rápida**: cambia su término en `BUSQUEDAS`, borra `img/dest/<id>.jpg` y `-sm.jpg`,
  y ejecuta `python fotos.py`.
- **Opción exacta**: busca la foto que quieras en commons.wikimedia.org y pon su nombre de
  archivo en `ARCHIVO_FIJO`. Manda sobre la búsqueda.
- **Tu propia foto**: déjala en `img/dest/<id>.jpg` (1200×800) y `<id>-sm.jpg` (600×400), y
  añade el id a `MANUALES` para que el script no la pise.

Las fotos son de Wikimedia Commons, filtradas entre las marcadas como *Quality* o *Featured*.
**La atribución es obligatoria** en las licencias Creative Commons: se genera sola en
`js/fotos.js` y se muestra en la página legal y sobre cada foto ampliada.

Si el país es nuevo, añádelo también a `PAISES` en `js/i18n.js` con sus 5 traducciones.

### Cambiar las ofertas — `js/contenido.js`

```js
const OFERTAS = [
  { destino:'bali', dto:32, motivo:'temporada baja' },
];
```

**Actualízalas cada semana.** Es lo que hace que la gente vuelva y lo que da credibilidad.

### Un viaje organizado nuevo — `js/data.js`, en `PAQUETES`

El itinerario se escribe con bloques ya traducidos (`llegada`, `visita`, `excursion`,
`libre`, `traslado`, `natura`, `gastro`, `regreso`) y el nombre del sitio:

```js
ruta:[
  {b:'llegada', l:'Oslo'},
  {b:'excursion', l:'los fiordos'},
  {b:'regreso', l:'Oslo'}
]
```

Así no tienes que traducir nada a 5 idiomas: solo los nombres propios, que no se traducen.

---

## 5. ⚠️ Al cambiar cualquier archivo: sube la versión

En **`sw.js`**, primera línea:

```js
const VERSION = 'voyara-v1.0';   // ← v1.1, v1.2…
```

Si no lo haces, quien ya visitó la web **seguirá viendo la versión vieja** (está cacheada).
Es el fallo número uno de las PWA.

---

## 6. Cómo conseguir visitas (sin visitas no hay comisiones)

Por orden de lo que funciona:

1. **Las herramientas atraen tráfico gratis.** «Calculadora de presupuesto de viaje» o
   «checklist de equipaje» tienen mucha búsqueda y poca competencia. Las guías genéricas
   («qué ver en Roma») compiten contra webs con años de ventaja: no vayas por ahí al principio.
2. **Canal de Telegram / Instagram de ofertas.** Publica 2-3 chollos reales al día con tu enlace.
   Es lo que mejor convierte y lo que menos depende de Google.
3. **Nicho concreto.** «Viajes en moto por Europa» o «primer viaje a Japón» posicionan
   mucho antes que «viajes baratos». Puedes cruzarlo con MotoSportPro.
4. **La lista de correo.** Ahora los suscriptores se guardan en el navegador de cada visitante
   (solo sirve de prueba). Cuando tengas tráfico, conecta un servicio real: Buttondown o
   MailerLite tienen plan gratis hasta 1.000 suscriptores.

Cuentas realistas: un 1-3 % de los visitantes hace clic hasta reservar, y cada reserva deja
entre 3 € y 25 €. Con 1.000 visitas al mes: entre 30 € y 150 €. Es un negocio de volumen y
de constancia, no de una noche.

---

## 7. Cookies y consentimiento

El script de Travelpayouts (Drive) **no se carga hasta que el visitante pulsa "Aceptar"** en el aviso
de abajo. Si rechaza, no se carga nunca y esa visita no genera comisión: es el precio de cumplir la
normativa europea, que exige el consentimiento **antes** de instalar cookies de seguimiento.

Vive todo en **`js/cookies.js`**, con sus textos en los 5 idiomas. El snippet oficial de Travelpayouts
está ahí dentro intacto — si algún día cambias de red de afiliados, se sustituye en la función
`cargarTravelpayouts()` y nada más.

El visitante puede cambiar de opinión desde el enlace **"Preferencias de cookies"** del pie.

> Si tocas `js/cookies.js`, comprueba que sigue cumpliendo:
> ```bash
> npm install jsdom     # única dependencia del proyecto, y solo para el test
> node test_cookies.js
> ```
> Prueba los seis escenarios (visitante nuevo, acepta, rechaza, vuelve, cambia de opinión, idiomas).

## 8. Aviso legal importante

`legal.html` trae aviso de afiliados, privacidad, cookies y términos en los 5 idiomas.

Antes de publicar **rellena `[TUS DATOS]`** con tu nombre o razón social, tu NIF y tu dirección
(es obligatorio en la UE y en EE.UU. — la FTC exige declarar la relación de afiliado, y esta
web ya lo hace de forma visible en la portada y en el pie).

Los textos son una base razonable, **no asesoramiento jurídico**. Cuando empieces a facturar
de verdad, que te los revise un asesor de tu país.

---

## Estructura

```
voyara/
├── index.html          la web entera
├── legal.html          textos legales en 5 idiomas
├── css/style.css       diseño (modo claro y oscuro)
├── js/
│   ├── config.js       ⭐ marca y afiliados — lo que tocas tú
│   ├── i18n.js         los 5 idiomas
│   ├── data.js         destinos y viajes organizados
│   ├── contenido.js    ofertas, guías, opiniones, equipaje
│   ├── arte.js         genera los paisajes en SVG
│   └── app.js          la lógica
├── icons/              iconos de la app (gen_iconos.py los regenera)
├── manifest.json       PWA
├── sw.js               ⚠️ subir VERSION en cada cambio
├── robots.txt · sitemap.xml
└── gen_iconos.py       python gen_iconos.py
```

Sin build, sin npm, sin dependencias. Abres `index.html` y funciona.
