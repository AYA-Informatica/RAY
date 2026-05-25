-- ============================================================================
-- RAY - Complete Database Schema for Manual Setup
-- Run this ENTIRE script in Supabase SQL Editor
-- This creates all tables, enums, and indexes from the Prisma schema
-- ============================================================================

-- Create Enums
CREATE TYPE "Condition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'USED');
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED', 'FLAGGED');
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'FAKE', 'STOLEN', 'HARASSMENT', 'SCAM', 'INAPPROPRIATE');
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'BOOLEAN');

-- User Table (mirrored from auth.users)
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  "avatarUrl" TEXT,
  bio TEXT,
  city VARCHAR(255),
  district VARCHAR(255),
  neighborhood VARCHAR(255),
  role "UserRole" NOT NULL DEFAULT 'USER',
  "isBanned" BOOLEAN NOT NULL DEFAULT false,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_city_idx" ON "User"("city");
CREATE INDEX "User_district_idx" ON "User"("district");

-- Block Table
CREATE TABLE "Block" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "blockerId" UUID NOT NULL,
  "blockedId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");
CREATE INDEX "Block_blockerId_idx" ON "Block"("blockerId");
CREATE INDEX "Block_blockedId_idx" ON "Block"("blockedId");

-- Category Table
CREATE TABLE "Category" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(255),
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CategoryAttribute Table
CREATE TABLE "CategoryAttribute" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "categoryId" VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL,
  type "AttributeType" NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  placeholder VARCHAR(255),
  options JSONB,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "CategoryAttribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "CategoryAttribute_categoryId_key_key" ON "CategoryAttribute"("categoryId", "key");
CREATE INDEX "CategoryAttribute_categoryId_idx" ON "CategoryAttribute"("categoryId");

-- Listing Table
CREATE TABLE "Listing" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  negotiable BOOLEAN NOT NULL DEFAULT true,
  condition "Condition" NOT NULL,
  city VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
  views INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" UUID NOT NULL,
  "categoryId" VARCHAR(255) NOT NULL,
  
  CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(id)
);

CREATE INDEX "Listing_city_idx" ON "Listing"("city");
CREATE INDEX "Listing_district_idx" ON "Listing"("district");
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- ListingImage Table
CREATE TABLE "ListingImage" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "listingId" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"(id) ON DELETE CASCADE
);

CREATE INDEX "ListingImage_listingId_idx" ON "ListingImage"("listingId");

-- ListingAttributeValue Table
CREATE TABLE "ListingAttributeValue" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "listingId" VARCHAR(255) NOT NULL,
  "attributeId" VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  
  CONSTRAINT "ListingAttributeValue_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"(id) ON DELETE CASCADE,
  CONSTRAINT "ListingAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "CategoryAttribute"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "ListingAttributeValue_listingId_attributeId_key" ON "ListingAttributeValue"("listingId", "attributeId");
CREATE INDEX "ListingAttributeValue_listingId_idx" ON "ListingAttributeValue"("listingId");
CREATE INDEX "ListingAttributeValue_attributeId_idx" ON "ListingAttributeValue"("attributeId");

-- Favorite Table
CREATE TABLE "Favorite" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "listingId" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

-- Conversation Table
CREATE TABLE "Conversation" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "listingId" VARCHAR(255) NOT NULL,
  "buyerId" UUID NOT NULL,
  "sellerId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"(id) ON DELETE CASCADE,
  CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"(id),
  CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"(id)
);

CREATE UNIQUE INDEX "Conversation_listingId_buyerId_key" ON "Conversation"("listingId", "buyerId");
CREATE INDEX "Conversation_buyerId_idx" ON "Conversation"("buyerId");
CREATE INDEX "Conversation_sellerId_idx" ON "Conversation"("sellerId");
CREATE INDEX "Conversation_listingId_idx" ON "Conversation"("listingId");

-- Message Table
CREATE TABLE "Message" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" VARCHAR(255) NOT NULL,
  "senderId" UUID NOT NULL,
  content TEXT,
  "imageUrl" TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"(id) ON DELETE CASCADE,
  CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"(id)
);

CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- Report Table
CREATE TABLE "Report" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  reason "ReportReason" NOT NULL,
  details TEXT,
  "reporterId" UUID NOT NULL,
  "listingId" VARCHAR(255),
  resolved BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"(id),
  CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"(id) ON DELETE CASCADE
);

CREATE INDEX "Report_listingId_idx" ON "Report"("listingId");
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");
CREATE INDEX "Report_resolved_idx" ON "Report"("resolved");

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Database schema created successfully!' AS message;
