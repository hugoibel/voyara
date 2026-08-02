// ============================================================
//  VOYARA — Destinos y viajes organizados
//  Para añadir un destino: copia un bloque y cambia los datos.
//    iata      → código del aeropuerto (para el buscador de vuelos)
//    tipos     → etiquetas de filtro (tp_* de i18n.js)
//    vuelo     → precio orientativo ida y vuelta, en EUR
//    hotel     → precio orientativo por noche, en EUR
//    dia       → presupuesto diario sin vuelo ni hotel, en EUR
//    epoca     → meses buenos (1 = enero … 12 = diciembre)
//    pop       → popularidad 0-100 (ordena la portada)
//    paisaje   → dibujo generado: playa|ciudad|montana|desierto|selva|nieve|isla|templo
//    tono      → color base del dibujo (grados HSL 0-360)
// ============================================================

const DESTINOS = [
  // ---------- EUROPA ----------
  { id:'roma', n:'Roma', pais:'it', cont:'europa', iata:'FCO', tipos:['ciudad','cultura','romantico'],
    vuelo:90, hotel:95, dia:55, epoca:[4,5,6,9,10], pop:96, paisaje:'ciudad', tono:28 },
  { id:'paris', n:'París', pais:'fr', cont:'europa', iata:'CDG', tipos:['ciudad','romantico','cultura'],
    vuelo:95, hotel:130, dia:70, epoca:[4,5,6,9,10], pop:98, paisaje:'ciudad', tono:220 },
  { id:'santorini', n:'Santorini', pais:'gr', cont:'europa', iata:'JTR', tipos:['playa','romantico','lujo'],
    vuelo:150, hotel:180, dia:70, epoca:[5,6,9,10], pop:92, paisaje:'isla', tono:205 },
  { id:'lisboa', n:'Lisboa', pais:'pt', cont:'europa', iata:'LIS', tipos:['ciudad','cultura','barato'],
    vuelo:70, hotel:80, dia:45, epoca:[3,4,5,6,9,10], pop:88, paisaje:'ciudad', tono:35 },
  { id:'islandia', n:'Reikiavik', pais:'is', cont:'europa', iata:'KEF', tipos:['naturaleza','aventura','montana'],
    vuelo:180, hotel:150, dia:90, epoca:[6,7,8,9], pop:84, paisaje:'nieve', tono:190 },
  { id:'amsterdam', n:'Ámsterdam', pais:'nl', cont:'europa', iata:'AMS', tipos:['ciudad','cultura','familia'],
    vuelo:90, hotel:135, dia:65, epoca:[4,5,6,9], pop:83, paisaje:'ciudad', tono:15 },
  { id:'praga', n:'Praga', pais:'cz', cont:'europa', iata:'PRG', tipos:['ciudad','cultura','barato','romantico'],
    vuelo:85, hotel:75, dia:40, epoca:[4,5,6,9,10,12], pop:82, paisaje:'ciudad', tono:45 },
  { id:'dubrovnik', n:'Dubrovnik', pais:'hr', cont:'europa', iata:'DBV', tipos:['playa','cultura','romantico'],
    vuelo:120, hotel:110, dia:55, epoca:[5,6,9,10], pop:78, paisaje:'isla', tono:200 },
  { id:'noruega', n:'Fiordos noruegos', pais:'no', cont:'europa', iata:'BGO', tipos:['naturaleza','montana','aventura'],
    vuelo:160, hotel:145, dia:85, epoca:[6,7,8], pop:76, paisaje:'montana', tono:200 },
  { id:'alpes', n:'Alpes suizos', pais:'ch', cont:'europa', iata:'ZRH', tipos:['montana','naturaleza','lujo','familia'],
    vuelo:130, hotel:180, dia:95, epoca:[1,2,6,7,8,12], pop:80, paisaje:'nieve', tono:210 },
  { id:'londres', n:'Londres', pais:'gb', cont:'europa', iata:'LHR', tipos:['ciudad','cultura','familia'],
    vuelo:85, hotel:160, dia:80, epoca:[5,6,7,8,9], pop:94, paisaje:'ciudad', tono:250 },
  { id:'canarias', n:'Canarias', pais:'es', cont:'europa', iata:'TFS', tipos:['playa','familia','naturaleza'],
    vuelo:75, hotel:85, dia:45, epoca:[1,2,3,10,11,12], pop:86, paisaje:'playa', tono:35 },

  // ---------- ASIA ----------
  { id:'tokio', n:'Tokio', pais:'jp', cont:'asia', iata:'HND', tipos:['ciudad','cultura','aventura'],
    vuelo:620, hotel:120, dia:70, epoca:[3,4,10,11], pop:97, paisaje:'templo', tono:340 },
  { id:'bali', n:'Bali', pais:'id', cont:'asia', iata:'DPS', tipos:['playa','romantico','barato','naturaleza'],
    vuelo:580, hotel:55, dia:35, epoca:[4,5,6,7,8,9], pop:95, paisaje:'selva', tono:145 },
  { id:'bangkok', n:'Bangkok', pais:'th', cont:'asia', iata:'BKK', tipos:['ciudad','barato','cultura'],
    vuelo:520, hotel:45, dia:30, epoca:[11,12,1,2], pop:90, paisaje:'templo', tono:40 },
  { id:'maldivas', n:'Maldivas', pais:'mv', cont:'asia', iata:'MLE', tipos:['playa','lujo','romantico'],
    vuelo:650, hotel:380, dia:90, epoca:[1,2,3,4,11,12], pop:89, paisaje:'isla', tono:180 },
  { id:'dubai', n:'Dubái', pais:'ae', cont:'asia', iata:'DXB', tipos:['ciudad','lujo','familia'],
    vuelo:340, hotel:150, dia:80, epoca:[11,12,1,2,3], pop:87, paisaje:'desierto', tono:30 },
  { id:'vietnam', n:'Vietnam', pais:'vn', cont:'asia', iata:'SGN', tipos:['aventura','barato','cultura','naturaleza'],
    vuelo:560, hotel:40, dia:28, epoca:[2,3,4,11,12], pop:81, paisaje:'selva', tono:120 },
  { id:'kioto', n:'Kioto', pais:'jp', cont:'asia', iata:'KIX', tipos:['cultura','romantico','naturaleza'],
    vuelo:640, hotel:110, dia:65, epoca:[3,4,11], pop:88, paisaje:'templo', tono:355 },
  { id:'srilanka', n:'Sri Lanka', pais:'lk', cont:'asia', iata:'CMB', tipos:['aventura','naturaleza','barato','playa'],
    vuelo:590, hotel:45, dia:30, epoca:[1,2,3,4,12], pop:72, paisaje:'selva', tono:100 },
  { id:'petra', n:'Petra', pais:'jo', cont:'asia', iata:'AMM', tipos:['cultura','aventura','desierto'],
    vuelo:290, hotel:80, dia:50, epoca:[3,4,5,10,11], pop:74, paisaje:'desierto', tono:20 },
  { id:'india', n:'Rajastán', pais:'in', cont:'asia', iata:'DEL', tipos:['cultura','aventura','barato'],
    vuelo:480, hotel:50, dia:30, epoca:[11,12,1,2,3], pop:73, paisaje:'templo', tono:15 },

  // ---------- AMÉRICA ----------
  { id:'nyc', n:'Nueva York', pais:'us', cont:'america', iata:'JFK', tipos:['ciudad','cultura','familia'],
    vuelo:420, hotel:210, dia:95, epoca:[4,5,6,9,10,12], pop:96, paisaje:'ciudad', tono:265 },
  { id:'cancun', n:'Riviera Maya', pais:'mx', cont:'america', iata:'CUN', tipos:['playa','familia','romantico'],
    vuelo:480, hotel:110, dia:55, epoca:[1,2,3,4,11,12], pop:91, paisaje:'playa', tono:175 },
  { id:'machupicchu', n:'Machu Picchu', pais:'pe', cont:'america', iata:'CUZ', tipos:['aventura','cultura','montana'],
    vuelo:720, hotel:70, dia:45, epoca:[5,6,7,8,9], pop:85, paisaje:'montana', tono:110 },
  { id:'patagonia', n:'Patagonia', pais:'ar', cont:'america', iata:'FTE', tipos:['aventura','naturaleza','montana'],
    vuelo:850, hotel:95, dia:60, epoca:[11,12,1,2,3], pop:77, paisaje:'montana', tono:195 },
  { id:'rio', n:'Río de Janeiro', pais:'br', cont:'america', iata:'GIG', tipos:['playa','ciudad','aventura'],
    vuelo:620, hotel:80, dia:50, epoca:[12,1,2,3], pop:82, paisaje:'playa', tono:150 },
  { id:'costarica', n:'Costa Rica', pais:'cr', cont:'america', iata:'SJO', tipos:['naturaleza','aventura','familia'],
    vuelo:640, hotel:85, dia:55, epoca:[12,1,2,3,4], pop:79, paisaje:'selva', tono:130 },
  { id:'habana', n:'La Habana', pais:'cu', cont:'america', iata:'HAV', tipos:['cultura','playa','barato'],
    vuelo:540, hotel:60, dia:40, epoca:[11,12,1,2,3,4], pop:71, paisaje:'ciudad', tono:190 },
  { id:'cartagena', n:'Cartagena', pais:'co', cont:'america', iata:'CTG', tipos:['playa','cultura','romantico'],
    vuelo:560, hotel:75, dia:40, epoca:[12,1,2,3], pop:70, paisaje:'playa', tono:340 },

  // ---------- ÁFRICA ----------
  { id:'marrakech', n:'Marrakech', pais:'ma', cont:'africa', iata:'RAK', tipos:['cultura','barato','aventura'],
    vuelo:130, hotel:60, dia:35, epoca:[3,4,5,10,11], pop:86, paisaje:'desierto', tono:25 },
  { id:'egipto', n:'El Cairo y Nilo', pais:'eg', cont:'africa', iata:'CAI', tipos:['cultura','aventura','familia'],
    vuelo:320, hotel:70, dia:45, epoca:[10,11,12,1,2,3], pop:83, paisaje:'desierto', tono:40 },
  { id:'safari', n:'Serengueti', pais:'tz', cont:'africa', iata:'JRO', tipos:['aventura','naturaleza','lujo'],
    vuelo:680, hotel:220, dia:110, epoca:[6,7,8,9,10], pop:78, paisaje:'selva', tono:60 },
  { id:'ciudadcabo', n:'Ciudad del Cabo', pais:'za', cont:'africa', iata:'CPT', tipos:['ciudad','naturaleza','playa'],
    vuelo:590, hotel:90, dia:50, epoca:[11,12,1,2,3], pop:75, paisaje:'montana', tono:210 },

  // ---------- OCEANÍA ----------
  { id:'sidney', n:'Sídney', pais:'au', cont:'oceania', iata:'SYD', tipos:['ciudad','playa','familia'],
    vuelo:1100, hotel:150, dia:80, epoca:[10,11,12,1,2,3], pop:80, paisaje:'playa', tono:200 },
  { id:'nuevazelanda', n:'Nueva Zelanda', pais:'nz', cont:'oceania', iata:'AKL', tipos:['naturaleza','aventura','montana'],
    vuelo:1250, hotel:120, dia:75, epoca:[11,12,1,2,3], pop:79, paisaje:'montana', tono:140 }
];

// ============================================================
//  BLOQUES DE ITINERARIO (traducidos; {l} = el lugar)
// ============================================================
const ITIN = {
  llegada:  { es:'Llegada a {l}. Traslado al hotel y primer paseo para situarte.',
              en:'Arrival in {l}. Transfer to the hotel and a first walk to get your bearings.',
              de:'Ankunft in {l}. Transfer zum Hotel und erster Spaziergang zur Orientierung.',
              fr:'Arrivée à {l}. Transfert à l\'hôtel et première balade pour se repérer.',
              it:'Arrivo a {l}. Trasferimento in hotel e prima passeggiata per orientarsi.' },
  visita:   { es:'Día completo visitando {l}, lo esencial y los rincones que no salen en las guías.',
              en:'Full day exploring {l}: the must-sees and the corners guidebooks miss.',
              de:'Ganzer Tag in {l}: die Highlights und die Ecken, die in keinem Führer stehen.',
              fr:'Journée complète à {l} : l\'essentiel et les coins absents des guides.',
              it:'Giornata intera a {l}: l\'essenziale e gli angoli che le guide non citano.' },
  excursion:{ es:'Excursión de día entero a {l}. Salida temprano, vuelta al atardecer.',
              en:'Full-day excursion to {l}. Early start, back at sunset.',
              de:'Ganztagesausflug nach {l}. Früher Start, Rückkehr bei Sonnenuntergang.',
              fr:'Excursion d\'une journée à {l}. Départ tôt, retour au coucher du soleil.',
              it:'Escursione di un\'intera giornata a {l}. Partenza presto, ritorno al tramonto.' },
  libre:    { es:'Día libre en {l}: playa, compras o simplemente no hacer nada.',
              en:'Free day in {l}: beach, shopping or simply doing nothing.',
              de:'Freier Tag in {l}: Strand, Shopping oder einfach nichts tun.',
              fr:'Journée libre à {l} : plage, shopping ou farniente.',
              it:'Giornata libera a {l}: mare, shopping o semplicemente riposo.' },
  traslado: { es:'Traslado a {l}. Por el camino, paradas en los puntos con mejores vistas.',
              en:'Transfer to {l}, stopping at the best viewpoints along the way.',
              de:'Fahrt nach {l}, mit Stopps an den schönsten Aussichtspunkten.',
              fr:'Transfert vers {l}, avec arrêts aux plus beaux points de vue.',
              it:'Trasferimento a {l}, con soste nei punti panoramici migliori.' },
  natura:   { es:'Naturaleza en estado puro en {l}: rutas a pie y fauna salvaje.',
              en:'Raw nature in {l}: hiking trails and wildlife.',
              de:'Pure Natur in {l}: Wanderwege und wilde Tiere.',
              fr:'Nature à l\'état pur à {l} : randonnées et faune sauvage.',
              it:'Natura allo stato puro a {l}: sentieri e fauna selvatica.' },
  gastro:   { es:'Ruta gastronómica por {l}, comiendo donde comen los de allí.',
              en:'Food tour around {l}, eating where the locals eat.',
              de:'Kulinarische Tour durch {l} — essen, wo die Einheimischen essen.',
              fr:'Parcours gastronomique à {l}, là où mangent les habitants.',
              it:'Tour gastronomico a {l}, mangiando dove mangiano del posto.' },
  regreso:  { es:'Última mañana libre y vuelo de vuelta desde {l}.',
              en:'Last free morning and return flight from {l}.',
              de:'Letzter freier Vormittag und Rückflug ab {l}.',
              fr:'Dernière matinée libre et vol retour depuis {l}.',
              it:'Ultima mattina libera e volo di ritorno da {l}.' }
};

// ============================================================
//  VIAJES ORGANIZADOS
//  precio = orientativo por persona en EUR (vuelo + hotel + básicos)
// ============================================================
const PAQUETES = [
  {
    id:'pq_japon', destino:'tokio', dest2:'kioto', n:'Japón esencial', iata:'HND',
    dias:12, precio:2450, pop:95, paisaje:'templo', tono:340,
    plazas:6,
    ruta:[
      {b:'llegada',   l:'Tokio'},
      {b:'visita',    l:'Tokio: Shibuya, Asakusa y Akihabara'},
      {b:'excursion', l:'Monte Fuji y Hakone'},
      {b:'traslado',  l:'Kioto en tren bala'},
      {b:'visita',    l:'Kioto: Fushimi Inari y Gion'},
      {b:'excursion', l:'Nara y sus ciervos'},
      {b:'gastro',    l:'Osaka'},
      {b:'libre',     l:'Kioto'},
      {b:'regreso',   l:'Osaka'}
    ],
    incluye:['vuelo','hotel','tren','desayuno','guia'],
    noIncluye:['comidas','seguro','extras']
  },
  {
    id:'pq_bali', destino:'bali', n:'Bali y las islas Gili', iata:'DPS',
    dias:10, precio:1290, pop:92, paisaje:'selva', tono:145,
    plazas:8,
    ruta:[
      {b:'llegada',   l:'Bali'},
      {b:'visita',    l:'Ubud: arrozales y templos'},
      {b:'natura',    l:'Volcán Batur al amanecer'},
      {b:'traslado',  l:'las islas Gili'},
      {b:'libre',     l:'Gili Trawangan'},
      {b:'visita',    l:'Nusa Penida y sus acantilados'},
      {b:'libre',     l:'Seminyak'},
      {b:'regreso',   l:'Denpasar'}
    ],
    incluye:['vuelo','hotel','traslados','desayuno'],
    noIncluye:['comidas','seguro','actividades']
  },
  {
    id:'pq_peru', destino:'machupicchu', n:'Perú: Cusco y Machu Picchu', iata:'CUZ',
    dias:9, precio:1780, pop:88, paisaje:'montana', tono:110,
    plazas:4,
    ruta:[
      {b:'llegada',   l:'Lima'},
      {b:'traslado',  l:'Cusco'},
      {b:'visita',    l:'Cusco y el Valle Sagrado'},
      {b:'excursion', l:'Machu Picchu'},
      {b:'natura',    l:'Montaña de los 7 colores'},
      {b:'gastro',    l:'Cusco'},
      {b:'regreso',   l:'Lima'}
    ],
    incluye:['vuelo','hotel','tren','guia','entradas'],
    noIncluye:['comidas','seguro','propinas']
  },
  {
    id:'pq_islandia', destino:'islandia', n:'Islandia en coche', iata:'KEF',
    dias:8, precio:1650, pop:86, paisaje:'nieve', tono:190,
    plazas:5,
    ruta:[
      {b:'llegada',   l:'Reikiavik'},
      {b:'visita',    l:'el Círculo Dorado'},
      {b:'natura',    l:'cascadas del sur y playa negra'},
      {b:'natura',    l:'la laguna glaciar de Jökulsárlón'},
      {b:'excursion', l:'los fiordos del este'},
      {b:'libre',     l:'Reikiavik'},
      {b:'regreso',   l:'Keflavík'}
    ],
    incluye:['vuelo','coche','hotel','desayuno'],
    noIncluye:['gasolina','comidas','seguro']
  },
  {
    id:'pq_marruecos', destino:'marrakech', n:'Marruecos: desierto y medinas', iata:'RAK',
    dias:7, precio:790, pop:84, paisaje:'desierto', tono:25,
    plazas:10,
    ruta:[
      {b:'llegada',   l:'Marrakech'},
      {b:'visita',    l:'la medina y los zocos'},
      {b:'traslado',  l:'el desierto por el Alto Atlas'},
      {b:'natura',    l:'las dunas de Merzouga'},
      {b:'excursion', l:'las gargantas del Todra'},
      {b:'gastro',    l:'Marrakech'},
      {b:'regreso',   l:'Marrakech'}
    ],
    incluye:['vuelo','hotel','traslados','guia','desayuno'],
    noIncluye:['comidas','seguro','propinas']
  },
  {
    id:'pq_italia', destino:'roma', n:'Italia clásica', iata:'FCO',
    dias:9, precio:1350, pop:90, paisaje:'ciudad', tono:28,
    plazas:12,
    ruta:[
      {b:'llegada',   l:'Roma'},
      {b:'visita',    l:'Coliseo, Foro y Vaticano'},
      {b:'traslado',  l:'Florencia'},
      {b:'visita',    l:'Florencia y la Toscana'},
      {b:'excursion', l:'Cinque Terre'},
      {b:'traslado',  l:'Venecia'},
      {b:'libre',     l:'Venecia'},
      {b:'regreso',   l:'Venecia'}
    ],
    incluye:['vuelo','hotel','tren','desayuno','entradas'],
    noIncluye:['comidas','seguro','extras']
  }
];

// Etiquetas de "incluye / no incluye"
const ITEMS_PQ = {
  vuelo:      { es:'Vuelos ida y vuelta', en:'Return flights', de:'Hin- und Rückflug', fr:'Vols aller-retour', it:'Voli andata e ritorno' },
  hotel:      { es:'Hoteles', en:'Hotels', de:'Hotels', fr:'Hôtels', it:'Hotel' },
  tren:       { es:'Trenes entre ciudades', en:'Trains between cities', de:'Züge zwischen den Städten', fr:'Trains entre les villes', it:'Treni tra le città' },
  coche:      { es:'Coche de alquiler', en:'Rental car', de:'Mietwagen', fr:'Voiture de location', it:'Auto a noleggio' },
  traslados:  { es:'Traslados', en:'Transfers', de:'Transfers', fr:'Transferts', it:'Trasferimenti' },
  desayuno:   { es:'Desayunos', en:'Breakfasts', de:'Frühstück', fr:'Petits-déjeuners', it:'Colazioni' },
  guia:       { es:'Guía en español', en:'English-speaking guide', de:'Deutschsprachige Reiseleitung', fr:'Guide francophone', it:'Guida in italiano' },
  entradas:   { es:'Entradas principales', en:'Main entrance tickets', de:'Haupteintritte', fr:'Billets d\'entrée principaux', it:'Ingressi principali' },
  comidas:    { es:'Comidas y cenas', en:'Lunches and dinners', de:'Mittag- und Abendessen', fr:'Déjeuners et dîners', it:'Pranzi e cene' },
  seguro:     { es:'Seguro de viaje', en:'Travel insurance', de:'Reiseversicherung', fr:'Assurance voyage', it:'Assicurazione di viaggio' },
  extras:     { es:'Gastos personales', en:'Personal expenses', de:'Persönliche Ausgaben', fr:'Dépenses personnelles', it:'Spese personali' },
  actividades:{ es:'Actividades opcionales', en:'Optional activities', de:'Optionale Aktivitäten', fr:'Activités optionnelles', it:'Attività opzionali' },
  gasolina:   { es:'Gasolina', en:'Fuel', de:'Benzin', fr:'Carburant', it:'Carburante' },
  propinas:   { es:'Propinas', en:'Tips', de:'Trinkgeld', fr:'Pourboires', it:'Mance' }
};
