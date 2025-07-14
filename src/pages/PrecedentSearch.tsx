import React, { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { SearchResults } from '@/components/SearchResults';
import { CaseDetail } from '@/components/CaseDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Scale, Search, FileText } from 'lucide-react';
import { SearchParams, CaseItem, CaseListResponse, legalCaseService } from '@/lib/LegalCaseService';

export const PrecedentSearch: React.FC = () => {
  const [searchResult, setSearchResult] = useState<CaseListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setCurrentSearchParams(params);
    
    try {
      console.log('판례 검색 실행:', params);
      const result = await legalCaseService.searchCases(params);
      console.log('검색 결과:', result);
      setSearchResult(result);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResult({
        success: false,
        data: {
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
          cases: []
        },
        error: '검색 중 오류가 발생했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseClick = (caseItem: CaseItem) => {
    // CaseDetail 컴포넌트에서 모달로 처리됨
    console.log('판례 상세보기:', caseItem);
  };

  const handleExternalLink = (caseItem: CaseItem) => {
    const precedentId = caseItem.판례정보일련번호;
    const caseNumber = caseItem.사건번호;
    
    let url = '';
    if (precedentId && /^\d+$/.test(precedentId)) {
      url = `https://www.law.go.kr/precSc.do?precSeq=${precedentId}`;
    } else if (caseNumber) {
      url = `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(caseNumber)}`;
    } else {
      url = 'https://www.law.go.kr/precSc.do';
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePageChange = (page: number) => {
    if (currentSearchParams) {
      handleSearch({
        ...currentSearchParams,
        page
      });
    }
  };

  const handleReset = () => {
    setSearchResult(null);
    setCurrentSearchParams(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
              <div className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">판례 검색 시스템</h1>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              법제처 OPEN API 활용
            </Badge>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 검색 폼 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              
              {/* 검색 가이드 */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    검색 가이드
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div>
                    <strong>검색 예시:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                      <li>자동차 사고</li>
                      <li>담보권</li>
                      <li>계약 해지</li>
                      <li>손해배상</li>
                    </ul>
                  </div>
                  <div>
                    <strong>검색 범위:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                      <li>판례명: 제목에서만 검색</li>
                      <li>본문검색: 전체 내용에서 검색</li>
                    </ul>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="lg:col-span-2">
            {!searchResult && !isLoading && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">판례 검색을 시작하세요</h3>
                  <p className="text-sm text-muted-foreground">
                    왼쪽 검색 폼에서 키워드를 입력하고 검색 버튼을 클릭하세요.
                  </p>
                </CardContent>
              </Card>
            )}

            {(searchResult || isLoading) && (
              <SearchResults
                cases={searchResult?.data.cases || []}
                totalCount={searchResult?.data.totalCount || 0}
                currentPage={searchResult?.data.currentPage || 1}
                totalPages={searchResult?.data.totalPages || 0}
                isLoading={isLoading}
                onCaseClick={handleCaseClick}
                onExternalLink={handleExternalLink}
              />
            )}

            {/* 페이지네이션 */}
            {searchResult && searchResult.data.totalPages > 1 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(searchResult.data.currentPage - 1)}
                      disabled={searchResult.data.currentPage <= 1 || isLoading}
                    >
                      ◀ 이전
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from(
                        { length: Math.min(5, searchResult.data.totalPages) },
                        (_, i) => {
                          const page = searchResult.data.currentPage - 2 + i;
                          if (page < 1 || page > searchResult.data.totalPages) return null;
                          
                          return (
                            <Button
                              key={page}
                              variant={page === searchResult.data.currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={isLoading}
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(searchResult.data.currentPage + 1)}
                      disabled={searchResult.data.currentPage >= searchResult.data.totalPages || isLoading}
                    >
                      다음 ▶
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 에러 메시지 */}
            {searchResult && !searchResult.success && (
              <Card className="mt-4 border-destructive">
                <CardContent className="p-4 text-center">
                  <div className="text-destructive">
                    <strong>검색 오류:</strong> {searchResult.error}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="mt-2"
                  >
                    다시 시도
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* 판례 상세보기 모달은 SearchResults 컴포넌트에서 CaseDetail로 처리 */}
      {searchResult && searchResult.data.cases.map((caseItem, index) => (
        <CaseDetail
          key={`detail-${caseItem.판례정보일련번호}-${index}`}
          caseItem={caseItem}
          trigger={<div style={{ display: 'none' }} />}
        />
      ))}
    </div>
  );
}; 