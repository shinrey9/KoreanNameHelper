import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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
      "hangul": "Korean syllable",
      "romanization": "romanized pronunciation", 
      "type": "family or given or syllable"
    }
  ]
}

Examples for context:
- "John" → "존" (jon)
- "Smith" → "스미스" (seu-mi-seu) 
- "María" → "마리아" (ma-ri-a)
- "François" → "프랑수아" (peu-rang-su-a)

Make sure each syllable in the breakdown corresponds to meaningful parts of the original name.

IMPORTANT: For the romanization field, separate each Korean syllable with spaces or hyphens for clear pronunciation. For example:
- 존스미스 should be romanized as "jon-seu-mi-seu" or "jon seu mi seu"
- 마리아 should be romanized as "ma-ri-a" or "ma ri a"`;
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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