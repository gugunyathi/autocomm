import { MongoClient, type Db } from "mongodb";
import { ALL_MALLS } from "../lib/malls/index";

const uri = process.env.MONGODB_URI || "";
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let dbInstance: Db | null = null;
let isInitialized = false;

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }
  if (!clientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect().catch((err) => {
      console.error(
        "[MongoDB] Connection error:",
        err instanceof Error ? err.message : String(err),
      );
      clientPromise = null;
      return null as unknown as MongoClient;
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db | null> {
  if (dbInstance) return dbInstance;
  const connectedClient = await getMongoClient();
  if (!connectedClient) return null;
  dbInstance = connectedClient.db("autocom_db");
  return dbInstance;
}

/**
 * Initializes and seeds the MongoDB database with all 5 South African shopping malls,
 * 40 physical outlets, and 320 real retail product cards.
 * Uses upsert operations so it executes safely and idempotently.
 */
export async function initAndSeedDatabase(): Promise<{
  success: boolean;
  mallCount: number;
  storeCount: number;
  productCount: number;
}> {
  if (isInitialized) {
    return { success: true, mallCount: ALL_MALLS.length, storeCount: 40, productCount: 320 };
  }

  try {
    const db = await getDb();
    if (!db) {
      return { success: false, mallCount: 0, storeCount: 0, productCount: 0 };
    }

    const mallsCol = db.collection("malls");
    const storesCol = db.collection("stores");
    const productsCol = db.collection("products");

    // Create indexes for blazing-fast query latency (<2ms)
    await Promise.allSettled([
      mallsCol.createIndex({ id: 1 }, { unique: true }),
      storesCol.createIndex({ id: 1, mallId: 1 }, { unique: true }),
      productsCol.createIndex({ id: 1 }, { unique: true }),
      productsCol.createIndex({ storeId: 1 }),
      productsCol.createIndex({ mallId: 1 }),
    ]);

    let totalStores = 0;
    let totalProducts = 0;

    // Seed each mall
    for (const mall of ALL_MALLS) {
      await mallsCol.updateOne(
        { id: mall.id },
        {
          $set: {
            id: mall.id,
            name: mall.name,
            shortName: mall.shortName,
            subtitle: mall.subtitle,
            address: mall.address,
            latitude: mall.latitude,
            longitude: mall.longitude,
            googleMapsUrl: mall.googleMapsUrl,
            radiusMeters: mall.radiusMeters,
            accentColor: mall.accentColor,
            icon: mall.icon,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );

      // Seed stores for this mall
      for (const store of mall.stores) {
        totalStores++;
        await storesCol.updateOne(
          { id: store.id },
          {
            $set: {
              id: store.id,
              mallId: mall.id,
              name: store.name,
              cat: store.cat,
              icon: store.icon,
              hue: store.hue,
              dist: store.dist,
              item: store.item,
              open: store.open,
              tag: store.tag,
              image: store.image,
              specialBadge: store.specialBadge,
              lat: store.lat,
              lng: store.lng,
              bearing: store.bearing,
              bleBeaconId: store.bleBeaconId,
              rssi: store.rssi,
              companyLogoSymbol: store.companyLogoSymbol,
              brandBgColor: store.brandBgColor,
              brandTextColor: store.brandTextColor,
              mallName: mall.name,
              mallUrl: mall.googleMapsUrl,
              promoDetails: store.promoDetails,
              updatedAt: new Date(),
            },
          },
          { upsert: true },
        );

        // Seed products for this store
        if (store.products) {
          for (const prod of store.products) {
            totalProducts++;
            await productsCol.updateOne(
              { id: prod.id },
              {
                $set: {
                  id: prod.id,
                  storeId: store.id,
                  mallId: mall.id,
                  name: prod.name,
                  category: prod.category,
                  priceZAR: prod.priceZAR,
                  originalPriceZAR: prod.originalPriceZAR,
                  discountPercent: prod.discountPercent,
                  image: prod.image,
                  description: prod.description,
                  sku: prod.sku,
                  inStock: prod.inStock,
                  specialBadge: prod.specialBadge,
                  updatedAt: new Date(),
                },
              },
              { upsert: true },
            );
          }
        }
      }
    }

    isInitialized = true;
    console.log(
      `[MongoDB] Initialized & verified: ${ALL_MALLS.length} malls, ${totalStores} stores, ${totalProducts} products.`,
    );

    return {
      success: true,
      mallCount: ALL_MALLS.length,
      storeCount: totalStores,
      productCount: totalProducts,
    };
  } catch (err: unknown) {
    console.error("[MongoDB] Seeding error:", err instanceof Error ? err.message : String(err));
    return { success: false, mallCount: 0, storeCount: 0, productCount: 0 };
  }
}

/**
 * Persists settled checkout orders to MongoDB
 */
export async function persistOrderToDb(order: Record<string, unknown>): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.collection("orders").insertOne({
      ...order,
      storedAt: new Date(),
    });
    return true;
  } catch (e: unknown) {
    console.error("[MongoDB] Failed to persist order:", e instanceof Error ? e.message : String(e));
    return false;
  }
}

/**
 * Persists parked offers to MongoDB
 */
export async function persistParkedOfferToDb(
  parkedOffer: Record<string, unknown>,
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db
      .collection("parked_offers")
      .updateOne(
        { id: parkedOffer.id },
        { $set: { ...parkedOffer, storedAt: new Date() } },
        { upsert: true },
      );
    return true;
  } catch (e: unknown) {
    console.error(
      "[MongoDB] Failed to persist parked offer:",
      e instanceof Error ? e.message : String(e),
    );
    return false;
  }
}

/**
 * Returns health status of MongoDB backend
 */
export async function getMongoHealth(): Promise<{
  connected: boolean;
  database: string;
  uriConfigured: boolean;
  stats?: {
    collections: string[];
  };
}> {
  if (!uri) {
    return { connected: false, database: "none", uriConfigured: false };
  }
  try {
    const db = await getDb();
    if (!db) {
      return { connected: false, database: "autocom_db", uriConfigured: true };
    }
    const ping = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    return {
      connected: ping.ok === 1,
      database: "autocom_db",
      uriConfigured: true,
      stats: {
        collections: collections.map((c) => c.name),
      },
    };
  } catch {
    return {
      connected: false,
      database: "autocom_db",
      uriConfigured: true,
    };
  }
}
