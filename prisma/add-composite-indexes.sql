-- Composite indexes for RAY launch performance.
-- Run in Supabase SQL Editor (not via prisma migrate).

-- Home feed: status + createdAt for "newest active listings"
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Listing_status_createdAt_idx"
  ON public."Listing" ("status", "createdAt" DESC);

-- Inbox: buyer/seller conversations sorted by last activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Conversation_buyerId_updatedAt_idx"
  ON public."Conversation" ("buyerId", "updatedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Conversation_sellerId_updatedAt_idx"
  ON public."Conversation" ("sellerId", "updatedAt" DESC);

-- Chat thread: messages in a conversation sorted by time
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Message_conversationId_createdAt_idx"
  ON public."Message" ("conversationId", "createdAt" ASC);

-- Unread count: batch unread per conversation (covers the groupBy query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Message_conversationId_isRead_senderId_idx"
  ON public."Message" ("conversationId", "isRead", "senderId");
