// 유의어 매핑
const SYNONYMS: Record<string, string[]> = {
  '납세의무자': ['납세자', '납세인'],
  '납세자': ['납세의무자', '납세인'],
  '납세인': ['납세의무자', '납세자'],
  '과세표준': ['표준액', '세표준', '과표'],
  '표준액': ['과세표준', '세표준', '과표'],
  '세표준': ['과세표준', '표준액', '과표'],
  '과표': ['과세표준', '표준액', '세표준'],
  '재산세': ['재세', '재산세액'],
  '재세': ['재산세', '재산세액'],
  '재산세액': ['재산세', '재세'],
  '부과징수': ['부과·징수', '징수부과'],
  '부과·징수': ['부과징수', '징수부과'],
  '징수부과': ['부과징수', '부과·징수'],
  '분할납부': ['분할납', '할부납부'],
  '분할납': ['분할납부', '할부납부'],
  '할부납부': ['분할납부', '분할납'],
  '납부유예': ['유예납부', '납부연기'],
  '유예납부': ['납부유예', '납부연기'],
  '납부연기': ['납부유예', '유예납부'],
  '비과세': ['면세', '세액면제'],
  '면세': ['비과세', '세액면제'],
  '세액면제': ['비과세', '면세'],
  '소액징수면제': ['소액면제', '징수면제'],
  '소액면제': ['소액징수면제', '징수면제'],
  '징수면제': ['소액징수면제', '소액면제'],
  '지역자원시설세': ['지자세', '시설세'],
  '지자세': ['지역자원시설세', '시설세'],
  '시설세': ['지역자원시설세', '지자세'],
  '세율특례': ['특례세율', '세율감면'],
  '특례세율': ['세율특례', '세율감면'],
  '세율감면': ['세율특례', '특례세율'],
  '상속': ['상속인', '피상속인'],
  '상속인': ['상속', '피상속인'],
  '피상속인': ['상속', '상속인'],
  '대습상속': ['대습', '차순위상속'],
  '대습': ['대습상속', '차순위상속'],
  '차순위상속': ['대습상속', '대습']
};

// 한글 초성 추출
const CHO_SUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export function extractChosung(text: string): string {
  return text
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      // 한글 완성형 범위 (가-힣)
      if (code >= 44032 && code <= 55203) {
        const chosungIndex = Math.floor((code - 44032) / 588);
        return CHO_SUNG[chosungIndex];
      }
      return '';
    })
    .join('');
}

// 초성 검색 매치
export function matchChosung(text: string, searchChosung: string): boolean {
  const textChosung = extractChosung(text);
  return textChosung.includes(searchChosung);
}

// 유의어 확장
export function expandSynonyms(searchTerm: string): string[] {
  const lowerTerm = searchTerm.toLowerCase();
  const synonyms = SYNONYMS[lowerTerm] || [];
  return [searchTerm, ...synonyms];
}

// 고급 검색 함수
export function advancedSearch(text: string, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;
  
  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // 1. 직접 텍스트 매치
  if (lowerText.includes(lowerSearchTerm)) {
    return true;
  }
  
  // 2. 유의어 검색
  const expandedTerms = expandSynonyms(lowerSearchTerm);
  for (const term of expandedTerms) {
    if (lowerText.includes(term.toLowerCase())) {
      return true;
    }
  }
  
  // 3. 초성 검색 (한글만 포함된 경우)
  const isKoreanOnly = /^[ㄱ-ㅎ]+$/.test(searchTerm);
  if (isKoreanOnly) {
    return matchChosung(text, searchTerm);
  }
  
  return false;
}

// 검색어 하이라이트용 - 매치된 부분 찾기
export function findMatchedParts(text: string, searchTerm: string): Array<{start: number, end: number, type: 'direct' | 'synonym' | 'chosung'}> {
  const matches: Array<{start: number, end: number, type: 'direct' | 'synonym' | 'chosung'}> = [];
  
  if (!searchTerm.trim()) return matches;
  
  const lowerText = text.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // 1. 직접 매치 찾기
  let index = lowerText.indexOf(lowerSearchTerm);
  while (index !== -1) {
    matches.push({
      start: index,
      end: index + lowerSearchTerm.length,
      type: 'direct'
    });
    index = lowerText.indexOf(lowerSearchTerm, index + 1);
  }
  
  // 2. 유의어 매치 찾기
  const expandedTerms = expandSynonyms(lowerSearchTerm);
  for (const term of expandedTerms) {
    if (term === searchTerm) continue; // 이미 처리됨
    
    let synonymIndex = lowerText.indexOf(term.toLowerCase());
    while (synonymIndex !== -1) {
      // 겹치지 않는 경우만 추가
      const overlapping = matches.some(match => 
        (synonymIndex >= match.start && synonymIndex < match.end) ||
        (synonymIndex + term.length > match.start && synonymIndex + term.length <= match.end)
      );
      
      if (!overlapping) {
        matches.push({
          start: synonymIndex,
          end: synonymIndex + term.length,
          type: 'synonym'
        });
      }
      synonymIndex = lowerText.indexOf(term.toLowerCase(), synonymIndex + 1);
    }
  }
  
  return matches.sort((a, b) => a.start - b.start);
}