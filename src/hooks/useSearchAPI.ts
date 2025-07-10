import { useState, useCallback } from 'react';
import { searchLawOrPrecedent, SearchParams, APIError } from '@/lib/apiClient';
import { parseAPIResponse } from '@/lib/xmlParser';
import type { LawData, PrecedentData } from '@/lib/xmlParser';

interface UseSearchAPIResult {
  data: LawData[] | PrecedentData[] | null;
  isLoading: boolean;
  error: APIError | null;
  search: (params: SearchParams) => Promise<boolean>;
  retry: () => Promise<boolean>;
  reset: () => void;
}

export const useSearchAPI = (): UseSearchAPIResult => {
  const [data, setData] = useState<LawData[] | PrecedentData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  const performSearch = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setLastSearchParams(params);

    try {
      console.log('검색 시작:', params);
      
      const response = await searchLawOrPrecedent(params);
      
      // 법제처 API는 항상 JSON으로 응답 받도록 설정됨
      const parsedData = parseAPIResponse(response, 'json');
      
      console.log('파싱된 데이터:', parsedData);
      setData(parsedData);
      return true; // 성공
      
    } catch (err: any) {
      console.error('검색 오류:', err);
      setError(err as APIError);
      setData(null);
      return false; // 실패
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (params: SearchParams) => {
    return await performSearch(params);
  }, [performSearch]);

  const retry = useCallback(async () => {
    if (lastSearchParams) {
      return await performSearch(lastSearchParams);
    }
    return false;
  }, [lastSearchParams, performSearch]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setLastSearchParams(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    search,
    retry,
    reset
  };
};