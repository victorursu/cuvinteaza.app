-- Add the word "a chilăvi" to cuvinteziCuvinte table
-- Verb, regional/archaic word meaning extreme physical exhaustion

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
    'a-chilavi-50',
    'a chilăvi',
    'verb (infinitiv, regional, arhaic)',
    'A slăbi foarte tare, a ajunge într-o stare de epuizare fizică, a se prăpădi de puteri, de obicei din cauza bolii, foamei, muncii grele sau neglijenței. Cuvântul este mai des întâlnit în vorbirea populară, în special în zone rurale, și apare rar în limbajul modern standard.',
    'https://picsum.photos/seed/chilavi/800/600',
    '["regional","arhaic","verb","populare","rural","epuizare"]'::jsonb,
    '["Calul a <strong>chilăvit</strong> de atâta drum și lipsă de hrană.","Omul era <strong>chilăvit</strong> după boală."]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = timezone('utc'::text, now());

