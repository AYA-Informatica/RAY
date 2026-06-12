-- ============================================================================
-- RAY — Supabase SQL setup
-- Run this in the Supabase SQL Editor AFTER `prisma migrate deploy` has created
-- the tables. It wires up:
--   1. auth.users  ->  public."User"  sync trigger (Google Sign-In)
--   2. Row Level Security policies (UUID ownership isolation)
--
-- Prisma quotes table/column names, so they are case-sensitive: "User", "Listing".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Auth sync: copy new auth users into the public marketplace User table
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."User" (id, email, name, "avatarUrl", "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep email/name/avatar fresh on subsequent logins.
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public."User"
  set email = new.email,
      "updatedAt" = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_update();

-- ----------------------------------------------------------------------------
-- 2. Row Level Security
-- ----------------------------------------------------------------------------
alter table public."User" enable row level security;
alter table public."Listing" enable row level security;
alter table public."ListingImage" enable row level security;
alter table public."Favorite" enable row level security;
alter table public."Conversation" enable row level security;
alter table public."Message" enable row level security;
alter table public."Report" enable row level security;
alter table public."Block" enable row level security;
alter table public."Category" enable row level security;
alter table public."CategoryAttribute" enable row level security;
alter table public."ListingAttributeValue" enable row level security;

-- Users: read any public profile, edit only your own.
create policy "Public profiles are readable"
  on public."User" for select using (true);
create policy "Users update own profile"
  on public."User" for update using (auth.uid() = id);

-- Categories + attributes: public read.
create policy "Categories readable" on public."Category" for select using (true);
create policy "Attributes readable" on public."CategoryAttribute" for select using (true);
create policy "Attribute values readable" on public."ListingAttributeValue" for select using (true);

-- Listings: public read of ACTIVE listings; owners do everything to their own.
create policy "Active listings are public"
  on public."Listing" for select using (status = 'ACTIVE' or auth.uid() = "userId");
create policy "Users insert own listings"
  on public."Listing" for insert with check (auth.uid() = "userId");
create policy "Users update own listings"
  on public."Listing" for update using (auth.uid() = "userId");
create policy "Users delete own listings"
  on public."Listing" for delete using (auth.uid() = "userId");

create policy "Listing images readable" on public."ListingImage" for select using (true);

-- Favorites: private to the owner.
create policy "Users read own favorites"
  on public."Favorite" for select using (auth.uid() = "userId");
create policy "Users add own favorites"
  on public."Favorite" for insert with check (auth.uid() = "userId");
create policy "Users remove own favorites"
  on public."Favorite" for delete using (auth.uid() = "userId");

-- Conversations + messages: only the buyer and seller may access.
create policy "Participants read conversations"
  on public."Conversation" for select
  using (auth.uid() = "buyerId" or auth.uid() = "sellerId");
create policy "Buyer creates conversation"
  on public."Conversation" for insert with check (auth.uid() = "buyerId");

create policy "Participants read messages"
  on public."Message" for select
  using (
    exists (
      select 1 from public."Conversation" c
      where c.id = "conversationId"
        and (auth.uid() = c."buyerId" or auth.uid() = c."sellerId")
    )
  );
create policy "Sender writes own messages"
  on public."Message" for insert with check (auth.uid() = "senderId");

-- Reports: a user may file a report; only staff (service role) read them.
create policy "Users file reports"
  on public."Report" for insert with check (auth.uid() = "reporterId");

-- Blocks: a user manages only their own block list.
create policy "Users read own blocks"
  on public."Block" for select using (auth.uid() = "blockerId");
create policy "Users create own blocks"
  on public."Block" for insert with check (auth.uid() = "blockerId");
create policy "Users remove own blocks"
  on public."Block" for delete using (auth.uid() = "blockerId");

-- NOTE: Admin/moderator access bypasses RLS via the service-role key, used only
-- on the server in the admin API. Never expose the service-role key client-side.

-- ListingAttributeValue: owners insert via listing (service role handles updates/deletes).
-- Direct inserts via the API are always through the listing owner's context.
create policy "Listing owners write attribute values"
  on public."ListingAttributeValue" for insert
  with check (
    exists (
      select 1 from public."Listing" l
      where l.id = "listingId" and l."userId" = auth.uid()
    )
  );

create policy "Listing owners delete attribute values"
  on public."ListingAttributeValue" for delete
  using (
    exists (
      select 1 from public."Listing" l
      where l.id = "listingId" and l."userId" = auth.uid()
    )
  );

-- CategoryAttribute: only admins (service role) may write categories/attributes.
-- No explicit policy needed — unmatched INSERT/UPDATE/DELETE are denied by default when RLS is ON.
-- The service role bypasses RLS entirely, so seeding via the API works correctly.

-- ----------------------------------------------------------------------------
-- 3. Realtime: broadcast INSERT/UPDATE on Message, User, and Conversation
-- Without this, postgres_changes subscriptions in the chat UI receive nothing
-- (new messages, read receipts, presence updates, and brand-new conversations
-- require a full refresh).
-- REPLICA IDENTITY FULL ensures UPDATE payloads include the full row (needed
-- for payload.new.isRead and payload.new.lastSeenAt).
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public."Message";
alter publication supabase_realtime add table public."User";
alter publication supabase_realtime add table public."Conversation";

alter table public."Message" replica identity full;
alter table public."User" replica identity full;
