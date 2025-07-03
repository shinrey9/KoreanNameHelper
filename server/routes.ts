import { Router } from "express";
import { storage } from "./storage";
import { conversionRequestSchema, seoSettingsUpdateSchema, aiSettingsUpdateSchema } from "@shared/schema";
import { transliterationService } from "./services/transliteration";
import { aiTransliterationService } from "./services/aiTransliteration";
import { textToSpeechService } from "./services/textToSpeech";
import { aiTextToSpeechService } from "./services/aiTextToSpeech";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Helper function to group syllables into words
function groupSyllablesIntoWords(breakdown: any[], originalName: string) {
  // If breakdown already has multi-syllable entries, return as is
  const hasMultiSyllableEntries = breakdown.some(item => item.hangul.length > 1);
  if (hasMultiSyllableEntries) {
    return breakdown;
  }

  // Group syllables by type (given, middle, family)
  const grouped: any[] = [];
  let currentGroup: any = null;

  for (const item of breakdown) {
    if (!currentGroup || currentGroup.type !== item.type) {
      // Start new group
      if (currentGroup) {
        grouped.push(currentGroup);
      }
      currentGroup = {
        hangul: item.hangul,
        romanization: item.romanization,
        type: item.type
      };
    } else {
      // Add to current group
      currentGroup.hangul += item.hangul;
      currentGroup.romanization += `-${item.romanization}`;
    }
  }
  
  if (currentGroup) {
    grouped.push(currentGroup);
  }

  return grouped.length > 0 ? grouped : breakdown;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API Routes

  // Convert name to Korean
  app.post("/api/convert", async (req, res) => {
    try {
      const { name, sourceLanguage } = conversionRequestSchema.parse(req.body);
      
      // Use AI service for conversion
      const result = await aiTransliterationService.convertToKorean(name, sourceLanguage);
      
      // Group syllables into words if AI still returns individual syllables
      const processedBreakdown = groupSyllablesIntoWords(result.breakdown, name);
      
      // Store in database
      const conversion = await storage.createConversion({
        originalName: name,
        sourceLanguage: sourceLanguage,
        koreanName: result.koreanName,
        romanization: result.romanization,
        breakdown: JSON.stringify(processedBreakdown),
      });

      res.json({
        success: true,
        data: {
          ...conversion,
          breakdown: processedBreakdown,
        },
      });
    } catch (error) {
      console.error("Conversion error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to convert name" 
      });
    }
  });

  // Generate Korean audio
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({
          success: false,
          error: "Text is required",
        });
      }

      // Use AI TTS service
      const result = await aiTextToSpeechService.generateKoreanAudio(text);
      
      if (result.error) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        data: {
          audioUrl: result.audioUrl,
        },
      });
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate audio",
      });
    }
  });

  // Get recent conversions
  app.get("/api/recent-conversions", async (req, res) => {
    try {
      const conversions = await storage.getRecentConversions(10);
      res.json(conversions);
    } catch (error) {
      console.error("Failed to get recent conversions:", error);
      res.status(500).json({ success: false, error: "Failed to get conversions" });
    }
  });

  // Get SEO settings for a specific page
  app.get("/api/admin/seo", isAuthenticated, async (req, res) => {
    try {
      const pagePath = req.query.pagePath as string;
      if (!pagePath) {
        const allSeoSettings = await storage.getAllSeoSettings();
        res.json({
          success: true,
          data: allSeoSettings
        });
        return;
      }
      
      const seoSettings = await storage.getSeoSettings(pagePath);
      res.json({
        success: true,
        data: seoSettings
      });
    } catch (error) {
      console.error('Failed to get SEO settings:', error);
      res.status(500).json({ success: false, error: 'Failed to get SEO settings' });
    }
  });

  // Update SEO settings
  app.put("/api/admin/seo", isAuthenticated, async (req, res) => {
    try {
      const validatedData = seoSettingsUpdateSchema.parse(req.body);
      const updatedSettings = await storage.updateSeoSettings(validatedData);
      
      res.json({
        success: true,
        data: updatedSettings
      });
    } catch (error) {
      console.error('Failed to update SEO settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update SEO settings' });
    }
  });

  // Get AI settings
  app.get("/api/admin/ai", isAuthenticated, async (req, res) => {
    try {
      const aiSettings = await storage.getAiSettings();
      const safeSettings = aiSettings ? {
        ...aiSettings,
        openaiApiKey: aiSettings.openaiApiKey ? `${aiSettings.openaiApiKey.slice(0, 7)}...${aiSettings.openaiApiKey.slice(-4)}` : ""
      } : null;
      
      res.json({
        success: true,
        data: safeSettings
      });
    } catch (error) {
      console.error('Failed to get AI settings:', error);
      res.status(500).json({ success: false, error: 'Failed to get AI settings' });
    }
  });

  // Update AI settings
  app.put("/api/admin/ai", isAuthenticated, async (req, res) => {
    try {
      const validatedData = aiSettingsUpdateSchema.parse(req.body);
      const updatedSettings = await storage.updateAiSettings(validatedData);
      
      res.json({
        success: true,
        data: {
          ...updatedSettings,
          openaiApiKey: updatedSettings.openaiApiKey ? `${updatedSettings.openaiApiKey.slice(0, 7)}...${updatedSettings.openaiApiKey.slice(-4)}` : ""
        }
      });
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update AI settings' });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
