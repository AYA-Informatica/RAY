/**
 * Maps CSV province names to display city names used in the Listing.city field.
 * Province is the top-level administrative unit in Rwanda; "city" in the data
 * model is a coarse grouping at province level.
 */
export const PROVINCE_TO_CITY: Record<string, string> = {
  "KIGALI CITY": "Kigali",
  "NORTHERN PROVINCE": "Northern Province",
  "SOUTHERN PROVINCE": "Southern Province",
  "EASTERN PROVINCE": "Eastern Province",
  "WESTERN PROVINCE": "Western Province",
};

/**
 * Legacy static location data — kept for reference.
 * All live location selection now uses the RwandaLocation DB table via /api/location/*.
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
