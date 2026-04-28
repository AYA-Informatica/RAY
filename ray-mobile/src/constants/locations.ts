export interface Neighborhood {
  name: string
  district: string
  displayLabel: string
}

export const KIGALI_DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge'] as const
export type KigaliDistrict = (typeof KIGALI_DISTRICTS)[number]

export const KIGALI_NEIGHBORHOODS: Neighborhood[] = [
  // Gasabo
  { name: 'Kimihurura', district: 'Gasabo', displayLabel: 'Kimihurura, Kigali' },
  { name: 'Remera', district: 'Gasabo', displayLabel: 'Remera, Kigali' },
  { name: 'Gisozi', district: 'Gasabo', displayLabel: 'Gisozi, Kigali' },
  { name: 'Kibagabaga', district: 'Gasabo', displayLabel: 'Kibagabaga, Kigali' },
  { name: 'Kacyiru', district: 'Gasabo', displayLabel: 'Kacyiru, Kigali' },
  { name: 'Kanombe', district: 'Gasabo', displayLabel: 'Kanombe, Kigali' },
  { name: 'Jabana', district: 'Gasabo', displayLabel: 'Jabana, Kigali' },
  { name: 'Rusororo', district: 'Gasabo', displayLabel: 'Rusororo, Kigali' },
  { name: 'Bumbogo', district: 'Gasabo', displayLabel: 'Bumbogo, Kigali' },
  // Kicukiro
  { name: 'Kicukiro', district: 'Kicukiro', displayLabel: 'Kicukiro, Kigali' },
  { name: 'Gikondo', district: 'Kicukiro', displayLabel: 'Gikondo, Kigali' },
  { name: 'Niboye', district: 'Kicukiro', displayLabel: 'Niboye, Kigali' },
  { name: 'Kagarama', district: 'Kicukiro', displayLabel: 'Kagarama, Kigali' },
  { name: 'Masaka', district: 'Kicukiro', displayLabel: 'Masaka, Kigali' },
  { name: 'Gahanga', district: 'Kicukiro', displayLabel: 'Gahanga, Kigali' },
  // Nyarugenge
  { name: 'Nyamirambo', district: 'Nyarugenge', displayLabel: 'Nyamirambo, Kigali' },
  { name: 'Downtown', district: 'Nyarugenge', displayLabel: 'Downtown, Kigali' },
  { name: 'Biryogo', district: 'Nyarugenge', displayLabel: 'Biryogo, Kigali' },
  { name: 'Muhima', district: 'Nyarugenge', displayLabel: 'Muhima, Kigali' },
  { name: 'Nyakabanda', district: 'Nyarugenge', displayLabel: 'Nyakabanda, Kigali' },
]
