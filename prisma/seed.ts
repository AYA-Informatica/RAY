/* eslint-disable no-console */
import { PrismaClient, Prisma, AttributeType } from "@prisma/client";
import type { ShowIf } from "../src/lib/utils/categoryAttributes";

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
  /** Only show this attribute when another attribute (by key) has one of these values. */
  showIf?: ShowIf;
};

type SeedCategory = {
  name: string;
  nameRw: string; // Kinyarwanda display name — cross-checked against src/lib/search/aliases.ts's vetted RW vocabulary
  nameFr: string; // French display name
  slug: string;
  icon: string; // emoji used in the category grid (matches wireframes)
  order: number;
  attributes: SeedAttribute[];
};

const CATEGORIES: SeedCategory[] = [
  {
    name: "Phones & Accessories",
    nameRw: "Telefoni",
    nameFr: "Téléphones",
    slug: "phones",
    icon: "📱",
    order: 1,
    attributes: [
      { label: "Item Type", key: "item_type", type: "SELECT", required: true, options: ["Smartphone", "Tablet / iPad", "Accessory — Case & Cover", "Accessory — Charger & Cable", "Accessory — Earphones & Headphones", "Accessory — Screen Protector", "Accessory — Power Bank", "Accessory — Memory Card", "Accessory — Other"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Apple, Samsung, Infinix, Tecno" },
      { label: "Storage", key: "storage", type: "SELECT", options: ["8GB", "16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], showIf: { key: "item_type", in: ["Smartphone", "Tablet / iPad"] } },
      { label: "RAM", key: "ram", type: "SELECT", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"], showIf: { key: "item_type", in: ["Smartphone", "Tablet / iPad"] } },
      { label: "Battery Health", key: "battery_health", type: "SELECT", options: ["100%", "90–99%", "80–89%", "70–79%", "Below 70%", "Unknown"], showIf: { key: "item_type", in: ["Smartphone", "Tablet / iPad"] } },
      { label: "Compatible With", key: "compatible_with", type: "TEXT", placeholder: "e.g. iPhone 13, Samsung Galaxy S21", showIf: { key: "item_type", in: ["Accessory — Case & Cover", "Accessory — Charger & Cable", "Accessory — Earphones & Headphones", "Accessory — Screen Protector", "Accessory — Power Bank", "Accessory — Memory Card", "Accessory — Other"] } },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent"] },
    ],
  },
  {
    name: "Electronics",
    nameRw: "Ikoranabuhanga",
    nameFr: "Électronique",
    slug: "electronics",
    icon: "💻",
    order: 2,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", required: true, options: ["Laptop", "TV", "Audio", "Camera", "Gaming", "Accessory", "Other"] },

      // Laptop
      { label: "Processor", key: "processor", type: "TEXT", placeholder: "e.g. Intel Core i5, Ryzen 5", showIf: { key: "type", in: ["Laptop"] } },
      { label: "RAM", key: "ram", type: "SELECT", options: ["2GB", "4GB", "8GB", "16GB", "32GB", "64GB+"], showIf: { key: "type", in: ["Laptop"] } },
      { label: "Storage", key: "storage", type: "SELECT", options: ["128GB", "256GB", "512GB", "1TB", "2TB+"], showIf: { key: "type", in: ["Laptop"] } },
      { label: "Screen Size", key: "screen_size", type: "SELECT", options: ["11\"–12\"", "13\"–14\"", "15\"–16\"", "17\"+"], showIf: { key: "type", in: ["Laptop"] } },
      { label: "Operating System", key: "os", type: "SELECT", options: ["Windows", "macOS", "Chrome OS", "Linux", "No OS"], showIf: { key: "type", in: ["Laptop"] } },
      { label: "Charger Included", key: "charger_included", type: "BOOLEAN", showIf: { key: "type", in: ["Laptop", "Gaming"] } },

      // TV
      { label: "Screen Size (inches)", key: "tv_screen_size", type: "SELECT", options: ["24\"", "32\"", "40\"", "43\"", "50\"", "55\"", "65\"", "75\"+"], showIf: { key: "type", in: ["TV"] } },
      { label: "Resolution", key: "resolution", type: "SELECT", options: ["HD", "Full HD", "4K UHD", "8K"], showIf: { key: "type", in: ["TV"] } },
      { label: "Smart TV", key: "smart_tv", type: "BOOLEAN", showIf: { key: "type", in: ["TV"] } },

      // Audio
      { label: "Audio Type", key: "audio_type", type: "SELECT", options: ["Speaker", "Headphones", "Earbuds", "Soundbar", "Home Theater System"], showIf: { key: "type", in: ["Audio"] } },
      { label: "Connectivity", key: "connectivity", type: "SELECT", options: ["Wired", "Bluetooth / Wireless", "Both"], showIf: { key: "type", in: ["Audio"] } },

      // Camera
      { label: "Camera Type", key: "camera_type", type: "SELECT", options: ["DSLR", "Mirrorless", "Point & Shoot", "Action Camera", "Drone"], showIf: { key: "type", in: ["Camera"] } },
      { label: "Megapixels", key: "megapixels", type: "TEXT", placeholder: "e.g. 24MP", showIf: { key: "type", in: ["Camera"] } },
      { label: "Lens Included", key: "lens_included", type: "BOOLEAN", showIf: { key: "type", in: ["Camera"] } },

      // Gaming
      { label: "Platform", key: "platform", type: "SELECT", options: ["PlayStation", "Xbox", "Nintendo Switch", "PC", "Other"], showIf: { key: "type", in: ["Gaming"] } },
      { label: "Storage", key: "gaming_storage", type: "SELECT", options: ["500GB", "1TB", "2TB+"], showIf: { key: "type", in: ["Gaming"] } },

      // Accessory
      { label: "Accessory Type", key: "accessory_type", type: "SELECT", options: ["Charger", "Cable", "Case / Cover", "Mouse", "Keyboard", "Power Bank", "Memory Card", "Other"], showIf: { key: "type", in: ["Accessory"] } },

      // Common to every type, including "Other"
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Dell, Sony, Samsung" },
      { label: "Warranty", key: "warranty", type: "BOOLEAN" },
    ],
  },
  {
    name: "Cars",
    nameRw: "Imodoka",
    nameFr: "Voitures",
    slug: "cars",
    icon: "🚗",
    order: 3,
    attributes: [
      { label: "Brand", key: "brand", type: "SELECT", required: true, options: ["Toyota", "Honda", "Nissan", "Mazda", "Mercedes-Benz", "BMW", "Volkswagen", "Suzuki", "Other"] },
      { label: "Model", key: "model", type: "TEXT", required: true, placeholder: "e.g. Corolla, Land Cruiser, Hilux, RAV4" },
      { label: "Year", key: "year", type: "NUMBER", required: true, placeholder: "e.g. 2018" },
      { label: "Mileage (km)", key: "mileage", type: "NUMBER", placeholder: "e.g. 85000" },
      { label: "Fuel Type", key: "fuel", type: "SELECT", options: ["Petrol", "Diesel", "Hybrid", "Electric"] },
      { label: "Transmission", key: "transmission", type: "SELECT", options: ["Manual", "Automatic"] },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent — Daily", "For Rent — Weekly", "For Rent — Monthly"] },
    ],
  },
  {
    name: "Bikes",
    nameRw: "Amagare na Moto",
    nameFr: "Vélos et Motos",
    slug: "bikes",
    icon: "🏍️",
    order: 4,
    attributes: [
      { label: "Bike Type", key: "bike_type", type: "SELECT", required: true, options: ["Bicycle", "Motorbike / Motorcycle", "Scooter / Moped", "Electric Bike (E-bike)"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Honda, Yamaha, Trek, Giant" },
      { label: "Model", key: "model", type: "TEXT", placeholder: "e.g. CG 125, CB 300R, Ninja 400", showIf: { key: "bike_type", in: ["Motorbike / Motorcycle", "Scooter / Moped"] } },
      { label: "Year", key: "year", type: "NUMBER", placeholder: "e.g. 2020" },
      { label: "Engine Size", key: "engine_size", type: "SELECT", options: ["Under 125cc", "125cc", "150cc", "200cc", "250cc", "400cc", "600cc+"], showIf: { key: "bike_type", in: ["Motorbike / Motorcycle", "Scooter / Moped"] } },
      { label: "Gear Count", key: "gear_count", type: "SELECT", options: ["Single Speed", "3-Speed", "7-Speed", "21-Speed", "27-Speed+"], showIf: { key: "bike_type", in: ["Bicycle"] } },
      { label: "Battery Range", key: "battery_range", type: "SELECT", options: ["Under 20km", "20–40km", "40–60km", "60–100km", "100km+"], showIf: { key: "bike_type", in: ["Electric Bike (E-bike)"] } },
      { label: "Frame / Style", key: "frame_style", type: "SELECT", options: ["Mountain", "Road", "City / Hybrid", "BMX", "Kids", "Other"], showIf: { key: "bike_type", in: ["Bicycle"] } },
      { label: "Mileage", key: "mileage", type: "NUMBER", placeholder: "e.g. 12000 km", showIf: { key: "bike_type", in: ["Motorbike / Motorcycle", "Scooter / Moped", "Electric Bike (E-bike)"] } },
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Sale", "For Rent — Daily", "For Rent — Weekly"] },
      { label: "Condition", key: "condition", type: "SELECT", required: true, options: ["New", "Like New", "Good", "Fair", "Used"] },
    ],
  },
  {
    name: "Residential Rentals",
    nameRw: "Amazu",
    nameFr: "Logements",
    slug: "residential-rentals",
    icon: "🏠",
    order: 5,
    attributes: [
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Rent", "For Sale"] },
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
    nameRw: "Ahantu h'Ubucuruzi",
    nameFr: "Locaux commerciaux",
    slug: "commercial-spaces",
    icon: "🏢",
    order: 6,
    attributes: [
      { label: "Listing Type", key: "listing_type", type: "SELECT", required: true, options: ["For Rent", "For Sale"] },
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
    nameRw: "Imbago",
    nameFr: "Meubles",
    slug: "furniture",
    icon: "🛋️",
    order: 7,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", required: true, options: ["Sofa", "Bed", "Table", "Chair", "Wardrobe", "Other"] },
      { label: "Material", key: "material", type: "TEXT", placeholder: "e.g. Wood, Fabric" },
      { label: "Bed Size", key: "bed_size", type: "SELECT", options: ["Single", "Double", "Queen", "King"], showIf: { key: "type", in: ["Bed"] } },
      { label: "Seating Capacity", key: "seating_capacity", type: "SELECT", options: ["1 Seater", "2 Seater", "3 Seater", "Corner / L-Shape", "5+ Seater"], showIf: { key: "type", in: ["Sofa"] } },
      { label: "Table Type", key: "table_type", type: "SELECT", options: ["Dining Table", "Coffee Table", "Office Desk", "Side Table", "Other"], showIf: { key: "type", in: ["Table"] } },
      { label: "Number of Doors", key: "number_of_doors", type: "SELECT", options: ["1", "2", "3", "4+"], showIf: { key: "type", in: ["Wardrobe"] } },
      { label: "Chair Type", key: "chair_type", type: "SELECT", options: ["Office", "Dining", "Armchair", "Outdoor", "Other"], showIf: { key: "type", in: ["Chair"] } },
    ],
  },
  {
    name: "Fashion",
    nameRw: "Imyambaro",
    nameFr: "Vêtements",
    slug: "fashion",
    icon: "👕",
    order: 8,
    attributes: [
      { label: "Category", key: "category", type: "SELECT", options: ["Men", "Women", "Kids", "Unisex"] },
      { label: "Item Type", key: "item_type", type: "SELECT", required: true, options: ["Clothing", "Shoes", "Bags", "Jewelry & Watches", "Other"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Nike, Adidas, Zara, H&M" },
      { label: "Size", key: "size", type: "SELECT", options: ["XS", "S", "M", "L", "XL", "XXL"], showIf: { key: "item_type", in: ["Clothing"] } },
      { label: "Shoe Size", key: "shoe_size", type: "SELECT", options: ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45", "EU 46"], showIf: { key: "item_type", in: ["Shoes"] } },
    ],
  },
  {
    name: "Jobs",
    nameRw: "Akazi",
    nameFr: "Emplois",
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
    nameRw: "Serivisi",
    nameFr: "Services",
    slug: "services",
    icon: "🛠️",
    order: 10,
    attributes: [
      { label: "Service Type", key: "service_type", type: "TEXT", placeholder: "e.g. Plumbing, Tutoring" },
    ],
  },
  {
    name: "Construction Materials",
    nameRw: "Ibikoresho by'Inyubako",
    nameFr: "Matériaux de construction",
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
    nameRw: "Imashini",
    nameFr: "Machines",
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
    nameRw: "Abana",
    nameFr: "Enfants",
    slug: "kids",
    icon: "👶",
    order: 13,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", required: true, options: ["Toys", "Clothing", "Strollers", "Furniture", "Other"] },
      { label: "Age Range", key: "age_range", type: "SELECT", options: ["0–6 months", "6–12 months", "1–2 years", "2–4 years", "4–6 years", "6–8 years", "8–12 years", "12+ years"], showIf: { key: "type", in: ["Toys", "Clothing"] } },
      { label: "Clothing Size", key: "clothing_size", type: "SELECT", options: ["Newborn", "0–3M", "3–6M", "6–12M", "1–2Y", "2–4Y", "4–6Y", "6–8Y", "8–10Y", "10–12Y"], showIf: { key: "type", in: ["Clothing"] } },
      { label: "Stroller Type", key: "stroller_type", type: "SELECT", options: ["Single", "Double", "Travel System", "Lightweight / Umbrella", "Jogging"], showIf: { key: "type", in: ["Strollers"] } },
    ],
  },
  {
    name: "Kitchen",
    nameRw: "Ibikoresho bya Gikoni",
    nameFr: "Cuisine",
    slug: "kitchen",
    icon: "🍳",
    order: 14,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", required: true, options: ["Cookware", "Appliances", "Utensils & Tools", "Tableware & Dinnerware", "Storage & Containers", "Other"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Tefal, Hotpoint, Nakumatt" },
      { label: "Material", key: "material", type: "SELECT", options: ["Stainless Steel", "Non-stick", "Cast Iron", "Aluminum", "Ceramic", "Glass", "Wood", "Plastic", "Silicone", "Porcelain", "Melamine", "Mixed", "Other"], showIf: { key: "type", in: ["Cookware", "Utensils & Tools", "Tableware & Dinnerware", "Storage & Containers"] } },
      { label: "Set Size", key: "set_size", type: "SELECT", options: ["Single Piece", "Set of 2–4", "Set of 5–8", "Set of 9–12", "Set of 12+"], showIf: { key: "type", in: ["Cookware", "Tableware & Dinnerware", "Storage & Containers"] } },
      { label: "Appliance Type", key: "appliance_type", type: "SELECT", options: ["Blender", "Microwave", "Oven", "Refrigerator", "Gas Cooker", "Electric Cooker", "Kettle", "Toaster", "Mixer", "Other"], showIf: { key: "type", in: ["Appliances"] } },
      { label: "Power Source", key: "power_source", type: "SELECT", options: ["Electric", "Gas", "Both"], showIf: { key: "type", in: ["Appliances"] } },
      { label: "Condition", key: "condition", type: "SELECT", required: true, options: ["New", "Like New", "Good", "Fair", "Used"] },
    ],
  },
  {
    name: "Beauty & Personal Care",
    nameRw: "Ibyubwiza",
    nameFr: "Beauté",
    slug: "beauty",
    icon: "💄",
    order: 15,
    attributes: [
      { label: "Type", key: "type", type: "SELECT", required: true, options: ["Skincare", "Makeup", "Haircare", "Fragrances & Perfumes", "Tools & Accessories", "Other"] },
      { label: "Brand", key: "brand", type: "TEXT", placeholder: "e.g. Nivea, MAC, L'Oréal" },
      { label: "Gender", key: "gender", type: "SELECT", options: ["Men", "Women", "Unisex"] },

      // Skincare
      { label: "Product Type", key: "skincare_type", type: "SELECT", options: ["Moisturizer", "Cleanser", "Serum", "Sunscreen", "Toner", "Face Mask", "Other"], showIf: { key: "type", in: ["Skincare"] } },
      { label: "Skin Type", key: "skin_type", type: "SELECT", options: ["All Skin Types", "Oily", "Dry", "Combination", "Sensitive"], showIf: { key: "type", in: ["Skincare"] } },

      // Makeup
      { label: "Product Type", key: "makeup_type", type: "SELECT", options: ["Foundation", "Lipstick", "Eyeshadow", "Mascara", "Concealer", "Blush", "Powder", "Other"], showIf: { key: "type", in: ["Makeup"] } },
      { label: "Shade", key: "shade", type: "TEXT", placeholder: "e.g. Shade 220, Ruby Red", showIf: { key: "type", in: ["Makeup"] } },

      // Haircare
      { label: "Product Type", key: "haircare_type", type: "SELECT", options: ["Shampoo", "Conditioner", "Hair Oil", "Styling Product", "Hair Treatment", "Other"], showIf: { key: "type", in: ["Haircare"] } },
      { label: "Hair Type", key: "hair_type", type: "SELECT", options: ["All Hair Types", "Curly", "Straight", "Oily", "Dry", "Color-Treated"], showIf: { key: "type", in: ["Haircare"] } },

      // Fragrances & Perfumes
      { label: "Fragrance Type", key: "fragrance_type", type: "SELECT", options: ["Perfume (EDP)", "Cologne (EDT)", "Body Mist", "Other"], showIf: { key: "type", in: ["Fragrances & Perfumes"] } },
      { label: "Volume", key: "volume", type: "SELECT", options: ["30ml", "50ml", "75ml", "100ml", "100ml+"], showIf: { key: "type", in: ["Fragrances & Perfumes"] } },

      // Tools & Accessories
      { label: "Tool Type", key: "tool_type", type: "SELECT", options: ["Makeup Brushes", "Hair Dryer", "Straightener / Curler", "Mirror", "Tweezers / Clippers", "Other"], showIf: { key: "type", in: ["Tools & Accessories"] } },

      { label: "Expiry Date", key: "expiry_date", type: "TEXT", placeholder: "e.g. 12/2026", showIf: { key: "type", in: ["Skincare", "Makeup", "Haircare", "Fragrances & Perfumes"] } },
      { label: "Condition", key: "condition", type: "SELECT", required: true, options: ["New / Sealed", "Used — Like New", "Used"] },
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
      update: { name: c.name, nameRw: c.nameRw, nameFr: c.nameFr, icon: c.icon, order: c.order },
      create: { name: c.name, nameRw: c.nameRw, nameFr: c.nameFr, slug: c.slug, icon: c.icon, order: c.order },
    });

    for (let i = 0; i < c.attributes.length; i++) {
      const a = c.attributes[i]!;
      const options = a.showIf
        ? { ...(a.options ? { values: a.options } : {}), showIf: a.showIf }
        : (a.options ?? null);
      await prisma.categoryAttribute.upsert({
        where: { categoryId_key: { categoryId: category.id, key: a.key } },
        update: {
          label: a.label,
          type: a.type,
          required: a.required ?? false,
          placeholder: a.placeholder ?? null,
          options: options ?? Prisma.JsonNull,
          order: i,
        },
        create: {
          categoryId: category.id,
          label: a.label,
          key: a.key,
          type: a.type,
          required: a.required ?? false,
          placeholder: a.placeholder ?? null,
          options: options ?? Prisma.JsonNull,
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
