import { users, conversions, type User, type InsertUser, type Conversion, type InsertConversion, type SeoSettings, type InsertSeoSettings, type AiSettings, type InsertAiSettings } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getRecentConversions(limit?: number): Promise<Conversion[]>;
  getConversionsByName(name: string): Promise<Conversion[]>;
  getSeoSettings(): Promise<SeoSettings | undefined>;
  updateSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings>;
  getAiSettings(): Promise<AiSettings | undefined>;
  updateAiSettings(settings: InsertAiSettings): Promise<AiSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversions: Map<number, Conversion>;
  private seoSettings: SeoSettings | undefined;
  private aiSettings: AiSettings | undefined;
  private currentUserId: number;
  private currentConversionId: number;

  constructor() {
    this.users = new Map();
    this.conversions = new Map();
    this.currentUserId = 1;
    this.currentConversionId = 1;
    
    // Initialize with default SEO settings
    this.seoSettings = {
      id: 1,
      pageTitle: "Korean Name Pronunciation Tool - Convert Your Name to Korean",
      metaDescription: "Convert your name from any language to Korean Hangul with accurate pronunciation guides and audio playback. AI-powered multilingual name transliteration.",
      ogTitle: "Discover Your Korean Name - AI-Powered Name Converter",
      ogDescription: "Enter your name and instantly see how it's written and pronounced in Korean. Perfect for learning Korean or creating Korean social media profiles.",
      keywords: "Korean name converter, Hangul transliteration, Korean pronunciation, name translation, multilingual converter",
      updatedAt: new Date(),
    };

    // Initialize with default AI settings
    this.aiSettings = {
      id: 1,
      openaiModel: "gpt-4o",
      openaiApiKey: process.env.OPENAI_API_KEY || "",
      updatedAt: new Date(),
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = this.currentConversionId++;
    const conversion: Conversion = { 
      ...insertConversion, 
      id,
      createdAt: new Date()
    };
    this.conversions.set(id, conversion);
    return conversion;
  }

  async getRecentConversions(limit: number = 10): Promise<Conversion[]> {
    return Array.from(this.conversions.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getConversionsByName(name: string): Promise<Conversion[]> {
    return Array.from(this.conversions.values())
      .filter(conversion => 
        conversion.originalName.toLowerCase().includes(name.toLowerCase())
      );
  }

  async getSeoSettings(): Promise<SeoSettings | undefined> {
    return this.seoSettings;
  }

  async updateSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings> {
    const updatedSettings: SeoSettings = {
      id: this.seoSettings?.id || 1,
      ...settings,
      updatedAt: new Date(),
    };
    this.seoSettings = updatedSettings;
    return updatedSettings;
  }

  async getAiSettings(): Promise<AiSettings | undefined> {
    return this.aiSettings;
  }

  async updateAiSettings(settings: InsertAiSettings): Promise<AiSettings> {
    const updatedSettings: AiSettings = {
      id: this.aiSettings?.id || 1,
      openaiModel: settings.openaiModel || "gpt-4o",
      openaiApiKey: settings.openaiApiKey || "",
      updatedAt: new Date(),
    };
    this.aiSettings = updatedSettings;
    return updatedSettings;
  }
}

export const storage = new MemStorage();
