# Supabase SQL

Run SQL files in order from `supabase/sql`.

For a new project:

1. `001_profiles_and_pairing.sql`
2. `002_profile_avatar_storage.sql`
3. `003_profile_avatar_rpc.sql`
4. `004_get_my_profile_rpc.sql`
5. `005_pair_photos.sql`
6. `006_fix_pair_member_rls_recursion.sql`
7. `007_pair_photo_view_updates.sql`
8. `008_connect4_sessions.sql`
9. `009_connect4_reset_and_rematch.sql`
10. `010_drop_connect4_reset_function.sql`

For existing projects, only run new numbered files you have not applied yet. The files are written to be safe to rerun, but the intended workflow is incremental migrations instead of repeatedly pasting one large SQL file.
