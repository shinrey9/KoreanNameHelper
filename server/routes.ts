import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { conversionRequestSchema } from "@shared/schema";
import { transliterationService } from "./services/transliteration";
import { aiTransliterationService } from "./services/aiTransliteration";
import { aiTextToSpeechService } from "./services/aiTextToSpeech";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Convert name to Korean using AI
  app.post("/api/convert", async (req, res) => {
    try {
      const { name, sourceLanguage } = conversionRequestSchema.parse(req.body);
      
      // Auto-detect language if requested
      const detectedLanguage = sourceLanguage === 'auto' 
        ? await aiTransliterationService.detectLanguage(name)
        : sourceLanguage;
      
      // Convert to Korean using AI
      const result = await aiTransliterationService.convertToKorean(name, detectedLanguage);
      
      // Store conversion
      const conversion = await storage.createConversion({
        originalName: name,
        sourceLanguage: detectedLanguage,
        koreanName: result.koreanName,
        romanization: result.romanization,
        breakdown: JSON.stringify(result.breakdown)
      });
      
      res.json({
        success: true,
        data: {
          id: conversion.id,
          originalName: name,
          sourceLanguage: detectedLanguage,
          koreanName: result.koreanName,
          romanization: result.romanization,
          breakdown: result.breakdown
        }
      });
      
    } catch (error: any) {
      console.error('Conversion error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to convert name'
      });
    }
  });
  
  // Generate audio for Korean pronunciation
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice, rate, pitch } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          error: 'Text is required'
        });
      }
      
      if (!aiTextToSpeechService.validateKoreanText(text)) {
        return res.status(400).json({
          success: false,
          error: 'Text must contain Korean characters'
        });
      }
      
      const result = await aiTextToSpeechService.generateKoreanAudio(text, {
        voice,
        rate: rate || 1.0,
        pitch: pitch || 1.0
      });
      
      if (result.error) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
      
      res.json({
        success: true,
        data: {
          audioUrl: result.audioUrl,
          text
        }
      });
      
    } catch (error: any) {
      console.error('TTS error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate audio'
      });
    }
  });
  
  // Get recent conversions
  app.get("/api/conversions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const conversions = await storage.getRecentConversions(limit);
      
      const formatted = conversions.map(conv => ({
        id: conv.id,
        originalName: conv.originalName,
        sourceLanguage: conv.sourceLanguage,
        koreanName: conv.koreanName,
        romanization: conv.romanization,
        breakdown: JSON.parse(conv.breakdown),
        createdAt: conv.createdAt
      }));
      
      res.json({
        success: true,
        data: formatted
      });
      
    } catch (error: any) {
      console.error('Get conversions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversions'
      });
    }
  });
  
  // Search conversions by name
  app.get("/api/conversions/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
      
      const conversions = await storage.getConversionsByName(q);
      
      const formatted = conversions.map(conv => ({
        id: conv.id,
        originalName: conv.originalName,
        sourceLanguage: conv.sourceLanguage,
        koreanName: conv.koreanName,
        romanization: conv.romanization,
        breakdown: JSON.parse(conv.breakdown),
        createdAt: conv.createdAt
      }));
      
      res.json({
        success: true,
        data: formatted
      });
      
    } catch (error: any) {
      console.error('Search conversions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search conversions'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
