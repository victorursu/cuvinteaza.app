-- Add 20 brand new Romanian words to cuvinteziCuvinte table
-- These are new words not in the existing fallback vocabulary

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
    'zadarnic-16',
    'zadarnic',
    'adjectiv',
    'Fără rezultat, în zadar; care nu aduce niciun folos sau efect. Ceva zadarnic este o încercare care nu duce nicăieri, o acțiune care rămâne fără urmări.',
    'https://picsum.photos/seed/zadarnic/800/600',
    '["stări","negativ","limbaj"]'::jsonb,
    '["Toate eforturile au fost <strong>zadarnice</strong>, nu a reușit nimic.","A încercat <strong>zadarnic</strong> să o convingă să rămână."]'::jsonb
  ),
  (
    'bucurie-17',
    'bucurie',
    'substantiv (f.)',
    'Sentiment de fericire și satisfacție; starea de a te simți bine, ușor, plin de energie pozitivă. Bucuria poate veni din lucruri mici sau mari, din momente simple sau evenimente importante.',
    'https://picsum.photos/seed/bucurie/800/600',
    '["emoții","pozitiv","cultură"]'::jsonb,
    '["<strong>Bucuria</strong> de a-l vedea a umplut-o complet.","A simțit o <strong>bucurie</strong> profundă când a auzit vestea."]'::jsonb
  ),
  (
    'a-si-aduna-18',
    'a-și aduna',
    'verb (reflexiv, infinitiv)',
    'A strânge, a colecta lucruri sau informații; a pune laolaltă ceva care era împrăștiat. Te poți aduna și tu însuți, adică să te concentrezi, să te strângi laolaltă.',
    'https://picsum.photos/seed/aduna/800/600',
    '["acțiuni","organizare","limbaj"]'::jsonb,
    '["A <strong>adunat</strong> toate documentele necesare.","S-a <strong>adunat</strong> și a început să lucreze cu concentrare."]'::jsonb
  ),
  (
    'liniste-19',
    'liniște',
    'substantiv (f.)',
    'Absența zgomotului sau a agitației; pace, calm, stare de repaus. Liniștea poate fi fizică (fără sunete) sau emoțională (fără tulburări).',
    'https://picsum.photos/seed/liniste/800/600',
    '["stări","natură","pace"]'::jsonb,
    '["<strong>Liniștea</strong> nopții era întreruptă doar de cântecul cântăreților.","A căutat <strong>liniște</strong> după o zi agitată."]'::jsonb
  ),
  (
    'a-razui-20',
    'a răzui',
    'verb (infinitiv)',
    'A șterge sau a elimina ceva prin frecare; a tăia ușor suprafața unui material. Poate fi literal (a răzui o suprafață) sau figurat (a răzui o idee, a o elimina).',
    'https://picsum.photos/seed/razui/800/600',
    '["acțiuni","fizic","limbaj"]'::jsonb,
    '["A <strong>răzuit</strong> peretele înainte de a-l vopsi.","A încercat să <strong>răzuiască</strong> amintirea din minte."]'::jsonb
  ),
  (
    'sfidator-21',
    'sfidător',
    'adjectiv',
    'Care provoacă sau îndrăznește; care arată curaj sau dispreț față de ceva. Un comportament sfidător poate fi curajos sau nesăbuit, în funcție de context.',
    'https://picsum.photos/seed/sfidator/800/600',
    '["caracter","comportament","emoții"]'::jsonb,
    '["A avut un zâmbet <strong>sfidător</strong> când a acceptat provocarea.","Tonele <strong>sfidătoare</strong> nu i-au plăcut profesorului."]'::jsonb
  ),
  (
    'a-se-ascunde-22',
    'a se ascunde',
    'verb (reflexiv, infinitiv)',
    'A te pune într-un loc unde nu ești văzut; a te face invizibil sau inaccesibil. Te poți ascunde fizic sau emoțional, păstrând ceva secret.',
    'https://picsum.photos/seed/ascunde/800/600',
    '["acțiuni","discreție","comportament"]'::jsonb,
    '["S-a <strong>ascuns</strong> în spatele copacului.","A încercat să <strong>se ascundă</strong> de propriile sentimente."]'::jsonb
  ),
  (
    'fermecat-23',
    'fermecat',
    'adjectiv',
    'Încântat, fascinat, captivat de ceva sau cineva; care pare să aibă o putere magică sau atractivă. Un loc fermecat este unul care te atrage și te face să te simți bine.',
    'https://picsum.photos/seed/fermecat/800/600',
    '["stări","pozitiv","descriere"]'::jsonb,
    '["Era <strong>fermecat</strong> de frumusețea peisajului.","Un moment <strong>fermecat</strong> de pace și armonie."]'::jsonb
  ),
  (
    'a-tremura-24',
    'a tremura',
    'verb (infinitiv)',
    'A vibra sau a se mișca rapid și necontrolat, de obicei din cauza frigului, fricii sau emoției. Poate fi fizic (tremurarea mâinilor) sau emoțional (tremura din emoție).',
    'https://picsum.photos/seed/tremura/800/600',
    '["acțiuni","fizic","emoții"]'::jsonb,
    '["<strong>Tremura</strong> de frig în noaptea rece.","Vocea i-a <strong>tremurat</strong> când a vorbit despre asta."]'::jsonb
  ),
  (
    'suflet-25',
    'suflet',
    'substantiv (n.)',
    'Partea spirituală sau emoțională a unei persoane; esența profundă a ființei umane. Sufletul reprezintă sentimentele, gândurile și personalitatea profundă.',
    'https://picsum.photos/seed/suflet/800/600',
    '["abstract","cultură","filosofie"]'::jsonb,
    '["A simțit că <strong>sufletul</strong> i se umple de bucurie.","Un <strong>suflet</strong> bun și generos."]'::jsonb
  ),
  (
    'a-inflori-26',
    'a înflori',
    'verb (infinitiv)',
    'A produce flori; a se dezvolta, a prospera, a ajunge la apogeul dezvoltării. Poate fi literal (o plantă înflorește) sau figurat (o idee, o relație înflorește).',
    'https://picsum.photos/seed/inflori/800/600',
    '["natură","dezvoltare","pozitiv"]'::jsonb,
    '["Cireșii au <strong>început să înflorească</strong> primăvara.","Prietenia lor a <strong>înflorit</strong> în ultimii ani."]'::jsonb
  ),
  (
    'melancolic-27',
    'melancolic',
    'adjectiv',
    'Care are sau exprimă melancolie; trist, nostalgic, cu o tristețe blândă și contemplativă. O persoană melancolică este adesea profundă și reflectivă.',
    'https://picsum.photos/seed/melancolic/800/600',
    '["emoții","stări","descriere"]'::jsonb,
    '["A avut un zâmbet <strong>melancolic</strong> privind fotografiile vechi.","O atmosferă <strong>melancolică</strong> de toamnă."]'::jsonb
  ),
  (
    'a-se-razgandi-28',
    'a se răzgândi',
    'verb (reflexiv, infinitiv)',
    'A-ți schimba părerea sau decizia; a reconsidera ceva și a alege altceva. Te răzgândești când realizezi că prima ta alegere nu era cea mai bună.',
    'https://picsum.photos/seed/razgandi/800/600',
    '["acțiuni","decizii","comportament"]'::jsonb,
    '["S-a <strong>răzgândit</strong> și a anulat călătoria.","După ce a reflectat, s-a <strong>răzgândit</strong> complet."]'::jsonb
  ),
  (
    'sclipitor-29',
    'sclipitor',
    'adjectiv',
    'Care strălucește, care emite lumină puternică; remarcabil, impresionant, deosebit. Ceva sclipitor atrage atenția prin strălucire sau prin calități excepționale.',
    'https://picsum.photos/seed/sclipitor/800/600',
    '["descriere","pozitiv","vizual"]'::jsonb,
    '["Un cer <strong>sclipitor</strong> de stele.","A avut o performanță <strong>sclipitoare</strong> la examen."]'::jsonb
  ),
  (
    'a-se-implini-30',
    'a se împlini',
    'verb (reflexiv, infinitiv)',
    'A deveni complet, a se realiza; a ajunge la finalizare sau la îndeplinire. Ceva se împlinește când devine realitate sau când ajunge la final.',
    'https://picsum.photos/seed/implini/800/600',
    '["acțiuni","realizare","abstract"]'::jsonb,
    '["Visul i s-a <strong>împlinit</strong> după mulți ani.","Termenul se <strong>împlinește</strong> mâine."]'::jsonb
  ),
  (
    'intunecat-31',
    'întunecat',
    'adjectiv',
    'Fără lumină sau cu foarte puțină lumină; întunecos. Poate fi literal (o cameră întunecată) sau figurat (gânduri întunecate, stări de spirit sumbre).',
    'https://picsum.photos/seed/intunecat/800/600',
    '["descriere","vizual","stări"]'::jsonb,
    '["O noapte <strong>întunecată</strong> fără lună.","A avut gânduri <strong>întunecate</strong> în acele zile."]'::jsonb
  ),
  (
    'a-respira-32',
    'a respira',
    'verb (infinitiv)',
    'A inhala și a expira aer; a trage aer în plămâni și apoi a-l elimina. Respirația este esențială pentru viață și poate fi controlată pentru relaxare.',
    'https://picsum.photos/seed/respira/800/600',
    '["acțiuni","fizic","viață"]'::jsonb,
    '["A <strong>respirat</strong> adânc înainte de a vorbi.","Aerul proaspăt era ușor de <strong>respirat</strong>."]'::jsonb
  ),
  (
    'fermecator-33',
    'fermecător',
    'adjectiv',
    'Care fermecă, care atrage și captează atenția; fascinant, încântător. Ceva fermecător are o calitate specială care te face să vrei să-l privești sau să-l asculți mai mult.',
    'https://picsum.photos/seed/fermecator/800/600',
    '["descriere","pozitiv","atractiv"]'::jsonb,
    '["O voce <strong>fermecătoare</strong> care te face să asculți.","Un peisaj <strong>fermecător</strong> de munte."]'::jsonb
  ),
  (
    'a-se-odihni-34',
    'a se odihni',
    'verb (reflexiv, infinitiv)',
    'A te relaxa, a te liniști, a-ți reface puterile; a lua o pauză din activități pentru a recupera energia. Te odihnești când ai nevoie de repaus.',
    'https://picsum.photos/seed/odihni/800/600',
    '["acțiuni","viață","relaxare"]'::jsonb,
    '["A decis să <strong>se odihnească</strong> după o zi lungă.","A <strong>se odihni</strong> este esențial pentru sănătate."]'::jsonb
  ),
  (
    'senin-35',
    'senin',
    'adjectiv',
    'Fără nori, clar; calm, liniștit, fără tulburări. Poate descrie vremea (cer senin) sau starea emoțională (minte senină, stare senină).',
    'https://picsum.photos/seed/senin/800/600',
    '["descriere","natură","stări"]'::jsonb,
    '["Un cer <strong>senin</strong> de vară.","A rămas <strong>senin</strong> în fața problemelor."]'::jsonb
  ),
  (
    'a-construi-36',
    'a construi',
    'verb (infinitiv)',
    'A clădi, a ridica o construcție; a crea, a dezvolta ceva pas cu pas. Poți construi literal (o casă) sau figurat (o relație, o carieră, un plan).',
    'https://picsum.photos/seed/construi/800/600',
    '["acțiuni","creare","dezvoltare"]'::jsonb,
    '["Au <strong>construit</strong> o casă nouă anul trecut.","A <strong>construit</strong> o carieră impresionantă din pasiune."]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = timezone('utc'::text, now());

