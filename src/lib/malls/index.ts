import { BEL_AIR_MALL } from "./bel-air";
import { JACKAL_CREEK_MALL } from "./jackal-creek";
import { BLUEBERRY_SQUARE_MALL } from "./blueberry-square";
import { NORTHGATE_MALL } from "./northgate";
import { FOURWAYS_MALL } from "./fourways";
import type { MallDefinition, MallStoreWithProducts, RealProduct } from "../mall-types";

export * from "../mall-types";
export { BEL_AIR_MALL, JACKAL_CREEK_MALL, BLUEBERRY_SQUARE_MALL, NORTHGATE_MALL, FOURWAYS_MALL };

export const ALL_MALLS: MallDefinition[] = [
  BEL_AIR_MALL,
  JACKAL_CREEK_MALL,
  BLUEBERRY_SQUARE_MALL,
  NORTHGATE_MALL,
  FOURWAYS_MALL,
];

export const MALL_MAP: Record<string, MallDefinition> = {
  [BEL_AIR_MALL.id]: BEL_AIR_MALL,
  [JACKAL_CREEK_MALL.id]: JACKAL_CREEK_MALL,
  [BLUEBERRY_SQUARE_MALL.id]: BLUEBERRY_SQUARE_MALL,
  [NORTHGATE_MALL.id]: NORTHGATE_MALL,
  [FOURWAYS_MALL.id]: FOURWAYS_MALL,
};

export function getMallById(mallId: string): MallDefinition {
  return MALL_MAP[mallId] || BEL_AIR_MALL;
}

export function getAllMallStores(): MallStoreWithProducts[] {
  return ALL_MALLS.flatMap((m) => m.stores);
}

export function findStoreById(storeId: string): MallStoreWithProducts | undefined {
  for (const mall of ALL_MALLS) {
    const store = mall.stores.find((s) => s.id === storeId);
    if (store) return store;
  }
  return undefined;
}

export function findProductsByStoreId(storeId: string): RealProduct[] {
  const store = findStoreById(storeId);
  return store?.products ?? [];
}
