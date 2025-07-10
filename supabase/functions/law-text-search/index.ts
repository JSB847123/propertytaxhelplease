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
    console.log('법령 원문 검색 요청 시작 - 전체 URL:', req.url);
    
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // 요청 파라미터 추출
    const searchValue = searchParams.get('searchValue') || '';
    const searchType = searchParams.get('searchType') || 'ID'; // ID 또는 LM
    
    console.log('검색 파라미터:', { searchValue, searchType });
    
    if (!searchValue.trim()) {
      return new Response(
        JSON.stringify({ 
          error: '검색어를 입력해주세요',
          code: 'MISSING_SEARCH_VALUE'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        }
      );
    }

    // 법제처 원문 검색 API 사용
    const apiUrl = 'http://www.law.go.kr/DRF/lawService.do';
    const apiParams = new URLSearchParams({
      OC: 'bahnntf',
      target: 'expc',
      type: 'HTML',
      mobileYn: 'Y'
    });

    // 검색 타입에 따라 ID 또는 LM 파라미터 추가
    if (searchType === 'ID') {
      apiParams.append('ID', searchValue);
    } else {
      apiParams.append('LM', searchValue);
    }

    console.log('API 호출 URL:', `${apiUrl}?${apiParams.toString()}`);

    // 법제처 API 호출
    const response = await fetch(`${apiUrl}?${apiParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PropertyTaxHelper/1.0)',
        'Accept': 'text/html, application/xml, text/xml, */*',
        'Accept-Charset': 'utf-8',
      },
    });

    if (!response.ok) {
      console.error('법제처 API 오류:', response.status, response.statusText);
      throw new Error(`법제처 API 응답 오류: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('API 응답 수신, 길이:', responseText.length);

    // 성공 응답 반환
    console.log('법령 원문 검색 완료, 결과 반환');
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          html: responseText,
          searchValue: searchValue,
          searchType: searchType
        },
        meta: {
          searchValue: searchValue,
          searchType: searchType,
          timestamp: new Date().toISOString()
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
    console.error('법령 원문 검색 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        error: '법령 원문 검색 중 오류가 발생했습니다',
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