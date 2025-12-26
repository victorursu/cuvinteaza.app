-- Add daily words for December 2025 and January 2026
-- Insert multiple daily words with their dates
-- Note: word_id is BIGINT after migration

INSERT INTO public."cuvinteziDailyWords" (word_id, date)
VALUES
  (37, '2025-12-26'),
  (38, '2025-12-28'),
  (44, '2025-12-29'),
  (79, '2025-12-30'),
  (78, '2025-12-31'),
  (96, '2026-01-01')
ON CONFLICT (date) 
DO UPDATE SET 
  word_id = EXCLUDED.word_id,
  updated_at = timezone('utc'::text, now());

