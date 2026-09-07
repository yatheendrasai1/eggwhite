import mongoose from "mongoose";

/**
 * Cached Mongoose connection for app models (Attempt).
 * Serverless-safe: reuses one connection across warm invocations.
 * Nothing connects at import time.
 */
type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _eggwhiteMongoose: Cached | undefined;
}

const cached: Cached = global._eggwhiteMongoose ?? { conn: null, promise: null };
global._eggwhiteMongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — see web/.env.example");
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
