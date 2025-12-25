-- Add daily words for specific dates
-- reg-005 for December 20, 2025
-- urb-002 for December 21, 2025

INSERT INTO public."cuvinteziDailyWords" (word_id, date)
VALUES
  ('reg-005', '2025-12-20'),
  ('urb-002', '2025-12-21')
ON CONFLICT (date) DO UPDATE
SET word_id = EXCLUDED.word_id,
    updated_at = timezone('utc'::text, now());

