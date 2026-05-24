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
    name: "Phones",
    slug: "phones",
    icon: "📱",
    order: 1,
    attributes: [
      { label: "Brand", key: "brand", type: "SELECT", required: true, options: ["Apple", "Samsung", "Tecno", "Infinix", "Xiaomi", "Itel", "Huawei", "Google", "Other"] },
      { label: "Storage", key: "storage", type: "SELECT", options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"] },
      { label: "RAM", key: "ram", type: "SELECT", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"] },
      { label: "Battery Health (%)", key: "battery_health", type: "NUMBER", placeholder: "e.g. 92" },
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
    ],
  },
  {
    name: "Bikes",
    slug: "bikes",
    icon: "🚲",
    order: 4,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", options: ["Motorcycle", "Bicycle", "Scooter"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Boxer, Bajaj" },
      { label: "Year", key: "year", type: "NUMBER", placeholder: "e.g. 2021" },
    ],
  },
  {
    name: "Rentals",
    slug: "rentals",
    icon: "🏠",
    order: 5,
    attributes: [
      { label: "Bedrooms", key: "bedrooms", type: "NUMBER", required: true, placeholder: "e.g. 2" },
      { label: "Bathrooms", key: "bathrooms", type: "NUMBER", placeholder: "e.g. 1" },
      { label: "Furnished", key: "furnished", type: "BOOLEAN" },
      { label: "Parking", key: "parking", type: "BOOLEAN" },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: "🛋️",
    order: 6,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", options: ["Sofa", "Bed", "Table", "Chair", "Wardrobe", "Other"] },
      { label: "Material", key: "material", type: "TEXT", placeholder: "e.g. Wood, Fabric" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👕",
    order: 7,
    attributes: [
      { label: "Category", key: "category", type: "SELECT", options: ["Men", "Women", "Kids", "Unisex"] },
      { label: "Size", key: "size", type: "SELECT", options: ["XS", "S", "M", "L", "XL", "XXL"] },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "💼",
    order: 8,
    attributes: [
      { label: "Job Type", key: "job_type", type: "SELECT", options: ["Full-time", "Part-time", "Contract", "Gig", "Internship"] },
      { label: "Remote", key: "remote", type: "BOOLEAN" },
    ],
  },
  {
    name: "Services",
    slug: "services",
    icon: "🛠️",
    order: 9,
    attributes: [
      { label: "Service Type", key: "service_type", type: "TEXT", placeholder: "e.g. Plumbing, Tutoring" },
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    icon: "👶",
    order: 10,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", options: ["Toys", "Clothing", "Strollers", "Furniture", "Other"] },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding RAY categories + attributes…");

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
