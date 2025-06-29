import { users, conversions, type User, type InsertUser, type Conversion, type InsertConversion } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getRecentConversions(limit?: number): Promise<Conversion[]>;
  getConversionsByName(name: string): Promise<Conversion[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversions: Map<number, Conversion>;
  private currentUserId: number;
  private currentConversionId: number;

  constructor() {
    this.users = new Map();
    this.conversions = new Map();
    this.currentUserId = 1;
    this.currentConversionId = 1;
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
}

export const storage = new MemStorage();
