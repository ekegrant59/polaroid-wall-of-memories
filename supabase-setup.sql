-- =====================================================
-- WALL OF MEMORIES - SUPABASE SETUP
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Walls table (main memory wall data)
CREATE TABLE IF NOT EXISTS walls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    letter_content TEXT DEFAULT '',
    final_image_url TEXT DEFAULT '',
    final_message TEXT DEFAULT '',
    pin_code TEXT,
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polaroids table (individual polaroid cards)
CREATE TABLE IF NOT EXISTS polaroids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wall_id UUID REFERENCES walls(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    message TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    rotation INTEGER DEFAULT 0,
    position_x TEXT DEFAULT '0%',
    position_y TEXT DEFAULT '0%',
    z_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_walls_user_id ON walls(user_id);
CREATE INDEX IF NOT EXISTS idx_walls_slug ON walls(slug);
CREATE INDEX IF NOT EXISTS idx_polaroids_wall_id ON polaroids(wall_id);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE polaroids ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RLS POLICIES FOR WALLS TABLE
-- (Drop existing policies first to avoid conflicts)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own walls" ON walls;
DROP POLICY IF EXISTS "Public can view published walls" ON walls;
DROP POLICY IF EXISTS "Users can create own walls" ON walls;
DROP POLICY IF EXISTS "Users can update own walls" ON walls;
DROP POLICY IF EXISTS "Users can delete own walls" ON walls;

-- Users can view their own walls
CREATE POLICY "Users can view own walls"
ON walls FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public can view published walls (for sharing)
CREATE POLICY "Public can view published walls"
ON walls FOR SELECT
TO anon
USING (is_published = true);

-- Users can create their own walls
CREATE POLICY "Users can create own walls"
ON walls FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own walls
CREATE POLICY "Users can update own walls"
ON walls FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own walls
CREATE POLICY "Users can delete own walls"
ON walls FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 4. RLS POLICIES FOR POLAROIDS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own polaroids" ON polaroids;
DROP POLICY IF EXISTS "Public can view published polaroids" ON polaroids;
DROP POLICY IF EXISTS "Users can create own polaroids" ON polaroids;
DROP POLICY IF EXISTS "Users can update own polaroids" ON polaroids;
DROP POLICY IF EXISTS "Users can delete own polaroids" ON polaroids;

-- Users can view polaroids of their own walls
CREATE POLICY "Users can view own polaroids"
ON polaroids FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM walls 
        WHERE walls.id = polaroids.wall_id 
        AND walls.user_id = auth.uid()
    )
);

-- Public can view polaroids of published walls
CREATE POLICY "Public can view published polaroids"
ON polaroids FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM walls 
        WHERE walls.id = polaroids.wall_id 
        AND walls.is_published = true
    )
);

-- Users can create polaroids for their own walls
CREATE POLICY "Users can create own polaroids"
ON polaroids FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM walls 
        WHERE walls.id = polaroids.wall_id 
        AND walls.user_id = auth.uid()
    )
);

-- Users can update polaroids of their own walls
CREATE POLICY "Users can update own polaroids"
ON polaroids FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM walls 
        WHERE walls.id = polaroids.wall_id 
        AND walls.user_id = auth.uid()
    )
);

-- Users can delete polaroids of their own walls
CREATE POLICY "Users can delete own polaroids"
ON polaroids FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM walls 
        WHERE walls.id = polaroids.wall_id 
        AND walls.user_id = auth.uid()
    )
);

-- =====================================================
-- 5. STORAGE BUCKET FOR IMAGES
-- =====================================================

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wall-images', 
    'wall-images', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- =====================================================
-- 6. STORAGE POLICIES
-- (Drop existing policies first to avoid conflicts)
-- =====================================================

DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;

-- Users can upload to their own folder (folder name = user id)
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'wall-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'wall-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'wall-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view images (public bucket)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wall-images');

-- =====================================================
-- 7. HELPER FUNCTION FOR VIEW COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION increment_view_count(wall_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE walls 
    SET view_count = view_count + 1 
    WHERE slug = wall_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS walls_updated_at ON walls;
CREATE TRIGGER walls_updated_at
    BEFORE UPDATE ON walls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- DONE! Your database is now ready.
-- =====================================================
