-- Add 20 words from fallbackVocabulary.ro.json to cuvinteziCuvinte table
-- Note: The JSON file contains 15 words, all are included here
-- Use ON CONFLICT to update if words already exist

INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES
  (
    'dor-1',
    'dor',
    'substantiv (n.)',
    'Un sentiment profund de lipsă și nostalgie, greu de tradus într-un singur cuvânt. Dorul poate fi după oameni, locuri, timpuri sau stări, amestecând tristețea cu speranța reîntâlnirii.',
    'https://picsum.photos/seed/dor/800/600',
    '["emoții","cultură","nostalgie"]'::jsonb,
    '["Mi-e <strong>dor</strong> de bunici și de mirosul de cozonac din copilărie.","<strong>Dorul</strong> de casă îl însoțea în fiecare seară."]'::jsonb
  ),
  (
    'ragaz-2',
    'răgaz',
    'substantiv (n.)',
    'Pauză scurtă sau perioadă de respiro în care te poți opri din alergătura zilnică. Un răgaz e timpul pe care ți-l iei ca să-ți aduni gândurile și să-ți reîncarci energia.',
    'https://picsum.photos/seed/ragaz/800/600',
    '["timp","echilibru","viață"]'::jsonb,
    '["După ședință, și-a luat un <strong>răgaz</strong> de zece minute să respire.","În weekend caut un <strong>răgaz</strong> pentru lectură și plimbare."]'::jsonb
  ),
  (
    'sueta-3',
    'șuetă',
    'substantiv (f.)',
    'Conversație lejeră, prietenoasă, fără un scop strict, purtată de obicei între cunoscuți. O șuetă bună relaxează și creează apropiere, ca un fir subțire care leagă oamenii.',
    'https://picsum.photos/seed/sueta/800/600',
    '["comunicare","social","relaxare"]'::jsonb,
    '["Am stat la o <strong>șuetă</strong> cu vecinii în fața blocului.","O <strong>șuetă</strong> scurtă la cafea i-a schimbat ziua."]'::jsonb
  ),
  (
    'zabava-4',
    'zăbavă',
    'substantiv (f.)',
    'Întârziere sau oprire mai lungă decât era nevoie; uneori și o rămânere pe loc din plăcere, ca atunci când zăbovești privind ceva frumos. Poate sugera atât lene, cât și contemplare.',
    'https://picsum.photos/seed/zabava/800/600',
    '["timp","ritm","limbaj"]'::jsonb,
    '["Fără <strong>zăbavă</strong>, a pornit la drum înainte să se întunece.","A făcut <strong>zăbavă</strong> privind luminile orașului."]'::jsonb
  ),
  (
    'sovaiala-5',
    'șovăială',
    'substantiv (f.)',
    'Neîncredere sau ezitare înainte de a lua o decizie. Șovăiala apare când cântărești opțiuni, când ți-e teamă de greșeală sau când nu ești sigur pe tine.',
    'https://picsum.photos/seed/sovaiala/800/600',
    '["psihologie","decizii","comportament"]'::jsonb,
    '["A semnat contractul fără <strong>șovăială</strong>.","<strong>Șovăiala</strong> lui s-a văzut în fiecare pas."]'::jsonb
  ),
  (
    'prag-6',
    'prag',
    'substantiv (n.)',
    'Partea de jos a unei uși peste care treci când intri sau ieși. În sens figurat, pragul este o limită sau un moment de trecere între două etape: pragul maturității, pragul unei schimbări.',
    'https://picsum.photos/seed/prag/800/600',
    '["spațiu","metaforă","limite"]'::jsonb,
    '["S-a oprit în <strong>prag</strong> și a zâmbit.","A trecut <strong>pragul</strong> unei noi etape în carieră."]'::jsonb
  ),
  (
    'mester-7',
    'meșter',
    'substantiv (m.)',
    'Om priceput la o meserie, care lucrează cu îndemânare și grijă pentru detalii. Un meșter bun nu doar repară sau construiește, ci pune în lucru experiența și respectul pentru material.',
    'https://picsum.photos/seed/mester/800/600',
    '["meserii","îndemânare","tradiție"]'::jsonb,
    '["<strong>Meșterul</strong> a reparat ușa din prima încercare.","E <strong>meșter</strong> la vorbă, dar și la treabă."]'::jsonb
  ),
  (
    'zugravi-8',
    'a zugrăvi',
    'verb (infinitiv)',
    'A vopsi sau a varui pereți, de obicei în interiorul unei clădiri. În sens figurat, a zugrăvi înseamnă a descrie viu o situație, ca și cum ai picta cuvinte pe un perete.',
    'https://picsum.photos/seed/zugravi/800/600',
    '["casă","acțiuni","limbaj"]'::jsonb,
    '["În weekend am decis să <strong>zugrăvim</strong> camera copilului.","Jurnalistul a <strong>zugrăvit</strong> atmosfera festivalului în detalii."]'::jsonb
  ),
  (
    'furisa-9',
    'a se furișa',
    'verb (reflexiv, infinitiv)',
    'A merge sau a te strecura în tăcere, cu grijă, ca să nu fii observat. Te poți furișa dintr-o cameră, dar și dintr-o situație incomodă, fără să lași urme.',
    'https://picsum.photos/seed/furisa/800/600',
    '["acțiuni","mişcare","discreție"]'::jsonb,
    '["S-a <strong>furișat</strong> afară ca să nu trezească pe nimeni.","Gândurile rele se <strong>furișează</strong> uneori fără să le chemi."]'::jsonb
  ),
  (
    'imbucurator-10',
    'îmbucurător',
    'adjectiv',
    'Care aduce bucurie sau dă speranță; încurajator. Un semn îmbucurător poate fi o veste bună, un progres mic dar sigur sau o schimbare care arată că lucrurile merg în direcția potrivită.',
    'https://picsum.photos/seed/imbucurator/800/600',
    '["stări","pozitiv","limbaj"]'::jsonb,
    '["E <strong>îmbucurător</strong> că analizele au ieșit bine.","Un mesaj <strong>îmbucurător</strong> i-a dat curaj să continue."]'::jsonb
  ),
  (
    'incalcit-11',
    'încâlcit',
    'adjectiv',
    'Complicat, greu de descurcat, ca un ghem de ațe. Poate fi un drum încâlcit, o problemă încâlcită sau o poveste încâlcită, cu multe detalii care se leagă între ele.',
    'https://picsum.photos/seed/incalcit/800/600',
    '["descriere","complexitate","limbaj"]'::jsonb,
    '["E un caz <strong>încâlcit</strong> și avem nevoie de răbdare.","A urmat un traseu <strong>încâlcit</strong> prin orașul vechi."]'::jsonb
  ),
  (
    'miji-12',
    'a miji',
    'verb (infinitiv)',
    'A apărea puțin câte puțin, abia zărindu-se: mijește soarele, mijește zorile. Este un verb care surprinde începutul discret al luminii sau al unui lucru care prinde contur.',
    'https://picsum.photos/seed/miji/800/600',
    '["natură","verbe","poetic"]'::jsonb,
    '["<strong>Mijeau</strong> zorile când am ajuns pe munte.","Prin perdea, lumina <strong>mijea</strong> timid."]'::jsonb
  ),
  (
    'murmur-13',
    'murmur',
    'substantiv (n.)',
    'Zgomot domol și continuu, ca al frunzelor, al apei sau al unei mulțimi care vorbește încet. Murmurul sugerează o prezență blândă, aproape hipnotică, în fundal.',
    'https://picsum.photos/seed/murmur/800/600',
    '["sunete","natură","descriere"]'::jsonb,
    '["Se auzea un <strong>murmur</strong> de apă dinspre pârâu.","<strong>Murmurul</strong> sălii s-a stins când a început discursul."]'::jsonb
  ),
  (
    'incropi-14',
    'a încropi',
    'verb (infinitiv)',
    'A face repede și improvizat, din ce ai la îndemână; a alcătui fără prea multă pregătire (un plan, o masă, o soluție).',
    'https://picsum.photos/seed/incropi/800/600',
    '["verbe","colocvial","improvizație"]'::jsonb,
    '["Am <strong>încropit</strong> un prânz rapid din ce am găsit în frigider.","Au <strong>încropit</strong> un plan pe genunchi și au plecat la drum."]'::jsonb
  ),
  (
    'indaratnic-15',
    'îndărătnic',
    'adjectiv',
    'Încăpățânat, greu de înduplecat; care își susține opinia sau comportamentul chiar și când apar argumente contra.',
    'https://picsum.photos/seed/indaratnic/800/600',
    '["adjective","caracter","comportament"]'::jsonb,
    '["E <strong>îndărătnic</strong> și nu renunță ușor la ideea lui.","Dintr-un orgoliu <strong>îndărătnic</strong>, a refuzat să ceară ajutor."]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = timezone('utc'::text, now());


