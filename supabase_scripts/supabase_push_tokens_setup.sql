-- Create the push tokens table
CREATE TABLE "cuvinteziPushTokens" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  device_info text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX ON "cuvinteziPushTokens" (user_id);
CREATE INDEX ON "cuvinteziPushTokens" (token);

-- Enable Row Level Security
ALTER TABLE "cuvinteziPushTokens" ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own tokens
-- Also allow viewing tokens with null user_id (for checking if token exists before login)
CREATE POLICY "Users can view their own push tokens" ON "cuvinteziPushTokens"
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy for authenticated users to insert their own tokens
-- Also allow inserting tokens with null user_id (for when user is not logged in)
CREATE POLICY "Users can insert their own push tokens" ON "cuvinteziPushTokens"
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy for authenticated users to update their own tokens
-- Also allow updating tokens that have null user_id (to associate them when user logs in)
CREATE POLICY "Users can update their own push tokens" ON "cuvinteziPushTokens"
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy for authenticated users to delete their own tokens
CREATE POLICY "Users can delete their own push tokens" ON "cuvinteziPushTokens"
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_push_token_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on each update
CREATE TRIGGER update_cuvintezi_push_token_updated_at
  BEFORE UPDATE ON "cuvinteziPushTokens"
  FOR EACH ROW EXECUTE FUNCTION update_push_token_updated_at();

