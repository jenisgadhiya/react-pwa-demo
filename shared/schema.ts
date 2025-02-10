import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    name: true,
    email: true,
    role: true,
    status: true,
  })
  .extend({
    email: z.string().email(),
    role: z.enum(["admin", "user", "manager"]),
    status: z.enum(["active", "inactive", "pending"]),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
