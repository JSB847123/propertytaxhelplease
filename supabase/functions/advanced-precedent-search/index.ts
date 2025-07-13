import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.2";

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
    console.log('고급 판례 검색 요청 시작 - 전체 URL:', req.url);
    
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // 요청 파라미터 추출
    const keyword = searchParams.get('keyword') || searchParams.get('query') || '';
    const id = searchParams.get('id') || Deno.env.get('LAW_OC') || 'bahnntf';
    const display = searchParams.get('display') || '100'; // 기본 100개
    const type = searchParams.get('type') || 'JSON'; // JSON으로 변경
    const search = searchParams.get('search') || '2'; // 기본값: 판시요지와 판시내용
    const prncYdStart = searchParams.get('prncYdStart') || '20000101'; // 시작 선고일자
    const prncYdEnd = searchParams.get('prncYdEnd') || '20231231'; // 종료 선고일자
    const page = searchParams.get('page') || '1';
    
    console.log('검색 파라미터:', { 
      keyword, 
      id, 
      display, 
      type, 
      search, 
      prncYdStart, 
      prncYdEnd, 
      page 
    });
    
    if (!keyword.trim()) {
      return new Response(
        JSON.stringify({ 
          error: '검색 키워드를 입력해주세요',
          code: 'MISSING_KEYWORD'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    // 법제처 API URL 구성 (JSON 형태로 호출)
    const baseUrl = `http://www.law.go.kr/DRF/lawSearch.do?OC=${id}`;
    const apiParams = new URLSearchParams({
      target: 'prec', // 판례 검색
      type: 'JSON', // JSON 형태로 변경
      query: keyword.trim(),
      display: display,
      search: search, // 2: 판시요지와 판시내용
      page: page,
      prncYd: `${prncYdStart}~${prncYdEnd}` // 선고일자 범위
    });

    const fullUrl = `${baseUrl}&${apiParams.toString()}`;
    console.log('API 호출 URL:', fullUrl);

    // 법제처 API 호출
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LawSearchBot/1.0)',
        'Accept': 'application/json, application/xml, text/xml, */*',
        'Accept-Charset': 'utf-8',
      },
    });

    if (!response.ok) {
      console.error('법제처 API 오류:', response.status, response.statusText);
      throw new Error(`법제처 API 응답 오류: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('API 응답 수신, 길이:', responseText.length);
    console.log('API 응답 내용 (처음 500자):', responseText.substring(0, 500));

    let processedData: any;
    let totalCount = 0;
    let extractedInfo: any = {};
    let precedentList: any[] = [];

    // 응답 데이터 파싱
    try {
      if (responseText.trim().startsWith('<')) {
        // XML 응답인 경우 JSON으로 변환
        console.log('XML 응답을 JSON으로 변환 중...');
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          textNodeName: '#text',
          parseAttributeValue: true,
          parseTagValue: true,
          trimValues: true
        });
        
        const xmlData = parser.parse(responseText);
        console.log('XML 파싱 결과:', JSON.stringify(xmlData, null, 2));
        
        // XML에서 판례 정보 추출
        if (xmlData.PrecSearch) {
          const precSearch = xmlData.PrecSearch;
          totalCount = parseInt(precSearch.totalCnt || '0');
          
          if (precSearch.prec) {
            const precList = Array.isArray(precSearch.prec) ? precSearch.prec : [precSearch.prec];
            precedentList = precList.map((prec: any) => ({
              판례정보일련번호: prec.판례일련번호 || prec.판례정보일련번호 || prec.precSeq || '',
              사건명: prec.사건명 || prec.caseNm || '',
              사건번호: prec.사건번호 || prec.caseNo || '',
              선고일자: prec.선고일자 || prec.judmnAdjuDt || '',
              법원명: prec.법원명 || prec.courtNm || '',
              판결유형: prec.판결유형 || prec.judmnAdjuDeclCd || '',
              판시사항: prec.판시사항 || prec.judmnItmCn || '',
              판결요지: prec.판결요지 || prec.judmnSumryCn || '',
              참조조문: prec.참조조문 || prec.refrnc || '',
              참조판례: prec.참조판례 || prec.refrncPrec || '',
              원본데이터: prec
            }));
          }
          
          extractedInfo = {
            totalCount: totalCount,
            resultMsg: precSearch.resultMsg || 'SUCCESS',
            keyword: precSearch.키워드 || keyword,
            searchType: 'precedent'
          };
        }
        
        processedData = {
          xmlContent: responseText,
          contentType: 'xml',
          extractedInfo: extractedInfo,
          precedentList: precedentList
        };
      } else {
        // JSON 응답인 경우
        console.log('JSON 응답 파싱 중...');
        const jsonData = JSON.parse(responseText);
        console.log('JSON 파싱 결과:', JSON.stringify(jsonData, null, 2));
        
        // JSON에서 판례 정보 추출
        if (jsonData.PrecSearch) {
          const precSearch = jsonData.PrecSearch;
          totalCount = parseInt(precSearch.totalCnt || '0');
          
          if (precSearch.prec) {
            const precList = Array.isArray(precSearch.prec) ? precSearch.prec : [precSearch.prec];
            precedentList = precList.map((prec: any) => ({
              판례정보일련번호: prec.판례일련번호 || prec.판례정보일련번호 || prec.precSeq || '',
              사건명: prec.사건명 || prec.caseNm || '',
              사건번호: prec.사건번호 || prec.caseNo || '',
              선고일자: prec.선고일자 || prec.judmnAdjuDt || '',
              법원명: prec.법원명 || prec.courtNm || '',
              판결유형: prec.판결유형 || prec.judmnAdjuDeclCd || '',
              판시사항: prec.판시사항 || prec.judmnItmCn || '',
              판결요지: prec.판결요지 || prec.judmnSumryCn || '',
              참조조문: prec.참조조문 || prec.refrnc || '',
              참조판례: prec.참조판례 || prec.refrncPrec || '',
              원본데이터: prec
            }));
          }
          
          extractedInfo = {
            totalCount: totalCount,
            resultMsg: precSearch.resultMsg || 'SUCCESS',
            keyword: precSearch.키워드 || keyword,
            searchType: 'precedent'
          };
        }
        
        processedData = {
          ...jsonData,
          contentType: 'json',
          extractedInfo: extractedInfo,
          precedentList: precedentList
        };
      }
    } catch (parseError) {
      console.error('응답 파싱 오류:', parseError);
      processedData = {
        rawContent: responseText,
        contentType: 'raw',
        parseError: parseError.message,
        precedentList: []
      };
    }

    // 성공 응답 반환
    console.log('고급 판례 검색 완료, 결과 반환');
    console.log('추출된 판례 개수:', precedentList.length);
    console.log('precedentList 샘플:', precedentList.slice(0, 2));
    
    return new Response(
      JSON.stringify({
        success: true,
        data: processedData,
        precedentList: precedentList,
        meta: {
          keyword: keyword,
          id: id,
          target: 'prec',
          type: type,
          search: search,
          display: parseInt(display),
          page: parseInt(page),
          prncYdRange: `${prncYdStart}~${prncYdEnd}`,
          totalCount: totalCount,
          extractedInfo: extractedInfo,
          timestamp: new Date().toISOString(),
          searchDescription: search === '2' ? '판시요지와 판시내용' : 
                           search === '1' ? '제목' : '전체'
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );

  } catch (error) {
    console.error('고급 판례 검색 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        error: '고급 판례 검색 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
});