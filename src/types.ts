export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  sizes: string[];
  imageUrl: string;
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  category: string;
  price: number;
  discount: number;
  discountedPrice?: number;
  stockQuantity?: number;
  priceVariants?: Array<{
    size: string;
    price: number;
    discount?: number;
    stock?: number;
  }>;
  customChemicals?: Array<{
    name: string;
    percentage: number;
    unit?: string;
  }>;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    otherNutrients?: Record<string, number>;
  };
  applicationMethod: string;
  benefits: string[];
  stockAvailability: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
} 