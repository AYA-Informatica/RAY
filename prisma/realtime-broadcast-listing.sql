-- ============================================================================
-- RAY — Live listing status/expiry broadcast to chat inbox
-- Run this in the Supabase SQL Editor. Purely additive: builds on the
-- broadcast infra from realtime-broadcast.sql (same private "user:<userId>"
-- channels and RLS policy — no new policy needed here).
--
-- When a Listing's status or expiresAt changes (e.g. marked SOLD/EXPIRED),
-- fan the change out to every user who has a conversation about that
-- listing, so their inbox badge updates live.
-- ============================================================================

create or replace function public.broadcast_listing_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uid uuid;
begin
  for uid in
    select "buyerId" from public."Conversation" where "listingId" = new.id
    union
    select "sellerId" from public."Conversation" where "listingId" = new.id
  loop
    perform realtime.broadcast_changes(
      'user:' || uid,
      tg_op,
      tg_op,
      tg_table_name,
      tg_table_schema,
      new,
      old
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists on_listing_status_broadcast on public."Listing";
create trigger on_listing_status_broadcast
  after update on public."Listing"
  for each row
  when (old.status is distinct from new.status or old."expiresAt" is distinct from new."expiresAt")
  execute function public.broadcast_listing_status_change();
