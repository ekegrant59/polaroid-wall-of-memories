-- Run this in your Supabase SQL Editor to fix the missing 'position' column
-- This will add the column that tracks which slot each polaroid belongs to

ALTER TABLE polaroids ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_polaroids_position ON polaroids(position);
