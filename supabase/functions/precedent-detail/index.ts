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
    const type = searchParams.get('type') || 'JSON'; // HTML, XML, JSON
    const oc = searchParams.get('oc') || 'bahnntf'; // 사용자 ID
    
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

    // 현재 법제처 API가 작동하지 않으므로 임시 응답을 반환
    console.log('법제처 API 호출 시도 중...');
    
    // 법제처 판례 본문 조회 API URL 구성
    const apiUrl = 'https://www.law.go.kr/DRF/lawService.do';
    const apiParams = new URLSearchParams({
      OC: oc,
      target: 'prec', // 판례 조회
      type: type,
      ID: precedentId.trim()
    });

    // 판례명이 있으면 추가
    if (precedentName.trim()) {
      apiParams.append('LM', precedentName.trim());
    }

    const fullUrl = `${apiUrl}?${apiParams.toString()}`;
    console.log('API 호출 URL:', fullUrl);

    let response;
    try {
      // 법제처 OPEN API 호출 시도
      response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PrecedentDetailBot/1.0)',
          'Accept': type === 'HTML' ? 'text/html, application/xhtml+xml, */*' : 'application/json, application/xml, text/xml, */*',
          'Accept-Charset': 'utf-8',
        },
      });
      
      console.log('법제처 API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`법제처 API 응답 오류: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('API 응답 수신, 길이:', responseText.length);

      // 응답 처리
      let processedData: any;
      if (type === 'JSON') {
        try {
          processedData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          throw new Error('API 응답을 파싱할 수 없습니다');
        }
      } else {
        processedData = {
          content: responseText,
          contentType: type.toLowerCase()
        };
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: processedData,
          meta: {
            precedentId: precedentId,
            precedentName: precedentName,
            type: type,
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

    } catch (apiError) {
      console.error('법제처 API 호출 오류:', apiError);
      
      // 임시 응답 반환 (법제처 API 오류 시)
      const dummyContent = {
        success: false,
        error: '현재 법제처 API 서비스에 일시적인 문제가 발생했습니다',
        code: 'API_UNAVAILABLE',
        message: '법제처 서버에서 응답을 받을 수 없습니다. 잠시 후 다시 시도해주세요.',
        details: {
          precedentId: precedentId,
          precedentName: precedentName,
          suggestedAction: '법제처 국가법령정보센터(https://www.law.go.kr)에서 직접 조회하시거나, 잠시 후 다시 시도해주세요.',
          externalLink: `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(precedentId)}`,
          timestamp: new Date().toISOString()
        }
      };

      return new Response(
        JSON.stringify(dummyContent),
        {
          status: 503, // Service Unavailable
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

  } catch (error) {
    console.error('판례 본문 조회 전체 오류:', error);
    console.error('오류 스택:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: '판례 본문 조회 중 오류가 발생했습니다',
        code: 'INTERNAL_ERROR',
        message: error.message || String(error),
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