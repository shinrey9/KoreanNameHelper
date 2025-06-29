// Korean transliteration service for converting names from various languages to Hangul

interface CharacterBreakdown {
  hangul: string;
  romanization: string;
  type: 'family' | 'given' | 'syllable';
}

// Common Korean surname mappings
const KOREAN_SURNAMES: Record<string, string> = {
  // English surnames to Korean
  'johnson': '존슨',
  'smith': '스미스',
  'brown': '브라운',
  'jones': '존스',
  'garcia': '가르시아',
  'miller': '밀러',
  'davis': '데이비스',
  'rodriguez': '로드리게스',
  'martinez': '마르티네스',
  'hernandez': '에르난데스',
  'lopez': '로페스',
  'gonzalez': '곤살레스',
  'wilson': '윌슨',
  'anderson': '앤더슨',
  'thomas': '토마스',
  'taylor': '테일러',
  'moore': '무어',
  'jackson': '잭슨',
  'martin': '마틴',
  'lee': '리',
  'perez': '페레스',
  'thompson': '톰슨',
  'white': '화이트',
  'harris': '해리스',
  'sanchez': '산체스',
  'clark': '클라크',
  'ramirez': '라미레스',
  'lewis': '루이스',
  'robinson': '로빈슨',
  'walker': '워커',
  'young': '영',
  'allen': '앨런',
  'king': '킹',
  'wright': '라이트',
  'scott': '스콧',
  'torres': '토레스',
  'nguyen': '응우옌',
  'hill': '힐',
  'flores': '플로레스',
  'green': '그린',
  'adams': '아담스',
  'nelson': '넬슨',
  'baker': '베이커',
  'hall': '홀',
  'rivera': '리베라',
  'campbell': '캠벨',
  'mitchell': '미첼',
  'carter': '카터',
  'roberts': '로버츠'
};

// Korean syllable components
const INITIAL_CONSONANTS: Record<string, string> = {
  'b': 'ㅂ', 'p': 'ㅍ', 'd': 'ㄷ', 't': 'ㅌ', 'g': 'ㄱ', 'k': 'ㅋ',
  'j': 'ㅈ', 'ch': 'ㅊ', 's': 'ㅅ', 'sh': 'ㅅ', 'h': 'ㅎ',
  'm': 'ㅁ', 'n': 'ㄴ', 'ng': 'ㅇ', 'l': 'ㄹ', 'r': 'ㄹ',
  'f': 'ㅍ', 'v': 'ㅂ', 'w': 'ㅇ', 'y': 'ㅇ', 'z': 'ㅈ',
  'c': 'ㅋ', 'x': 'ㅋ', 'q': 'ㅋ', 'th': 'ㅅ'
};

const VOWELS: Record<string, string> = {
  'a': 'ㅏ', 'e': 'ㅔ', 'i': 'ㅣ', 'o': 'ㅗ', 'u': 'ㅜ',
  'ae': 'ㅐ', 'ai': 'ㅐ', 'ay': 'ㅔ', 'ea': 'ㅣ', 'ei': 'ㅔ',
  'ie': 'ㅣ', 'oa': 'ㅗ', 'oe': 'ㅗ', 'oo': 'ㅜ', 'ou': 'ㅜ',
  'oy': 'ㅗ', 'ue': 'ㅜ', 'ui': 'ㅜ', 'ya': 'ㅑ', 'ye': 'ㅖ',
  'yo': 'ㅛ', 'yu': 'ㅠ', 'au': 'ㅏ', 'aw': 'ㅏ',
  'eo': 'ㅓ', 'eu': 'ㅓ', 'ew': 'ㅜ', 'ey': 'ㅔ',
  // Language-specific vowels
  'ä': 'ㅏ', 'ö': 'ㅓ', 'ü': 'ㅜ', 'á': 'ㅏ', 'é': 'ㅔ',
  'í': 'ㅣ', 'ó': 'ㅗ', 'ú': 'ㅜ', 'à': 'ㅏ', 'è': 'ㅔ',
  'ì': 'ㅣ', 'ò': 'ㅗ', 'ù': 'ㅜ', 'â': 'ㅏ', 'ê': 'ㅔ',
  'î': 'ㅣ', 'ô': 'ㅗ', 'û': 'ㅜ', 'ã': 'ㅏ', 'õ': 'ㅗ',
  'ë': 'ㅔ', 'ï': 'ㅣ', 'ÿ': 'ㅣ', 'ç': 'ㅅ', 'ñ': 'ㄴ'
};

const FINAL_CONSONANTS: Record<string, string> = {
  'b': 'ㅂ', 'p': 'ㅂ', 'd': 'ㄷ', 't': 'ㅅ', 'g': 'ㄱ', 'k': 'ㄱ',
  's': 'ㅅ', 'z': 'ㅅ', 'x': 'ㄱ', 'f': 'ㅂ', 'v': 'ㅂ',
  'm': 'ㅁ', 'n': 'ㄴ', 'ng': 'ㅇ', 'l': 'ㄹ', 'r': 'ㄹ',
  'sh': 'ㅅ', 'ch': 'ㅅ', 'th': 'ㅅ'
};

// Improved phonetic patterns for better Korean conversion
const PHONETIC_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Common English name patterns
  { pattern: /^mc/i, replacement: '맥' },
  { pattern: /^mac/i, replacement: '맥' },
  { pattern: /^o'/i, replacement: '오' },
  { pattern: /son$/i, replacement: '슨' },
  { pattern: /sen$/i, replacement: '센' },
  { pattern: /ton$/i, replacement: '톤' },
  { pattern: /tion$/i, replacement: '션' },
  { pattern: /sion$/i, replacement: '션' },
  { pattern: /ck$/i, replacement: '크' },
  { pattern: /gh/i, replacement: 'ㄱ' },
  { pattern: /ph/i, replacement: 'ㅍ' },
  { pattern: /th/i, replacement: 'ㅅ' },
  { pattern: /sh/i, replacement: 'ㅅ' },
  { pattern: /ch/i, replacement: 'ㅊ' },
  { pattern: /ng/i, replacement: 'ㅇ' },
  { pattern: /nk/i, replacement: 'ㅇㄱ' },
  { pattern: /mp/i, replacement: 'ㅁㅂ' },
  { pattern: /nd/i, replacement: 'ㄴㄷ' },
  { pattern: /nt/i, replacement: 'ㄴㅌ' },
  { pattern: /ll/i, replacement: 'ㄹ' },
  { pattern: /rr/i, replacement: 'ㄹ' },
  { pattern: /ss/i, replacement: 'ㅅ' },
  { pattern: /tt/i, replacement: 'ㅌ' },
  { pattern: /ff/i, replacement: 'ㅍ' },
  { pattern: /pp/i, replacement: 'ㅂ' },
  { pattern: /bb/i, replacement: 'ㅂ' },
  { pattern: /dd/i, replacement: 'ㄷ' },
  { pattern: /gg/i, replacement: 'ㄱ' },
  { pattern: /kk/i, replacement: 'ㄱ' }
];

class TransliterationService {
  
  convertToKorean(name: string, sourceLanguage: string): {
    koreanName: string;
    romanization: string;
    breakdown: CharacterBreakdown[];
  } {
    const normalizedName = this.normalizeName(name);
    const parts = normalizedName.split(' ');
    
    let koreanParts: string[] = [];
    let romanizationParts: string[] = [];
    let breakdown: CharacterBreakdown[] = [];
    
    parts.forEach((part, index) => {
      const isFirstPart = index === 0;
      const korean = this.convertSingleName(part, sourceLanguage, isFirstPart);
      const romanization = this.generateRomanization(korean);
      
      koreanParts.push(korean);
      romanizationParts.push(romanization);
      
      // Add to breakdown
      breakdown.push({
        hangul: korean,
        romanization: romanization,
        type: isFirstPart ? 'family' : 'given'
      });
    });
    
    return {
      koreanName: koreanParts.join(''),
      romanization: romanizationParts.join(' '),
      breakdown
    };
  }
  
  private normalizeName(name: string): string {
    return name.trim()
      .toLowerCase()
      .replace(/[^\w\sáàâãäéèêëíìîïóòôõöúùûüñç]/g, '')
      .replace(/\s+/g, ' ');
  }
  
  private convertSingleName(name: string, sourceLanguage: string, isFamily: boolean): string {
    // Check if it's a common surname
    if (isFamily && KOREAN_SURNAMES[name]) {
      return KOREAN_SURNAMES[name];
    }
    
    // For family names, add 김 as default Korean surname if not found
    if (isFamily) {
      return '김';
    }
    
    // Convert phonetically
    return this.phoneticConversion(name, sourceLanguage);
  }
  
  private phoneticConversion(name: string, sourceLanguage: string): string {
    // Apply phonetic patterns first
    let processedName = name.toLowerCase();
    for (const { pattern, replacement } of PHONETIC_PATTERNS) {
      processedName = processedName.replace(pattern, replacement);
    }
    
    // If any Korean characters were added by patterns, combine with syllable conversion
    const koreanParts = processedName.match(/[가-힣]+/g) || [];
    const nonKoreanParts = processedName.replace(/[가-힣]+/g, '|').split('|');
    
    let result = '';
    let partIndex = 0;
    
    for (let i = 0; i < nonKoreanParts.length; i++) {
      if (nonKoreanParts[i]) {
        result += this.convertToKoreanSyllables(nonKoreanParts[i]);
      }
      if (koreanParts[partIndex]) {
        result += koreanParts[partIndex];
        partIndex++;
      }
    }
    
    return this.postProcessKorean(result);
  }
  
  private convertToKoreanSyllables(text: string): string {
    const syllables: string[] = [];
    let i = 0;
    
    while (i < text.length) {
      const syllable = this.buildKoreanSyllable(text, i);
      if (syllable.korean) {
        syllables.push(syllable.korean);
        i += syllable.consumed;
      } else {
        i++;
      }
    }
    
    return syllables.join('');
  }
  
  private buildKoreanSyllable(text: string, startIndex: number): { korean: string; consumed: number } {
    let i = startIndex;
    let initial = '';
    let vowel = '';
    let final = '';
    let consumed = 0;
    
    // Find initial consonant (optional in Korean)
    let consonantMatch = this.findLongestMatch(text, i, INITIAL_CONSONANTS);
    if (consonantMatch.match) {
      initial = consonantMatch.match;
      i += consonantMatch.length;
      consumed += consonantMatch.length;
    }
    
    // Find vowel (required)
    let vowelMatch = this.findLongestMatch(text, i, VOWELS);
    if (vowelMatch.match) {
      vowel = vowelMatch.match;
      i += vowelMatch.length;
      consumed += vowelMatch.length;
    } else if (!initial) {
      // No vowel found and no initial consonant, try to use as vowel
      const char = text[i];
      if (VOWELS[char]) {
        vowel = VOWELS[char];
        consumed = 1;
      } else {
        // Default to 'ㅓ' for unrecognized characters
        vowel = 'ㅓ';
        consumed = 1;
      }
    } else {
      // Have initial consonant but no vowel, add default vowel
      vowel = 'ㅓ';
    }
    
    // Find final consonant (optional)
    if (i < text.length) {
      let finalMatch = this.findLongestMatch(text, i, FINAL_CONSONANTS);
      if (finalMatch.match) {
        // Only add final consonant if it's not the start of next syllable
        const nextChar = text[i + finalMatch.length];
        if (!nextChar || !VOWELS[nextChar]) {
          final = finalMatch.match;
          consumed += finalMatch.length;
        }
      }
    }
    
    // Construct Korean syllable
    if (!vowel) {
      return { korean: '', consumed: 0 };
    }
    
    const korean = this.combineHangulComponents(
      initial || 'ㅇ', // Use ㅇ if no initial consonant
      vowel,
      final
    );
    
    return { korean, consumed: Math.max(consumed, 1) };
  }
  
  private findLongestMatch(text: string, startIndex: number, mapping: Record<string, string>): { match: string; length: number } {
    let bestMatch = '';
    let bestLength = 0;
    
    // Try matches from longest to shortest
    for (let len = 4; len >= 1; len--) {
      if (startIndex + len <= text.length) {
        const substring = text.substring(startIndex, startIndex + len);
        if (mapping[substring]) {
          bestMatch = mapping[substring];
          bestLength = len;
          break;
        }
      }
    }
    
    return { match: bestMatch, length: bestLength };
  }
  
  private combineHangulComponents(initial: string, vowel: string, final: string = ''): string {
    // Korean syllable construction using Unicode composition
    const initialCode = this.getInitialConsonantCode(initial);
    const vowelCode = this.getVowelCode(vowel);
    const finalCode = final ? this.getFinalConsonantCode(final) : 0;
    
    // Unicode formula for Korean syllables: 0xAC00 + (initial × 588) + (vowel × 28) + final
    const syllableCode = 0xAC00 + (initialCode * 588) + (vowelCode * 28) + finalCode;
    
    return String.fromCharCode(syllableCode);
  }
  
  private getInitialConsonantCode(consonant: string): number {
    const codes: Record<string, number> = {
      'ㅇ': 11, 'ㄱ': 0, 'ㄴ': 2, 'ㄷ': 3, 'ㄹ': 5, 'ㅁ': 6, 'ㅂ': 7, 'ㅅ': 9,
      'ㅈ': 12, 'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18
    };
    return codes[consonant] || 11; // Default to ㅇ
  }
  
  private getVowelCode(vowel: string): number {
    const codes: Record<string, number> = {
      'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6, 'ㅖ': 7,
      'ㅗ': 8, 'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13, 'ㅝ': 14, 'ㅞ': 15,
      'ㅟ': 16, 'ㅠ': 17, 'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20
    };
    return codes[vowel] || 4; // Default to ㅓ
  }
  
  private getFinalConsonantCode(consonant: string): number {
    const codes: Record<string, number> = {
      'ㄱ': 1, 'ㄴ': 4, 'ㄷ': 7, 'ㄹ': 8, 'ㅁ': 16, 'ㅂ': 17, 'ㅅ': 19, 'ㅇ': 21
    };
    return codes[consonant] || 0; // No final consonant
  }
  
  private postProcessKorean(korean: string): string {
    // Remove excessive consonants and improve flow
    return korean
      .replace(/으$/, '') // Remove trailing 으
      .replace(/([ㄱ-ㅎ])으/g, '$1') // Remove 으 after consonants
      .replace(/(.)\1{2,}/g, '$1$1'); // Limit repeated characters
  }
  
  private generateRomanization(korean: string): string {
    // Use Revised Romanization of Korean system
    const romanizationMap: Record<string, string> = {
      // Initial consonants
      'ㄱ': 'g', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅅ': 's',
      'ㅇ': '', 'ㅈ': 'j', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
      // Vowels
      'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye',
      'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we',
      'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
    };

    let result = '';
    
    for (const char of korean) {
      if (char >= '가' && char <= '힣') {
        // Decompose Korean syllable
        const code = char.charCodeAt(0) - 0xAC00;
        const initial = Math.floor(code / 588);
        const vowel = Math.floor((code % 588) / 28);
        const final = code % 28;
        
        // Get components
        const initialChars = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const vowelChars = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        const finalChars = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        
        // Build romanization
        const initialRoman = romanizationMap[initialChars[initial]] || '';
        const vowelRoman = romanizationMap[vowelChars[vowel]] || '';
        const finalRoman = final > 0 ? romanizationMap[finalChars[final]] || '' : '';
        
        // Handle final consonant pronunciation rules
        let finalPronunciation = finalRoman;
        if (final === 1 || final === 2 || final === 8) finalPronunciation = 'k'; // ㄱ, ㄲ, ㄺ
        else if (final === 4 || final === 5 || final === 6) finalPronunciation = 'n'; // ㄴ, ㄵ, ㄶ
        else if (final === 7) finalPronunciation = 't'; // ㄷ
        else if (final === 17 || final === 18) finalPronunciation = 'p'; // ㅂ, ㅄ
        else if (final === 19 || final === 20) finalPronunciation = 't'; // ㅅ, ㅆ
        else if (final === 22 || final === 23 || final === 24 || final === 25 || final === 26 || final === 27) finalPronunciation = 't'; // ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ
        
        result += initialRoman + vowelRoman + finalPronunciation;
      } else {
        result += char;
      }
    }
    
    return result.toLowerCase();
  }
  
  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    if (/[가-힣]/.test(text)) return 'ko';
    if (/[а-я]/.test(text)) return 'ru';
    if (/[α-ω]/.test(text)) return 'el';
    if (/[あ-ん]/.test(text)) return 'ja';
    if (/[一-龯]/.test(text)) return 'zh';
    if (/[ñáéíóúü]/.test(text)) return 'es';
    if (/[çàèùâêîôûë]/.test(text)) return 'fr';
    if (/[äöüß]/.test(text)) return 'de';
    if (/[àèìòùâêîôû]/.test(text)) return 'it';
    if (/[ãõçáéíóú]/.test(text)) return 'pt';
    
    return 'en'; // Default to English
  }
}

export const transliterationService = new TransliterationService();
