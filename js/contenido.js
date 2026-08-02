// ============================================================
//  VOYARA — Ofertas, guías, opiniones y checklist de equipaje
// ============================================================

// ---------- OFERTAS DE LA SEMANA ----------
// dto = % de descuento sobre el precio normal. Revísalas cada semana.
const OFERTAS = [
  { destino:'bali',       dto:32, motivo:'temporada baja' },
  { destino:'marrakech',  dto:28, motivo:'plazas libres' },
  { destino:'praga',      dto:25, motivo:'vuelos baratos' },
  { destino:'cancun',     dto:22, motivo:'oferta hotel' },
  { destino:'tokio',      dto:18, motivo:'vuelos baratos' },
  { destino:'lisboa',     dto:20, motivo:'fin de semana' }
];

const MOTIVOS = {
  'temporada baja': { es:'Temporada baja', en:'Low season', de:'Nebensaison', fr:'Basse saison', it:'Bassa stagione' },
  'plazas libres':  { es:'Últimas plazas', en:'Last spots', de:'Letzte Plätze', fr:'Dernières places', it:'Ultimi posti' },
  'vuelos baratos': { es:'Vuelos en mínimos', en:'Flights at their lowest', de:'Flüge auf Tiefstand', fr:'Vols au plus bas', it:'Voli ai minimi' },
  'oferta hotel':   { es:'Hotel rebajado', en:'Hotel discounted', de:'Hotel reduziert', fr:'Hôtel remisé', it:'Hotel scontato' },
  'fin de semana':  { es:'Escapada de finde', en:'Weekend break', de:'Wochenendtrip', fr:'Escapade week-end', it:'Fuga nel weekend' }
};

// ---------- GUÍAS Y CONSEJOS ----------
const GUIAS = [
  {
    id:'g_vuelos', icono:'✈️', tono:210,
    t:{ es:'Cómo encontrar vuelos baratos de verdad',
        en:'How to actually find cheap flights',
        de:'So findest du wirklich günstige Flüge',
        fr:'Comment trouver de vrais vols pas chers',
        it:'Come trovare voli davvero economici' },
    r:{ es:'No hay trucos mágicos ni modo incógnito. Hay cuatro cosas que sí funcionan y las llevamos comprobando años.',
        en:'There are no magic tricks or incognito mode. There are four things that do work, and we\'ve been testing them for years.',
        de:'Es gibt keine Zaubertricks und keinen Inkognito-Modus. Vier Dinge funktionieren wirklich — seit Jahren getestet.',
        fr:'Ni astuce magique, ni navigation privée. Quatre choses fonctionnent vraiment, testées depuis des années.',
        it:'Nessun trucco magico né modalità incognito. Ci sono quattro cose che funzionano davvero, testate per anni.' },
    p:[
      { es:'Reserva entre 6 y 10 semanas antes. Para larga distancia, de 3 a 5 meses.',
        en:'Book 6 to 10 weeks ahead. For long haul, 3 to 5 months.',
        de:'Buche 6 bis 10 Wochen vorher. Bei Langstrecke 3 bis 5 Monate.',
        fr:'Réservez 6 à 10 semaines à l\'avance. Pour le long-courrier, 3 à 5 mois.',
        it:'Prenota con 6-10 settimane di anticipo. Sul lungo raggio, 3-5 mesi.' },
      { es:'Vuela martes o miércoles: suele haber entre un 15 % y un 25 % de diferencia con el viernes.',
        en:'Fly Tuesday or Wednesday: usually 15-25 % cheaper than Friday.',
        de:'Fliege dienstags oder mittwochs: meist 15-25 % günstiger als freitags.',
        fr:'Partez mardi ou mercredi : souvent 15 à 25 % moins cher que le vendredi.',
        it:'Vola di martedì o mercoledì: di solito costa il 15-25 % meno del venerdì.' },
      { es:'Mira aeropuertos alternativos. A veces uno a 60 km te ahorra 120 €.',
        en:'Check alternative airports. One 60 km away can save you €120.',
        de:'Prüfe Ausweichflughäfen. 60 km weiter kann 120 € sparen.',
        fr:'Regardez les aéroports alternatifs. Un à 60 km peut économiser 120 €.',
        it:'Controlla gli aeroporti alternativi. Uno a 60 km può farti risparmiare 120 €.' },
      { es:'Pon alertas de precio y espera. El 80 % de las bajadas duran menos de 48 horas.',
        en:'Set price alerts and wait. 80 % of price drops last under 48 hours.',
        de:'Preisalarme setzen und warten. 80 % der Preisstürze halten keine 48 Stunden.',
        fr:'Créez des alertes de prix et attendez. 80 % des baisses durent moins de 48 h.',
        it:'Imposta avvisi di prezzo e aspetta. L\'80 % dei ribassi dura meno di 48 ore.' }
    ]
  },
  {
    id:'g_equipaje', icono:'🧳', tono:35,
    t:{ es:'Viajar solo con equipaje de mano',
        en:'Travelling with hand luggage only',
        de:'Nur mit Handgepäck reisen',
        fr:'Voyager avec un seul bagage cabine',
        it:'Viaggiare solo con il bagaglio a mano' },
    r:{ es:'Ahorras dinero, tiempo en el aeropuerto y el susto de que tu maleta acabe en otro país.',
        en:'You save money, airport time and the fright of your bag ending up in another country.',
        de:'Spart Geld, Zeit am Flughafen und den Schreck, wenn der Koffer im falschen Land landet.',
        fr:'Vous économisez de l\'argent, du temps à l\'aéroport et la peur de voir sa valise ailleurs.',
        it:'Risparmi soldi, tempo in aeroporto e lo spavento della valigia finita altrove.' },
    p:[
      { es:'Enrolla la ropa en vez de doblarla: cabe un 30 % más y se arruga menos.',
        en:'Roll your clothes instead of folding: 30 % more fits and they wrinkle less.',
        de:'Kleidung rollen statt falten: 30 % mehr Platz und weniger Falten.',
        fr:'Roulez vos vêtements : 30 % de place en plus et moins de plis.',
        it:'Arrotola i vestiti invece di piegarli: entra il 30 % in più e si stropicciano meno.' },
      { es:'Tres colores como máximo. Todo combina con todo y llevas la mitad.',
        en:'Three colours max. Everything matches and you pack half as much.',
        de:'Maximal drei Farben. Alles passt zusammen, du packst die Hälfte.',
        fr:'Trois couleurs maximum. Tout s\'assortit, vous emportez moitié moins.',
        it:'Massimo tre colori. Tutto si abbina e porti la metà.' },
      { es:'Lo más pesado, puesto: las botas y la chaqueta van encima, no dentro.',
        en:'Wear the heavy stuff: boots and jacket go on you, not in the bag.',
        de:'Das Schwerste anziehen: Stiefel und Jacke am Körper, nicht im Koffer.',
        fr:'Portez le plus lourd : bottes et veste sur vous, pas dans le sac.',
        it:'Indossa le cose pesanti: scarponi e giacca addosso, non in valigia.' },
      { es:'Líquidos en formato sólido: champú en pastilla y pasta de dientes en tableta pasan sin problema.',
        en:'Solid toiletries: shampoo bars and toothpaste tablets sail through security.',
        de:'Feste Kosmetik: Haarseife und Zahnputztabletten kommen problemlos durch.',
        fr:'Cosmétiques solides : shampoing solide et dentifrice en pastilles passent sans souci.',
        it:'Cosmetici solidi: shampoo in saponetta e dentifricio in pastiglie passano senza problemi.' }
    ]
  },
  {
    id:'g_seguro', icono:'🛡️', tono:150,
    t:{ es:'Seguro de viaje: cuándo hace falta de verdad',
        en:'Travel insurance: when you really need it',
        de:'Reiseversicherung: wann sie wirklich nötig ist',
        fr:'Assurance voyage : quand elle est vraiment utile',
        it:'Assicurazione di viaggio: quando serve davvero' },
    r:{ es:'Ni siempre ni nunca. Depende de a dónde vas y de lo que ya llevas cubierto sin saberlo.',
        en:'Not always, not never. It depends where you go and what you\'re already covered for without knowing.',
        de:'Weder immer noch nie. Es hängt vom Ziel ab — und davon, was ohnehin schon gedeckt ist.',
        fr:'Ni toujours ni jamais. Cela dépend de la destination et de ce que vous couvrez déjà sans le savoir.',
        it:'Né sempre né mai. Dipende da dove vai e da cosa sei già coperto senza saperlo.' },
    p:[
      { es:'Dentro de la UE, la Tarjeta Sanitaria Europea cubre lo urgente. Pídela, es gratis.',
        en:'Within the EU, the European Health Card covers emergencies. Get one, it\'s free.',
        de:'In der EU deckt die Europäische Krankenversicherungskarte Notfälle. Beantrage sie, kostenlos.',
        fr:'Dans l\'UE, la carte européenne d\'assurance maladie couvre l\'urgence. Elle est gratuite.',
        it:'Nell\'UE la Tessera Sanitaria Europea copre le urgenze. Richiedila, è gratis.' },
      { es:'En EE.UU., una noche de hospital ronda los 4.000 $. Ahí el seguro no es opcional.',
        en:'In the US, one night in hospital is around $4,000. There, insurance is not optional.',
        de:'In den USA kostet eine Nacht im Krankenhaus rund 4.000 $. Dort ist Versicherung Pflicht.',
        fr:'Aux États-Unis, une nuit d\'hôpital coûte environ 4 000 $. L\'assurance n\'y est pas optionnelle.',
        it:'Negli USA una notte in ospedale costa circa 4.000 $. Lì l\'assicurazione non è opzionale.' },
      { es:'Mira tu tarjeta de crédito: muchas premium ya incluyen seguro si pagas el viaje con ella.',
        en:'Check your credit card: many premium ones include cover if you paid the trip with it.',
        de:'Prüfe deine Kreditkarte: viele Premiumkarten versichern, wenn du damit bezahlst.',
        fr:'Vérifiez votre carte de crédit : beaucoup de cartes premium assurent si vous payez avec.',
        it:'Controlla la carta di credito: molte premium includono la copertura se paghi il viaggio con essa.' },
      { es:'Lo caro no es la cancelación, es la repatriación. Mira ese límite antes que el precio.',
        en:'The expensive part isn\'t cancellation, it\'s repatriation. Check that limit before the price.',
        de:'Teuer ist nicht die Stornierung, sondern der Rücktransport. Prüfe dieses Limit zuerst.',
        fr:'Le coûteux n\'est pas l\'annulation mais le rapatriement. Vérifiez ce plafond avant le prix.',
        it:'La voce cara non è l\'annullamento ma il rimpatrio. Guarda quel massimale prima del prezzo.' }
    ]
  },
  {
    id:'g_primera', icono:'🌍', tono:280,
    t:{ es:'Tu primer viaje largo, sin agobios',
        en:'Your first long trip, stress-free',
        de:'Deine erste lange Reise, ohne Stress',
        fr:'Votre premier grand voyage, sans stress',
        it:'Il tuo primo viaggio lungo, senza stress' },
    r:{ es:'La diferencia entre disfrutarlo y sufrirlo casi nunca es el dinero: es la preparación.',
        en:'The difference between enjoying it and suffering it is rarely money: it\'s preparation.',
        de:'Der Unterschied zwischen Genuss und Stress ist selten Geld — es ist Vorbereitung.',
        fr:'La différence entre plaisir et galère, ce n\'est presque jamais l\'argent : c\'est la préparation.',
        it:'La differenza tra godersela e soffrirla non è quasi mai il denaro: è la preparazione.' },
    p:[
      { es:'Comprueba el pasaporte hoy: muchos países exigen 6 meses de validez al entrar.',
        en:'Check your passport today: many countries require 6 months\' validity on entry.',
        de:'Prüfe heute deinen Pass: viele Länder verlangen 6 Monate Restgültigkeit.',
        fr:'Vérifiez votre passeport aujourd\'hui : beaucoup de pays exigent 6 mois de validité.',
        it:'Controlla oggi il passaporto: molti paesi richiedono 6 mesi di validità all\'ingresso.' },
      { es:'Copia digital de todo: pasaporte, reservas y seguro en tu correo y en el móvil.',
        en:'Digital copies of everything: passport, bookings and insurance in your email and phone.',
        de:'Digitale Kopien von allem: Pass, Buchungen und Versicherung per Mail und im Handy.',
        fr:'Copies numériques de tout : passeport, réservations et assurance dans votre mail et mobile.',
        it:'Copie digitali di tutto: passaporto, prenotazioni e assicurazione via mail e sul telefono.' },
      { es:'No planifiques cada hora. Deja un día libre por semana; lo agradecerás.',
        en:'Don\'t plan every hour. Leave one free day per week; you\'ll thank yourself.',
        de:'Plane nicht jede Stunde. Lass pro Woche einen freien Tag — du wirst es dir danken.',
        fr:'Ne planifiez pas chaque heure. Gardez un jour libre par semaine, vous me remercierez.',
        it:'Non pianificare ogni ora. Lascia un giorno libero a settimana: ti ringrazierai.' },
      { es:'Lleva efectivo local del primer día. El cajero del aeropuerto siempre es el peor cambio.',
        en:'Carry local cash for day one. The airport ATM always has the worst rate.',
        de:'Bargeld für den ersten Tag mitnehmen. Der Flughafen-Automat hat den schlechtesten Kurs.',
        fr:'Emportez des espèces pour le premier jour. Le distributeur de l\'aéroport a le pire taux.',
        it:'Porta contanti per il primo giorno. Il bancomat in aeroporto ha sempre il cambio peggiore.' }
    ]
  }
];

// ---------- OPINIONES ----------
const OPINIONES = [
  { n:'Laura M.', d:'roma', e:5,
    t:{ es:'Encontré el vuelo 90 € más barato que en la web donde siempre miro. Tardé dos minutos.',
        en:'Found the flight €90 cheaper than on the site I always use. Took me two minutes.',
        de:'Flug 90 € günstiger als auf meiner Stammseite. Hat zwei Minuten gedauert.',
        fr:'Vol trouvé 90 € moins cher que sur mon site habituel. En deux minutes.',
        it:'Volo trovato 90 € in meno del sito che uso sempre. In due minuti.' } },
  { n:'Marc D.', d:'bali', e:5,
    t:{ es:'El itinerario de Bali nos sirvió tal cual. Reservamos por partes y salió mucho más barato.',
        en:'The Bali itinerary worked exactly as it was. We booked it in parts and paid much less.',
        de:'Die Bali-Route haben wir 1:1 übernommen. In Teilen gebucht und viel gespart.',
        fr:'L\'itinéraire de Bali nous a servi tel quel. Réservé par étapes, bien moins cher.',
        it:'L\'itinerario di Bali ci è servito così com\'era. Prenotato a tappe e speso molto meno.' } },
  { n:'Sofia R.', d:'tokio', e:5,
    t:{ es:'La calculadora de presupuesto clavó lo que nos gastamos en Japón. Impresionante.',
        en:'The budget calculator nailed what we spent in Japan. Impressive.',
        de:'Der Budgetrechner traf unsere Japan-Ausgaben genau. Beeindruckend.',
        fr:'Le calculateur de budget a deviné nos dépenses au Japon. Impressionnant.',
        it:'Il calcolatore di budget ha azzeccato quanto abbiamo speso in Giappone. Notevole.' } },
  { n:'Thomas K.', d:'islandia', e:4,
    t:{ es:'Muy útil para comparar sin abrir mil pestañas. Echo en falta más destinos del norte.',
        en:'Very handy to compare without opening a thousand tabs. I\'d like more northern destinations.',
        de:'Sehr praktisch zum Vergleichen ohne tausend Tabs. Mehr Ziele im Norden wären schön.',
        fr:'Très pratique pour comparer sans ouvrir mille onglets. J\'aimerais plus de destinations nordiques.',
        it:'Utilissimo per confrontare senza aprire mille schede. Vorrei più destinazioni del nord.' } },
  { n:'Elena P.', d:'marrakech', e:5,
    t:{ es:'Nos avisaron de una bajada de precio y reservamos ese mismo día. 180 € menos entre los dos.',
        en:'They warned us about a price drop and we booked that same day. €180 less for the two of us.',
        de:'Sie meldeten einen Preissturz, wir buchten am selben Tag. 180 € weniger zu zweit.',
        fr:'Ils nous ont signalé une baisse et on a réservé le jour même. 180 € de moins à deux.',
        it:'Ci hanno avvisati di un calo e abbiamo prenotato lo stesso giorno. 180 € in meno in due.' } },
  { n:'Andrea B.', d:'cancun', e:5,
    t:{ es:'Lo que más valoro: te dicen claramente que ganan comisión. Eso da confianza.',
        en:'What I value most: they clearly say they earn a commission. That builds trust.',
        de:'Was ich am meisten schätze: Sie sagen offen, dass sie Provision bekommen. Das schafft Vertrauen.',
        fr:'Ce que j\'apprécie le plus : ils disent clairement qu\'ils touchent une commission. Ça inspire confiance.',
        it:'Quello che apprezzo di più: dicono chiaramente che guadagnano una commissione. Dà fiducia.' } }
];

// ---------- CHECKLIST DE EQUIPAJE ----------
const EQUIPAJE = {
  doc: ['pasaporte','visado','seguro','tarjetas','efectivo','reservas'],
  ropa: ['camisetas','pantalones','ropa_interior','calzado','abrigo','banador'],
  higiene:['cepillo','desodorante','gel','protector','toallitas'],
  tec: ['movil','cargador','adaptador','bateria','auriculares'],
  salud:['medicinas','tiritas','repelente','mascarilla']
};

const EQ_TXT = {
  pasaporte:  { es:'Pasaporte / DNI', en:'Passport / ID', de:'Reisepass / Ausweis', fr:'Passeport / carte d\'identité', it:'Passaporto / carta d\'identità' },
  visado:     { es:'Visado o autorización', en:'Visa or travel authorisation', de:'Visum oder Einreisegenehmigung', fr:'Visa ou autorisation', it:'Visto o autorizzazione' },
  seguro:     { es:'Póliza del seguro', en:'Insurance policy', de:'Versicherungspolice', fr:'Police d\'assurance', it:'Polizza assicurativa' },
  tarjetas:   { es:'Tarjetas de pago', en:'Payment cards', de:'Zahlungskarten', fr:'Cartes de paiement', it:'Carte di pagamento' },
  efectivo:   { es:'Algo de efectivo local', en:'Some local cash', de:'Etwas Bargeld vor Ort', fr:'Un peu d\'espèces locales', it:'Un po\' di contanti locali' },
  reservas:   { es:'Reservas impresas o en el móvil', en:'Bookings printed or on your phone', de:'Buchungen ausgedruckt oder im Handy', fr:'Réservations imprimées ou sur mobile', it:'Prenotazioni stampate o sul telefono' },
  camisetas:  { es:'Camisetas', en:'T-shirts', de:'T-Shirts', fr:'T-shirts', it:'Magliette' },
  pantalones: { es:'Pantalones', en:'Trousers', de:'Hosen', fr:'Pantalons', it:'Pantaloni' },
  ropa_interior:{ es:'Ropa interior y calcetines', en:'Underwear and socks', de:'Unterwäsche und Socken', fr:'Sous-vêtements et chaussettes', it:'Intimo e calzini' },
  calzado:    { es:'Calzado cómodo', en:'Comfortable shoes', de:'Bequeme Schuhe', fr:'Chaussures confortables', it:'Scarpe comode' },
  abrigo:     { es:'Chaqueta o abrigo', en:'Jacket or coat', de:'Jacke oder Mantel', fr:'Veste ou manteau', it:'Giacca o cappotto' },
  banador:    { es:'Bañador', en:'Swimwear', de:'Badesachen', fr:'Maillot de bain', it:'Costume da bagno' },
  cepillo:    { es:'Cepillo y pasta de dientes', en:'Toothbrush and toothpaste', de:'Zahnbürste und Zahnpasta', fr:'Brosse à dents et dentifrice', it:'Spazzolino e dentifricio' },
  desodorante:{ es:'Desodorante', en:'Deodorant', de:'Deo', fr:'Déodorant', it:'Deodorante' },
  gel:        { es:'Gel y champú', en:'Shower gel and shampoo', de:'Duschgel und Shampoo', fr:'Gel douche et shampoing', it:'Bagnoschiuma e shampoo' },
  protector:  { es:'Protector solar', en:'Sunscreen', de:'Sonnencreme', fr:'Crème solaire', it:'Crema solare' },
  toallitas:  { es:'Toallitas', en:'Wet wipes', de:'Feuchttücher', fr:'Lingettes', it:'Salviettine' },
  movil:      { es:'Móvil', en:'Phone', de:'Handy', fr:'Téléphone', it:'Telefono' },
  cargador:   { es:'Cargador', en:'Charger', de:'Ladegerät', fr:'Chargeur', it:'Caricabatterie' },
  adaptador:  { es:'Adaptador de enchufe', en:'Plug adapter', de:'Steckdosenadapter', fr:'Adaptateur de prise', it:'Adattatore di presa' },
  bateria:    { es:'Batería externa', en:'Power bank', de:'Powerbank', fr:'Batterie externe', it:'Powerbank' },
  auriculares:{ es:'Auriculares', en:'Headphones', de:'Kopfhörer', fr:'Écouteurs', it:'Cuffie' },
  medicinas:  { es:'Medicación habitual', en:'Regular medication', de:'Regelmäßige Medikamente', fr:'Médicaments habituels', it:'Medicine abituali' },
  tiritas:    { es:'Tiritas y analgésico', en:'Plasters and painkillers', de:'Pflaster und Schmerzmittel', fr:'Pansements et antalgique', it:'Cerotti e antidolorifico' },
  repelente:  { es:'Repelente de mosquitos', en:'Insect repellent', de:'Mückenschutz', fr:'Anti-moustiques', it:'Repellente per zanzare' },
  mascarilla: { es:'Mascarillas', en:'Face masks', de:'Masken', fr:'Masques', it:'Mascherine' }
};
