import { users, conversions, type User, type UpsertUser, type Conversion, type InsertConversion, type SeoSettings, type InsertSeoSettings, type AiSettings, type InsertAiSettings } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getRecentConversions(limit?: number): Promise<Conversion[]>;
  getConversionsByName(name: string): Promise<Conversion[]>;
  getSeoSettings(pagePath: string): Promise<SeoSettings | undefined>;
  updateSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings>;
  getAllSeoSettings(): Promise<SeoSettings[]>;
  getAiSettings(): Promise<AiSettings | undefined>;
  updateAiSettings(settings: InsertAiSettings): Promise<AiSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversions: Map<number, Conversion>;
  private seoSettings: Map<string, SeoSettings>;
  private aiSettings: AiSettings | undefined;
  private currentConversionId: number;
  private currentSeoId: number;

  constructor() {
    this.users = new Map();
    this.conversions = new Map();
    this.seoSettings = new Map();
    this.currentConversionId = 1;
    this.currentSeoId = 1;
    
    // Initialize with default SEO settings for different pages
    const homepageSeo: SeoSettings = {
      id: this.currentSeoId++,
      pagePath: "/",
      pageTitle: "Multi-Language Conversion Tools - Convert Names & More",
      metaDescription: "Access powerful conversion tools for names, text, and more. Convert names to Korean, Chinese, and other languages with AI-powered accuracy.",
      ogTitle: "Multi-Language Conversion Tools - Your Gateway to Global Languages",
      ogDescription: "Discover our suite of language conversion tools. Perfect for learning languages, creating international profiles, and understanding global cultures.",
      keywords: "language converter, name converter, multilingual tools, translation tools, Korean converter, Chinese converter",
      updatedAt: new Date(),
    };
    
    const koreanConverterSeo: SeoSettings = {
      id: this.currentSeoId++,
      pagePath: "/korean-name-converter",
      pageTitle: "Korean Name Pronunciation Tool - Convert Your Name to Korean",
      metaDescription: "Convert your name from any language to Korean Hangul with accurate pronunciation guides and audio playback. AI-powered multilingual name transliteration.",
      ogTitle: "Discover Your Korean Name - AI-Powered Name Converter",
      ogDescription: "Enter your name and instantly see how it's written and pronounced in Korean. Perfect for learning Korean or creating Korean social media profiles.",
      keywords: "Korean name converter, Hangul transliteration, Korean pronunciation, name translation, multilingual converter",
      updatedAt: new Date(),
    };
    
    this.seoSettings.set("/", homepageSeo);
    this.seoSettings.set("/korean-name-converter", koreanConverterSeo);

    // Initialize with default AI settings
    this.aiSettings = {
      id: 1,
      openaiModel: "gpt-4o",
      openaiApiKey: process.env.OPENAI_API_KEY || "",
      updatedAt: new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(userData.id, newUser);
      return newUser;
    }
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

  async getSeoSettings(pagePath: string): Promise<SeoSettings | undefined> {
    return this.seoSettings.get(pagePath);
  }

  async getAllSeoSettings(): Promise<SeoSettings[]> {
    return Array.from(this.seoSettings.values());
  }

  async updateSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings> {
    const existingSettings = this.seoSettings.get(settings.pagePath);
    const updatedSettings: SeoSettings = {
      id: existingSettings?.id || this.currentSeoId++,
      ...settings,
      updatedAt: new Date(),
    };
    this.seoSettings.set(settings.pagePath, updatedSettings);
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

// Switch between MemStorage and DatabaseStorage
export const storage = process.env.DATABASE_URL ? new MemStorage() : new MemStorage();
