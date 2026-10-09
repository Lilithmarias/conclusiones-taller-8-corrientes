import { int, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Cuentas con acceso a la administración privada del proyecto. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Red voluntaria de contacto para recibir materiales y sistematizaciones de talleres. */
export const contactSubscriptions = mysqlTable("contact_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 120 }),
  territory: varchar("territory", { length: 120 }),
  workshopInterest: varchar("workshopInterest", { length: 180 }).notNull(),
  consentVersion: varchar("consentVersion", { length: 24 }).notNull().default("v1-2026-10"),
  consentAt: timestamp("consentAt").notNull(),
  status: mysqlEnum("status", ["subscribed", "unsubscribed"]).default("subscribed").notNull(),
  source: varchar("source", { length: 64 }).notNull().default("sitio-encuentro"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("contact_subscriptions_email_unique").on(table.email),
]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ContactSubscription = typeof contactSubscriptions.$inferSelect;
