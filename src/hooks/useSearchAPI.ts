import { useState, useCallback } from 'react';
import { searchLawOrPrecedent, SearchParams, APIError } from '@/lib/apiClient';
import { parseAPIResponse } from '@/lib/xmlParser';
import type { LawData, PrecedentData } from '@/lib/xmlParser';

interface UseSearchAPIResult {
  data: LawData[] | PrecedentData[] | null;
  isLoading: boolean;
  error: APIError | null;
  search: (params: SearchParams) => Promise<void>;
  retry: () => Promise<void>;
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
      
      // 응답 타입 결정
      const contentType = params.target === 'law' ? 'xml' : 'json';
      const parsedData = parseAPIResponse(response, contentType);
      
      console.log('파싱된 데이터:', parsedData);
      setData(parsedData);
      
    } catch (err: any) {
      console.error('검색 오류:', err);
      setError(err as APIError);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (params: SearchParams) => {
    await performSearch(params);
  }, [performSearch]);

  const retry = useCallback(async () => {
    if (lastSearchParams) {
      await performSearch(lastSearchParams);
    }
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