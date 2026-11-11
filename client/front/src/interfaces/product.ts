export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  details: string[];
  image: string;
  images: string[];
  sizes: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
}