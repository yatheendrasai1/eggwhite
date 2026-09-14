// One-off admin bootstrap: grants dashboard ("tiv") access to an account by email.
// Usage: npx tsx --env-file=.env.local scripts/grant-tiv.mts someone@example.com
//
// Looks the user up in the Auth.js-owned `eggwhite` database (native driver, same
// as src/auth.ts), then writes the flag through the app's own Mongoose model
// (src/lib/models/UserProfile.ts) so it lands wherever the rest of the app's
// Mongoose models actually read/write — whatever database connectDB() resolves to.
import { getMongoClient } from "../src/lib/mongoClient";
import { connectDB } from "../src/lib/db";
import { UserProfileModel } from "../src/lib/models/UserProfile";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx --env-file=.env.local scripts/grant-tiv.mts <email>");
  process.exit(1);
}

const client = await getMongoClient();
const authDb = client.db("eggwhite");

const user = await authDb.collection("users").findOne({ email });
if (!user) {
  console.error(`No user found with email ${email}. They must sign in at least once first.`);
  process.exit(1);
}

const userId = String(user._id);
await connectDB();
await UserProfileModel.findOneAndUpdate(
  { userId },
  { $set: { isTiv: true } },
  { upsert: true }
);

console.log(`Granted dashboard access to ${email} (userId ${userId}).`);
process.exit(0);
