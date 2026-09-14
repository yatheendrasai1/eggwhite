import crypto from "node:crypto";
import { getMongoClient } from "@/lib/mongoClient";

const AUTH_DB = "eggwhite";
const SESSION_DAYS = 30;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export function isValidUsername(u: string): boolean {
  return USERNAME_RE.test(u);
}

export function isValidPassword(p: string): boolean {
  return typeof p === "string" && p.length >= 8 && p.length <= 200;
}

function scryptHash(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await scryptHash(password, salt);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptHash(password, salt);
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

export function generateEntryCode(): string {
  return crypto.randomBytes(9).toString("base64url");
}

export type LocalUser = {
  _id: import("mongodb").ObjectId;
  username: string;
  usernameLower: string;
  passwordHash: string;
  status: "pending" | "active";
  entryCode: string;
  name: string;
  createdAt: Date;
};

async function usersCollection() {
  const client = await getMongoClient();
  return client.db(AUTH_DB).collection<LocalUser>("users");
}

async function sessionsCollection() {
  const client = await getMongoClient();
  return client.db(AUTH_DB).collection("sessions");
}

export async function createLocalSession(userId: import("mongodb").ObjectId): Promise<string> {
  const sessions = await sessionsCollection();
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sessions.insertOne({ sessionToken, userId, expires });
  return sessionToken;
}

/** Same cookie shape @auth/core uses for the database session strategy. */
export function sessionCookieHeader(token: string, secure: boolean): string {
  const name = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const attrs = [`${name}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

export type SignupResult =
  | { ok: true }
  | { ok: false; reason: "invalid-username" | "invalid-password" | "username-taken" };

export async function signup(username: string, password: string): Promise<SignupResult> {
  if (!isValidUsername(username)) return { ok: false, reason: "invalid-username" };
  if (!isValidPassword(password)) return { ok: false, reason: "invalid-password" };

  const users = await usersCollection();
  const usernameLower = username.toLowerCase();
  const existing = await users.findOne({ usernameLower });
  if (existing) return { ok: false, reason: "username-taken" };

  const passwordHash = await hashPassword(password);
  const entryCode = generateEntryCode();

  await users.insertOne({
    username,
    usernameLower,
    passwordHash,
    status: "pending",
    entryCode,
    name: username,
    createdAt: new Date(),
  } as LocalUser);

  return { ok: true };
}

export type ActivateResult =
  | { ok: true; cookie: string }
  | { ok: false; reason: "invalid" };

export async function activate(username: string, entryCode: string): Promise<ActivateResult> {
  const users = await usersCollection();
  const usernameLower = username.toLowerCase();
  const user = await users.findOne({ usernameLower, status: "pending" });
  if (!user) return { ok: false, reason: "invalid" };

  const provided = Buffer.from(entryCode);
  const expected = Buffer.from(user.entryCode);
  const matches =
    provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!matches) return { ok: false, reason: "invalid" };

  await users.updateOne({ _id: user._id }, { $set: { status: "active" } });
  const cookie = await createLocalSession(user._id);
  return { ok: true, cookie };
}

export type LoginResult =
  | { ok: true; cookie: string }
  | { ok: false; reason: "invalid-credentials" | "pending" };

export async function login(username: string, password: string): Promise<LoginResult> {
  const users = await usersCollection();
  const usernameLower = username.toLowerCase();
  const user = await users.findOne({ usernameLower });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, reason: "invalid-credentials" };
  }
  if (user.status !== "active") return { ok: false, reason: "pending" };

  const cookie = await createLocalSession(user._id);
  return { ok: true, cookie };
}
