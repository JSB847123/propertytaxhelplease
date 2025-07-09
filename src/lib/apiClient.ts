import { supabase } from "@/integrations/supabase/client";

export interface APIError extends Error {
  type: 'network' | 'cors' | 'api' | 'timeout' | 'unknown';
  statusCode?: number;
  details?: string;
}

export class NetworkError extends Error implements APIError {
  type: 'network' = 'network';
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class CORSError extends Error implements APIError {
  type: 'cors' = 'cors';
  constructor(message: string) {
    super(message);
    this.name = 'CORSError';
  }
}

export class APIResponseError extends Error implements APIError {
  type: 'api' = 'api';
  statusCode: number;
  details?: string;
  
  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.name = 'APIResponseError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class TimeoutError extends Error implements APIError {
  type: 'timeout' = 'timeout';
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// 에러 분류 함수
const classifyError = (error: any): APIError => {
  // 네트워크 연결 오류
  if (!navigator.onLine) {
    return new NetworkError('인터넷 연결을 확인해주세요.');
  }
  
  // CORS 오류
  if (error.message?.includes('CORS') || 
      error.message?.includes('Access-Control-Allow-Origin') ||
      error.message?.includes('Cross-Origin Request Blocked')) {
    return new CORSError('CORS 정책으로 인해 요청이 차단되었습니다.');
  }
  
  // 타임아웃 오류
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return new TimeoutError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
  }
  
  // HTTP 응답 오류
  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode;
    let message = '서버 오류가 발생했습니다.';
    
    switch (statusCode) {
      case 400:
        message = '잘못된 요청입니다. 검색 조건을 확인해주세요.';
        break;
      case 401:
        message = '인증이 필요합니다.';
        break;
      case 403:
        message = '접근 권한이 없습니다.';
        break;
      case 404:
        message = '요청한 리소스를 찾을 수 없습니다.';
        break;
      case 429:
        message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 500:
        message = '서버 내부 오류가 발생했습니다.';
        break;
      case 502:
        message = '서버 게이트웨이 오류가 발생했습니다.';
        break;
      case 503:
        message = '서비스를 일시적으로 사용할 수 없습니다.';
        break;
    }
    
    return new APIResponseError(message, statusCode, error.message);
  }
  
  // 기타 오류
  return {
    type: 'unknown',
    name: 'UnknownError',
    message: error.message || '알 수 없는 오류가 발생했습니다.',
  } as APIError;
};

export interface SearchParams {
  target: 'law' | 'prec';
  query?: string;
  search?: string; // 판례 검색 범위
  display?: number; // 결과 개수
  page?: number;
  [key: string]: any;
}

// 법령/판례 검색 API 호출
export const searchLawOrPrecedent = async (
  params: SearchParams,
  timeoutMs: number = 30000
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log('API 호출 시작:', params);
    
    // URL 쿼리 파라미터로 전달
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('q', params.query);
    if (params.target) searchParams.append('target', params.target);
    if (params.search) searchParams.append('search', params.search);
    if (params.display) searchParams.append('display', params.display.toString());
    if (params.page) searchParams.append('page', params.page.toString());

    // Edge Function 호출 (GET 방식)
    const functionUrl = `https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/law-search?${searchParams.toString()}`;
    
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function 응답 오류:', response.status, errorText);
      throw new APIResponseError(`서버 오류: ${response.status}`, response.status, errorText);
    }

    const data = await response.text();

    console.log('API 응답 수신 완료');
    return typeof data === 'string' ? data : JSON.stringify(data);

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('API 호출 오류:', error);
    
    // AbortError (타임아웃)인 경우
    if (error.name === 'AbortError') {
      throw new TimeoutError('요청 시간이 초과되었습니다.');
    }
    
    // 이미 분류된 오류인 경우
    if (error.type) {
      throw error;
    }
    
    // 분류되지 않은 오류
    throw classifyError(error);
  }
};

// 에러 메시지 생성 헬퍼
export const getErrorMessage = (error: APIError): string => {
  switch (error.type) {
    case 'network':
      return `🌐 ${error.message}`;
    case 'cors':
      return `🚫 ${error.message}`;
    case 'api':
      return `⚠️ ${error.message}`;
    case 'timeout':
      return `⏱️ ${error.message}`;
    default:
      return `❌ ${error.message}`;
  }
};

// 재시도 가능한 오류인지 확인
export const isRetryableError = (error: APIError): boolean => {
  return error.type === 'network' || 
         error.type === 'timeout' || 
         (error.type === 'api' && error.statusCode && error.statusCode >= 500);
};