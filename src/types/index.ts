export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  price: number;
  discount: number;
  discountedPrice?: number;
  sizes?: string[];
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    otherNutrients?: Record<string, number>;
  };
  customChemicals?: Array<{
    name: string;
    percentage: number;
    unit?: string;
  }>;
  applicationMethod: string;
  benefits: string[];
  stockAvailability: boolean;
  stockQuantity?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  location: string;
  text: string;
  rating: number;
  photoUrl?: string;
}

export interface DealerLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}