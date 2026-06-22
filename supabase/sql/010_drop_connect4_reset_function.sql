-- Cleans up the obsolete mid-game Connect 4 reset RPC.
-- Run this if you previously applied an older draft of 009_connect4_reset_and_rematch.sql.

drop function if exists public.reset_connect4_session(uuid);
