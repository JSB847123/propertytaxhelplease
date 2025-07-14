import { useState, useEffect, useCallback } from 'react';
import type { PrecedentData } from '@/lib/xmlParser';

export interface BookmarkedPrecedent extends PrecedentData {
  id: string;
  bookmarkedAt: number;
  tags?: string[];
  notes?: string;
}

export interface BookmarkedLaw {
  id: string;
  법령명한글: string;
  법령구분명: string;
  소관부처명: string;
  공포일자: string;
  시행일자: string;
  법령상세링크: string;
  법령약칭명?: string;
  제개정구분명: string;
  법령ID: string;
  bookmarkedAt: number;
  tags?: string[];
  notes?: string;
}

const BOOKMARKS_KEY = 'law_precedent_bookmarks';
const LAW_BOOKMARKS_KEY = 'law_bookmarks';

// 커스텀 이벤트 타입
const BOOKMARK_CHANGE_EVENT = 'bookmarkChange';
const LAW_BOOKMARK_CHANGE_EVENT = 'lawBookmarkChange';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedPrecedent[]>([]);
  const [lawBookmarks, setLawBookmarks] = useState<BookmarkedLaw[]>([]);

  // localStorage에서 북마크 로드
  const loadBookmarks = useCallback(() => {
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

  const loadLawBookmarks = useCallback(() => {
    try {
      const savedLawBookmarks = localStorage.getItem(LAW_BOOKMARKS_KEY);
      if (savedLawBookmarks) {
        const parsedLawBookmarks = JSON.parse(savedLawBookmarks);
        setLawBookmarks(parsedLawBookmarks);
      }
    } catch (error) {
      console.error('법령 북마크 로드 오류:', error);
      localStorage.removeItem(LAW_BOOKMARKS_KEY);
    }
  }, []);

  // 초기 로드 및 이벤트 리스너 설정
  useEffect(() => {
    loadBookmarks();
    loadLawBookmarks();

    // 커스텀 이벤트 리스너 추가
    const handleBookmarkChange = () => {
      loadBookmarks();
    };

    const handleLawBookmarkChange = () => {
      loadLawBookmarks();
    };

    // storage 이벤트 리스너 (다른 탭에서의 변경사항 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BOOKMARKS_KEY) {
        loadBookmarks();
      }
      if (e.key === LAW_BOOKMARKS_KEY) {
        loadLawBookmarks();
      }
    };

    window.addEventListener(BOOKMARK_CHANGE_EVENT, handleBookmarkChange);
    window.addEventListener(LAW_BOOKMARK_CHANGE_EVENT, handleLawBookmarkChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(BOOKMARK_CHANGE_EVENT, handleBookmarkChange);
      window.removeEventListener(LAW_BOOKMARK_CHANGE_EVENT, handleLawBookmarkChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadBookmarks, loadLawBookmarks]);

  // 북마크 저장 및 이벤트 발생
  const saveToLocalStorage = useCallback((bookmarksData: BookmarkedPrecedent[]) => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarksData));
      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent(BOOKMARK_CHANGE_EVENT));
    } catch (error) {
      console.error('북마크 저장 오류:', error);
    }
  }, []);

  // 법령 북마크 저장 및 이벤트 발생
  const saveToLocalStorageLaw = useCallback((lawBookmarksData: BookmarkedLaw[]) => {
    try {
      localStorage.setItem(LAW_BOOKMARKS_KEY, JSON.stringify(lawBookmarksData));
      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent(LAW_BOOKMARK_CHANGE_EVENT));
    } catch (error) {
      console.error('법령 북마크 저장 오류:', error);
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

  // 법령 북마크 관련 함수들
  const addLawBookmark = useCallback((law: any, tags?: string[], notes?: string) => {
    const bookmarkId = `${law.법령ID}_${Date.now()}`;
    
    const newBookmark: BookmarkedLaw = {
      id: bookmarkId,
      법령명한글: law.법령명한글,
      법령구분명: law.법령구분명,
      소관부처명: law.소관부처명,
      공포일자: law.공포일자,
      시행일자: law.시행일자,
      법령상세링크: law.법령상세링크,
      법령약칭명: law.법령약칭명,
      제개정구분명: law.제개정구분명,
      법령ID: law.법령ID,
      bookmarkedAt: Date.now(),
      tags,
      notes
    };

    setLawBookmarks(prev => {
      // 중복 제거 (같은 법령ID)
      const filtered = prev.filter(item => item.법령ID !== law.법령ID);
      const updated = [newBookmark, ...filtered];
      saveToLocalStorageLaw(updated);
      return updated;
    });

    return bookmarkId;
  }, [saveToLocalStorageLaw]);

  const removeLawBookmark = useCallback((bookmarkId: string) => {
    setLawBookmarks(prev => {
      const updated = prev.filter(item => item.id !== bookmarkId);
      saveToLocalStorageLaw(updated);
      return updated;
    });
  }, [saveToLocalStorageLaw]);

  const removeLawBookmarkByLawId = useCallback((lawId: string) => {
    setLawBookmarks(prev => {
      const updated = prev.filter(item => item.법령ID !== lawId);
      saveToLocalStorageLaw(updated);
      return updated;
    });
  }, [saveToLocalStorageLaw]);

  const isLawBookmarked = useCallback((lawId: string) => {
    return lawBookmarks.some(item => item.법령ID === lawId);
  }, [lawBookmarks]);

  const getLawBookmarkByLawId = useCallback((lawId: string) => {
    return lawBookmarks.find(item => item.법령ID === lawId);
  }, [lawBookmarks]);

  return {
    bookmarks,
    lawBookmarks,
    addBookmark,
    removeBookmark,
    removeBookmarkByCaseNumber,
    updateBookmark,
    isBookmarked,
    getBookmarkByCaseNumber,
    clearBookmarks,
    getBookmarksByTag,
    getAllTags,
    // 법령 북마크 관련
    addLawBookmark,
    removeLawBookmark,
    removeLawBookmarkByLawId,
    isLawBookmarked,
    getLawBookmarkByLawId
  };
};