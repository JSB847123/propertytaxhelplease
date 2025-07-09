import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'law' | 'prec';
  timestamp: number;
  resultCount?: number;
}

const SEARCH_HISTORY_KEY = 'law_search_history';
const MAX_HISTORY_ITEMS = 20;

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // localStorage에서 검색 기록 로드
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('검색 기록 로드 오류:', error);
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }
  }, []);

  // 검색 기록 저장
  const saveToLocalStorage = useCallback((historyItems: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(historyItems));
    } catch (error) {
      console.error('검색 기록 저장 오류:', error);
    }
  }, []);

  // 새 검색 기록 추가
  const addSearchHistory = useCallback((query: string, type: 'law' | 'prec', resultCount?: number) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query: query.trim(),
      type,
      timestamp: Date.now(),
      resultCount
    };

    setHistory(prev => {
      // 중복 제거 (같은 쿼리와 타입)
      const filtered = prev.filter(item => 
        !(item.query === newItem.query && item.type === newItem.type)
      );
      
      // 새 항목을 맨 앞에 추가하고 최대 개수 제한
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  // 검색 기록 삭제
  const removeSearchHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  // 모든 검색 기록 삭제
  const clearSearchHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // 검색 기록에서 검색 (최근 검색어 자동완성용)
  const getRecentSearches = useCallback((type?: 'law' | 'prec', limit: number = 5) => {
    return history
      .filter(item => !type || item.type === type)
      .slice(0, limit);
  }, [history]);

  return {
    history,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
    getRecentSearches
  };
};