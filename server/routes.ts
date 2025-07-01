import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { conversionRequestSchema, seoSettingsUpdateSchema, aiSettingsUpdateSchema } from "@shared/schema";
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

  // Get AI settings
  app.get("/api/admin/ai", async (req, res) => {
    try {
      const aiSettings = await storage.getAiSettings();
      // Don't expose the full API key, only show first/last few characters
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
  app.put("/api/admin/ai", async (req, res) => {
    try {
      const validatedData = aiSettingsUpdateSchema.parse(req.body);
      const updatedSettings = await storage.updateAiSettings(validatedData);
      
      res.json({
        success: true,
        data: {
          ...updatedSettings,
          openaiApiKey: `${updatedSettings.openaiApiKey.slice(0, 7)}...${updatedSettings.openaiApiKey.slice(-4)}`
        }
      });
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update AI settings' });
    }
  });

  // Admin page route
  app.get("/admin", (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Korean Name Tool</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; }
    .tabs { margin-bottom: 30px; border-bottom: 1px solid #ddd; }
    .tab { display: inline-block; padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent; }
    .tab.active { border-bottom-color: #0066cc; background: #f0f8ff; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-weight: 600; margin-bottom: 5px; }
    input, textarea, select { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
    textarea { min-height: 80px; resize: vertical; }
    button { background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    button:hover { background: #0052a3; }
    .success { color: #059669; margin-top: 10px; }
    .error { color: #dc2626; margin-top: 10px; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <h1>Admin Panel</h1>
  
  <div class="tabs">
    <div class="tab active" onclick="showTab('seo')">SEO Settings</div>
    <div class="tab" onclick="showTab('ai')">AI Configuration</div>
  </div>
  <div id="seo-tab" class="tab-content active">
    <h2>SEO Settings</h2>
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
      <div id="seo-message"></div>
    </form>
  </div>

  <div id="ai-tab" class="tab-content">
    <h2>AI Configuration</h2>
    <div class="warning">
      <strong>Warning:</strong> Changing these settings will affect all AI-powered features including name conversion and text-to-speech.
    </div>
    <form id="aiForm">
      <div class="form-group">
        <label for="openaiModel">OpenAI Model</label>
        <select id="openaiModel" name="openaiModel" required>
          <option value="gpt-4o">GPT-4o (Latest, Recommended)</option>
          <option value="gpt-4o-mini">GPT-4o Mini (Faster, Lower Cost)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
      </div>
      <div class="form-group">
        <label for="openaiApiKey">OpenAI API Key</label>
        <input type="password" id="openaiApiKey" name="openaiApiKey" required minlength="10" placeholder="sk-...">
        <small style="color: #666;">Your API key is stored securely and only partially visible for verification.</small>
      </div>
      <button type="submit">Update AI Settings</button>
      <div id="ai-message"></div>
    </form>
  </div>

  <script>
    function showTab(tabName) {
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show selected tab content
      document.getElementById(tabName + '-tab').classList.add('active');
      // Add active class to clicked tab
      event.target.classList.add('active');
    }

    async function loadSeoSettings() {
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
        console.error('Error loading SEO settings:', error);
      }
    }

    async function loadAiSettings() {
      try {
        const response = await fetch('/api/admin/ai');
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          document.getElementById('openaiModel').value = data.openaiModel || 'gpt-4o';
          // Don't populate the API key field for security
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    }

    document.getElementById('seoForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const messageEl = document.getElementById('seo-message');

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

    document.getElementById('aiForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const messageEl = document.getElementById('ai-message');

      try {
        const response = await fetch('/api/admin/ai', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
          messageEl.innerHTML = '<div class="success">AI settings updated successfully!</div>';
          // Clear the API key field after successful update
          document.getElementById('openaiApiKey').value = '';
        } else {
          messageEl.innerHTML = '<div class="error">Error: ' + (result.error || 'Unknown error') + '</div>';
        }
      } catch (error) {
        messageEl.innerHTML = '<div class="error">Error updating settings: ' + error.message + '</div>';
      }
    });

    // Load settings on page load
    loadSeoSettings();
    loadAiSettings();
  </script>
</body>
</html>`;
    res.send(html);
  });

  const httpServer = createServer(app);
  return httpServer;
}
