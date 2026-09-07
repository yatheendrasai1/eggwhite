import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * Lazily-created shared MongoClient for the Auth.js MongoDB adapter.
 * Nothing connects at import time, so `next build` works without env vars.
 */
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
};

declare global {
  var _eggwhiteMongo: Promise<MongoClient> | undefined;
}

export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — see web/.env.example");

  if (process.env.NODE_ENV === "development") {
    if (!global._eggwhiteMongo) {
      global._eggwhiteMongo = new MongoClient(uri, options).connect();
    }
    return global._eggwhiteMongo;
  }
  if (!global._eggwhiteMongo) {
    global._eggwhiteMongo = new MongoClient(uri, options).connect();
  }
  return global._eggwhiteMongo;
}
