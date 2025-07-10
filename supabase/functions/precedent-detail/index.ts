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

    // 법제처 판례 본문 조회 API URL 구성
    const apiUrl = 'http://www.law.go.kr/DRF/lawService.do';
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

    // 법제처 API 호출
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PrecedentDetailBot/1.0)',
        'Accept': type === 'HTML' ? 'text/html, application/xhtml+xml, */*' : 'application/json, application/xml, text/xml, */*',
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
    let extractedInfo: any = {};

    // 응답 타입에 따른 처리
    if (type === 'HTML') {
      // HTML 응답인 경우
      processedData = {
        htmlContent: responseText,
        contentType: 'html'
      };
      
      // HTML에서 기본 정보 추출 시도
      const titleMatch = responseText.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        extractedInfo.title = titleMatch[1];
      }
      
    } else {
      // JSON/XML 응답인 경우 파싱
      try {
        if (responseText.trim().startsWith('<')) {
          // XML 응답인 경우
          console.log('XML 응답 감지 - 판례 정보 추출 중...');
          
          // 기본 정보 추출
          const resultMsgMatch = responseText.match(/<resultMsg[^>]*>([^<]+)<\/resultMsg>/);
          const resultCodeMatch = responseText.match(/<resultCode[^>]*>([^<]+)<\/resultCode>/);
          
          extractedInfo = {
            resultMsg: resultMsgMatch ? resultMsgMatch[1] : null,
            resultCode: resultCodeMatch ? resultCodeMatch[1] : null,
            precedentId: precedentId,
            contentType: 'xml'
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
          
          extractedInfo = {
            resultMsg: jsonData.PrecService?.resultMsg || jsonData.resultMsg,
            resultCode: jsonData.PrecService?.resultCode || jsonData.resultCode,
            precedentId: precedentId,
            contentType: 'json'
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
    console.log('판례 본문 조회 완료, 결과 반환');
    return new Response(
      JSON.stringify({
        success: true,
        data: processedData,
        meta: {
          precedentId: precedentId,
          precedentName: precedentName,
          oc: oc,
          target: 'prec',
          type: type,
          extractedInfo: extractedInfo,
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
    console.error('판례 본문 조회 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        error: '판례 본문 조회 중 오류가 발생했습니다',
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