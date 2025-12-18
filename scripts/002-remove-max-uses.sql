-- Remove max_uses constraint - access codes can now be used infinitely
-- This migration updates existing codes to have no usage limit

UPDATE access_codes SET max_uses = NULL WHERE max_uses IS NOT NULL;
