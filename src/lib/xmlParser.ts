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
  lawId?: string;
  lawName?: string;
  lawType?: string;
  promulgationDate?: string;
  content?: string;
  [key: string]: any;
}

export interface PrecedentData {
  caseTitle: string;
  caseNumber: string;
  judgmentDate: string;
  courtName: string;
  judgmentType: string;
  caseContent?: string;
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
      lawId: law['@_lawId'] || law.lawId || '',
      lawName: law['@_lawName'] || law.lawName || law['#text'] || '',
      lawType: law['@_lawType'] || law.lawType || '',
      promulgationDate: law['@_promulgationDate'] || law.promulgationDate || '',
      content: law.content || law['#text'] || '',
      ...law
    }));
  } catch (error) {
    console.error('XML 파싱 오류:', error);
    throw new Error('XML 데이터를 파싱하는 중 오류가 발생했습니다.');
  }
};

// 판례 JSON 파싱 (API가 JSON을 반환하는 경우)
export const parsePrecedentJSON = (jsonString: string): PrecedentData[] => {
  try {
    const data = JSON.parse(jsonString);
    
    // API 응답 구조에 따라 데이터 추출
    let precedentList: any[] = [];
    
    if (data.PrecedentSearch) {
      precedentList = Array.isArray(data.PrecedentSearch) 
        ? data.PrecedentSearch 
        : [data.PrecedentSearch];
    } else if (data.items) {
      precedentList = Array.isArray(data.items) 
        ? data.items 
        : [data.items];
    } else if (Array.isArray(data)) {
      precedentList = data;
    }
    
    return precedentList.map((item: any) => ({
      caseTitle: item.판례명 || item.caseName || item.title || '',
      caseNumber: item.사건번호 || item.caseNumber || item.number || '',
      judgmentDate: item.선고일자 || item.judgmentDate || item.date || '',
      courtName: item.법원명 || item.courtName || item.court || '',
      judgmentType: item.판결유형 || item.judgmentType || item.type || '판결',
      caseContent: item.판례내용 || item.content || item.summary || ''
    }));
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
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
    return parsePrecedentJSON(responseText);
  }
};