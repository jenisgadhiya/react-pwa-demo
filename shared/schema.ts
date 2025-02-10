
import { z } from "zod";

// Define user types
export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "manager";
  status: "active" | "inactive" | "pending";
  created_at: string;
};

export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "manager"]).default("user"),
  status: z.enum(["active", "inactive", "pending"]).default("active")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
