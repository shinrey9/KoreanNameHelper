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

    let basePrompt = `Convert the ${sourceLangName} name "${name}" to Korean Hangul with PRECISE ${sourceLangName} pronunciation.

⚠️ CRITICAL WARNING: The letter J sounds completely different in different languages:
- English J = "ㅈ" sound (jazz) → 조, 제, 지  
- German J = "ㅇ" sound (yes) → 요, 예, 이
- Spanish J = "ㅎ" sound (harsh H) → 호, 헤, 히

MANDATORY: Use the actual pronunciation rules of ${sourceLangName}, NOT generic transliteration.

Language-specific pronunciation rules:
${this.getLanguageSpecificRules(sourceLanguage)}

Instructions:
1. Apply ${sourceLangName} phonetic rules exactly - same letters sound different in different languages
2. Use proper Korean syllable structure (consonant-vowel-consonant pattern)
3. Follow Korean transliteration conventions for foreign names
4. For family names, use common Korean surname equivalents when appropriate
5. Ensure the Korean version reflects how a native ${sourceLangName} speaker would pronounce it

VERIFICATION: For "Johann" specifically:
- If English: MUST be 조한 (JO-hahn)
- If German: MUST be 요한 (YO-hahn)
- If Spanish: MUST be 호한 (HO-hahn)`;

    // Add special instructions for Chinese characters
    if (sourceLanguage === 'zh' || sourceLanguage === 'zh-cn' || sourceLanguage === 'zh-tw') {
      basePrompt += `

SPECIAL INSTRUCTION FOR CHINESE CHARACTERS: This is a Chinese character name. Use the original Chinese pronunciation to create the Korean transliteration. Base the Korean conversion on how the Chinese name actually sounds in Chinese (Mandarin/Cantonese), not the Korean reading of the characters. For example:
- 李明 should be based on "Lǐ Míng" pronunciation, not Korean readings
- 王小美 should be based on "Wáng Xiǎo Měi" pronunciation`;
    }

    return basePrompt + `

CRITICAL REQUIREMENT: Create breakdown by COMPLETE WORDS only, never by individual syllables.

WRONG WAY (DO NOT DO THIS):
"Keanu Charles Reeves" → [{"hangul":"키","type":"given"}, {"hangul":"아","type":"given"}, {"hangul":"누","type":"given"}, {"hangul":"찰","type":"given"}, {"hangul":"스","type":"given"}, {"hangul":"리","type":"family"}, {"hangul":"브","type":"family"}, {"hangul":"스","type":"family"}]

CORRECT WAY (DO THIS):
"Keanu Charles Reeves" → [{"hangul":"키아누","romanization":"ki-a-nu","type":"given"}, {"hangul":"찰스","romanization":"chal-seu","type":"middle"}, {"hangul":"리브스","romanization":"ri-beu-seu","type":"family"}]

For example:
- "Keanu Charles Reeves" should have EXACTLY 3 breakdown entries: "키아누" (given), "찰스" (middle), "리브스" (family) 
- "John Smith" should have EXACTLY 2 breakdown entries: "존" (given), "스미스" (family)
- "María José García" should have EXACTLY 3 breakdown entries: "마리아" (given), "호세" (middle), "가르시아" (family)

DO NOT break down "키아누" into "키", "아", "누" - keep complete words together.

Provide your response in JSON format with these exact fields:
{
  "korean_name": "Korean Hangul characters with spaces between words",
  "romanization": "Romanized pronunciation using Revised Romanization of Korean",
  "breakdown": [
    {
      "hangul": "Complete Korean word (multiple syllables)",
      "romanization": "romanized pronunciation for this complete word", 
      "type": "family or given or middle"
    }
  ]
}

Examples for WORD-BY-WORD breakdown (NOT syllable-by-syllable):
- "John Smith" → breakdown: [{"hangul": "존", "romanization": "jon", "type": "given"}, {"hangul": "스미스", "romanization": "seu-mi-seu", "type": "family"}]
- "Keanu Charles Reeves" → breakdown: [{"hangul": "키아누", "romanization": "ki-a-nu", "type": "given"}, {"hangul": "찰스", "romanization": "chal-seu", "type": "middle"}, {"hangul": "리브스", "romanization": "ri-beu-seu", "type": "family"}]
- "María José García" → breakdown: [{"hangul": "마리아", "romanization": "ma-ri-a", "type": "given"}, {"hangul": "호세", "romanization": "ho-se", "type": "middle"}, {"hangul": "가르시아", "romanization": "ga-reu-si-a", "type": "family"}]

REMEMBER: Each breakdown entry must be a COMPLETE WORD from the original name, not individual syllables.`;
  }

  private getLanguageSpecificRules(sourceLanguage: string): string {
    const rules: Record<string, string> = {
      'en': `ENGLISH pronunciation rules:
- J = ALWAYS 'ㅈ' sound (like "jazz") → 조, 제, 지
- W = 'ㅜ' sound (like "water") → 워, 웨, 위  
- R = soft 'ㄹ' sound → 르, 리, 러
- TH = 'ㅅ' or 'ㄷ' sound → 스, 드
- CRITICAL: Johann in English = 조한 (JO-hahn) NOT 요한
- Examples: Johann → 조한, William → 윌리엄, Robert → 로버트, John → 존`,

      'de': `GERMAN pronunciation rules:
- J = ALWAYS 'ㅇ' sound (like English Y) → 요, 예, 이
- W = 'ㅂ' sound (like V) → 브, 바, 비
- R = rolled 'ㄹ' sound → 르, 리, 러  
- CH = 'ㅎ' sound → 히, 하, 헤
- CRITICAL: Johann in German = 요한 (YO-hahn) NOT 조한
- Examples: Johann → 요한, Wolfgang → 볼프강, Heinrich → 하인리히`,

      'fr': `FRENCH pronunciation rules:
- J = soft 'ㅈ' sound → 즈, 지, 자
- R = uvular 'ㄹ' sound → 르, 리, 러
- Silent letters at end (final consonants often silent)
- Nasal sounds: an/en → 앙, on → 옹
- Examples: Jean → 장, Pierre → 피에르, François → 프랑수아`,

      'es': `SPANISH pronunciation rules:
- J = 'ㅎ' sound (like strong H) → 호, 헤, 히
- LL = 'ㅇ' sound → 요, 예, 이
- RR = strong rolled 'ㄹ' → 르, 리, 러
- ñ = 'ㄴ' sound → 니, 나, 네
- Examples: José → 호세, Guillermo → 기예르모, María → 마리아`,

      'it': `ITALIAN pronunciation rules:
- GI/GE = 'ㅈ' sound → 지, 제
- CI/CE = 'ㅊ' sound → 치, 체  
- GLI = 'ㅇ' sound → 리, 레
- R = rolled 'ㄹ' → 르, 리, 러
- Examples: Giuseppe → 주세페, Francesco → 프란체스코, Maria → 마리아`,

      'pt': `PORTUGUESE pronunciation rules:
- J = soft 'ㅈ' sound → 주, 지, 자
- LH = 'ㅇ' sound → 리, 레
- NH = 'ㄴ' sound → 니, 나
- R at start = strong 'ㅎ' sound → 히, 하, 헤
- Examples: João → 주앙, Carlos → 카를루스, Maria → 마리아`,

      'ru': `RUSSIAN pronunciation rules:
- Use Cyrillic pronunciation, not Latin transliteration
- Я = 'ㅇ' sound → 야
- Ю = 'ㅇ' sound → 유
- Е = 'ㅇ' sound → 예
- Soft/hard consonants distinction important
- Examples: Иван → 이반, Владимир → 블라디미르, Екатерина → 예카테리나`
    };

    return rules[sourceLanguage] || `Apply standard ${sourceLanguage} pronunciation rules accurately.`;
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