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
    console.log('고급 판례 검색 요청 시작 - 전체 URL:', req.url);
    
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // 요청 파라미터 추출
    const keyword = searchParams.get('keyword') || searchParams.get('query') || '';
    const id = searchParams.get('id') || Deno.env.get('LAW_OC') || 'bahnntf';
    const display = searchParams.get('display') || '100'; // 기본 100개
    const type = searchParams.get('type') || 'html'; // html 또는 JSON
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

    // 법제처 API URL 구성 (사용자가 제공한 형식과 동일)
    const baseUrl = `http://www.law.go.kr/DRF/lawSearch.do?OC=${id}`;
    const apiParams = new URLSearchParams({
      target: 'prec', // 판례 검색
      type: type, // html 또는 JSON
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
        'Accept': type === 'html' ? 'text/html, application/xhtml+xml, */*' : 'application/json, application/xml, text/xml, */*',
        'Accept-Charset': 'utf-8',
      },
    });

    if (!response.ok) {
      console.error('법제처 API 오류:', response.status, response.statusText);
      throw new Error(`법제처 API 응답 오류: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('API 응답 수신, 길이:', responseText.length);
    console.log('응답 타입:', type);
    console.log('API 응답 내용 (처음 500자):', responseText.substring(0, 500));

    let processedData: any;
    let totalCount = 0;
    let extractedInfo: any = {};

    // 응답 타입에 따른 처리
    if (type === 'html') {
      // HTML 응답인 경우 그대로 반환하거나 간단한 파싱
      processedData = {
        htmlContent: responseText,
        contentType: 'html'
      };
      
      // HTML에서 totalCnt 정보 추출 시도 (정규식 사용)
      const totalCntMatch = responseText.match(/<totalCnt[^>]*>(\d+)<\/totalCnt>/);
      if (totalCntMatch) {
        totalCount = parseInt(totalCntMatch[1]);
      }
      
    } else {
      // JSON/XML 응답인 경우 파싱
      try {
        if (responseText.trim().startsWith('<')) {
          // XML 응답인 경우 - totalCnt 정보 추출
          console.log('XML 응답 감지 - totalCnt 추출 중...');
          
          const totalCntMatch = responseText.match(/<totalCnt[^>]*>(\d+)<\/totalCnt>/);
          if (totalCntMatch) {
            totalCount = parseInt(totalCntMatch[1]);
            console.log('추출된 totalCnt:', totalCount);
          }
          
          // 기타 유용한 정보 추출
          const resultMsgMatch = responseText.match(/<resultMsg[^>]*>([^<]+)<\/resultMsg>/);
          const keywordMatch = responseText.match(/<키워드[^>]*>([^<]+)<\/키워드>/);
          
          extractedInfo = {
            totalCount: totalCount,
            resultMsg: resultMsgMatch ? resultMsgMatch[1] : null,
            keyword: keywordMatch ? keywordMatch[1] : keyword,
            searchType: 'precedent'
          };
          
          processedData = {
            xmlContent: responseText,
            contentType: 'xml',
            extractedInfo: extractedInfo
          };
        } else {
          // JSON 응답인 경우
          console.log('JSON 응답 파싱 중...');
          const jsonData = JSON.parse(responseText);
          
          // JSON에서 totalCnt 추출 시도
          if (jsonData.PrecSearch?.totalCnt) {
            totalCount = parseInt(jsonData.PrecSearch.totalCnt);
          } else if (jsonData.totalCnt) {
            totalCount = parseInt(jsonData.totalCnt);
          }
          
          extractedInfo = {
            totalCount: totalCount,
            resultMsg: jsonData.PrecSearch?.resultMsg || jsonData.resultMsg,
            keyword: jsonData.PrecSearch?.키워드 || jsonData.키워드 || keyword,
            searchType: 'precedent'
          };
          
          processedData = {
            ...jsonData,
            contentType: 'json',
            extractedInfo: extractedInfo
          };
        }
      } catch (parseError) {
        console.error('응답 파싱 오류:', parseError);
        processedData = {
          rawContent: responseText,
          contentType: 'raw',
          parseError: parseError.message
        };
      }
    }

    // 성공 응답 반환
    console.log('고급 판례 검색 완료, 결과 반환');
    return new Response(
      JSON.stringify({
        success: true,
        data: processedData,
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