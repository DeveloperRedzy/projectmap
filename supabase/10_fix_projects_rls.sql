-- Check if RLS is enabled on projects
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'projects';
