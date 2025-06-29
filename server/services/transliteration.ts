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

// Phonetic mapping for various languages to Korean
const PHONETIC_MAP: Record<string, string> = {
  // Vowels
  'a': '아', 'e': '에', 'i': '이', 'o': '오', 'u': '우',
  'ai': '아이', 'au': '아우', 'ei': '에이', 'ou': '오우',
  'ay': '에이', 'ey': '에이', 'oy': '오이',
  
  // Consonants
  'b': '브', 'c': '크', 'd': '드', 'f': '프', 'g': '그',
  'h': '흐', 'j': '즈', 'k': '크', 'l': '를', 'm': '므',
  'n': '느', 'p': '프', 'q': '크', 'r': '르', 's': '스',
  't': '트', 'v': '브', 'w': '우', 'x': '크스', 'y': '이', 'z': '즈',
  
  // Common combinations
  'ch': '치', 'sh': '시', 'th': '스', 'ph': '프', 'gh': '그',
  'ck': '크', 'ng': '응', 'nk': '응크', 'mp': '음프', 'nd': '운드',
  'nt': '운트', 'st': '스트', 'sp': '스프', 'sc': '스크',
  
  // Language-specific patterns
  'ñ': '니', 'ç': '스', 'ß': '스', 'ö': '외', 'ü': '위', 'ä': '에',
  'é': '에', 'è': '에', 'ê': '에', 'ë': '에',
  'á': '아', 'à': '아', 'â': '아', 'ã': '아',
  'í': '이', 'ì': '이', 'î': '이', 'ï': '이',
  'ó': '오', 'ò': '오', 'ô': '오', 'õ': '오',
  'ú': '우', 'ù': '우', 'û': '우', 'ü': '위'
};

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
    let result = '';
    let i = 0;
    
    while (i < name.length) {
      let matched = false;
      
      // Try longer patterns first
      for (let len = 3; len >= 1; len--) {
        if (i + len <= name.length) {
          const substring = name.substring(i, i + len);
          if (PHONETIC_MAP[substring]) {
            result += PHONETIC_MAP[substring];
            i += len;
            matched = true;
            break;
          }
        }
      }
      
      if (!matched) {
        // If no mapping found, try single character
        const char = name[i];
        if (PHONETIC_MAP[char]) {
          result += PHONETIC_MAP[char];
        } else {
          // Default mapping for unmapped characters
          result += '으';
        }
        i++;
      }
    }
    
    return this.postProcessKorean(result);
  }
  
  private postProcessKorean(korean: string): string {
    // Remove excessive consonants and improve flow
    return korean
      .replace(/으$/, '') // Remove trailing 으
      .replace(/([ㄱ-ㅎ])으/g, '$1') // Remove 으 after consonants
      .replace(/(.)\1{2,}/g, '$1$1'); // Limit repeated characters
  }
  
  private generateRomanization(korean: string): string {
    // Simplified romanization mapping
    const romanMap: Record<string, string> = {
      '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma',
      '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha',
      '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
      '김': 'kim', '이': 'i', '박': 'park', '최': 'choi', '정': 'jung',
      '강': 'kang', '조': 'jo', '윤': 'yoon', '장': 'jang', '임': 'im',
      '존': 'jon', '슨': 'seun', '스': 'seu', '미': 'mi', '트': 'teu',
      '브': 'beu', '라': 'ra', '운': 'un', '드': 'deu', '프': 'peu',
      '그': 'geu', '르': 'reu', '느': 'neu', '크': 'keu', '즈': 'jeu',
      '치': 'chi', '시': 'si', '니': 'ni', '리': 'ri', '외': 'oe',
      '위': 'wi', '에': 'e', '오': 'o', '우': 'u', '응': 'eung'
    };
    
    let result = '';
    for (const char of korean) {
      if (romanMap[char]) {
        result += romanMap[char] + '-';
      }
    }
    
    return result.replace(/-$/, '').replace(/-+/g, '-');
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
