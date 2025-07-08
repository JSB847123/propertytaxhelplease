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
    
    // target 파라미터로 API 종류 결정
    const target = searchParams.get('target') || 'law';
    const apiId = 'bahnntf'; // 사용자 제공 API ID
    
    let baseUrl: string;
    let apiParams: URLSearchParams;
    
    if (target === 'prec') {
      // 판례 API 설정
      baseUrl = 'http://open.law.go.kr/LSO/openApi/precedentList.do';
      apiParams = new URLSearchParams({
        OC: apiId,
        target: 'prec',
        type: 'JSON',
        // 클라이언트에서 전달받은 파라미터들 추가
        ...Object.fromEntries(searchParams)
      });
    } else {
      // 법령 API 설정 (기존)
      baseUrl = 'http://www.law.go.kr/DRF/lawService.do';
      apiParams = new URLSearchParams({
        OC: apiId,
        target: 'law',
        type: 'XML',
        // 클라이언트에서 전달받은 파라미터들 추가
        ...Object.fromEntries(searchParams)
      });
    }

    console.log(`Making request to ${target === 'prec' ? 'Precedent' : 'Law'} API:`, `${baseUrl}?${apiParams.toString()}`);

    // API 호출
    const response = await fetch(`${baseUrl}?${apiParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LawPortal/1.0)',
        'Accept': target === 'prec' ? 'application/json, */*' : 'application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`${target === 'prec' ? 'Precedent' : 'Law'} API responded with status: ${response.status}`);
    }

    const data = await response.text();
    
    console.log(`${target === 'prec' ? 'Precedent' : 'Law'} API response received, length:`, data.length);

    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': target === 'prec' ? 'application/json; charset=utf-8' : 'application/xml; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in law-proxy function:', error);
    
    const url = new URL(req.url);
    const target = url.searchParams.get('target') || 'law';
    
    return new Response(
      JSON.stringify({ 
        error: target === 'prec' ? 'Failed to fetch precedent data' : 'Failed to fetch law data',
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