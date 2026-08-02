# Cómo conseguir visitas

Sin visitas no hay comisiones. Esto es lo que hay que hacer, por orden.

---

## Antes de nada: lo que NO va a funcionar

No intentes posicionar "vuelos baratos" ni "qué ver en Roma". Ahí compites contra
Skyscanner y Booking, con veinte años de ventaja y millones de presupuesto. Con un
dominio nuevo eso es inalcanzable, y perseguirlo es la forma más rápida de tirar meses
a la basura.

Tu terreno es el **long-tail**: búsquedas largas y concretas donde ellos no llegan.
"Cuánto cuesta un viaje a Bali", "mejor época para ir a Japón", "presupuesto viaje
a Perú". De eso van las 180 páginas que ya tienes generadas.

---

## 1. Dar de alta la web en los buscadores (30 minutos, hazlo hoy)

### Google Search Console

1. Entra en **search.google.com/search-console** con tu cuenta de Google.
2. Añade una propiedad de tipo **Prefijo de URL**: `https://hugoibel.github.io/voyara/`
3. Para verificar, elige **Etiqueta HTML**. Te dará algo así:
   `<meta name="google-site-verification" content="AbC123..." />`
4. **Pásame ese código** y lo pongo en su sitio (ya está el hueco preparado en `index.html`).
5. Cuando te verifique: menú **Sitemaps** → escribe `sitemap.xml` → Enviar.

Con eso le estás diciendo a Google que existen tus **182 direcciones**. Tardará entre
días y semanas en visitarlas todas.

### Bing (también alimenta a DuckDuckGo y a ChatGPT)

1. **bing.com/webmasters** → puedes importar directamente desde Google Search Console,
   que es lo más rápido.
2. Si lo haces a mano, te dará un código `msvalidate.01`: pásamelo igual.

> Bing lo salta mucha gente y es un error: tiene menos competencia y sus resultados
> alimentan a varios asistentes de IA.

---

## 2. Pinterest (la vía más rápida a tráfico real)

Ya tienes **36 imágenes verticales generadas** con sus textos en `pinterest/`.

Es tu mejor apuesta a corto plazo porque **Pinterest no depende de la autoridad de tu
dominio**: es un buscador visual donde un pin nuevo puede aparecer desde el primer día,
y los viajes son de lo más buscado allí (más de mil millones de búsquedas al año).

**Instrucciones completas en `pinterest/GUIA.md`.** Resumen:

1. Cuenta de **empresa** (no personal) en pinterest.com/business/create
2. Reclama tu web → te dará un código `p:domain_verify` → pásamelo
3. Crea 5 tableros (uno por continente)
4. Sube **3-5 pines al día**, no los 36 de golpe

Ten paciencia: Pinterest tarda **4-8 semanas** en arrancar con una cuenta nueva. La
mayoría abandona justo antes de que empiece a funcionar.

---

## 3. Las 180 páginas de destino (ya hechas)

Cada destino tiene ahora su propia página, en los 5 idiomas:

```
https://hugoibel.github.io/voyara/destinos/es/bali.html
https://hugoibel.github.io/voyara/destinos/en/bali.html   ...
```

Cada una compite por sus propias búsquedas con datos reales: cuánto cuesta el vuelo,
el hotel, el gasto diario, el total y los mejores meses. Están enlazadas desde la
portada y entre sí, que es como Google las va descubriendo.

**Si cambias precios o añades un destino**, vuelve a ejecutar:

```bash
python paginas.py
```

Regenera las 180 páginas y el `sitemap.xml`.

---

## 4. Cuando tengas algo de tráfico

**Canal de Telegram de ofertas.** Es lo que mejor convierte y lo que menos depende de
Google, pero exige constancia: 2-3 chollos reales al día. Si no vas a mantener el ritmo,
mejor no empezarlo.

**Lista de correo de verdad.** Ahora los suscriptores se guardan solo en el navegador de
cada visitante: sirve para probar, no para enviar nada. Con tráfico real, conecta
Buttondown o MailerLite (gratis hasta 1.000 suscriptores).

**Dominio propio** (~10 €/año). Un `github.io` resta credibilidad y posiciona peor que un
dominio tuyo. Cuando lo compres hay que cambiar las URLs en `index.html`, `sitemap.xml`,
`robots.txt`, `paginas.py` y `pinterest.py`.

---

## Qué esperar, con números

| Cuándo | Qué debería pasar |
|---|---|
| Semana 1-2 | Google empieza a indexar. 0-20 visitas |
| Mes 1-2 | Pinterest arranca. 100-400 visitas/mes |
| Mes 3-6 | Long-tail posicionando. 500-3.000 visitas/mes |

Con 1.000 visitas al mes: entre un 1 % y un 3 % llega a reservar, y cada reserva deja
entre 3 € y 25 €. Eso son **20-150 € al mes**.

No es un negocio rápido. Es de constancia: publicar pines, refrescar las ofertas cada
semana y añadir destinos. Lo que mata estos proyectos no es la competencia, es
abandonarlos en el mes dos.

---

## Cosas que te van a proponer y no valen la pena

- **Comprar enlaces o seguidores**: Google lo detecta y penaliza; los seguidores comprados
  no hacen clic.
- **Publicar en decenas de directorios**: no sirve desde hace años.
- **Generar 500 páginas de golpe con IA**: Google penaliza el contenido masivo sin valor.
  Tus 180 páginas funcionan porque cada una tiene datos reales y distintos.
- **Pagar publicidad ahora**: con un 1-3 % de conversión y 3-25 € por venta, los números
  no dan. La publicidad tiene sentido cuando ya sabes cuánto vale una visita tuya.
