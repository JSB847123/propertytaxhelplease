import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, Building2, Eye, ExternalLink } from 'lucide-react';
import { CaseItem } from '@/lib/LegalCaseService';
import { CaseDetail } from '@/components/CaseDetail';

interface SearchResultsProps {
  cases: CaseItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  onCaseClick: (caseItem: CaseItem) => void;
  onExternalLink: (caseItem: CaseItem) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  cases,
  totalCount,
  currentPage,
  totalPages,
  isLoading = false,
  onCaseClick,
  onExternalLink
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // YYYYMMDD 형태를 YYYY-MM-DD로 변환
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    }
    return dateString;
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">검색 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cases.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">검색 결과가 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-2">
                다른 검색어를 시도해보시거나 검색 조건을 조정해보세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 결과 헤더 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              검색 결과
            </span>
            <Badge variant="secondary">
              총 {totalCount.toLocaleString()}건
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentPage}페이지 / 총 {totalPages}페이지
          </p>
        </CardHeader>
      </Card>

      {/* 검색 결과 목록 */}
      <div className="space-y-4">
        {cases.map((caseItem, index) => (
          <Card key={`${caseItem.판례정보일련번호}-${index}`} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">
                    {caseItem.사건명 || '사건명 없음'}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {caseItem.사건번호}
                    </Badge>
                    {caseItem.선고일자 && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(caseItem.선고일자)}
                      </Badge>
                    )}
                    {caseItem.법원명 && (
                      <Badge variant="secondary" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {caseItem.법원명}
                      </Badge>
                    )}
                    {caseItem.판결유형 && (
                      <Badge variant="outline" className="text-xs">
                        {caseItem.판결유형}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <CaseDetail
                    caseItem={caseItem}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        상세보기
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExternalLink(caseItem)}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    법제처
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* 판시사항 */}
              {caseItem.판시사항 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">📋 판시사항</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    {truncateText(caseItem.판시사항, 150)}
                  </p>
                </div>
              )}

              {/* 판결요지 */}
              {caseItem.판결요지 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">⚖️ 판결요지</h4>
                  <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                    {truncateText(caseItem.판결요지, 150)}
                  </p>
                </div>
              )}

              {/* 참조조문 */}
              {caseItem.참조조문 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">📖 참조조문</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                    {truncateText(caseItem.참조조문, 100)}
                  </p>
                </div>
              )}

              {/* 참조판례 */}
              {caseItem.참조판례 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">🔗 참조판례</h4>
                  <p className="text-sm text-gray-600 bg-purple-50 p-2 rounded">
                    {truncateText(caseItem.참조판례, 100)}
                  </p>
                </div>
              )}

              <Separator className="my-3" />

              {/* 메타 정보 */}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>판례일련번호: {caseItem.판례정보일련번호}</span>
                <span>법제처 국가법령정보센터 제공</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 페이지네이션 정보 */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {currentPage} / {totalPages} 페이지 
              ({((currentPage - 1) * cases.length + 1).toLocaleString()} - {(currentPage * cases.length).toLocaleString()}번째 결과)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 