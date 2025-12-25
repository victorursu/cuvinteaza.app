-- Query to show the most liked words from cuvinteziLikes
-- This query counts likes per word and orders by count descending

-- Simple version: Just word_id and like count
SELECT 
  word_id,
  COUNT(*) as like_count
FROM public."cuvinteziLikes"
GROUP BY word_id
ORDER BY like_count DESC;

-- Detailed version: Join with cuvinteziCuvinte to show word details
SELECT 
  l.word_id,
  c.title,
  c.grammar_block,
  c.definition,
  COUNT(*) as like_count
FROM public."cuvinteziLikes" l
LEFT JOIN public."cuvinteziCuvinte" c ON l.word_id = c.id
GROUP BY l.word_id, c.title, c.grammar_block, c.definition
ORDER BY like_count DESC;

-- Top 10 most liked words with details
SELECT 
  l.word_id,
  c.title,
  c.grammar_block,
  COUNT(*) as like_count
FROM public."cuvinteziLikes" l
LEFT JOIN public."cuvinteziCuvinte" c ON l.word_id = c.id
GROUP BY l.word_id, c.title, c.grammar_block
ORDER BY like_count DESC
LIMIT 10;

