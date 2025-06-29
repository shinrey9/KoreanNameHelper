// Client-side language and transliteration utilities

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
];

export function getLanguageByCode(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function validateNameInput(name: string): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long (max 100 characters)' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes, and common diacritics
  const validNamePattern = /^[a-zA-ZÀ-ÿĀ-žА-я가-힣一-龯ひらがなカタカナ\s'-]+$/;
  if (!validNamePattern.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  return { isValid: true };
}

export function formatKoreanBreakdown(breakdown: any[]): string {
  return breakdown.map(item => 
    `${item.hangul} (${item.romanization})`
  ).join(' • ');
}
