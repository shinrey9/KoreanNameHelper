import OpenAI from "openai";
import { storage } from "../storage";

// OpenAI client will be initialized with dynamic settings

interface CharacterBreakdown {
  hangul: string;
  romanization: string;
  type: 'family' | 'given' | 'syllable';
}

interface AITransliterationResult {
  koreanName: string;
  romanization: string;
  breakdown: CharacterBreakdown[];
}

class AITransliterationService {
  
  async convertToKorean(name: string, sourceLanguage: string): Promise<AITransliterationResult> {
    try {
      const prompt = this.buildPrompt(name, sourceLanguage);
      
      // Get current AI settings for model and API key
      const aiSettings = await storage.getAiSettings();
      const model = aiSettings?.openaiModel || "gpt-4o";
      const apiKey = aiSettings?.openaiApiKey || process.env.OPENAI_API_KEY || "";
      
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert in Korean transliteration and phonetics. You help people convert names from various languages into accurate Korean Hangul with proper pronunciation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        koreanName: result.korean_name || '',
        romanization: result.romanization || '',
        breakdown: result.breakdown || []
      };
      
    } catch (error) {
      console.error('AI Transliteration error:', error);
      throw new Error('Failed to generate AI transliteration');
    }
  }

  private buildPrompt(name: string, sourceLanguage: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish', 
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'auto': 'auto-detected language'
    };

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;

    let basePrompt = `Convert the ${sourceLangName} name "${name}" to Korean Hangul with accurate pronunciation.

Instructions:
1. Consider the phonetics and pronunciation of the original name in ${sourceLangName}
2. Use proper Korean syllable structure (consonant-vowel-consonant pattern)
3. Follow Korean transliteration conventions for foreign names
4. For family names, use common Korean surname equivalents when appropriate
5. Ensure the Korean version sounds natural when pronounced by Korean speakers`;

    // Add special instructions for Chinese characters
    if (sourceLanguage === 'zh' || sourceLanguage === 'zh-cn' || sourceLanguage === 'zh-tw') {
      basePrompt += `

SPECIAL INSTRUCTION FOR CHINESE CHARACTERS: This is a Chinese character name. Use the original Chinese pronunciation to create the Korean transliteration. Base the Korean conversion on how the Chinese name actually sounds in Chinese (Mandarin/Cantonese), not the Korean reading of the characters. For example:
- 李明 should be based on "Lǐ Míng" pronunciation, not Korean readings
- 王小美 should be based on "Wáng Xiǎo Měi" pronunciation`;
    }

    return basePrompt + `

Provide your response in JSON format with these exact fields:
{
  "korean_name": "Korean Hangul characters",
  "romanization": "Romanized pronunciation using Revised Romanization of Korean",
  "breakdown": [
    {
      "hangul": "Korean word part",
      "romanization": "romanized pronunciation", 
      "type": "family or given"
    }
  ]
}

Examples for word-by-word breakdown:
- "John Smith" → breakdown: [{"hangul": "존", "romanization": "jon", "type": "given"}, {"hangul": "스미스", "romanization": "seu-mi-seu", "type": "family"}]
- "María García" → breakdown: [{"hangul": "마리아", "romanization": "ma-ri-a", "type": "given"}, {"hangul": "가르시아", "romanization": "ga-reu-si-a", "type": "family"}]
- "François Dubois" → breakdown: [{"hangul": "프랑수아", "romanization": "peu-rang-su-a", "type": "given"}, {"hangul": "뒤부아", "romanization": "dwi-bu-a", "type": "family"}]

Important: Break down by WORDS (first name, last name, middle names), not individual syllables. Each entry in breakdown should represent a complete word from the original name.

IMPORTANT: For the romanization field, use word-based spacing that matches the breakdown structure. For example:
- 존 스미스 should be romanized as "jon seu-mi-seu" (given name + family name)
- 마리아 가르시아 should be romanized as "ma-ri-a ga-reu-si-a" (given name + family name)`;
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      // Get current AI settings for model and API key
      const aiSettings = await storage.getAiSettings();
      const model = aiSettings?.openaiModel || "gpt-4o";
      const apiKey = aiSettings?.openaiApiKey || process.env.OPENAI_API_KEY || "";
      
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system", 
            content: "You are a language detection expert. Identify the language of the given name."
          },
          {
            role: "user",
            content: `Detect the language of this name: "${text}". Respond with just the ISO 639-1 language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, etc.).`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      return response.choices[0].message.content?.trim().toLowerCase() || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }
}

export const aiTransliterationService = new AITransliterationService();