-- Add 3 urban/slang Romanian words to cuvinteziCuvinte table
-- These words should be tagged with "urban" or "slang" for the Urbanisme screen

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
    'a-se-bagat-urb-001',
    'a se băga',
    'verb (reflexiv, infinitiv)',
    'A interveni într-o conversație sau situație fără să fii invitat; a se amesteca în treburile altora. În limbajul urban, "a te băga" înseamnă să te implici sau să comentezi despre ceva.',
    'https://picsum.photos/seed/bagat/800/600',
    '["urban","slang","acțiuni","comportament"]'::jsonb,
    '["Nu te <strong>băga</strong> în discuția noastră!","S-a <strong>băgat</strong> în seamă fără să fie întrebat."]'::jsonb
  ),
  (
    'smecher-urb-002',
    'șmecher',
    'adjectiv / substantiv',
    'Deștept, isteț, care știe să se descurce; persoană inteligentă care găsește soluții ingenioase. În limbajul urban, un șmecher este cineva care este cool, inteligent sau care știe cum să rezolve probleme.',
    'https://picsum.photos/seed/smecher/800/600',
    '["urban","slang","caracter","pozitiv"]'::jsonb,
    '["E un tip <strong>șmecher</strong>, știe să rezolve orice problemă.","A făcut o mișcare <strong>șmecheră</strong> și a scăpat din situație."]'::jsonb
  ),
  (
    'a-se-dat-urb-003',
    'a se da',
    'verb (reflexiv, infinitiv)',
    'A pretinde, a se comporta ca și cum ai fi ceva ce nu ești; a se face de râs sau a încerca să impresionezi. În limbajul urban, "a te da" înseamnă să te prefaci sau să te comporți într-un anumit mod pentru a impresiona.',
    'https://picsum.photos/seed/dat/800/600',
    '["urban","slang","acțiuni","comportament","negativ"]'::jsonb,
    '["Se <strong>dă</strong> deștept, dar nu știe nimic.","Nu te <strong>da</strong> important când nu ești."]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = timezone('utc'::text, now());


