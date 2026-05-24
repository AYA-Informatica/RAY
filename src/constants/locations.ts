/**
 * Rwanda location data — Kigali-first per go-to-market strategy.
 * Country -> City -> District -> Neighborhood granularity.
 */
export const RWANDA_CITIES = [
  {
    city: "Kigali",
    districts: [
      { name: "Gasabo", neighborhoods: ["Kimihurura", "Kacyiru", "Remera", "Kimironko", "Gisozi", "Kinyinya"] },
      { name: "Kicukiro", neighborhoods: ["Kanombe", "Niboye", "Gatenga", "Kagarama", "Gikondo"] },
      { name: "Nyarugenge", neighborhoods: ["Nyamirambo", "Muhima", "Kiyovu", "Gitega", "Nyakabanda"] },
    ],
  },
  { city: "Musanze", districts: [{ name: "Musanze", neighborhoods: ["Cyuve", "Muhoza"] }] },
  { city: "Rubavu", districts: [{ name: "Rubavu", neighborhoods: ["Gisenyi", "Nyundo"] }] },
  { city: "Huye", districts: [{ name: "Huye", neighborhoods: ["Tumba", "Ngoma"] }] },
] as const;

export const DISTANCE_RADII = [
  { label: "Within 2 km", value: 2 },
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
  { label: "Within 25 km", value: 25 },
  { label: "Anywhere", value: 0 },
] as const;
