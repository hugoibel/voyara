# Kit de Pinterest

36 imágenes verticales (1000×1500, el formato que Pinterest premia) con el texto
ya escrito. Solo tienes que subirlas.

## Por qué Pinterest y no otra red

Pinterest **no es una red social, es un buscador visual**. Eso cambia todo para ti:

- No necesitas seguidores. Un pin nuevo puede aparecer en búsquedas desde el primer día.
- **No depende de la autoridad de tu dominio**, que es tu punto débil ahora mismo.
- Los pines siguen trayendo visitas **meses o años** después de publicarlos, al revés
  que un post de Instagram, que muere en 24 horas.
- Los viajes son de los nichos más buscados: más de mil millones de búsquedas al año.

## Preparación (una vez, 15 minutos)

1. Crea una **cuenta de empresa** en pinterest.com/business/create (gratis).
   La de empresa da estadísticas y permite reclamar la web; la personal no.
2. **Reclama tu sitio web**: Ajustes → Cuentas reclamadas → añade
   `hugoibel.github.io/voyara`. Te dará una etiqueta que hay que pegar en el HTML;
   pásamela y la pongo.
3. Crea **5 tableros**, uno por continente (la columna `tablero_sugerido` del CSV te
   dice a cuál va cada pin):
   - Viajes por Europa · Viajes por Asia · Viajes por América · Viajes por África · Viajes por Oceanía

## Publicar

Abre `publicar.csv` con Excel. Cada fila es un pin:

| Columna | Qué hacer con ella |
|---|---|
| `imagen` | la subes |
| `titulo` | al campo Título |
| `descripcion` | al campo Descripción |
| `enlace` | al campo "Enlace de destino" — **este es el que trae la visita** |
| `tablero_sugerido` | en qué tablero guardarlo |

**El campo del enlace es el importante.** Sin él, el pin es bonito pero no te
trae a nadie.

## Ritmo

**3-5 pines al día, no los 36 de golpe.** Pinterest penaliza las subidas masivas de
una cuenta nueva; prefiere constancia. Con 36 imágenes tienes para 8-10 días.
Puedes programarlos desde el propio Pinterest.

Cuando se te acaben, vuelve a ejecutar `python pinterest.py` tras añadir destinos
nuevos, o repite los mismos destinos con otra foto.

## Qué esperar

No es inmediato: Pinterest tarda **entre 4 y 8 semanas** en empezar a distribuir bien
una cuenta nueva. A partir de ahí crece solo. No abandones a las dos semanas: es
justo el error que hace que la mayoría no vea resultados.

## Lo que NO debes hacer

- Poner el enlace de afiliado directamente en el pin. Pinterest lo penaliza y algunos
  programas lo prohíben. **Enlaza siempre a tu web**, que es donde están tus enlaces.
- Repetir el mismo pin exacto muchas veces.
- Comprar seguidores: no sirven de nada en un buscador visual.
