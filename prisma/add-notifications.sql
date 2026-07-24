-- Notification — in-app notification center.
-- Run in Supabase SQL Editor (not via prisma migrate).
--
-- Added in schema.prisma by commit 493a3e2 without a matching migration,
-- which left the live DB without this table and broke AppShell (every
-- authenticated page) via the unguarded getUnreadNotificationCount() call.

CREATE TABLE IF NOT EXISTS public."Notification" (
  "id"        TEXT PRIMARY KEY,
  "userId"    UUID NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "type"      TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "body"      TEXT,
  "link"      TEXT,
  "isRead"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx"
  ON public."Notification" ("userId", "isRead");

CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx"
  ON public."Notification" ("userId", "createdAt" DESC);
