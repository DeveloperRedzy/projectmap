-- Create profiles for any existing auth users that don't have one
INSERT INTO profiles (id, first_name, last_name)
SELECT id,
  COALESCE(raw_user_meta_data->>'first_name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'last_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify profiles exist
SELECT p.id, p.first_name, p.last_name, u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id;
