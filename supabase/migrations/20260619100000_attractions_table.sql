-- =============================================================================
-- Migration: 20260619100000_attractions_table.sql
-- Purpose:   Create 'attractions' table, enable RLS, seed 11 attractions (sr/en/de/it)
--            Replaces static src/data/attractions.ts + JSONB content table pattern.
-- =============================================================================

-- ============================================================
-- 1. TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attractions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          jsonb       NOT NULL,       -- {"sr":"...","en":"...","de":"...","it":"..."}
  description   jsonb,                      -- {"sr":"...","en":"...","de":"...","it":"..."}
  distance      text,                       -- e.g. "15 km"
  image         text,                       -- relative URL or Cloudinary path
  latitude      numeric,
  longitude     numeric,
  display_order int         NOT NULL DEFAULT 0,
  is_visible    boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attractions_display_order ON public.attractions (display_order);
CREATE INDEX IF NOT EXISTS idx_attractions_is_visible    ON public.attractions (is_visible);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attractions_updated_at ON public.attractions;
CREATE TRIGGER trg_attractions_updated_at
  BEFORE UPDATE ON public.attractions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated): SELECT only visible rows
DROP POLICY IF EXISTS "attractions_select_visible" ON public.attractions;
CREATE POLICY "attractions_select_visible"
  ON public.attractions
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Service role: full access (admin CRUD via supabaseAdmin client)
DROP POLICY IF EXISTS "attractions_service_role_all" ON public.attractions;
CREATE POLICY "attractions_service_role_all"
  ON public.attractions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. SEED DATA  (11 attractions × 4 languages)
--    Dollar-quoting ($a$...$a$) avoids escaping issues with
--    Cyrillic text, apostrophes, and special chars.
-- ============================================================

-- Attraction 0: Sokobanja / Сокобања
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Сокобања","en":"Sokobanja","de":"Sokobanja","it":"Sokobanja"}$a$::jsonb,
  $a${
    "sr": "Сокобања је једна од најпознатијих и најпосећенијих бања у Србији, чувена по својим лековитим термалним изворима и чистој природи. Идеално је место за релаксацију, лечење респираторних проблема и уживање у велнес третманима. Поред тога, нуди бројне стазе за шетњу и планинарење.",
    "en": "Sokobanja is one of the most famous and most visited spas in Serbia, renowned for its healing thermal springs and clean nature. It is an ideal place for relaxation, treatment of respiratory problems, and enjoying wellness treatments. In addition, it offers numerous trails for walking and hiking.",
    "de": "Sokobanja ist einer der bekanntesten und meistbesuchten Kurorte in Serbien, berühmt für seine heilenden Thermalquellen und die saubere Natur. Es ist ein idealer Ort zur Entspannung, zur Behandlung von Atemwegsproblemen und zum Genießen von Wellnessanwendungen. Darüber hinaus bietet es zahlreiche Wander- und Spazierwege.",
    "it": "Sokobanja è una delle terme più famose e visitate della Serbia, rinomata per le sue sorgenti termali curative e la natura pulita. È un luogo ideale per il relax, il trattamento dei problemi respiratori e per godere di trattamenti benessere. Inoltre, offre numerosi sentieri per passeggiate ed escursioni."
  }$a$::jsonb,
  '15 km',
  '/images/attractions/Soko banja.jpeg',
  43.641565127341906,
  21.882190601581627,
  0,
  true
);

-- Attraction 1: Rtanj / Ртањ
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Ртањ","en":"Rtanj","de":"Rtanj","it":"Rtanj"}$a$::jsonb,
  $a${
    "sr": "Планина Ртањ је права мистерија природе, позната по свом готово савршеном пирамидалном облику. Сматра се местом са посебном енергијом, а њен врх Шиљак је изазов за планинаре. Ртањ је такође познат по ендемској биљци, ртањском чају, који има бројна лековита својства.",
    "en": "Mount Rtanj is a true mystery of nature, known for its almost perfect pyramidal shape. It is considered a place with special energy, and its peak, Šiljak, is a challenge for mountaineers. Rtanj is also known for its endemic plant, Rtanj tea, which has numerous medicinal properties.",
    "de": "Der Berg Rtanj ist ein wahres Naturgeheimnis, bekannt für seine fast perfekte Pyramidenform. Er gilt als ein Ort mit besonderer Energie, und sein Gipfel, Šiljak, ist eine Herausforderung für Bergsteiger. Rtanj ist auch für seine endemische Pflanze, den Rtanj-Tee, bekannt, der zahlreiche heilende Eigenschaften hat.",
    "it": "Il monte Rtanj è un vero mistero della natura, noto per la sua forma quasi perfettamente piramidale. È considerato un luogo con un'energia speciale e la sua cima, Šiljak, è una sfida per gli alpinisti. Rtanj è anche noto per la sua pianta endemica, il tè di Rtanj, che ha numerose proprietà medicinali."
  }$a$::jsonb,
  '30 km',
  '/images/attractions/Rtanj sa 20km daljine.jpeg',
  43.7760920245904,
  21.893234963295363,
  1,
  true
);

-- Attraction 2: Moravica River Spring / Извор реке Моравице
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Извор реке Моравице","en":"Moravica River Spring","de":"Quelle des Flusses Moravica","it":"Sorgente del fiume Moravica"}$a$::jsonb,
  $a${
    "sr": "Извор реке Моравице је скривени драгуљ природе, смештен у подножју планине Девице. Ово живописно место са кристално чистом водом и бујном вегетацијом је идеално за излете, пикнике и уживање у нетакнутој природи. Шетња до извора је право освежење за душу и тело.",
    "en": "The spring of the Moravica River is a hidden gem of nature, located at the foot of Mount Devica. This picturesque place with crystal clear water and lush vegetation is ideal for excursions, picnics, and enjoying untouched nature. A walk to the spring is a real refreshment for the soul and body.",
    "de": "Die Quelle des Flusses Moravica ist ein verborgenes Juwel der Natur am Fuße des Berges Devica. Dieser malerische Ort mit kristallklarem Wasser und üppiger Vegetation ist ideal für Ausflüge, Picknicks und zum Genießen der unberührten Natur. Ein Spaziergang zur Quelle ist eine wahre Erfrischung für Körper und Seele.",
    "it": "La sorgente del fiume Moravica è una gemma nascosta della natura, situata ai piedi del monte Devica. Questo luogo pittoresco con acqua cristallina e vegetazione lussureggiante è ideale per escursioni, picnic e per godersi la natura incontaminata. Una passeggiata fino alla sorgente è un vero ristoro per l'anima e il corpo."
  }$a$::jsonb,
  '20 km',
  '/images/attractions/Moravica.jpg',
  43.629977718036045,
  21.991947561377742,
  2,
  true
);

-- Attraction 3: Sokograd / Сокоград
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Сокоград","en":"Sokograd","de":"Sokograd","it":"Sokograd"}$a$::jsonb,
  $a${
    "sr": "Сокоград је импресивно средњовековно утврђење, смештено на стени изнад кањона реке Моравице. Са његових зидина пружа се спектакуларан поглед на околину. Посета Сокограду је као путовање кроз време, које ће вас упознати са богатом историјом овог краја.",
    "en": "Sokograd is an impressive medieval fortress, located on a rock above the canyon of the Moravica River. Its walls offer a spectacular view of the surroundings. A visit to Sokograd is like a journey through time, which will acquaint you with the rich history of this region.",
    "de": "Sokograd ist eine beeindruckende mittelalterliche Festung auf einem Felsen über der Schlucht des Flusses Moravica. Von seinen Mauern aus bietet sich ein spektakulärer Blick auf die Umgebung. Ein Besuch in Sokograd ist wie eine Zeitreise, die Sie mit der reichen Geschichte dieser Region vertraut macht.",
    "it": "Sokograd è un'imponente fortezza medievale, situata su una roccia sopra il canyon del fiume Moravica. Dalle sue mura si gode di una vista spettacolare sui dintorni. Una visita a Sokograd è come un viaggio nel tempo, che vi farà conoscere la ricca storia di questa regione."
  }$a$::jsonb,
  '18 km',
  '/images/attractions/Soko Grad .jpeg',
  43.634760339796934,
  21.8932035586355,
  3,
  true
);

-- Attraction 4: Vrmdza Lake / Врмџанско језеро
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Врмџанско језеро","en":"Vrmdža Lake","de":"Vrmdža-See","it":"Lago di Vrmdža"}$a$::jsonb,
  $a${
    "sr": "Врмџанско језеро је мало, али прелепо карстно језеро у близини села Врмџа. Окружено је зеленилом и идеално је место за пикник, риболов и одмор у природи. У близини се налази и Врмџански град, још једно занимљиво место за истраживање.",
    "en": "Vrmdža Lake is a small but beautiful karst lake near the village of Vrmdža. It is surrounded by greenery and is an ideal place for a picnic, fishing, and relaxing in nature. Nearby is the Vrmdža town, another interesting place to explore.",
    "de": "Der Vrmdža-See ist ein kleiner, aber wunderschöner Karstsee in der Nähe des Dorfes Vrmdža. Er ist von Grün umgeben und ein idealer Ort für ein Picknick, zum Angeln und zum Entspannen in der Natur. In der Nähe befindet sich auch die Stadt Vrmdža, ein weiterer interessanter Ort zum Erkunden.",
    "it": "Il lago di Vrmdža è un piccolo ma bellissimo lago carsico vicino al villaggio di Vrmdža. È circondato dal verde ed è un luogo ideale per un picnic, per la pesca e per rilassarsi nella natura. Nelle vicinanze si trova anche la città di Vrmdža, un altro luogo interessante da esplorare."
  }$a$::jsonb,
  '6 km',
  '/images/attractions/Врмџанско_језеро.jpg',
  43.74209131879247,
  21.826366875382313,
  4,
  true
);

-- Attraction 5: Jagodina Aqua Park / Аква парк Јагодина
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Аква парк Јагодина","en":"Jagodina Aqua Park","de":"Aqua Park Jagodina","it":"Aqua Park di Jagodina"}$a$::jsonb,
  $a${
    "sr": "Ако тражите забаву за целу породицу, Аква парк у Јагодини је прави избор. Са бројним тобоганима, базенима и другим атракцијама, гарантује незабораван дан пун смеха и адреналина. У склопу комплекса се налази и Музеј воштаних фигура и зоолошки врт.",
    "en": "If you are looking for fun for the whole family, the Aqua Park in Jagodina is the right choice. With numerous water slides, pools, and other attractions, it guarantees an unforgettable day full of laughter and adrenaline. The complex also includes a Wax Museum and a zoo.",
    "de": "Wenn Sie Spaß für die ganze Familie suchen, ist der Aqua Park in Jagodina die richtige Wahl. Mit zahlreichen Wasserrutschen, Pools und anderen Attraktionen garantiert er einen unvergesslichen Tag voller Lachen und Adrenalin. Der Komplex umfasst auch ein Wachsfigurenkabinett und einen Zoo.",
    "it": "Se cercate divertimento per tutta la famiglia, l'Aqua Park di Jagodina è la scelta giusta. Con numerosi scivoli d'acqua, piscine e altre attrazioni, garantisce una giornata indimenticabile piena di risate e adrenalina. Il complesso comprende anche un Museo delle Cere e uno zoo."
  }$a$::jsonb,
  '60-70 km',
  '/images/attractions/Аква парк Јагодина.jpg',
  43.977,
  21.27,
  5,
  true
);

-- Attraction 6: Red Cross Concentration Camp / Логор Црвени Крст
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Логор Црвени Крст","en":"Red Cross Concentration Camp","de":"KZ Rotes Kreuz","it":"Campo di concentramento della Croce Rossa"}$a$::jsonb,
  $a${
    "sr": "Логор Црвени Крст у Нишу је један од најозлоглашенијих нацистичких концентрационих логора у Другом светском рату. Данас је то меморијални музеј који сведочи о страдању и херојству затвореника. Посета овом месту је потресно, али важно историјско искуство.",
    "en": "The Red Cross concentration camp in Niš is one of the most notorious Nazi concentration camps of World War II. Today it is a memorial museum that testifies to the suffering and heroism of the prisoners. A visit to this place is a harrowing but important historical experience.",
    "de": "Das Konzentrationslager Rotes Kreuz in Niš ist eines der berüchtigtsten Konzentrationslager der Nazis im Zweiten Weltkrieg. Heute ist es ein Gedenkmuseum, das vom Leiden und Heldentum der Gefangenen zeugt. Ein Besuch an diesem Ort ist eine erschütternde, aber wichtige historische Erfahrung.",
    "it": "Il campo di concentramento della Croce Rossa a Niš è uno dei più famigerati campi di concentramento nazisti della Seconda Guerra Mondiale. Oggi è un museo commemorativo che testimonia la sofferenza e l'eroismo dei prigionieri. Una visita a questo luogo è un'esperienza straziante ma importante dal punto di vista storico."
  }$a$::jsonb,
  '55 km',
  '/images/attractions/Логор Црвени Крст.jpg',
  43.325,
  21.8958,
  6,
  true
);

-- Attraction 7: Bubanj Memorial Park / Спомен-парк Бубањ
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Спомен-парк Бубањ","en":"Bubanj Memorial Park","de":"Gedenkpark Bubanj","it":"Parco commemorativo di Bubanj"}$a$::jsonb,
  $a${
    "sr": "Спомен-парк Бубањ је монументални меморијални комплекс посвећен жртвама стрељаним у Другом светском рату. Три песнице симболизују отпор и непокорност. Ово је место за размишљање и одавање почасти жртвама фашизма.",
    "en": "Bubanj Memorial Park is a monumental memorial complex dedicated to the victims shot during World War II. The three fists symbolize resistance and defiance. This is a place for reflection and paying tribute to the victims of fascism.",
    "de": "Der Gedenkpark Bubanj ist ein monumentaler Gedenkkomplex, der den im Zweiten Weltkrieg erschossenen Opfern gewidmet ist. Die drei Fäuste symbolisieren Widerstand und Trotz. Dies ist ein Ort des Nachdenkens und des Gedenkens an die Opfer des Faschismus.",
    "it": "Il Parco commemorativo di Bubanj è un monumentale complesso commemorativo dedicato alle vittime fucilate durante la Seconda Guerra Mondiale. I tre pugni simboleggiano la resistenza e la sfida. Questo è un luogo di riflessione e di omaggio alle vittime del fascismo."
  }$a$::jsonb,
  '55 km',
  '/images/attractions/Спомен-парк Бубањ.jpg',
  43.305,
  21.8736,
  7,
  true
);

-- Attraction 8: Mediana / Медијана
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Медијана","en":"Mediana","de":"Mediana","it":"Mediana"}$a$::jsonb,
  $a${
    "sr": "Медијана је значајно археолошко налазиште из римског доба, које се налази у близини Ниша. Била је луксузно предграђе античког Наиса и родно место цара Константина Великог. Овде можете видети остатке царске виле, мозаике и друге артефакте.",
    "en": "Mediana is a significant archaeological site from the Roman era, located near Niš. It was a luxurious suburb of ancient Naissus and the birthplace of Emperor Constantine the Great. Here you can see the remains of the imperial villa, mosaics, and other artifacts.",
    "de": "Mediana ist eine bedeutende archäologische Stätte aus der Römerzeit in der Nähe von Niš. Es war ein luxuriöser Vorort des antiken Naissus und der Geburtsort von Kaiser Konstantin dem Großen. Hier können Sie die Überreste der Kaiservilla, Mosaike und andere Artefakte sehen.",
    "it": "Mediana è un importante sito archeologico di epoca romana, situato vicino a Niš. Era un lussuoso sobborgo dell'antica Naissus e il luogo di nascita dell'imperatore Costantino il Grande. Qui si possono vedere i resti della villa imperiale, mosaici e altri reperti."
  }$a$::jsonb,
  '55 km',
  '/images/attractions/Медијана.jpg',
  43.305,
  21.945,
  8,
  true
);

-- Attraction 9: Cegar Monument / Споменик на Чегру
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Споменик на Чегру","en":"Čegar Monument","de":"Čegar-Denkmal","it":"Monumento di Čegar"}$a$::jsonb,
  $a${
    "sr": "Споменик на Чегру је подигнут у част јунацима из Првог српског устанка и чувеној бици на Чегру. Посебно се истиче кула од лобања, која је симбол српске храбрости и жртве. Ово је место од великог историјског значаја за српски народ.",
    "en": "The Čegar Monument was erected in honor of the heroes of the First Serbian Uprising and the famous Battle of Čegar. The skull tower, a symbol of Serbian courage and sacrifice, is particularly noteworthy. This is a place of great historical importance for the Serbian people.",
    "de": "Das Čegar-Denkmal wurde zu Ehren der Helden des Ersten Serbischen Aufstands und der berühmten Schlacht von Čegar errichtet. Besonders bemerkenswert ist der Schädelturm, ein Symbol für serbischen Mut und Opferbereitschaft. Dies ist ein Ort von großer historischer Bedeutung für das serbische Volk.",
    "it": "Il Monumento di Čegar è stato eretto in onore degli eroi della Prima Rivolta Serba e della famosa Battaglia di Čegar. Particolarmente degna di nota è la torre dei teschi, simbolo del coraggio e del sacrificio serbo. Questo è un luogo di grande importanza storica per il popolo serbo."
  }$a$::jsonb,
  '55 km',
  '/images/attractions/Споменик на Чегру.jpg',
  43.3667,
  21.95,
  9,
  true
);

-- Attraction 10: St. Roman Church / Црква Светог Романа
INSERT INTO public.attractions
  (name, description, distance, image, latitude, longitude, display_order, is_visible)
VALUES (
  $a${"sr":"Црква Светог Романа","en":"St. Roman Church","de":"Kirche des Heiligen Roman","it":"Chiesa di San Romano"}$a$::jsonb,
  $a${
    "sr": "Манастир Светог Романа је један од најстаријих манастира у Србији, смештен у живописном окружењу. Познат је по својој лековитој води и моштима Светог Романа. Ово је место мира и духовности, идеално за све који траже утеху и благослов.",
    "en": "The Monastery of St. Roman is one of the oldest monasteries in Serbia, located in a picturesque setting. It is known for its healing water and the relics of St. Roman. This is a place of peace and spirituality, ideal for all who seek comfort and blessing.",
    "de": "Das Kloster des Heiligen Roman ist eines der ältesten Klöster in Serbien und liegt in einer malerischen Umgebung. Es ist bekannt für sein Heilwasser und die Reliquien des Heiligen Roman. Dies ist ein Ort des Friedens und der Spiritualität, ideal für alle, die Trost und Segen suchen.",
    "it": "Il Monastero di San Romano è uno dei più antichi monasteri della Serbia, situato in un ambiente pittoresco. È noto per la sua acqua curativa e le reliquie di San Romano. Questo è un luogo di pace e spiritualità, ideale per tutti coloro che cercano conforto e benedizione."
  }$a$::jsonb,
  '10-15 km',
  '/images/attractions/Црква Светог Романа.jpg',
  43.6,
  21.65,
  10,
  true
);

-- ============================================================
-- 4. NOTE — Migracija postojecih custom atrakcija
-- ============================================================
-- Ako postoji red u tabeli 'content' sa kljucem 'attractions.custom'
-- (JSONB niz custom atrakcija dodanih iz admina), taj sadrzaj treba
-- rucno prebaciti u novu tabelu 'attractions' pre nego sto se
-- stari kod za citanje iz 'content' obrisi.
--
-- Preporuceni postupak:
--   1. Pokreni: SELECT value FROM content WHERE key = 'attractions.custom';
--   2. Za svaki objekat u nizu napravi INSERT u public.attractions
--      sa odgovarajucim name/description JSONB i ostalim poljima.
--   3. Postavi display_order > 10 da budu iza staticnih (ili podesi po zelji).
--   4. Tek posle verifikacije: DELETE FROM content WHERE key = 'attractions.custom';
--
-- SQL migracija nije automatizovana jer format custom objekata
-- moze da varira (admin je mogao da unosi samo sr tekst, bez i18n).
-- ============================================================
