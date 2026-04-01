export type Category = 'phones' | 'cars' | 'houses' | 'furniture' | 'electronics' | 'all';
export type Condition = 'new' | 'used' | 'refurbished';

export interface Seller {
  name: string;
  phone: string;
  avatar?: string;
  joinedDate: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: 'Frw';
  category: Exclude<Category, 'all'>;
  condition: Condition;
  location: string;
  images: string[];
  description: string;
  seller: Seller;
  createdAt: string;
  isBoosted: boolean;
  viewCount: number;
}
