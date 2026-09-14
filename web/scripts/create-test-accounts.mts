// One-off: creates fake Auth.js users + sessions (bypassing real Google OAuth) so you
// can impersonate them locally for testing, and prints a curl-ready session cookie.
//
// To use in a browser: DevTools > Application > Cookies > http://localhost:3000 >
// add a cookie named `authjs.session-token` with the printed value, path `/`
// (check "HttpOnly" if the UI offers it). Then reload the page as that user.
//
// Usage: npx tsx --env-file=.env.local scripts/create-test-accounts.mts
import crypto from "node:crypto";
import { getMongoClient } from "../src/lib/mongoClient";
import { connectDB } from "../src/lib/db";
import { UserProfileModel } from "../src/lib/models/UserProfile";

const SESSION_DAYS = 30;

const ACCOUNTS = [
  { label: "Regular", name: "Test — Regular", email: "eggwhite-test-regular@example.test", pro: null as number | null },
  { label: "Pro (active)", name: "Test — Pro", email: "eggwhite-test-pro@example.test", pro: 20 },
  { label: "Pro (expired)", name: "Test — Pro Expired", email: "eggwhite-test-pro-expired@example.test", pro: -5 },
];

const client = await getMongoClient();
const db = client.db("eggwhite");
await connectDB();

const results: { label: string; email: string; userId: string; cookie: string }[] = [];

for (const acc of ACCOUNTS) {
  // idempotent: reuse the user doc if this script has been run before
  const existing = await db.collection("users").findOne({ email: acc.email });
  const userId =
    existing?._id ??
    (await db.collection("users").insertOne({
      name: acc.name,
      email: acc.email,
      emailVerified: null,
      image: null,
    })).insertedId;

  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.collection("sessions").insertOne({ sessionToken, userId, expires });

  if (acc.pro !== null) {
    const proExpiresAt = new Date(Date.now() + acc.pro * 24 * 60 * 60 * 1000);
    await UserProfileModel.findOneAndUpdate(
      { userId: String(userId) },
      { $set: { proExpiresAt } },
      { upsert: true }
    );
  }

  results.push({ label: acc.label, email: acc.email, userId: String(userId), cookie: sessionToken });
}

console.log("\nTest accounts ready:\n");
for (const r of results) {
  console.log(`${r.label} — ${r.email}`);
  console.log(`  userId: ${r.userId}`);
  console.log(`  cookie: authjs.session-token=${r.cookie}`);
  console.log(`  curl:   curl -s -b "authjs.session-token=${r.cookie}" http://localhost:3000/api/profile`);
  console.log("");
}

process.exit(0);
