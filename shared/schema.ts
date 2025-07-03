import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  pagePath: text("page_path").notNull().unique(), // e.g., "/", "/korean-name-converter"
  pageTitle: text("page_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  ogTitle: text("og_title").default(""),
  ogDescription: text("og_description").default(""),
  keywords: text("keywords").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  openaiModel: text("openai_model").notNull().default("gpt-4o"),
  openaiApiKey: text("openai_api_key"), // 선택사항으로 변경
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);

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
  pagePath: z.string().min(1, "Page path is required"),
  pageTitle: z.string().min(1, "Page title is required").max(200, "Title too long"),
  metaDescription: z.string().min(1, "Meta description is required").max(300, "Description too long"),
  ogTitle: z.string().max(200, "Title too long"),
  ogDescription: z.string().max(300, "Description too long"),
  keywords: z.string().max(500, "Keywords too long"),
});

export const seoSettingsRequestSchema = z.object({
  pagePath: z.string().min(1, "Page path is required"),
});

export const insertAiSettingsSchema = createInsertSchema(aiSettings).omit({
  id: true,
  updatedAt: true,
});

export const aiSettingsUpdateSchema = z.object({
  openaiModel: z.string().min(1, "OpenAI model is required"),
  openaiApiKey: z.string().optional(), // API 키는 선택사항
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type ConversionRequest = z.infer<typeof conversionRequestSchema>;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;
export type SeoSettingsUpdate = z.infer<typeof seoSettingsUpdateSchema>;
export type SeoSettingsRequest = z.infer<typeof seoSettingsRequestSchema>;
export type InsertAiSettings = z.infer<typeof insertAiSettingsSchema>;
export type AiSettings = typeof aiSettings.$inferSelect;
export type AiSettingsUpdate = z.infer<typeof aiSettingsUpdateSchema>;
