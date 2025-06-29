import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  sourceLanguage: text("source_language").notNull(),
  koreanName: text("korean_name").notNull(),
  romanization: text("romanization").notNull(),
  breakdown: text("breakdown").notNull(), // JSON string of character breakdown
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
});

export const conversionRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  sourceLanguage: z.string().min(2, "Invalid language code"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type ConversionRequest = z.infer<typeof conversionRequestSchema>;
