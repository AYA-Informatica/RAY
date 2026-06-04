# Supabase Database Setup Instructions

## Step 1: Apply Database Schema

Go to Supabase SQL Editor: https://supabase.com/dashboard/project/afipvqridgcfauinbqnr/sql/new

Copy and paste the ENTIRE content of `prisma/manual-schema.sql` and click RUN.

This creates all tables, enums, indexes, and foreign keys.

## Step 2: Setup Auth Sync & Row Level Security

In the same SQL Editor, copy and paste the ENTIRE content of `prisma/setup.sql` and click RUN.

This sets up:
- Automatic sync from auth.users to public."User" table
- Row Level Security policies for all tables

## Step 3: Create Storage Buckets

Go to: https://supabase.com/dashboard/project/afipvqridgcfauinbqnr/storage/buckets

Create 3 PUBLIC buckets:
1. `listings` - for listing images
2. `avatars` - for user profile pictures  
3. `chat-images` - for images shared in chat

Make sure each is set to PUBLIC when creating.

## Step 4: Seed Categories (Run Locally)

After completing Steps 1-3, run this locally:

```bash
npm run db:seed
```

This will populate the 10 launch categories (Phones, Electronics, Cars, etc.) with their dynamic attributes.

## Step 5: Configure Google OAuth

Go to: https://supabase.com/dashboard/project/afipvqridgcfauinbqnr/auth/providers

- Enable Google provider
- Add your Google OAuth Client ID and Client Secret
- Add authorized redirect URLs:
  - http://localhost:3000/auth/callback (development)
  - https://ray-production.vercel.app/auth/callback (production)

## Verification

After all steps, test locally:
```bash
npm run dev
```

Visit http://localhost:3000 - you should see the home page without errors.
