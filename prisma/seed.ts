/* eslint-disable no-console */
import { PrismaClient, AttributeType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Launch categories (liquidity-first ordering per MVP Discovery):
 * Phones + Rentals + Cars are the liquidity engine; the rest are expansion.
 */
type SeedAttribute = {
  label: string;
  key: string;
  type: AttributeType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

type SeedCategory = {
  name: string;
  slug: string;
  icon: string; // emoji used in the category grid (matches wireframes)
  order: number;
  attributes: SeedAttribute[];
};

const CATEGORIES: SeedCategory[] = [
  {
    name: "Phones & Accessories",
    slug: "phones",
    icon: "📱",
    order: 1,
    attributes: [
      { label: "Item Type", key: "item_type", type: "SELECT", required: true, options: ["Smartphone", "Tablet / iPad", "Accessory — Case & Cover", "Accessory — Charger & Cable", "Accessory — Earphones & Headphones", "Accessory — Screen Protector", "Accessory — Power Bank", "Accessory — Memory Card", "Accessory — Other"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Apple, Samsung, Infinix, Tecno" },
      { label: "Storage", key: "storage", type: "SELECT", options: ["8GB", "16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] },
      { label: "RAM", key: "ram", type: "SELECT", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"] },
      { label: "Battery Health", key: "battery_health", type: "SELECT", options: ["100%", "90–99%", "80–89%", "70–79%", "Below 70%", "Unknown"] },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent"] },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "💻",
    order: 2,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", required: true, options: ["Laptop", "TV", "Audio", "Camera", "Gaming", "Accessory", "Other"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Dell, Sony" },
      { label: "Warranty", key: "warranty", type: "BOOLEAN" },
    ],
  },
  {
    name: "Cars",
    slug: "cars",
    icon: "🚗",
    order: 3,
    attributes: [
      { label: "Brand", key: "brand", type: "SELECT", required: true, options: ["Toyota", "Honda", "Nissan", "Mazda", "Mercedes-Benz", "BMW", "Volkswagen", "Suzuki", "Other"] },
      { label: "Year", key: "year", type: "NUMBER", required: true, placeholder: "e.g. 2018" },
      { label: "Mileage (km)", key: "mileage", type: "NUMBER", placeholder: "e.g. 85000" },
      { label: "Fuel Type", key: "fuel", type: "SELECT", options: ["Petrol", "Diesel", "Hybrid", "Electric"] },
      { label: "Transmission", key: "transmission", type: "SELECT", options: ["Manual", "Automatic"] },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent — Daily", "For Rent — Weekly", "For Rent — Monthly"] },
    ],
  },
  {
    name: "Bikes",
    slug: "bikes",
    icon: "🏍️",
    order: 4,
    attributes: [
      { label: "Bike Type", key: "bike_type", type: "SELECT", required: true, options: ["Bicycle", "Motorbike / Motorcycle", "Scooter / Moped", "Electric Bike (E-bike)"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Honda, Yamaha, Trek, Giant" },
      { label: "Year", key: "year", type: "NUMBER", placeholder: "e.g. 2020" },
      { label: "Engine Size", key: "engine_size", type: "SELECT", options: ["Under 125cc", "125cc", "150cc", "200cc", "250cc", "400cc", "600cc+"] },
      { label: "Frame / Style", key: "frame_style", type: "SELECT", options: ["Mountain", "Road", "City / Hybrid", "BMX", "Kids", "Other"] },
      { label: "Mileage", key: "mileage", type: "NUMBER", placeholder: "e.g. 12000 km" },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent — Daily", "For Rent — Weekly"] },
      { label: "Condition", key: "condition", type: "SELECT", required: true, options: ["New", "Like New", "Good", "Fair", "Used"] },
    ],
  },
  {
    name: "Residential Rentals",
    slug: "residential-rentals",
    icon: "🏠",
    order: 5,
    attributes: [
      { label: "Property Type", key: "property_type", type: "SELECT", required: true, options: ["Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms", "Full House", "Villa / Compound", "Shared Room"] },
      { label: "Furnished", key: "furnished", type: "SELECT", required: true, options: ["Furnished", "Semi-furnished", "Unfurnished"] },
      { label: "Bathrooms", key: "bathrooms", type: "SELECT", options: ["1", "2", "3+"] },
      { label: "Parking", key: "parking", type: "SELECT", options: ["Available", "Not available"] },
      { label: "Floor Level", key: "floor_level", type: "SELECT", options: ["Ground floor", "1st floor", "2nd floor", "3rd floor", "Higher"] },
      { label: "Water Supply", key: "water_supply", type: "SELECT", options: ["Tap water", "Borehole", "Both"] },
      { label: "Security", key: "security", type: "SELECT", options: ["Gated compound", "Security guard", "CCTV", "None"] },
      { label: "Internet", key: "internet", type: "SELECT", options: ["Included in rent", "Not included"] },
    ],
  },
  {
    name: "Commercial Spaces",
    slug: "commercial-spaces",
    icon: "🏢",
    order: 6,
    attributes: [
      { label: "Space Type", key: "space_type", type: "SELECT", required: true, options: ["Office Space", "Shop / Retail", "Warehouse", "Restaurant Space", "Event Venue", "Salon / Spa", "Workshop / Garage", "Parking / Storage"] },
      { label: "Floor Area (sqm)", key: "floor_area_sqm", type: "NUMBER", required: true, placeholder: "e.g. 50" },
      { label: "Floor Level", key: "floor_level", type: "SELECT", options: ["Ground floor", "1st floor", "2nd floor", "3rd floor", "Higher"] },
      { label: "Lease Term", key: "lease_term", type: "SELECT", options: ["Monthly", "Quarterly", "Annually", "Negotiable"] },
      { label: "Condition", key: "condition", type: "SELECT", options: ["Shell / Bare", "Partially fitted", "Fully fitted out"] },
      { label: "Utilities Included", key: "utilities_included", type: "SELECT", options: ["All utilities included", "None included", "Partial"] },
      { label: "Main Road Frontage", key: "main_road_frontage", type: "SELECT", options: ["Yes — faces main road", "No — interior location"] },
      { label: "Parking", key: "parking", type: "SELECT", options: ["Dedicated parking", "Shared parking", "Street parking only", "None"] },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: "🛋️",
    order: 7,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", options: ["Sofa", "Bed", "Table", "Chair", "Wardrobe", "Other"] },
      { label: "Material", key: "material", type: "TEXT", placeholder: "e.g. Wood, Fabric" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👕",
    order: 8,
    attributes: [
      { label: "Category", key: "category", type: "SELECT", options: ["Men", "Women", "Kids", "Unisex"] },
      { label: "Size", key: "size", type: "SELECT", options: ["XS", "S", "M", "L", "XL", "XXL"] },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "💼",
    order: 9,
    attributes: [
      { label: "Job Type", key: "job_type", type: "SELECT", options: ["Full-time", "Part-time", "Contract", "Gig", "Internship"] },
      { label: "Remote", key: "remote", type: "BOOLEAN" },
    ],
  },
  {
    name: "Services",
    slug: "services",
    icon: "🛠️",
    order: 10,
    attributes: [
      { label: "Service Type", key: "service_type", type: "TEXT", placeholder: "e.g. Plumbing, Tutoring" },
    ],
  },
  {
    name: "Construction Materials",
    slug: "construction",
    icon: "🧱",
    order: 11,
    attributes: [
      { label: "Material Type", key: "material_type", type: "SELECT", required: true, options: ["Cement / Concrete", "Steel / Metal / Iron", "Timber / Wood", "Roofing Materials", "Tiles / Flooring", "Bricks / Blocks", "Sand / Aggregate / Gravel", "Paint / Finishes", "Glass", "Plumbing Materials", "Electrical Materials", "Insulation"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Cimerwa, Bamburi, Kigali Cement" },
      { label: "Quantity Available", key: "quantity_available", type: "NUMBER", placeholder: "e.g. 50" },
      { label: "Unit", key: "unit", type: "SELECT", options: ["Bags", "Tonnes", "Cubic metres", "Square metres", "Pieces / Units", "Bundles", "Litres", "Rolls", "Sheets"] },
      { label: "Condition", key: "condition", type: "SELECT", required: true, options: ["New / Unused", "Used / Surplus"] },
      { label: "Delivery Available", key: "delivery_available", type: "SELECT", options: ["Yes — I can deliver", "No — collection only"] },
    ],
  },
  {
    name: "Machinery",
    slug: "machinery",
    icon: "⚙️",
    order: 12,
    attributes: [
      { label: "Machine Type", key: "machine_type", type: "SELECT", required: true, options: ["Excavator / Bulldozer", "Crane / Lifting", "Forklift", "Concrete Mixer", "Generator", "Air Compressor", "Drilling / Boring Equipment", "Agricultural Equipment", "Welding Equipment", "Printing Machine", "Woodworking Machine", "Pumps / Motors"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Caterpillar, Komatsu, Honda, Perkins" },
      { label: "Year of Manufacture", key: "year_of_manufacture", type: "NUMBER", placeholder: "e.g. 2018" },
      { label: "Hours of Use", key: "hours_of_use", type: "NUMBER", placeholder: "e.g. 1200" },
      { label: "Fuel Type", key: "fuel_type", type: "SELECT", options: ["Diesel", "Petrol", "Electric", "Manual / Hand-operated"] },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent — Daily", "For Rent — Weekly", "For Rent — Monthly"] },
      { label: "Condition", key: "condition", type: "SELECT", required: true, options: ["Excellent — like new", "Good — fully operational", "Fair — needs minor repair", "For parts / Not working"] },
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    icon: "👶",
    order: 13,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", options: ["Toys", "Clothing", "Strollers", "Furniture", "Other"] },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding RAY categories + attributes…");

  // One-time migration: rename the "rentals" category to "residential-rentals"
  // in place (keeping its id) so existing listings keep a valid categoryId.
  const oldRentals = await prisma.category.findUnique({ where: { slug: "rentals" } });
  const newRentals = await prisma.category.findUnique({ where: { slug: "residential-rentals" } });
  if (oldRentals && !newRentals) {
    await prisma.category.update({
      where: { id: oldRentals.id },
      data: { slug: "residential-rentals" },
    });
    console.log("  ↻ Renamed category slug: rentals -> residential-rentals");
  }

  for (const c of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, order: c.order },
      create: { name: c.name, slug: c.slug, icon: c.icon, order: c.order },
    });

    for (let i = 0; i < c.attributes.length; i++) {
      const a = c.attributes[i]!;
      await prisma.categoryAttribute.upsert({
        where: { categoryId_key: { categoryId: category.id, key: a.key } },
        update: {
          label: a.label,
          type: a.type,
          required: a.required ?? false,
          placeholder: a.placeholder ?? null,
          options: a.options ?? undefined,
          order: i,
        },
        create: {
          categoryId: category.id,
          label: a.label,
          key: a.key,
          type: a.type,
          required: a.required ?? false,
          placeholder: a.placeholder ?? null,
          options: a.options ?? undefined,
          order: i,
        },
      });
    }

    // Remove attributes that are no longer part of this category's schema.
    const validKeys = c.attributes.map((a) => a.key);
    await prisma.categoryAttribute.deleteMany({
      where: { categoryId: category.id, key: { notIn: validKeys } },
    });

    console.log(`  ✓ ${c.icon} ${c.name} (${c.attributes.length} attributes)`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
