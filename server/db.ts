import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ContactSubscription, InsertUser, contactSubscriptions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  updateSet.lastSignedIn = values.lastSignedIn;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export type ContactSubscriptionInput = {
  email: string;
  name?: string;
  territory?: string;
  workshopInterest: string;
};

export async function upsertContactSubscription(input: ContactSubscriptionInput): Promise<ContactSubscription> {
  const db = await getDb();
  if (!db) throw new Error("La base de contactos no está disponible. Probá nuevamente en unos minutos.");

  const now = new Date();
  const values = {
    email: input.email.trim().toLowerCase(),
    name: input.name?.trim() || null,
    territory: input.territory?.trim() || null,
    workshopInterest: input.workshopInterest,
    consentAt: now,
    status: "subscribed" as const,
    source: "sitio-encuentro",
  };

  await db.insert(contactSubscriptions).values(values).onDuplicateKeyUpdate({
    set: {
      name: values.name,
      territory: values.territory,
      workshopInterest: values.workshopInterest,
      consentAt: now,
      consentVersion: "v1-2026-10",
      status: "subscribed",
      updatedAt: now,
    },
  });

  const result = await db.select().from(contactSubscriptions).where(eq(contactSubscriptions.email, values.email)).limit(1);
  if (!result[0]) throw new Error("No se pudo confirmar la inscripción.");
  return result[0];
}
