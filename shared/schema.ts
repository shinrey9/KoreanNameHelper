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

export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pageTitle: text("page_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  ogTitle: text("og_title").notNull(),
  ogDescription: text("og_description").notNull(),
  keywords: text("keywords").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  openaiModel: text("openai_model").notNull().default("gpt-4o"),
  openaiApiKey: text("openai_api_key").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  updatedAt: true,
});

export const seoSettingsUpdateSchema = z.object({
  pageTitle: z.string().min(1, "Page title is required").max(200, "Title too long"),
  metaDescription: z.string().min(1, "Meta description is required").max(300, "Description too long"),
  ogTitle: z.string().min(1, "OG title is required").max(200, "Title too long"),
  ogDescription: z.string().min(1, "OG description is required").max(300, "Description too long"),
  keywords: z.string().min(1, "Keywords are required").max(500, "Keywords too long"),
});

export const insertAiSettingsSchema = createInsertSchema(aiSettings).omit({
  id: true,
  updatedAt: true,
});

export const aiSettingsUpdateSchema = z.object({
  openaiModel: z.string().min(1, "OpenAI model is required"),
  openaiApiKey: z.string().min(1, "OpenAI API key is required").min(10, "API key too short"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type ConversionRequest = z.infer<typeof conversionRequestSchema>;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;
export type SeoSettingsUpdate = z.infer<typeof seoSettingsUpdateSchema>;
export type InsertAiSettings = z.infer<typeof insertAiSettingsSchema>;
export type AiSettings = typeof aiSettings.$inferSelect;
export type AiSettingsUpdate = z.infer<typeof aiSettingsUpdateSchema>;
