import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";
import { z } from "zod";

// Define the users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "user", "manager"] }).notNull().default("user"),
  status: text("status", { enum: ["active", "inactive", "pending"] }).notNull().default("active"),
  created_at: timestamp("created_at").defaultNow()
});

// Create the insert schema using drizzle-zod
export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "manager"]).default("user"),
  status: z.enum(["active", "inactive", "pending"]).default("active")
}).omit({ id: true, created_at: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;