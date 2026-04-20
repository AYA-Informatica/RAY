export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: "Frw";
  category: "phones" | "cars" | "houses" | "furniture" | "electronics";
  condition: "new" | "used" | "refurbished";
  location: string;
  images: string[];
  description: string;
  seller: { name: string; phone: string; joinedDate: string };
  createdAt: string;
  isBoosted: boolean;
  viewCount: number;
}

export const mockListings: Listing[] = [
  {
    id: "l1",
    title: "iPhone 13 Pro Max - 256GB Sierra Blue",
    price: 950000,
    currency: "Frw",
    category: "phones",
    condition: "used",
    location: "Kigali, Kicukiro",
    images: [],
    description: "Mint condition iPhone. Comes with original box and cable. Battery health at 92%.",
    seller: { name: "Eric T.", phone: "+250788123456", joinedDate: "2024-01-10T00:00:00Z" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isBoosted: true,
    viewCount: 142
  },
  {
    id: "l2",
    title: "Toyota RAV4 2018 - Excellent Condition",
    price: 32000000,
    currency: "Frw",
    category: "cars",
    condition: "used",
    location: "Kigali, Gasabo",
    images: [],
    description: "Well maintained SUV. Petrol, automatic transmission, 45,000 KM. Custom duties fully paid.",
    seller: { name: "Mutanguha J.", phone: "+250788654321", joinedDate: "2023-05-20T00:00:00Z" },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isBoosted: true,
    viewCount: 512
  },
  {
    id: "l3",
    title: "Modern L-Shape Sofa Set",
    price: 450000,
    currency: "Frw",
    category: "furniture",
    condition: "new",
    location: "Kigali, Nyarugenge",
    images: [],
    description: "Brand new custom made L-shape sofa. We deliver anywhere in Kigali. Assorted colors available.",
    seller: { name: "Kigali Furniture", phone: "+250781234567", joinedDate: "2025-11-01T00:00:00Z" },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isBoosted: false,
    viewCount: 89
  },
  {
    id: "l4",
    title: "Samsung 55' 4K Smart TV",
    price: 780000,
    currency: "Frw",
    category: "electronics",
    condition: "new",
    location: "Kigali, Kicukiro",
    images: [],
    description: "Brand new in box. Under 1 year warranty. Free wall mount and installation in Kigali.",
    seller: { name: "Electro World", phone: "+250788998877", joinedDate: "2024-08-15T00:00:00Z" },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isBoosted: false,
    viewCount: 201
  },
  {
    id: "l5",
    title: "4 Bedroom House for Rent",
    price: 800000,
    currency: "Frw",
    category: "houses",
    condition: "used",
    location: "Kigali, Kibagabaga",
    images: [],
    description: "Spacious house with 4 bedrooms, 3 bathrooms, large garden, and servant quarters. Available next month.",
    seller: { name: "Rwanda Properties", phone: "+250788112233", joinedDate: "2022-02-14T00:00:00Z" },
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    isBoosted: true,
    viewCount: 1056
  },
  {
    id: "l6",
    title: "Macbook Air M1 2020",
    price: 850000,
    currency: "Frw",
    category: "electronics",
    condition: "used",
    location: "Kigali, Kimihurura",
    images: [],
    description: "Base model M1 chip, 8GB RAM, 256GB SSD. Battery cycle at 150. Light scratching on bottom.",
    seller: { name: "David K.", phone: "+250789000111", joinedDate: "2025-01-01T00:00:00Z" },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isBoosted: false,
    viewCount: 76
  }
];
