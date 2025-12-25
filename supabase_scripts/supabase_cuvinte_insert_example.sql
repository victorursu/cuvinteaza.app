-- Example: How to insert vocabulary words into cuvinteziCuvinte table
-- Based on the structure from fallbackVocabulary.ro.json

-- Example 1: Insert a word with all fields
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
  '["emoții", "cultură", "nostalgie"]'::jsonb,
  '["Mi-e <strong>dor</strong> de bunici și de mirosul de cozonac din copilărie.", "<strong>Dorul</strong> de casă îl însoțea în fiecare seară."]'::jsonb
);

-- Example 2: Insert another word
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
  '["timp", "echilibru", "viață"]'::jsonb,
  '["După ședință, și-a luat un <strong>răgaz</strong> de zece minute să respire.", "În weekend caut un <strong>răgaz</strong> pentru lectură și plimbare."]'::jsonb
);

-- Example 3: Query words by tag
SELECT * FROM public."cuvinteziCuvinte"
WHERE tags @> '["emoții"]'::jsonb;

-- Example 4: Search words by title (case-insensitive)
SELECT * FROM public."cuvinteziCuvinte"
WHERE LOWER(title) LIKE LOWER('%dor%');

-- Example 5: Get all words with a specific grammar type
SELECT * FROM public."cuvinteziCuvinte"
WHERE grammar_block LIKE '%substantiv%';

-- Example 6: Update a word
UPDATE public."cuvinteziCuvinte"
SET 
  definition = 'Updated definition here',
  updated_at = now()
WHERE id = 'dor-1';

