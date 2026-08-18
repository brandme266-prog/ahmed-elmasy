-- Add email column to site_settings table
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'info.ganna1@gmail.com';

-- Update existing row with the new email
UPDATE public.site_settings SET email = 'info.ganna1@gmail.com' WHERE id = true;