-- Auto-generated SQL import script
-- Generated from: fallbackVocabulary.ro.json, fallbackUrbanisme.ro.json, fallbackRegionalisme.ro.json
-- Total words: 45
-- Generated at: 2025-12-24T22:52:31.256Z

-- Begin transaction
BEGIN;

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'dor-1',
  'dor',
  'substantiv (n.)',
  'Un sentiment profund de lipsă și nostalgie, greu de tradus într-un singur cuvânt. Dorul poate fi după oameni, locuri, timpuri sau stări, amestecând tristețea cu speranța reîntâlnirii.',
  'https://picsum.photos/seed/dor/800/600',
  '["emoții","cultură","nostalgie"]',
  '["Mi-e <strong>dor</strong> de bunici și de mirosul de cozonac din copilărie.","<strong>Dorul</strong> de casă îl însoțea în fiecare seară."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'ragaz-2',
  'răgaz',
  'substantiv (n.)',
  'Pauză scurtă sau perioadă de respiro în care te poți opri din alergătura zilnică. Un răgaz e timpul pe care ți-l iei ca să-ți aduni gândurile și să-ți reîncarci energia.',
  'https://picsum.photos/seed/ragaz/800/600',
  '["timp","echilibru","viață"]',
  '["După ședință, și-a luat un <strong>răgaz</strong> de zece minute să respire.","În weekend caut un <strong>răgaz</strong> pentru lectură și plimbare."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'sueta-3',
  'șuetă',
  'substantiv (f.)',
  'Conversație lejeră, prietenoasă, fără un scop strict, purtată de obicei între cunoscuți. O șuetă bună relaxează și creează apropiere, ca un fir subțire care leagă oamenii.',
  'https://picsum.photos/seed/sueta/800/600',
  '["comunicare","social","relaxare"]',
  '["Am stat la o <strong>șuetă</strong> cu vecinii în fața blocului.","O <strong>șuetă</strong> scurtă la cafea i-a schimbat ziua."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'zabava-4',
  'zăbavă',
  'substantiv (f.)',
  'Întârziere sau oprire mai lungă decât era nevoie; uneori și o rămânere pe loc din plăcere, ca atunci când zăbovești privind ceva frumos. Poate sugera atât lene, cât și contemplare.',
  'https://picsum.photos/seed/zabava/800/600',
  '["timp","ritm","limbaj"]',
  '["Fără <strong>zăbavă</strong>, a pornit la drum înainte să se întunece.","A făcut <strong>zăbavă</strong> privind luminile orașului."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'sovaiala-5',
  'șovăială',
  'substantiv (f.)',
  'Neîncredere sau ezitare înainte de a lua o decizie. Șovăiala apare când cântărești opțiuni, când ți-e teamă de greșeală sau când nu ești sigur pe tine.',
  'https://picsum.photos/seed/sovaiala/800/600',
  '["psihologie","decizii","comportament"]',
  '["A semnat contractul fără <strong>șovăială</strong>.","<strong>Șovăiala</strong> lui s-a văzut în fiecare pas."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'prag-6',
  'prag',
  'substantiv (n.)',
  'Partea de jos a unei uși peste care treci când intri sau ieși. În sens figurat, pragul este o limită sau un moment de trecere între două etape: pragul maturității, pragul unei schimbări.',
  'https://picsum.photos/seed/prag/800/600',
  '["spațiu","metaforă","limite"]',
  '["S-a oprit în <strong>prag</strong> și a zâmbit.","A trecut <strong>pragul</strong> unei noi etape în carieră."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'mester-7',
  'meșter',
  'substantiv (m.)',
  'Om priceput la o meserie, care lucrează cu îndemânare și grijă pentru detalii. Un meșter bun nu doar repară sau construiește, ci pune în lucru experiența și respectul pentru material.',
  'https://picsum.photos/seed/mester/800/600',
  '["meserii","îndemânare","tradiție"]',
  '["<strong>Meșterul</strong> a reparat ușa din prima încercare.","E <strong>meșter</strong> la vorbă, dar și la treabă."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'zugravi-8',
  'a zugrăvi',
  'verb (infinitiv)',
  'A vopsi sau a varui pereți, de obicei în interiorul unei clădiri. În sens figurat, a zugrăvi înseamnă a descrie viu o situație, ca și cum ai picta cuvinte pe un perete.',
  'https://picsum.photos/seed/zugravi/800/600',
  '["casă","acțiuni","limbaj"]',
  '["În weekend am decis să <strong>zugrăvim</strong> camera copilului.","Jurnalistul a <strong>zugrăvit</strong> atmosfera festivalului în detalii."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'furisa-9',
  'a se furișa',
  'verb (reflexiv, infinitiv)',
  'A merge sau a te strecura în tăcere, cu grijă, ca să nu fii observat. Te poți furișa dintr-o cameră, dar și dintr-o situație incomodă, fără să lași urme.',
  'https://picsum.photos/seed/furisa/800/600',
  '["acțiuni","mişcare","discreție"]',
  '["S-a <strong>furișat</strong> afară ca să nu trezească pe nimeni.","Gândurile rele se <strong>furișează</strong> uneori fără să le chemi."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'imbucurator-10',
  'îmbucurător',
  'adjectiv',
  'Care aduce bucurie sau dă speranță; încurajator. Un semn îmbucurător poate fi o veste bună, un progres mic dar sigur sau o schimbare care arată că lucrurile merg în direcția potrivită.',
  'https://picsum.photos/seed/imbucurator/800/600',
  '["stări","pozitiv","limbaj"]',
  '["E <strong>îmbucurător</strong> că analizele au ieșit bine.","Un mesaj <strong>îmbucurător</strong> i-a dat curaj să continue."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'incalcit-11',
  'încâlcit',
  'adjectiv',
  'Complicat, greu de descurcat, ca un ghem de ațe. Poate fi un drum încâlcit, o problemă încâlcită sau o poveste încâlcită, cu multe detalii care se leagă între ele.',
  'https://picsum.photos/seed/incalcit/800/600',
  '["descriere","complexitate","limbaj"]',
  '["E un caz <strong>încâlcit</strong> și avem nevoie de răbdare.","A urmat un traseu <strong>încâlcit</strong> prin orașul vechi."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'miji-12',
  'a miji',
  'verb (infinitiv)',
  'A apărea puțin câte puțin, abia zărindu-se: mijește soarele, mijește zorile. Este un verb care surprinde începutul discret al luminii sau al unui lucru care prinde contur.',
  'https://picsum.photos/seed/miji/800/600',
  '["natură","verbe","poetic"]',
  '["<strong>Mijeau</strong> zorile când am ajuns pe munte.","Prin perdea, lumina <strong>mijea</strong> timid."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'murmur-13',
  'murmur',
  'substantiv (n.)',
  'Zgomot domol și continuu, ca al frunzelor, al apei sau al unei mulțimi care vorbește încet. Murmurul sugerează o prezență blândă, aproape hipnotică, în fundal.',
  'https://picsum.photos/seed/murmur/800/600',
  '["sunete","natură","descriere"]',
  '["Se auzea un <strong>murmur</strong> de apă dinspre pârâu.","<strong>Murmurul</strong> sălii s-a stins când a început discursul."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'incropi-14',
  'a încropi',
  'verb (infinitiv)',
  'A face repede și improvizat, din ce ai la îndemână; a alcătui fără prea multă pregătire (un plan, o masă, o soluție).',
  'https://picsum.photos/seed/incropi/800/600',
  '["verbe","colocvial","improvizație"]',
  '["Am <strong>încropit</strong> un prânz rapid din ce am găsit în frigider.","Au <strong>încropit</strong> un plan pe genunchi și au plecat la drum."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'indaratnic-15',
  'îndărătnic',
  'adjectiv',
  'Încăpățânat, greu de înduplecat; care își susține opinia sau comportamentul chiar și când apar argumente contra.',
  'https://picsum.photos/seed/indaratnic/800/600',
  '["adjective","caracter","comportament"]',
  '["E <strong>îndărătnic</strong> și nu renunță ușor la ideea lui.","Dintr-un orgoliu <strong>îndărătnic</strong>, a refuzat să ceară ajutor."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-001',
  'a da swipe',
  'verb (locuțiune, infinitiv)',
  'A glisa cu degetul pe ecran (de obicei în aplicații), pentru a trece la următorul ecran/element.',
  'https://picsum.photos/seed/urb-swipe/800/600',
  '["urban","tech","slang"]',
  '["Am dat <strong>swipe</strong> și am trecut la următorul card.","Dă <strong>swipe</strong> la stânga dacă nu-ți place."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-002',
  'story',
  'substantiv (n., col.)',
  'Postare scurtă (de obicei foto/video) care dispare după 24 de ore, popularizată de rețelele sociale.',
  'https://picsum.photos/seed/urb-story/800/600',
  '["urban","social media"]',
  '["Am pus un <strong>story</strong> de la concert.","Dă-mi tag în <strong>story</strong> dacă postezi poza."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-003',
  'a da tag',
  'verb (locuțiune, infinitiv)',
  'A menționa pe cineva într-o postare (de obicei cu @), ca să fie notificat.',
  'https://picsum.photos/seed/urb-tag/800/600',
  '["urban","social media"]',
  '["M-a <strong>taguit</strong> în poză și am primit notificare.","Dă-mi <strong>tag</strong> când ajungi acolo."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-004',
  'a da like',
  'verb (locuțiune, infinitiv)',
  'A aprecia o postare cu un buton (inimă, thumbs up), în jargonul social media.',
  'https://picsum.photos/seed/urb-like/800/600',
  '["urban","social media"]',
  '["Am dat <strong>like</strong> la postarea ta.","Dacă ți-a plăcut, dă <strong>like</strong> și share."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-005',
  'vibe',
  'substantiv (n., col.)',
  'Atmosferă/stare generală resimțită într-un loc sau într-o situație; „feeling”.',
  'https://picsum.photos/seed/urb-vibe/800/600',
  '["urban","slang","emoții"]',
  '["Localul are un <strong>vibe</strong> super relaxat.","Nu-mi place <strong>vibe-ul</strong> de aici, hai să plecăm."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-006',
  'cringe',
  'adjectiv / substantiv (col.)',
  'Ceva jenant sau stânjenitor, care te face să „strâmbi din nas” de rușine pentru altcineva.',
  'https://picsum.photos/seed/urb-cringe/800/600',
  '["urban","slang","internet"]',
  '["Clipul ăsta e <strong>cringe</strong>, nu pot să mă uit până la capăt.","Mi-a fost <strong>cringe</strong> de faza aia."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-007',
  'a flexa',
  'verb (infinitiv, col.)',
  'A se lăuda ostentativ cu ceva (bani, lucruri, realizări).',
  'https://picsum.photos/seed/urb-flexa/800/600',
  '["urban","slang","social"]',
  '["Tot <strong>flexează</strong> cu mașina nouă.","Nu mai <strong>flexa</strong>, că nu impresionezi pe nimeni."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-008',
  'a da ghost',
  'verb (locuțiune, infinitiv)',
  'A dispărea brusc dintr-o conversație/relatie, fără explicații (ghosting).',
  'https://picsum.photos/seed/urb-ghost/800/600',
  '["urban","slang","relații","internet"]',
  '["După două zile, mi-a dat <strong>ghost</strong> și n-a mai răspuns.","Nu-i ok să dai <strong>ghost</strong> fără să spui nimic."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-009',
  'binge',
  'verb (infinitiv, col.)',
  'A consuma multe episoade/clipuri dintr-o dată (binge-watching).',
  'https://picsum.photos/seed/urb-binge/800/600',
  '["urban","slang","media"]',
  '["Am <strong>binge-uit</strong> tot sezonul într-o seară.","În weekend vreau să <strong>binge</strong> un serial nou."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-010',
  'random',
  'adjectiv (col.)',
  'Fără legătură clară cu contextul; întâmplător, neașteptat.',
  'https://picsum.photos/seed/urb-random/800/600',
  '["urban","slang","internet"]',
  '["A fost un mesaj <strong>random</strong>, n-avea nicio treabă.","Ne-am întâlnit <strong>random</strong> pe stradă."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-011',
  'a face check-in',
  'verb (locuțiune, infinitiv)',
  'A marca prezența într-un loc (în aplicații) sau a te înregistra la hotel/avioane; folosit des în jargon urban.',
  'https://picsum.photos/seed/urb-checkin/800/600',
  '["urban","travel","social media"]',
  '["Am făcut <strong>check-in</strong> la hotel în 5 minute.","Își face mereu <strong>check-in</strong> când ajunge la un local nou."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-012',
  'a da un DM',
  'verb (locuțiune, infinitiv)',
  'A trimite un mesaj privat (Direct Message) pe rețele sociale.',
  'https://picsum.photos/seed/urb-dm/800/600',
  '["urban","social media","internet"]',
  '["Dă-mi un <strong>DM</strong> și vorbim acolo.","Mi-a trimis <strong>DM</strong> după ce a văzut story-ul."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-013',
  'hustle',
  'substantiv (n., col.)',
  'Muncă intensă, alergătură constantă pentru bani/proiecte; „agitație productivă”.',
  'https://picsum.photos/seed/urb-hustle/800/600',
  '["urban","slang","muncă"]',
  '["În oraș, toată lumea e pe <strong>hustle</strong> nonstop.","Mi-am luat o pauză de la <strong>hustle</strong> și am dormit."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-014',
  'a fi pe modul avion',
  'locuțiune (col.)',
  'A fi „deconectat” de la social/media sau indisponibil; metaforă inspirată din setarea telefonului.',
  'https://picsum.photos/seed/urb-avion/800/600',
  '["urban","slang","tech"]',
  '["Weekendul ăsta sunt pe <strong>modul avion</strong>, fără notificări.","Când lucrez, intru pe <strong>modul avion</strong> și nu răspund."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'urb-015',
  'a lua Uber/Bolt',
  'verb (locuțiune, infinitiv)',
  'A comanda o cursă prin aplicație (ride-sharing). În vorbirea urbană, numele brandului devine verb/expresie.',
  'https://picsum.photos/seed/urb-uber/800/600',
  '["urban","transport","tech"]',
  '["E târziu, hai să luăm un <strong>Uber</strong> până acasă.","Am luat un <strong>Bolt</strong> că nu mai era metrou."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-001',
  'cucuruz',
  'substantiv (n.)',
  'Regionalism (mai ales Moldova/Ardeal) pentru „porumb”. Se folosește frecvent în vorbirea de la sat și în unele zone rurale.',
  'https://picsum.photos/seed/reg-cucuruz/800/600',
  '["regionalisme","rural","moldova","agricultură"]',
  '["Am pus <strong>cucuruz</strong> în grădină, să avem pentru iarnă.","La piață, bunica a cerut un sac de <strong>cucuruz</strong>."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-002',
  'oleacă',
  'adverb',
  'Regionalism (mai ales Moldova) cu sensul „puțin”, „un pic”.',
  'https://picsum.photos/seed/reg-oleaca/800/600',
  '["regionalisme","moldova","vorbire"]',
  '["Stai <strong>oleacă</strong> să termin treaba asta.","Mai pune <strong>oleacă</strong> sare, te rog."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-003',
  'șură',
  'substantiv (f.)',
  'Construcție la țară folosită pentru depozitarea fânului, paielor sau a uneltelor; hambar.',
  'https://picsum.photos/seed/reg-sura/800/600',
  '["regionalisme","rural","gospodărie"]',
  '["Am băgat căruța în <strong>șură</strong> înainte să înceapă ploaia.","Fânul mirosea a vară în <strong>șură</strong>."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-004',
  'cocon',
  'substantiv (m.)',
  'Regionalism (în diferite zone) pentru „copil/băiat”, uneori cu nuanță afectivă.',
  'https://picsum.photos/seed/reg-cocon/800/600',
  '["regionalisme","familie","rural"]',
  '["Când era <strong>cocon</strong>, alerga toată ziua pe uliță.","Hai, <strong>cocon</strong>, îmbracă-te și vino la masă!"]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-005',
  'pălincă',
  'substantiv (f.)',
  'Băutură spirtoasă tradițională (mai ales în Ardeal), distilată din fructe (prune, mere etc.).',
  'https://picsum.photos/seed/reg-palinca/800/600',
  '["regionalisme","ardeal","tradiție"]',
  '["Ne-au omenit cu o <strong>pălincă</strong> de prune, tare și aromată.","La nuntă, a curs <strong>pălinca</strong> din partea casei."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-006',
  'șogor',
  'substantiv (m.)',
  'Regionalism ardelean (împrumut din maghiară) pentru „cumnat” (soțul surorii / fratele soțului etc., în funcție de uz local).',
  'https://picsum.photos/seed/reg-sogor/800/600',
  '["regionalisme","ardeal","împrumut","maghiară","familie"]',
  '["Merg la <strong>șogor</strong> la o cafea, că n-am mai vorbit de mult.","<strong>Șogorul</strong> meu e din Cluj și are mereu povești bune."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-007',
  'șnițel',
  'substantiv (n.)',
  'Preparat din carne bătută, dată prin făină/ou/pesmet și prăjită. Termen răspândit, dar asociat puternic cu influențe central-europene (inclusiv maghiare/germane).',
  'https://picsum.photos/seed/reg-snitzel/800/600',
  '["regionalisme","împrumut","gastronomie"]',
  '["Am făcut <strong>șnițel</strong> cu piure, ca la bunica.","La cantină, <strong>șnițelul</strong> a fost surprinzător de bun."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-008',
  'gulaș',
  'substantiv (n.)',
  'Tocană/supă consistentă cu carne și boia, asociată cu bucătăria maghiară și zonele din vestul României.',
  'https://picsum.photos/seed/reg-gulas/800/600',
  '["regionalisme","ardeal","împrumut","maghiară","gastronomie"]',
  '["La târg, am mâncat un <strong>gulaș</strong> fierbinte, cu boia.","În Ardeal, <strong>gulașul</strong> e nelipsit la evenimentele de iarnă."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-009',
  'baftă',
  'substantiv (f.)',
  'Noroc, succes; termen foarte răspândit, cu origine atribuită limbii rrome (romani) în multe surse.',
  'https://picsum.photos/seed/reg-bafta/800/600',
  '["regionalisme","împrumut","romani","vorbire"]',
  '["<strong>Baftă</strong> la examen, să-ți pice subiecte ușoare!","Cu <strong>baftă</strong> și muncă, le rezolvi pe toate."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-010',
  'mișto',
  'adjectiv / adverb (col.)',
  'Colocvial: „bun”, „tare”, „plăcut”. De multe ori indicat ca împrumut din romani.',
  'https://picsum.photos/seed/reg-misto/800/600',
  '["regionalisme","împrumut","romani","colocvial"]',
  '["A fost <strong>mișto</strong> filmul, m-a prins din primele minute.","Ai o idee <strong>mișto</strong>, chiar merită încercată."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-011',
  'a se hodini',
  'verb (reflexiv, infinitiv)',
  'Regionalism (mai ales Moldova) pentru „a se odihni”.',
  'https://picsum.photos/seed/reg-hodini/800/600',
  '["regionalisme","moldova","verbe","rural"]',
  '["Ne-am <strong>hodinit</strong> oleacă la umbră, că era zăpușeală.","După prânz, tata se <strong>hodinește</strong> o jumătate de oră."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-012',
  'a păpușa (mâncarea)',
  'verb (infinitiv, col.)',
  'Regional/colocvial: a mânca repede sau pe furiș; uzul poate varia mult între zone.',
  'https://picsum.photos/seed/reg-papusa/800/600',
  '["regionalisme","colocvial","rural"]',
  '["A <strong>păpușat</strong> o felie de pâine și a fugit afară.","Nu mai <strong>păpușa</strong> pe ascuns, vino la masă!"]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-013',
  'pogon',
  'substantiv (n.)',
  'Unitate de măsură veche pentru suprafață de teren, încă auzită la țară în anumite regiuni.',
  'https://picsum.photos/seed/reg-pogon/800/600',
  '["regionalisme","rural","agricultură","măsuri"]',
  '["Avem două <strong>pogoane</strong> de vie pe deal.","Bunicul încă măsoară pământul în <strong>pogon</strong>."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-014',
  'hârtop',
  'substantiv (n.)',
  'Groapă mare, denivelare adâncă pe drum; regionalism răspândit în vorbirea populară.',
  'https://picsum.photos/seed/reg-hartop/800/600',
  '["regionalisme","rural","drumuri","vorbire"]',
  '["Drumul e plin de <strong>hârtoape</strong>, mergem încet.","Am sărit într-un <strong>hârtop</strong> și mi-am vărsat cafeaua."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  'reg-015',
  'a se chilăvi',
  'verb (reflexiv, infinitiv)',
  'Regional/colocvial: a slăbi, a se ofili, a se istovi (uz variabil).',
  'https://picsum.photos/seed/reg-chilavi/800/600',
  '["regionalisme","colocvial","vorbire"]',
  '["S-a <strong>chilăvit</strong> de la atâta muncă și stres.","Nu te mai <strong>chilăvi</strong>, ia-ți un răgaz și odihnește-te."]'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now();

-- Commit transaction
COMMIT;

-- Verify import
SELECT COUNT(*) as total_words FROM public."cuvinteziCuvinte";
SELECT COUNT(*) as vocabulary_words FROM public."cuvinteziCuvinte" WHERE id LIKE '%-%' AND id NOT LIKE 'urb-%' AND id NOT LIKE 'reg-%';
SELECT COUNT(*) as urbanisme_words FROM public."cuvinteziCuvinte" WHERE id LIKE 'urb-%';
SELECT COUNT(*) as regionalisme_words FROM public."cuvinteziCuvinte" WHERE id LIKE 'reg-%';
