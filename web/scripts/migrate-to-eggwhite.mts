// One-off: copies this app's collections from the `test` database (the driver's
// default when MONGODB_URI has no db name) into `eggwhite` (the database
// src/auth.ts already uses explicitly). Copy-only — does not touch `test`.
//
// IMPORTANT: `test` is a shared fallback database on this cluster and also holds
// an unrelated project's collections (notifications, transactions, tokens,
// schedulers, icconfigs, users). Only the collections below belong to this app.
//
// Usage: npx tsx --env-file=.env.local scripts/migrate-to-eggwhite.mts
import { getMongoClient } from "../src/lib/mongoClient";

const APP_COLLECTIONS = ["attempts", "results", "userprofiles", "passcodes", "prousages"];

const client = await getMongoClient();
const source = client.db("test");
const dest = client.db("eggwhite");

for (const name of APP_COLLECTIONS) {
  const docs = await source.collection(name).find({}).toArray();
  const beforeDest = await dest.collection(name).countDocuments();
  if (docs.length === 0) {
    console.log(`${name}: source has 0 docs, nothing to copy (dest had ${beforeDest}).`);
    continue;
  }
  const result = await dest.collection(name).insertMany(docs, { ordered: false });
  const afterDest = await dest.collection(name).countDocuments();
  console.log(
    `${name}: copied ${result.insertedCount}/${docs.length} docs. eggwhite.${name} now has ${afterDest} docs (had ${beforeDest}).`
  );
}

await client.close();
process.exit(0);
