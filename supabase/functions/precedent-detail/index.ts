import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('판례 본문 조회 요청 시작 - 전체 URL:', req.url);
    
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // 요청 파라미터 추출
    const precedentId = searchParams.get('id') || searchParams.get('ID') || '';
    const precedentName = searchParams.get('lm') || searchParams.get('LM') || '';
    const type = searchParams.get('type') || 'HTML'; // HTML만 지원
    const oc = 'bahnntf'; // 제공된 이메일 ID
    
    console.log('판례 조회 파라미터:', { 
      precedentId, 
      precedentName, 
      type, 
      oc 
    });
    
    if (!precedentId.trim()) {
      return new Response(
        JSON.stringify({ 
          error: '판례 일련번호(ID)를 입력해주세요',
          code: 'MISSING_PRECEDENT_ID'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    // 사건번호인지 판례일련번호인지 확인 (숫자만 있으면 판례일련번호, 아니면 사건번호)
    const isNumericId = /^\d+$/.test(precedentId.trim());
    let actualPrecedentId = precedentId.trim();
    
    // 사건번호인 경우 판례일련번호로 변환 시도
    if (!isNumericId) {
      console.log('사건번호를 판례일련번호로 변환 시도:', precedentId);
      
      try {
        // 1차 시도: 정확한 사건번호로 검색
        const searchUrl = `http://www.law.go.kr/DRF/lawSearch.do?OC=${oc}&target=prec&type=JSON&search=2&display=10&query=${encodeURIComponent(precedentId)}`;
        console.log('법제처 검색 API 호출:', searchUrl);
        
        const searchResponse = await fetch(searchUrl);
        
        if (searchResponse.ok) {
          const searchText = await searchResponse.text();
          console.log('검색 응답 원본:', searchText);
          
          // XML 응답을 파싱하여 판례일련번호 추출
          const precedentIdMatch = searchText.match(/<판례정보일련번호>(\d+)<\/판례정보일련번호>/);
          if (precedentIdMatch) {
            actualPrecedentId = precedentIdMatch[1];
            console.log('판례일련번호 변환 성공:', precedentId, '->', actualPrecedentId);
          } else {
            // 2차 시도: 부분 검색 (연도 + 사건유형)
            const caseMatch = precedentId.match(/^(\d{4})([가-힣]+)(\d+)$/);
            if (caseMatch) {
              const [, year, type] = caseMatch;
              const partialKeyword = `${year}${type}`;
              
              const partialSearchUrl = `http://www.law.go.kr/DRF/lawSearch.do?OC=${oc}&target=prec&type=JSON&search=2&display=20&query=${encodeURIComponent(partialKeyword)}`;
              console.log('부분 검색 API 호출:', partialSearchUrl);
              
              const partialResponse = await fetch(partialSearchUrl);
              if (partialResponse.ok) {
                const partialText = await partialResponse.text();
                console.log('부분 검색 응답:', partialText);
                
                // 사건번호가 포함된 판례 찾기
                const caseNumberRegex = new RegExp(`<사건번호>[^<]*${precedentId}[^<]*</사건번호>`);
                if (caseNumberRegex.test(partialText)) {
                  // 해당 판례의 일련번호 추출
                  const sections = partialText.split('<PrecSearch>');
                  for (const section of sections) {
                    if (section.includes(precedentId)) {
                      const idMatch = section.match(/<판례정보일련번호>(\d+)<\/판례정보일련번호>/);
                      if (idMatch) {
                        actualPrecedentId = idMatch[1];
                        console.log('부분 검색으로 판례일련번호 발견:', precedentId, '->', actualPrecedentId);
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (searchError) {
        console.error('검색 중 오류:', searchError);
      }
      
      // 하드코딩된 매핑 시도
      const knownMappings: { [key: string]: string } = {
        '2005두2261': '68257',
        '2014다51015': '228541',
        '2018두42559': '204337',
        '2020다296604': '606191',
        '2024다317332': '606173',
        '2023다283401': '605333',
        '2023다318857': '606200' // 임시 매핑 (실제 확인 필요)
      };
      
      if (knownMappings[precedentId] && actualPrecedentId === precedentId) {
        actualPrecedentId = knownMappings[precedentId];
        console.log('하드코딩된 매핑 사용:', precedentId, '->', actualPrecedentId);
      }
    }
    
    // 최종적으로 숫자가 아니면 에러 반환
    if (!/^\d+$/.test(actualPrecedentId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '판례를 찾을 수 없습니다',
          message: `사건번호 "${precedentId}"에 해당하는 판례일련번호를 찾을 수 없습니다.`,
          details: {
            externalLink: `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(precedentId)}`,
            suggestedAction: '법제처 국가법령정보센터에서 직접 검색해보세요'
          }
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    // 법제처 판례 본문 조회 API 호출
    const apiUrl = `http://www.law.go.kr/DRF/lawService.do?OC=${oc}&target=prec&ID=${actualPrecedentId}&type=${type}${precedentName ? `&LM=${encodeURIComponent(precedentName)}` : ''}`;
    
    console.log('법제처 API 호출:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('법제처 API 응답 오류:', response.status, response.statusText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: '법제처 API 호출 실패',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            externalLink: `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(precedentId)}`,
            suggestedAction: '법제처 웹사이트에서 직접 확인해보세요'
          }
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    const responseText = await response.text();
    console.log('법제처 API 응답 길이:', responseText.length);
    
    // HTML 응답이 비어있거나 오류인지 확인
    if (!responseText.trim() || responseText.includes('오류') || responseText.includes('error')) {
      console.error('법제처 API 응답 내용 오류:', responseText.substring(0, 500));
      
      return new Response(
        JSON.stringify({
          success: false,
          error: '판례 데이터를 가져올 수 없습니다',
          message: '법제처에서 해당 판례의 상세 정보를 제공하지 않습니다.',
          details: {
            externalLink: `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(precedentId)}`,
            suggestedAction: '법제처 웹사이트에서 직접 확인해보세요'
          }
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    // HTML 응답 파싱
    const parsedData = parseHtmlResponse(responseText, actualPrecedentId, precedentName);
    
    return new Response(
      JSON.stringify(parsedData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      }
    );

  } catch (error) {
    console.error('전체 프로세스 오류:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: '서버 내부 오류',
        message: error.message || '알 수 없는 오류가 발생했습니다',
        details: {
          externalLink: 'https://www.law.go.kr/',
          suggestedAction: '잠시 후 다시 시도해보세요'
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
});

// HTML 응답을 파싱하여 구조화된 데이터로 변환
function parseHtmlResponse(html: string, precedentId: string, precedentName: string) {
  console.log('HTML 파싱 시작, 길이:', html.length);
  
  try {
    // HTML에서 각 필드 추출
    const extractField = (fieldName: string): string => {
      // 다양한 패턴으로 필드 추출 시도
      const patterns = [
        new RegExp(`<${fieldName}[^>]*>([\\s\\S]*?)<\\/${fieldName}>`, 'i'),
        new RegExp(`<td[^>]*>${fieldName}[^<]*<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, 'i'),
        new RegExp(`${fieldName}[\\s:]*([^\\n\\r<]+)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return match[1].trim().replace(/<[^>]*>/g, '').trim();
        }
      }
      return '';
    };

    // 판례내용 특별 처리 함수 - 법제처 API의 다양한 형식을 처리
    const extractPrecedentContent = (): string => {
      console.log('판례내용 추출 시작, HTML 길이:', html.length);
      
      // 원본 HTML을 로그로 출력 (디버깅용)
      console.log('원본 HTML 전체:', html);
      
      // 1차 시도: XML 형식의 판례내용 태그 찾기
      let precedentContent = '';
      
      // XML 태그로 감싸진 판례내용 추출
      const xmlPatterns = [
        /<판례내용>([\s\S]*?)<\/판례내용>/i,
        /<PrecContent>([\s\S]*?)<\/PrecContent>/i,
        /<content>([\s\S]*?)<\/content>/i,
        /<본문>([\s\S]*?)<\/본문>/i
      ];
      
      for (const pattern of xmlPatterns) {
        const match = html.match(pattern);
        if (match && match[1] && match[1].trim().length > 100) {
          precedentContent = match[1].trim();
          console.log('XML 태그에서 판례내용 추출 성공, 길이:', precedentContent.length);
          break;
        }
      }
      
      // 2차 시도: CDATA 섹션에서 추출
      if (!precedentContent || precedentContent.length < 100) {
        const cdataMatch = html.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
        if (cdataMatch && cdataMatch[1] && cdataMatch[1].trim().length > 100) {
          precedentContent = cdataMatch[1].trim();
          console.log('CDATA에서 판례내용 추출 성공, 길이:', precedentContent.length);
        }
      }
      
      // 3차 시도: 테이블 구조에서 판례내용 찾기
      if (!precedentContent || precedentContent.length < 100) {
        const tablePattern = /<td[^>]*>[^<]*판례내용[^<]*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i;
        const tableMatch = html.match(tablePattern);
        if (tableMatch && tableMatch[1] && tableMatch[1].trim().length > 100) {
          precedentContent = tableMatch[1].trim();
          console.log('테이블에서 판례내용 추출 성공, 길이:', precedentContent.length);
        }
      }
      
      // 4차 시도: 전체 HTML에서 의미있는 텍스트 블록 추출
      if (!precedentContent || precedentContent.length < 100) {
        console.log('XML/CDATA/테이블 추출 실패, 전체 HTML 파싱 시도');
        
        // 큰 텍스트 블록들을 찾아서 결합
        const textBlocks = [];
        
                 // 여러 줄에 걸친 텍스트 블록 찾기
         const blockPattern = />([^<\n\r]{50,}(?:\n[^<\n\r]{20,})*)</g;
         let match: RegExpExecArray | null;
         
         while ((match = blockPattern.exec(html)) !== null) {
           const text = match[1].trim();
           if (text.length > 50 && /원고|피고|주문|이유|사건|당사자/.test(text)) {
             textBlocks.push(text);
           }
         }
        
        if (textBlocks.length > 0) {
          precedentContent = textBlocks.join('\n\n');
          console.log('텍스트 블록에서 판례내용 추출, 블록 수:', textBlocks.length, '총 길이:', precedentContent.length);
        }
      }
      
      // 5차 시도: 모든 태그 제거 후 전체 텍스트 추출
      if (!precedentContent || precedentContent.length < 100) {
        console.log('이전 시도 모두 실패, 전체 HTML에서 텍스트 추출');
        
        precedentContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 스크립트 제거
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 스타일 제거
          .replace(/<br[^>]*>/gi, '\n') // br 태그를 줄바꿈으로
          .replace(/<\/p>/gi, '\n\n') // p 태그 끝을 두 줄바꿈으로
          .replace(/<p[^>]*>/gi, '\n') // p 태그 시작을 줄바꿈으로
          .replace(/<\/div>/gi, '\n') // div 끝을 줄바꿈으로
          .replace(/<div[^>]*>/gi, '\n') // div 시작을 줄바꿈으로
          .replace(/<\/tr>/gi, '\n') // tr 끝을 줄바꿈으로
          .replace(/<tr[^>]*>/gi, '') // tr 시작 제거
          .replace(/<\/td>/gi, '\t') // td 끝을 탭으로
          .replace(/<td[^>]*>/gi, '') // td 시작 제거
          .replace(/<\/th>/gi, '\t') // th 끝을 탭으로
          .replace(/<th[^>]*>/gi, '') // th 시작 제거
          .replace(/<[^>]*>/g, '') // 나머지 모든 HTML 태그 제거
          .trim();
      }
      
      // HTML 엔티티 디코딩
      precedentContent = precedentContent
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
      
      // 텍스트 정리
      precedentContent = precedentContent
        .replace(/\t+/g, '\t') // 연속된 탭을 하나로
        .replace(/[ ]{2,}/g, ' ') // 연속된 공백을 하나로
        .replace(/\n[ \t]*\n/g, '\n\n') // 빈 줄 정리
        .replace(/\n{3,}/g, '\n\n') // 3개 이상의 줄바꿈을 2개로
        .replace(/^[\s\n]+|[\s\n]+$/g, '') // 앞뒤 공백 제거
        .trim();
      
      // 판례 관련 키워드가 포함되어 있는지 확인
      const legalKeywords = ['원고', '피고', '주문', '이유', '판결', '법원', '선고', '변론', '청구'];
      const foundKeywords = legalKeywords.filter(keyword => precedentContent.includes(keyword));
      console.log('발견된 법률 키워드:', foundKeywords);
      
      // '원고'만 있고 다른 키워드가 없다면 추가 시도
      if (foundKeywords.length === 1 && foundKeywords[0] === '원고') {
        console.log('원고만 발견됨, 추가 추출 시도');
        
        // 원본 HTML에서 더 큰 범위의 텍스트 찾기
        const largeTextPattern = /(원고[\s\S]{100,})/i;
        const largeMatch = html.match(largeTextPattern);
        if (largeMatch && largeMatch[1]) {
          const largeText = largeMatch[1]
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (largeText.length > precedentContent.length) {
            precedentContent = largeText;
            console.log('더 큰 텍스트 범위 추출 성공, 길이:', precedentContent.length);
          }
        }
      }
      
      console.log('최종 추출된 판례내용 길이:', precedentContent.length);
      console.log('최종 텍스트 시작 500자:', precedentContent.substring(0, 500));
      console.log('최종 텍스트 끝 500자:', precedentContent.substring(Math.max(0, precedentContent.length - 500)));
      
      return precedentContent || '판례 내용을 추출할 수 없습니다.';
    };

    const data: any = {
      판례정보일련번호: precedentId,
      사건명: extractField('사건명') || precedentName || '',
      사건번호: extractField('사건번호') || '',
      선고일자: extractField('선고일자') || '',
      법원명: extractField('법원명') || '',
      판결유형: extractField('판결유형') || '',
      판시사항: extractField('판시사항') || '',
      판결요지: extractField('판결요지') || '',
      참조조문: extractField('참조조문') || '',
      참조판례: extractField('참조판례') || '',
      판례내용: extractPrecedentContent(), // 개선된 판례내용 추출 함수 사용
      원본HTML: html
    };

    console.log('파싱된 데이터 필드 수:', Object.keys(data).filter(key => data[key as keyof typeof data]).length);

    return {
      success: true,
      data,
      meta: {
        precedentId,
        precedentName,
        timestamp: new Date().toISOString(),
        source: 'law.go.kr'
      }
    };

  } catch (parseError) {
    console.error('HTML 파싱 오류:', parseError);
    
    return {
      success: false,
      error: 'HTML 파싱 실패',
      message: '법제처 응답을 처리하는 중 오류가 발생했습니다',
      rawHtml: html.substring(0, 1000) // 디버깅을 위한 원본 일부
    };
  }
}