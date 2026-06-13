-- ============================================================================
-- RAY — Inbox realtime via Broadcast from Database
-- Run this in the Supabase SQL Editor. Purely additive: does not touch the
-- existing Message/Conversation/User RLS policies or postgres_changes
-- publication entries (still used by useRealtimeMessages and presence).
--
-- Background: unfiltered postgres_changes subscriptions on the RLS-protected
-- Message/Conversation tables never deliver to clients (confirmed). This
-- file sets up DB-trigger-driven Broadcast to a private per-user channel
-- ("user:<userId>") instead, which the inbox sidebar subscribes to.
--
-- Prisma quotes table/column names, so they are case-sensitive: "Message",
-- "Conversation", "buyerId", "sellerId", "conversationId".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Broadcast Message inserts/updates to both participants' channels
-- ----------------------------------------------------------------------------
create or replace function public.broadcast_message_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  conv record;
begin
  select "buyerId", "sellerId" into conv
  from public."Conversation"
  where id = coalesce(new."conversationId", old."conversationId");

  if conv."buyerId" is not null then
    perform realtime.broadcast_changes(
      'user:' || conv."buyerId",
      tg_op,
      tg_op,
      tg_table_name,
      tg_table_schema,
      new,
      old
    );
  end if;

  if conv."sellerId" is not null then
    perform realtime.broadcast_changes(
      'user:' || conv."sellerId",
      tg_op,
      tg_op,
      tg_table_name,
      tg_table_schema,
      new,
      old
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_message_broadcast on public."Message";
create trigger on_message_broadcast
  after insert or update on public."Message"
  for each row execute function public.broadcast_message_change();

-- ----------------------------------------------------------------------------
-- 2. Broadcast new Conversations to both participants' channels
-- ----------------------------------------------------------------------------
create or replace function public.broadcast_conversation_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform realtime.broadcast_changes(
    'user:' || new."buyerId",
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );

  perform realtime.broadcast_changes(
    'user:' || new."sellerId",
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );

  return new;
end;
$$;

drop trigger if exists on_conversation_broadcast on public."Conversation";
create trigger on_conversation_broadcast
  after insert on public."Conversation"
  for each row execute function public.broadcast_conversation_insert();

-- ----------------------------------------------------------------------------
-- 3. Realtime Authorization: let each user read their own private channel
-- ----------------------------------------------------------------------------
drop policy if exists "Users read their own broadcast channel" on "realtime"."messages";

create policy "Users read their own broadcast channel"
on "realtime"."messages"
for select
to authenticated
using (
  realtime.topic() = 'user:' || auth.uid()::text
  and realtime.messages.extension = 'broadcast'
);
