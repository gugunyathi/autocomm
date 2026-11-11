export interface DepartmentLinks {
  mens?: string;
  womens?: string;
  kids?: string;
  home?: string;
  all?: string;
}

export interface LiveWebsitePromo {
  title: string;
  description: string;
  discountPercent: number;
  ruleText: string; // e.g. "Buy 2 Get 50% Off lowest priced item"
  sourceUrl: string; // e.g. "https://www.mrp.com/en_za/black-friday/denim-shorts-buy-2-get-50-off-the-lowest-priced-item"
  departmentLinks?: DepartmentLinks;
  billboardLocation?: string;
  lastCrawledAt: number;
  dealStatus?: "LIVE" | "UPDATING" | "EXPIRED";
}

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
  productUrl?: string;
  department?: "mens" | "womens" | "kids" | "home" | "all" | string;
  promoRule?: string;
}

export interface MallStoreWithProducts extends Store {
  mallId: string;
  products: RealProduct[];
  liveWebsitePromo?: LiveWebsitePromo;
  websiteUrl?: string;
  specialsUrl?: string;
  departmentLinks?: DepartmentLinks;
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
