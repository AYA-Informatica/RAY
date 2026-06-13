-- ============================================================================
-- RAY — Add per-user "hide conversation" columns
-- Run this in the Supabase SQL Editor (direct DB connection from this dev
-- environment is unreachable, so `prisma db push` can't apply it).
--
-- Additive: two nullable columns on Conversation. A conversation is hidden
-- for a user when their *HiddenAt timestamp is >= the conversation's
-- updatedAt — so it reappears automatically once a new message arrives.
-- ============================================================================

alter table public."Conversation"
  add column if not exists "buyerHiddenAt" timestamp(3),
  add column if not exists "sellerHiddenAt" timestamp(3);
