export interface AttractionEntry {
  id: number
  name: string
  description: string
  distance: string
  image: string
  lat: number
  lng: number
}

const sr: AttractionEntry[] = [
  {
    id: 0,
    name: 'Сокобања',
    description: 'Сокобања је једна од најпознатијих и најпосећенијих бања у Србији, чувена по својим лековитим термалним изворима и чистој природи. Идеално је место за релаксацију, лечење респираторних проблема и уживање у велнес третманима. Поред тога, нуди бројне стазе за шетњу и планинарење.',
    distance: '15 km',
    image: '/images/attractions/Soko banja.jpeg',
    lat: 43.641565127341906,
    lng: 21.882190601581627,
  },
  {
    id: 1,
    name: 'Ртањ',
    description: 'Планина Ртањ је права мистерија природе, позната по свом готово савршеном пирамидалном облику. Сматра се местом са посебном енергијом, а њен врх Шиљак је изазов за планинаре. Ртањ је такође познат по ендемској биљци, ртањском чају, који има бројна лековита својства.',
    distance: '30 km',
    image: '/images/attractions/Rtanj sa 20km daljine.jpeg',
    lat: 43.7760920245904,
    lng: 21.893234963295363,
  },
  {
    id: 2,
    name: 'Извор реке Моравице',
    description: 'Извор реке Моравице је скривени драгуљ природе, смештен у подножју планине Девице. Ово живописно место са кристално чистом водом и бујном вегетацијом је идеално за излете, пикнике и уживање у нетакнутој природи. Шетња до извора је право освежење за душу и тело.',
    distance: '20 km',
    image: '/images/attractions/Moravica.jpg',
    lat: 43.629977718036045,
    lng: 21.991947561377742,
  },
  {
    id: 3,
    name: 'Сокоград',
    description: 'Сокоград је импресивно средњовековно утврђење, смештено на стени изнад кањона реке Моравице. Са његових зидина пружа се спектакуларан поглед на околину. Посета Сокограду је као путовање кроз време, које ће вас упознати са богатом историјом овог краја.',
    distance: '18 km',
    image: '/images/attractions/Soko Grad .jpeg',
    lat: 43.634760339796934,
    lng: 21.8932035586355,
  },
  {
    id: 4,
    name: 'Врмџанско језеро',
    description: 'Врмџанско језеро је мало, али прелепо карстно језеро у близини села Врмџа. Окружено је зеленилом и идеално је место за пикник, риболов и одмор у природи. У близини се налази и Врмџански град, још једно занимљиво место за истраживање.',
    distance: '6 km',
    image: '/images/attractions/Врмџанско_језеро.jpg',
    lat: 43.74209131879247,
    lng: 21.826366875382313,
  },
  {
    id: 5,
    name: 'Аква парк Јагодина',
    description: 'Ако тражите забаву за целу породицу, Аква парк у Јагодини је прави избор. Са бројним тобоганима, базенима и другим атракцијама, гарантује незабораван дан пун смеха и адреналина. У склопу комплекса се налази и Музеј воштаних фигура и зоолошки врт.',
    distance: '60-70 km',
    image: '/images/attractions/Аква парк Јагодина.jpg',
    lat: 43.977,
    lng: 21.27,
  },
  {
    id: 6,
    name: 'Логор Црвени Крст',
    description: 'Логор Црвени Крст у Нишу је један од најозлоглашенијих нацистичких концентрационих логора у Другом светском рату. Данас је то меморијални музеј који сведочи о страдању и херојству затвореника. Посета овом месту је потресно, али важно историјско искуство.',
    distance: '55 km',
    image: '/images/attractions/Логор Црвени Крст.jpg',
    lat: 43.325,
    lng: 21.8958,
  },
  {
    id: 7,
    name: 'Спомен-парк Бубањ',
    description: 'Спомен-парк Бубањ је монументални меморијални комплекс посвећен жртвама стрељаним у Другом светском рату. Три песнице симболизују отпор и непокорност. Ово је место за размишљање и одавање почасти жртвама фашизма.',
    distance: '55 km',
    image: '/images/attractions/Спомен-парк Бубањ.jpg',
    lat: 43.305,
    lng: 21.8736,
  },
  {
    id: 8,
    name: 'Медијана',
    description: 'Медијана је значајно археолошко налазиште из римског доба, које се налази у близини Ниша. Била је луксузно предграђе античког Наиса и родно место цара Константина Великог. Овде можете видети остатке царске виле, мозаике и друге артефакте.',
    distance: '55 km',
    image: '/images/attractions/Медијана.jpg',
    lat: 43.305,
    lng: 21.945,
  },
  {
    id: 9,
    name: 'Споменик на Чегру',
    description: 'Споменик на Чегру је подигнут у част јунацима из Првог српског устанка и чувеној бици на Чегру. Посебно се истиче кула од лобања, која је симбол српске храбрости и жртве. Ово је место од великог историјског значаја за српски народ.',
    distance: '55 km',
    image: '/images/attractions/Споменик на Чегру.jpg',
    lat: 43.3667,
    lng: 21.95,
  },
  {
    id: 10,
    name: 'Црква Светог Романа',
    description: 'Манастир Светог Романа је један од најстаријих манастира у Србији, смештен у живописном окружењу. Познат је по својој лековитој води и моштима Светог Романа. Ово је место мира и духовности, идеално за све који траже утеху и благослов.',
    distance: '10-15 km',
    image: '/images/attractions/Црква Светог Романа.jpg',
    lat: 43.6,
    lng: 21.65,
  },
]

const en: AttractionEntry[] = [
  { id: 0, name: 'Sokobanja', description: 'Sokobanja is one of the most famous and most visited spas in Serbia, renowned for its healing thermal springs and clean nature. It is an ideal place for relaxation, treatment of respiratory problems, and enjoying wellness treatments. In addition, it offers numerous trails for walking and hiking.', distance: '15 km', image: '/images/attractions/Soko banja.jpeg', lat: 43.641565127341906, lng: 21.882190601581627 },
  { id: 1, name: 'Rtanj', description: 'Mount Rtanj is a true mystery of nature, known for its almost perfect pyramidal shape. It is considered a place with special energy, and its peak, Šiljak, is a challenge for mountaineers. Rtanj is also known for its endemic plant, Rtanj tea, which has numerous medicinal properties.', distance: '30 km', image: '/images/attractions/Rtanj sa 20km daljine.jpeg', lat: 43.7760920245904, lng: 21.893234963295363 },
  { id: 2, name: 'Moravica River Spring', description: 'The spring of the Moravica River is a hidden gem of nature, located at the foot of Mount Devica. This picturesque place with crystal clear water and lush vegetation is ideal for excursions, picnics, and enjoying untouched nature. A walk to the spring is a real refreshment for the soul and body.', distance: '20 km', image: '/images/attractions/Moravica.jpg', lat: 43.629977718036045, lng: 21.991947561377742 },
  { id: 3, name: 'Sokograd', description: 'Sokograd is an impressive medieval fortress, located on a rock above the canyon of the Moravica River. Its walls offer a spectacular view of the surroundings. A visit to Sokograd is like a journey through time, which will acquaint you with the rich history of this region.', distance: '18 km', image: '/images/attractions/Soko Grad .jpeg', lat: 43.634760339796934, lng: 21.8932035586355 },
  { id: 4, name: 'Vrmdža Lake', description: 'Vrmdža Lake is a small but beautiful karst lake near the village of Vrmdža. It is surrounded by greenery and is an ideal place for a picnic, fishing, and relaxing in nature. Nearby is the Vrmdža town, another interesting place to explore.', distance: '6 km', image: '/images/attractions/Врмџанско_језеро.jpg', lat: 43.74209131879247, lng: 21.826366875382313 },
  { id: 5, name: 'Jagodina Aqua Park', description: 'If you are looking for fun for the whole family, the Aqua Park in Jagodina is the right choice. With numerous water slides, pools, and other attractions, it guarantees an unforgettable day full of laughter and adrenaline. The complex also includes a Wax Museum and a zoo.', distance: '60-70 km', image: '/images/attractions/Аква парк Јагодина.jpg', lat: 43.977, lng: 21.27 },
  { id: 6, name: 'Red Cross Concentration Camp', description: 'The Red Cross concentration camp in Niš is one of the most notorious Nazi concentration camps of World War II. Today it is a memorial museum that testifies to the suffering and heroism of the prisoners. A visit to this place is a harrowing but important historical experience.', distance: '55 km', image: '/images/attractions/Логор Црвени Крст.jpg', lat: 43.325, lng: 21.8958 },
  { id: 7, name: 'Bubanj Memorial Park', description: 'Bubanj Memorial Park is a monumental memorial complex dedicated to the victims shot during World War II. The three fists symbolize resistance and defiance. This is a place for reflection and paying tribute to the victims of fascism.', distance: '55 km', image: '/images/attractions/Спомен-парк Бубањ.jpg', lat: 43.305, lng: 21.8736 },
  { id: 8, name: 'Mediana', description: 'Mediana is a significant archaeological site from the Roman era, located near Niš. It was a luxurious suburb of ancient Naissus and the birthplace of Emperor Constantine the Great. Here you can see the remains of the imperial villa, mosaics, and other artifacts.', distance: '55 km', image: '/images/attractions/Медијана.jpg', lat: 43.305, lng: 21.945 },
  { id: 9, name: 'Čegar Monument', description: 'The Čegar Monument was erected in honor of the heroes of the First Serbian Uprising and the famous Battle of Čegar. The skull tower, a symbol of Serbian courage and sacrifice, is particularly noteworthy. This is a place of great historical importance for the Serbian people.', distance: '55 km', image: '/images/attractions/Споменик на Чегру.jpg', lat: 43.3667, lng: 21.95 },
  { id: 10, name: 'St. Roman Church', description: 'The Monastery of St. Roman is one of the oldest monasteries in Serbia, located in a picturesque setting. It is known for its healing water and the relics of St. Roman. This is a place of peace and spirituality, ideal for all who seek comfort and blessing.', distance: '10-15 km', image: '/images/attractions/Црква Светог Романа.jpg', lat: 43.6, lng: 21.65 },
]

const de: AttractionEntry[] = [
  { id: 0, name: 'Sokobanja', description: 'Sokobanja ist einer der bekanntesten und meistbesuchten Kurorte in Serbien, berühmt für seine heilenden Thermalquellen und die saubere Natur. Es ist ein idealer Ort zur Entspannung, zur Behandlung von Atemwegsproblemen und zum Genießen von Wellnessanwendungen. Darüber hinaus bietet es zahlreiche Wander- und Spazierwege.', distance: '15 km', image: '/images/attractions/Soko banja.jpeg', lat: 43.641565127341906, lng: 21.882190601581627 },
  { id: 1, name: 'Rtanj', description: 'Der Berg Rtanj ist ein wahres Naturgeheimnis, bekannt für seine fast perfekte Pyramidenform. Er gilt als ein Ort mit besonderer Energie, und sein Gipfel, Šiljak, ist eine Herausforderung für Bergsteiger. Rtanj ist auch für seine endemische Pflanze, den Rtanj-Tee, bekannt, der zahlreiche heilende Eigenschaften hat.', distance: '30 km', image: '/images/attractions/Rtanj sa 20km daljine.jpeg', lat: 43.7760920245904, lng: 21.893234963295363 },
  { id: 2, name: 'Quelle des Flusses Moravica', description: 'Die Quelle des Flusses Moravica ist ein verborgenes Juwel der Natur am Fuße des Berges Devica. Dieser malerische Ort mit kristallklarem Wasser und üppiger Vegetation ist ideal für Ausflüge, Picknicks und zum Genießen der unberührten Natur. Ein Spaziergang zur Quelle ist eine wahre Erfrischung für Körper und Seele.', distance: '20 km', image: '/images/attractions/Moravica.jpg', lat: 43.629977718036045, lng: 21.991947561377742 },
  { id: 3, name: 'Sokograd', description: 'Sokograd ist eine beeindruckende mittelalterliche Festung auf einem Felsen über der Schlucht des Flusses Moravica. Von seinen Mauern aus bietet sich ein spektakulärer Blick auf die Umgebung. Ein Besuch in Sokograd ist wie eine Zeitreise, die Sie mit der reichen Geschichte dieser Region vertraut macht.', distance: '18 km', image: '/images/attractions/Soko Grad .jpeg', lat: 43.634760339796934, lng: 21.8932035586355 },
  { id: 4, name: 'Vrmdža-See', description: 'Der Vrmdža-See ist ein kleiner, aber wunderschöner Karstsee in der Nähe des Dorfes Vrmdža. Er ist von Grün umgeben und ein idealer Ort für ein Picknick, zum Angeln und zum Entspannen in der Natur. In der Nähe befindet sich auch die Stadt Vrmdža, ein weiterer interessanter Ort zum Erkunden.', distance: '6 km', image: '/images/attractions/Врмџанско_језеро.jpg', lat: 43.74209131879247, lng: 21.826366875382313 },
  { id: 5, name: 'Aqua Park Jagodina', description: 'Wenn Sie Spaß für die ganze Familie suchen, ist der Aqua Park in Jagodina die richtige Wahl. Mit zahlreichen Wasserrutschen, Pools und anderen Attraktionen garantiert er einen unvergesslichen Tag voller Lachen und Adrenalin. Der Komplex umfasst auch ein Wachsfigurenkabinett und einen Zoo.', distance: '60-70 km', image: '/images/attractions/Аква парк Јагодина.jpg', lat: 43.977, lng: 21.27 },
  { id: 6, name: 'KZ Rotes Kreuz', description: 'Das Konzentrationslager Rotes Kreuz in Niš ist eines der berüchtigtsten Konzentrationslager der Nazis im Zweiten Weltkrieg. Heute ist es ein Gedenkmuseum, das vom Leiden und Heldentum der Gefangenen zeugt. Ein Besuch an diesem Ort ist eine erschütternde, aber wichtige historische Erfahrung.', distance: '55 km', image: '/images/attractions/Логор Црвени Крст.jpg', lat: 43.325, lng: 21.8958 },
  { id: 7, name: 'Gedenkpark Bubanj', description: 'Der Gedenkpark Bubanj ist ein monumentaler Gedenkkomplex, der den im Zweiten Weltkrieg erschossenen Opfern gewidmet ist. Die drei Fäuste symbolisieren Widerstand und Trotz. Dies ist ein Ort des Nachdenkens und des Gedenkens an die Opfer des Faschismus.', distance: '55 km', image: '/images/attractions/Спомен-парк Бубањ.jpg', lat: 43.305, lng: 21.8736 },
  { id: 8, name: 'Mediana', description: 'Mediana ist eine bedeutende archäologische Stätte aus der Römerzeit in der Nähe von Niš. Es war ein luxuriöser Vorort des antiken Naissus und der Geburtsort von Kaiser Konstantin dem Großen. Hier können Sie die Überreste der Kaiservilla, Mosaike und andere Artefakte sehen.', distance: '55 km', image: '/images/attractions/Медијана.jpg', lat: 43.305, lng: 21.945 },
  { id: 9, name: 'Čegar-Denkmal', description: 'Das Čegar-Denkmal wurde zu Ehren der Helden des Ersten Serbischen Aufstands und der berühmten Schlacht von Čegar errichtet. Besonders bemerkenswert ist der Schädelturm, ein Symbol für serbischen Mut und Opferbereitschaft. Dies ist ein Ort von großer historischer Bedeutung für das serbische Volk.', distance: '55 km', image: '/images/attractions/Споменик на Чегру.jpg', lat: 43.3667, lng: 21.95 },
  { id: 10, name: 'Kirche des Heiligen Roman', description: 'Das Kloster des Heiligen Roman ist eines der ältesten Klöster in Serbien und liegt in einer malerischen Umgebung. Es ist bekannt für sein Heilwasser und die Reliquien des Heiligen Roman. Dies ist ein Ort des Friedens und der Spiritualität, ideal für alle, die Trost und Segen suchen.', distance: '10-15 km', image: '/images/attractions/Црква Светог Романа.jpg', lat: 43.6, lng: 21.65 },
]

const it: AttractionEntry[] = [
  { id: 0, name: 'Sokobanja', description: 'Sokobanja è una delle terme più famose e visitate della Serbia, rinomata per le sue sorgenti termali curative e la natura pulita. È un luogo ideale per il relax, il trattamento dei problemi respiratori e per godere di trattamenti benessere. Inoltre, offre numerosi sentieri per passeggiate ed escursioni.', distance: '15 km', image: '/images/attractions/Soko banja.jpeg', lat: 43.641565127341906, lng: 21.882190601581627 },
  { id: 1, name: 'Rtanj', description: 'Il monte Rtanj è un vero mistero della natura, noto per la sua forma quasi perfettamente piramidale. È considerato un luogo con un\'energia speciale e la sua cima, Šiljak, è una sfida per gli alpinisti. Rtanj è anche noto per la sua pianta endemica, il tè di Rtanj, che ha numerose proprietà medicinali.', distance: '30 km', image: '/images/attractions/Rtanj sa 20km daljine.jpeg', lat: 43.7760920245904, lng: 21.893234963295363 },
  { id: 2, name: 'Sorgente del fiume Moravica', description: 'La sorgente del fiume Moravica è una gemma nascosta della natura, situata ai piedi del monte Devica. Questo luogo pittoresco con acqua cristallina e vegetazione lussureggiante è ideale per escursioni, picnic e per godersi la natura incontaminata. Una passeggiata fino alla sorgente è un vero ristoro per l\'anima e il corpo.', distance: '20 km', image: '/images/attractions/Moravica.jpg', lat: 43.629977718036045, lng: 21.991947561377742 },
  { id: 3, name: 'Sokograd', description: 'Sokograd è un\'imponente fortezza medievale, situata su una roccia sopra il canyon del fiume Moravica. Dalle sue mura si gode di una vista spettacolare sui dintorni. Una visita a Sokograd è come un viaggio nel tempo, che vi farà conoscere la ricca storia di questa regione.', distance: '18 km', image: '/images/attractions/Soko Grad .jpeg', lat: 43.634760339796934, lng: 21.8932035586355 },
  { id: 4, name: 'Lago di Vrmdža', description: 'Il lago di Vrmdža è un piccolo ma bellissimo lago carsico vicino al villaggio di Vrmdža. È circondato dal verde ed è un luogo ideale per un picnic, per la pesca e per rilassarsi nella natura. Nelle vicinanze si trova anche la città di Vrmdža, un altro luogo interessante da esplorare.', distance: '6 km', image: '/images/attractions/Врмџанско_језеро.jpg', lat: 43.74209131879247, lng: 21.826366875382313 },
  { id: 5, name: 'Aqua Park di Jagodina', description: 'Se cercate divertimento per tutta la famiglia, l\'Aqua Park di Jagodina è la scelta giusta. Con numerosi scivoli d\'acqua, piscine e altre attrazioni, garantisce una giornata indimenticabile piena di risate e adrenalina. Il complesso comprende anche un Museo delle Cere e uno zoo.', distance: '60-70 km', image: '/images/attractions/Аква парк Јагодина.jpg', lat: 43.977, lng: 21.27 },
  { id: 6, name: 'Campo di concentramento della Croce Rossa', description: 'Il campo di concentramento della Croce Rossa a Niš è uno dei più famigerati campi di concentramento nazisti della Seconda Guerra Mondiale. Oggi è un museo commemorativo che testimonia la sofferenza e l\'eroismo dei prigionieri. Una visita a questo luogo è un\'esperienza straziante ma importante dal punto di vista storico.', distance: '55 km', image: '/images/attractions/Логор Црвени Крст.jpg', lat: 43.325, lng: 21.8958 },
  { id: 7, name: 'Parco commemorativo di Bubanj', description: 'Il Parco commemorativo di Bubanj è un monumentale complesso commemorativo dedicato alle vittime fucilate durante la Seconda Guerra Mondiale. I tre pugni simboleggiano la resistenza e la sfida. Questo è un luogo di riflessione e di omaggio alle vittime del fascismo.', distance: '55 km', image: '/images/attractions/Спомен-парк Бубањ.jpg', lat: 43.305, lng: 21.8736 },
  { id: 8, name: 'Mediana', description: 'Mediana è un importante sito archeologico di epoca romana, situato vicino a Niš. Era un lussuoso sobborgo dell\'antica Naissus e il luogo di nascita dell\'imperatore Costantino il Grande. Qui si possono vedere i resti della villa imperiale, mosaici e altri reperti.', distance: '55 km', image: '/images/attractions/Медијана.jpg', lat: 43.305, lng: 21.945 },
  { id: 9, name: 'Monumento di Čegar', description: 'Il Monumento di Čegar è stato eretto in onore degli eroi della Prima Rivolta Serba e della famosa Battaglia di Čegar. Particolarmente degna di nota è la torre dei teschi, simbolo del coraggio e del sacrificio serbo. Questo è un luogo di grande importanza storica per il popolo serbo.', distance: '55 km', image: '/images/attractions/Споменик на Чегру.jpg', lat: 43.3667, lng: 21.95 },
  { id: 10, name: 'Chiesa di San Romano', description: 'Il Monastero di San Romano è uno dei più antichi monasteri della Serbia, situato in un ambiente pittoresco. È noto per la sua acqua curativa e le reliquie di San Romano. Questo è un luogo di pace e spiritualità, ideale per tutti coloro che cercano conforto e benedizione.', distance: '10-15 km', image: '/images/attractions/Црква Светог Романа.jpg', lat: 43.6, lng: 21.65 },
]

export const STATIC_ATTRACTIONS: Record<string, AttractionEntry[]> = { sr, en, de, it }
