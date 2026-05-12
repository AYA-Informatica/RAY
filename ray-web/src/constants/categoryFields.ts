export type FieldType = 'select' | 'toggle' | 'text' | 'number'

export interface CategoryField {
  key: string            // maps to listing.meta[key]
  label: string          // shown to user
  type: FieldType
  options?: string[]     // for select fields
  placeholder?: string   // for text/number fields
  required: boolean
}

export const CATEGORY_FIELDS: Record<string, CategoryField[]> = {
  mobiles: [
    { key: 'brand',   label: 'Brand',   type: 'select', options: ['Apple', 'Samsung', 'Tecno', 'Infinix', 'itel', 'Xiaomi', 'Huawei', 'Nokia', 'Other'], required: true },
    { key: 'storage', label: 'Storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', 'Other'], required: false },
    { key: 'network', label: 'Network', type: 'select', options: ['2G', '3G', '4G', '5G'], required: false },
  ],
  electronics: [
    { key: 'brand',  label: 'Brand',  type: 'select', options: ['Apple', 'Samsung', 'HP', 'Dell', 'Lenovo', 'LG', 'Sony', 'Hisense', 'Canon', 'Nikon', 'Other'], required: false },
    { key: 'model',  label: 'Model',  type: 'text', placeholder: 'e.g. MacBook Pro 2022', required: false },
    { key: 'warranty', label: 'Has Warranty', type: 'toggle', required: false },
  ],
  vehicles: [
    { key: 'make',  label: 'Make',  type: 'select', options: ['Toyota', 'Suzuki', 'Nissan', 'Honda', 'Hyundai', 'Mitsubishi', 'Subaru', 'BMW', 'Mercedes', 'Kia', 'Other'], required: true },
    { key: 'year',  label: 'Year',  type: 'select', options: Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i)), required: true },
    { key: 'mileage', label: 'Mileage (km)', type: 'number', placeholder: 'e.g. 45000', required: false },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual'], required: false },
  ],
  property: [
    { key: 'bedrooms', label: 'Bedrooms', type: 'select', options: ['Studio', '1', '2', '3', '4', '5+'], required: false },
    { key: 'bathrooms', label: 'Bathrooms', type: 'select', options: ['1', '2', '3', '4+'], required: false },
    { key: 'furnished', label: 'Furnished', type: 'toggle', required: false },
    { key: 'size_sqm', label: 'Size (sqm)', type: 'number', placeholder: 'e.g. 75', required: false },
  ],
  fashion: [
    { key: 'size',   label: 'Size',  type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Other'], required: false },
    { key: 'gender', label: 'For',   type: 'select', options: ['Women', 'Men', 'Kids', 'Unisex'], required: false },
    { key: 'brand',  label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Zara, H&M', required: false },
  ],
  furniture: [
    { key: 'material', label: 'Material', type: 'select', options: ['Wood', 'Metal', 'Plastic', 'Fabric', 'Leather', 'Glass', 'Mixed', 'Other'], required: false },
    { key: 'color',    label: 'Color',    type: 'text', placeholder: 'e.g. Dark brown, White', required: false },
    { key: 'assembly_required', label: 'Assembly Required', type: 'toggle', required: false },
  ],
  food: [
    { key: 'unit',        label: 'Sold Per',  type: 'select', options: ['Kg', 'Litre', 'Piece', 'Bag', 'Crate', 'Dozen', 'Bundle', 'Other'], required: true },
    { key: 'origin',      label: 'Origin',    type: 'text', placeholder: 'e.g. Musanze, Nyagatare', required: false },
    { key: 'organic',     label: 'Organic',   type: 'toggle', required: false },
  ],
  services: [
    { key: 'availability', label: 'Available', type: 'select', options: ['Weekdays', 'Weekends', 'Any Day', 'By Appointment'], required: false },
    { key: 'pricing_type', label: 'Pricing',   type: 'select', options: ['Fixed Price', 'Hourly Rate', 'Per Day', 'Negotiable', 'Free Quote'], required: false },
    { key: 'experience_years', label: 'Years of Experience', type: 'select', options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'], required: false },
  ],
  jobs: [
    { key: 'salary_period', label: 'Salary Period', type: 'select', options: ['Monthly', 'Daily', 'Hourly', 'Per Project'], required: false },
    { key: 'remote',        label: 'Remote Work',   type: 'toggle', required: false },
    { key: 'experience_level', label: 'Experience Level', type: 'select', options: ['Entry Level', 'Mid Level', 'Senior', 'Any Level'], required: false },
  ],
  health: [
    { key: 'brand',      label: 'Brand',      type: 'text', placeholder: 'e.g. Nivea, Optimum Nutrition', required: false },
    { key: 'expiry',     label: 'Has Valid Expiry Date', type: 'toggle', required: false },
    { key: 'prescription_required', label: 'Prescription Required', type: 'toggle', required: false },
  ],
  sports: [
    { key: 'brand',  label: 'Brand',  type: 'text', placeholder: 'e.g. Nike, Adidas, Trek', required: false },
    { key: 'gender', label: 'For',    type: 'select', options: ['Men', 'Women', 'Kids', 'Unisex'], required: false },
    { key: 'size',   label: 'Size',   type: 'text', placeholder: 'e.g. L, 42, 15kg', required: false },
  ],
  kids: [
    { key: 'age_range', label: 'Age Range', type: 'select', options: ['0–1 year', '1–3 years', '3–6 years', '6–10 years', '10–14 years', 'All Ages'], required: false },
    { key: 'gender',    label: 'For',       type: 'select', options: ['Boys', 'Girls', 'All'], required: false },
    { key: 'safety_certified', label: 'Safety Certified', type: 'toggle', required: false },
  ],
}