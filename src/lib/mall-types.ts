import type { Store } from "./acn-data";

export interface RealProduct {
  id: string;
  name: string;
  category: string;
  priceZAR: number;
  originalPriceZAR: number;
  discountPercent: number;
  image: string;
  description: string;
  sku: string;
  inStock: boolean;
  specialBadge?: string;
}

export interface MallStoreWithProducts extends Store {
  mallId: string;
  products: RealProduct[];
}

export interface MallDefinition {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  radiusMeters: number;
  accentColor: string;
  icon: string;
  stores: MallStoreWithProducts[];
}
