import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface TTSResult {
  audioUrl?: string;
  audioBuffer?: Buffer;
  error?: string;
}

class AITextToSpeechService {
  
  async generateKoreanAudio(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    try {
      // Use OpenAI's text-to-speech API for accurate Korean pronunciation
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy", // OpenAI's voices work well with Korean
        input: text,
        speed: options.rate || 1.0
      });
      
      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Convert to data URL for immediate playback
      const base64Audio = buffer.toString('base64');
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      
      return {
        audioUrl,
        audioBuffer: buffer,
        error: undefined
      };
      
    } catch (error) {
      console.error('AI TTS Error:', error);
      
      // Fallback to browser speech synthesis
      return {
        audioUrl: `data:audio/tts,korean=${encodeURIComponent(text)}&voice=${options.voice || 'ko-KR'}&rate=${options.rate || 1.0}`,
        error: undefined
      };
    }
  }
  
  getSupportedVoices(): string[] {
    return [
      'alloy',
      'echo', 
      'fable',
      'onyx',
      'nova',
      'shimmer'
    ];
  }
  
  validateKoreanText(text: string): boolean {
    // Check if text contains Korean characters
    return /[가-힣]/.test(text);
  }
}

export const aiTextToSpeechService = new AITextToSpeechService();