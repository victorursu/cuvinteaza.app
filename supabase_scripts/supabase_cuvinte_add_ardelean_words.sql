-- Add 16 Ardeal regional words to cuvinteziCuvinte table
-- These are regional words from Transylvania (Ardeal)

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
    'ard-001',
    'a se hodini',
    'verb (infinitiv)',
    'A se odihni, a-și trage sufletul după muncă. Verbul sugerează o pauză firească, luată fără grabă.',
    'https://picsum.photos/seed/hodini/800/600',
    '["regionalisme","ardeal","verbe"]'::jsonb,
    '["După lucru, s-o pus pe prispă să se <strong>hodinească</strong>.","No, hai să ne <strong>hodinim</strong> oleacă."]'::jsonb
  ),
  (
    'ard-002',
    'a se îmbuca',
    'verb (infinitiv)',
    'A mânca, de obicei cu poftă. Termen familiar, folosit în contexte casnice sau prietenești.',
    'https://picsum.photos/seed/imbuca/800/600',
    '["regionalisme","ardeal","verbe"]'::jsonb,
    '["Ne-am <strong>îmbucat</strong> bine înainte de drum.","Hai să ne <strong>îmbucăm</strong> ceva."]'::jsonb
  ),
  (
    'ard-003',
    'a se hodorogi',
    'verb (infinitiv)',
    'A bolborosi sau a merge prost, făcând zgomote neplăcute, mai ales despre un obiect stricat.',
    'https://picsum.photos/seed/hodorogi/800/600',
    '["regionalisme","ardeal","verbe"]'::jsonb,
    '["Motorul se <strong>hodorogea</strong> de parcă era pe ducă.","Tot <strong>hodorogește</strong> cazanul ăla."]'::jsonb
  ),
  (
    'ard-004',
    'a se fofila',
    'verb (infinitiv)',
    'A se eschiva, a evita o responsabilitate sau un răspuns direct.',
    'https://picsum.photos/seed/fofila/800/600',
    '["regionalisme","ardeal","verbe"]'::jsonb,
    '["Nu te mai <strong>fofila</strong> și spune drept.","S-o <strong>fofilat</strong> când a fost de lucru."]'::jsonb
  ),
  (
    'ard-005',
    'a se îndărătnici',
    'verb (infinitiv)',
    'A deveni încăpățânat, a insista pe propria voință în ciuda argumentelor.',
    'https://picsum.photos/seed/indaratnic/800/600',
    '["regionalisme","ardeal","verbe"]'::jsonb,
    '["S-o <strong>îndărătnicit</strong> și nu mai cedează.","Când se <strong>îndărătnicește</strong>, nu-l mai întorci."]'::jsonb
  ),
  (
    'ard-006',
    'fain',
    'adjectiv',
    'Frumos, plăcut, reușit. Un cuvânt emblematic pentru vorbirea ardelenească.',
    'https://picsum.photos/seed/fain/800/600',
    '["regionalisme","ardeal","adjective"]'::jsonb,
    '["O fost tare <strong>fain</strong> la munte.","Ce zi <strong>faină</strong>!"]'::jsonb
  ),
  (
    'ard-007',
    'no',
    'interjecție',
    'Exprimă acordul, tranziția sau îndemnul: ei bine, hai, așa.',
    'https://picsum.photos/seed/no/800/600',
    '["regionalisme","ardeal","interjecții"]'::jsonb,
    '["<strong>No</strong>, hai că-i gata.","<strong>No</strong>, așe zic și eu."]'::jsonb
  ),
  (
    'ard-008',
    'io',
    'pronume personal',
    'Forma regională pentru «eu», frecvent folosită în vorbirea colocvială.',
    'https://picsum.photos/seed/io/800/600',
    '["regionalisme","ardeal","pronume"]'::jsonb,
    '["<strong>Io</strong> nu știu de asta.","<strong>Io</strong> aș zice să mai așteptăm."]'::jsonb
  ),
  (
    'ard-009',
    'apăi',
    'adverb / interjecție',
    'Așadar, deci; marchează concluzia sau resemnarea.',
    'https://picsum.photos/seed/apai/800/600',
    '["regionalisme","ardeal","interjecții"]'::jsonb,
    '["<strong>Apăi</strong>, ce să faci?","<strong>Apăi</strong>, așe-o fost."]'::jsonb
  ),
  (
    'ard-010',
    'tăt',
    'adjectiv / pronume',
    'Tot, întreg. Formă prescurtată, foarte frecventă în Ardeal.',
    'https://picsum.photos/seed/tat/800/600',
    '["regionalisme","ardeal"]'::jsonb,
    '["O mâncat <strong>tăt</strong> din blid.","<strong>Tăt</strong> satul știe."]'::jsonb
  ),
  (
    'ard-011',
    'amu',
    'adverb de timp',
    'Acum, în momentul de față.',
    'https://picsum.photos/seed/amu/800/600',
    '["regionalisme","ardeal"]'::jsonb,
    '["<strong>Amu</strong> vin.","<strong>Amu</strong> îi vremea."]'::jsonb
  ),
  (
    'ard-012',
    'curechi',
    'substantiv',
    'Varză. Termen tradițional folosit mai ales în mediul rural.',
    'https://picsum.photos/seed/curechi/800/600',
    '["regionalisme","ardeal","substantive"]'::jsonb,
    '["O pus <strong>curechi</strong> la murat.","Supa de <strong>curechi</strong> îi gata."]'::jsonb
  ),
  (
    'ard-013',
    'zăpuc',
    'substantiv',
    'Persoană zăpăcită, neastâmpărată sau dezordonată.',
    'https://picsum.photos/seed/zapuc/800/600',
    '["regionalisme","ardeal"]'::jsonb,
    '["Îi tare <strong>zăpuc</strong> copilu'' ăsta.","Nu fi <strong>zăpuc</strong>!"]'::jsonb
  ),
  (
    'ard-014',
    'lepedău',
    'substantiv',
    'Haină groasă, de obicei purtată iarna.',
    'https://picsum.photos/seed/lepedau/800/600',
    '["regionalisme","ardeal","substantive"]'::jsonb,
    '["Ia-ți <strong>lepedăul</strong> că-i frig.","Și-o pus <strong>lepedăul</strong> pe el."]'::jsonb
  ),
  (
    'ard-015',
    'tău',
    'substantiv',
    'Lac mic de munte sau de câmpie.',
    'https://picsum.photos/seed/tau/800/600',
    '["regionalisme","ardeal","natură"]'::jsonb,
    '["S-o oprit lângă <strong>tău</strong>.","<strong>Tăul</strong> era liniștit dimineața."]'::jsonb
  ),
  (
    'ard-016',
    'blid',
    'substantiv',
    'Farfurie. Termen tradițional, foarte răspândit.',
    'https://picsum.photos/seed/blid/800/600',
    '["regionalisme","ardeal","substantive"]'::jsonb,
    '["O golit <strong>blidul</strong>.","Pune mâncarea în <strong>blid</strong>."]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = timezone('utc'::text, now());

