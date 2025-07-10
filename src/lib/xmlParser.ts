import { XMLParser } from 'fast-xml-parser';

// XML 파싱 옵션 설정
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: false,
  arrayMode: false,
  alwaysCreateTextNode: false,
  isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
    // 배열로 처리할 요소들 지정
    if (name === 'PrecedentSearch' || name === 'law') return true;
    return false;
  }
};

const parser = new XMLParser(parserOptions);

export interface LawData {
  lsId?: string;
  lsNm?: string;
  lsTypeCd?: string;
  promulgationDt?: string;
  enfcDt?: string;
  admstNm?: string;
  lsRsnCn?: string;
  [key: string]: any;
}

export interface PrecedentData {
  caseNm?: string;
  caseNo?: string;
  judmnAdjuDt?: string;
  courtName?: string;
  judmnAdjuDeclCd?: string;
  abstrct?: string;
  refrnc?: string;
  judmnAdjuGbnCd?: string;
  [key: string]: any;
}

// 법령 XML 파싱
export const parseLawXML = (xmlString: string): LawData[] => {
  try {
    const result = parser.parse(xmlString);
    
    // XML 구조에 따라 데이터 추출
    let lawList: any[] = [];
    
    if (result.LawService?.law) {
      lawList = Array.isArray(result.LawService.law) 
        ? result.LawService.law 
        : [result.LawService.law];
    }
    
    return lawList.map((law: any) => ({
      lsId: law.lsId || law['@_lsId'] || '',
      lsNm: law.lsNm || law['@_lsNm'] || law['#text'] || '',
      lsTypeCd: law.lsTypeCd || law['@_lsTypeCd'] || '',
      promulgationDt: law.promulgationDt || law['@_promulgationDt'] || '',
      enfcDt: law.enfcDt || law['@_enfcDt'] || '',
      admstNm: law.admstNm || law['@_admstNm'] || '',
      lsRsnCn: law.lsRsnCn || law.content || law['#text'] || '',
      ...law
    }));
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    throw new Error('XML 데이터를 파싱하는 중 오류가 발생했습니다.');
  }
};

// 법제처 API JSON 응답 파싱 (법령 및 판례 통합)
export const parseLawSearchJSON = (jsonString: string): (LawData | PrecedentData)[] => {
  try {
    // Edge Function에서 wrapping된 응답 파싱
    const response = JSON.parse(jsonString);
    
    // Edge Function 응답 구조: { success: true, data: {...}, meta: {...} }
    let data = response;
    if (response.success && response.data) {
      data = response.data;
    }
    
    console.log('파싱할 데이터:', data);
    
    // 법령 검색 응답 구조: { LawSearch: { law: [...], totalCnt: "0", ... } }
    if (data.LawSearch) {
      const lawSearch = data.LawSearch;
      
      // totalCnt가 "0"이면 빈 배열 반환
      if (lawSearch.totalCnt === "0" || parseInt(lawSearch.totalCnt) === 0) {
        console.log('검색 결과 없음 - totalCnt:', lawSearch.totalCnt);
        return [];
      }
      
      // law 배열이 있으면 파싱
      if (lawSearch.law) {
        const lawList = Array.isArray(lawSearch.law) ? lawSearch.law : [lawSearch.law];
        
        return lawList.map((law: any) => ({
          lsId: law.법령ID || law.lsId || '',
          lsNm: law.법령명한글 || law.법령명 || law.lsNm || '',
          lsTypeCd: law.법령구분명 || law.lsTypeCd || '',
          promulgationDt: law.공포일자 || law.promulgationDt || '',
          enfcDt: law.시행일자 || law.enfcDt || '',
          admstNm: law.소관부처명 || law.admstNm || '',
          lsRsnCn: law.법령약칭명 || law.lsRsnCn || '',
          ...law
        }));
      }
    }
    
    // 판례 검색 응답 구조 처리
    if (data.PrecedentSearch) {
      const precedentSearch = data.PrecedentSearch;
      
      if (precedentSearch.totalCnt === "0" || parseInt(precedentSearch.totalCnt) === 0) {
        return [];
      }
      
      if (precedentSearch.precedent) {
        const precedentList = Array.isArray(precedentSearch.precedent) 
          ? precedentSearch.precedent 
          : [precedentSearch.precedent];
        
        return precedentList.map((item: any) => ({
          caseNm: item.사건명 || item.caseNm || '',
          caseNo: item.사건번호 || item.caseNo || '',
          judmnAdjuDt: item.선고일자 || item.judmnAdjuDt || '',
          courtName: item.법원명 || item.courtName || '',
          judmnAdjuDeclCd: item.판결유형 || item.judmnAdjuDeclCd || '판결',
          abstrct: item.판시사항 || item.abstrct || '',
          refrnc: item.참조조문 || item.refrnc || '',
          judmnAdjuGbnCd: item.심급구분 || item.judmnAdjuGbnCd || '',
          ...item
        }));
      }
    }
    
    console.log('인식되지 않는 응답 구조:', data);
    return [];
    
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    console.log('파싱 실패한 원본 데이터:', jsonString);
    throw new Error('JSON 데이터를 파싱하는 중 오류가 발생했습니다.');
  }
};

// 통합 파싱 함수
export const parseAPIResponse = (
  responseText: string, 
  contentType: 'xml' | 'json'
): LawData[] | PrecedentData[] => {
  if (contentType === 'xml') {
    return parseLawXML(responseText);
  } else {
    return parseLawSearchJSON(responseText);
  }
};