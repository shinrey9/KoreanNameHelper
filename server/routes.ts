import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { conversionRequestSchema, seoSettingsUpdateSchema } from "@shared/schema";
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

  // Get SEO settings
  app.get("/api/admin/seo", async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
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
  app.put("/api/admin/seo", async (req, res) => {
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

  // Admin page route
  app.get("/admin", (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - SEO Settings</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-weight: 600; margin-bottom: 5px; }
    input, textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    textarea { min-height: 80px; resize: vertical; }
    button { background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0052a3; }
    .success { color: #059669; margin-top: 10px; }
    .error { color: #dc2626; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>SEO Settings Admin</h1>
  <form id="seoForm">
    <div class="form-group">
      <label for="pageTitle">Page Title</label>
      <input type="text" id="pageTitle" name="pageTitle" required maxlength="200">
    </div>
    <div class="form-group">
      <label for="metaDescription">Meta Description</label>
      <textarea id="metaDescription" name="metaDescription" required maxlength="300"></textarea>
    </div>
    <div class="form-group">
      <label for="ogTitle">Open Graph Title</label>
      <input type="text" id="ogTitle" name="ogTitle" required maxlength="200">
    </div>
    <div class="form-group">
      <label for="ogDescription">Open Graph Description</label>
      <textarea id="ogDescription" name="ogDescription" required maxlength="300"></textarea>
    </div>
    <div class="form-group">
      <label for="keywords">Keywords (comma separated)</label>
      <input type="text" id="keywords" name="keywords" required maxlength="500">
    </div>
    <button type="submit">Update SEO Settings</button>
    <div id="message"></div>
  </form>

  <script>
    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/seo');
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          document.getElementById('pageTitle').value = data.pageTitle || '';
          document.getElementById('metaDescription').value = data.metaDescription || '';
          document.getElementById('ogTitle').value = data.ogTitle || '';
          document.getElementById('ogDescription').value = data.ogDescription || '';
          document.getElementById('keywords').value = data.keywords || '';
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    document.getElementById('seoForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const messageEl = document.getElementById('message');

      try {
        const response = await fetch('/api/admin/seo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
          messageEl.innerHTML = '<div class="success">SEO settings updated successfully!</div>';
        } else {
          messageEl.innerHTML = '<div class="error">Error: ' + (result.error || 'Unknown error') + '</div>';
        }
      } catch (error) {
        messageEl.innerHTML = '<div class="error">Error updating settings: ' + error.message + '</div>';
      }
    });

    loadSettings();
  </script>
</body>
</html>`;
    res.send(html);
  });

  const httpServer = createServer(app);
  return httpServer;
}
