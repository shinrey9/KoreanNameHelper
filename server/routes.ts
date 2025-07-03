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
      console.log('Received SEO update request body:', req.body);
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

  // Admin page route
  app.get("/admin", isAuthenticated, (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - Language Tools</title>
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
    .success { color: #22c55e; font-weight: 600; margin: 10px 0; }
    .error { color: #ef4444; font-weight: 600; margin: 10px 0; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 20px; }
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
    <div class="form-group">
      <label for="pageSelect">Select Page</label>
      <select id="pageSelect" onchange="loadSeoSettings()">
        <option value="/">Homepage</option>
        <option value="/korean-name-converter">Korean Name Converter</option>
      </select>
    </div>
    <form id="seoForm">
      <input type="hidden" id="pagePath" name="pagePath" value="/">
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
          <option value="gpt-4.1">GPT-4.1 (Newest, Most Capable)</option>
          <option value="gpt-4.1-mini">GPT-4.1 Mini (Balanced Performance)</option>
          <option value="gpt-4.1-nano">GPT-4.1 Nano (Fastest, Most Efficient)</option>
          <option value="gpt-4o">GPT-4o (Latest, Recommended)</option>
          <option value="gpt-4o-mini">GPT-4o Mini (Faster, Lower Cost)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
      </div>
      <div class="form-group">
        <label for="openaiApiKey">OpenAI API Key</label>
        <input type="password" id="openaiApiKey" name="openaiApiKey" required placeholder="Enter your OpenAI API key">
        <small style="color: #666; margin-top: 4px; display: block;">This key is used for AI-powered Korean name conversion.</small>
      </div>
      <button type="submit">Update AI Settings</button>
      <div id="ai-message"></div>
    </form>
  </div>
  <script>
    function showTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.getElementById(tabName + '-tab').classList.add('active');
      event.target.classList.add('active');
    }

    async function loadSeoSettings() {
      try {
        const selectedPage = document.getElementById('pageSelect').value;
        const response = await fetch('/api/admin/seo?pagePath=' + encodeURIComponent(selectedPage));
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          document.getElementById('pagePath').value = selectedPage;
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
          document.getElementById('openaiApiKey').value = '';
        } else {
          messageEl.innerHTML = '<div class="error">Error: ' + (result.error || 'Unknown error') + '</div>';
        }
      } catch (error) {
        messageEl.innerHTML = '<div class="error">Error updating settings: ' + error.message + '</div>';
      }
    });

    loadSeoSettings();
    loadAiSettings();
  </script>
</body>
</html>`);
  });

  const httpServer = createServer(app);
  return httpServer;
}