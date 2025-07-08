import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // 기본 API 설정
    const apiId = 'bahnntf'; // 사용자 제공 API ID
    const baseUrl = 'http://www.law.go.kr/DRF/lawService.do';
    
    // 법제처 API 파라미터 구성
    const lawApiParams = new URLSearchParams({
      OC: apiId,
      target: 'law',
      type: 'XML',
      // 클라이언트에서 전달받은 파라미터들 추가
      ...Object.fromEntries(searchParams)
    });

    console.log('Making request to Law API:', `${baseUrl}?${lawApiParams.toString()}`);

    // 법제처 API 호출
    const response = await fetch(`${baseUrl}?${lawApiParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LawPortal/1.0)',
        'Accept': 'application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Law API responded with status: ${response.status}`);
    }

    const data = await response.text();
    
    console.log('Law API response received, length:', data.length);

    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in law-proxy function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch law data',
        message: error.message,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});