import { useState, useEffect, useCallback } from 'react';
import type { PrecedentData } from '@/lib/xmlParser';

export interface BookmarkedPrecedent extends PrecedentData {
  id: string;
  bookmarkedAt: number;
  tags?: string[];
  notes?: string;
}

const BOOKMARKS_KEY = 'law_precedent_bookmarks';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedPrecedent[]>([]);

  // localStorage에서 북마크 로드
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (savedBookmarks) {
        const parsedBookmarks = JSON.parse(savedBookmarks);
        setBookmarks(parsedBookmarks);
      }
    } catch (error) {
      console.error('북마크 로드 오류:', error);
      localStorage.removeItem(BOOKMARKS_KEY);
    }
  }, []);

  // 북마크 저장
  const saveToLocalStorage = useCallback((bookmarksData: BookmarkedPrecedent[]) => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksData));
    } catch (error) {
      console.error('북마크 저장 오류:', error);
    }
  }, []);

  // 북마크 추가
  const addBookmark = useCallback((precedent: PrecedentData, tags?: string[], notes?: string) => {
    const bookmarkId = `${precedent.caseNumber}_${Date.now()}`;
    
    const newBookmark: BookmarkedPrecedent = {
      ...precedent,
      id: bookmarkId,
      bookmarkedAt: Date.now(),
      tags,
      notes
    };

    setBookmarks(prev => {
      // 중복 제거 (같은 사건번호)
      const filtered = prev.filter(item => item.caseNumber !== precedent.caseNumber);
      const updated = [newBookmark, ...filtered];
      saveToLocalStorage(updated);
      return updated;
    });

    return bookmarkId;
  }, [saveToLocalStorage]);

  // 북마크 제거
  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  // 사건번호로 북마크 제거
  const removeBookmarkByCaseNumber = useCallback((caseNumber: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(item => item.caseNumber !== caseNumber);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  // 북마크 수정 (태그, 노트)
  const updateBookmark = useCallback((id: string, updates: Partial<Pick<BookmarkedPrecedent, 'tags' | 'notes'>>) => {
    setBookmarks(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      saveToLocalStorage(updated);
      return updated;
    });
  }, [saveToLocalStorage]);

  // 북마크 여부 확인
  const isBookmarked = useCallback((caseNumber: string) => {
    return bookmarks.some(item => item.caseNumber === caseNumber);
  }, [bookmarks]);

  // 사건번호로 북마크 찾기
  const getBookmarkByCaseNumber = useCallback((caseNumber: string) => {
    return bookmarks.find(item => item.caseNumber === caseNumber);
  }, [bookmarks]);

  // 모든 북마크 삭제
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    localStorage.removeItem(BOOKMARKS_KEY);
  }, []);

  // 태그별 북마크 필터링
  const getBookmarksByTag = useCallback((tag: string) => {
    return bookmarks.filter(item => item.tags?.includes(tag));
  }, [bookmarks]);

  // 모든 태그 목록 가져오기
  const getAllTags = useCallback(() => {
    const allTags = bookmarks.flatMap(item => item.tags || []);
    return Array.from(new Set(allTags));
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    removeBookmarkByCaseNumber,
    updateBookmark,
    isBookmarked,
    getBookmarkByCaseNumber,
    clearBookmarks,
    getBookmarksByTag,
    getAllTags
  };
};