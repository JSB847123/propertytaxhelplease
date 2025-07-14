import React, { useState } from 'react';
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
  isLoading,
  onCaseClick,
  onExternalLink
}) => {
  const [openDetailMap, setOpenDetailMap] = useState<{[key: string]: boolean}>({});

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // YYYYMMDD 형태를 YYYY.MM.DD로 변환
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}.${dateString.slice(4, 6)}.${dateString.slice(6, 8)}`;
    }
    
    return dateString;
  };

  const handleTitleClick = (caseId: string) => {
    setOpenDetailMap(prev => ({
      ...prev,
      [caseId]: true
    }));
  };

  const handleDetailClose = (caseId: string) => {
    setOpenDetailMap(prev => ({
      ...prev,
      [caseId]: false
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">판례를 검색하고 있습니다...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
            <p className="text-muted-foreground">다른 검색어로 다시 시도해보세요</p>
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
              판례 검색 결과
            </span>
            <Badge variant="secondary" className="text-sm">
              {cases.length.toLocaleString()}건
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 검색 결과 목록 */}
      <div className="space-y-3">
        {cases.map((caseItem, index) => {
          const caseId = caseItem.판례정보일련번호 || caseItem.사건번호 || `case-${index}`;
          const isDetailOpen = openDetailMap[caseId] || false;
          
          return (
            <Card key={caseId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle 
                      className="text-base leading-tight mb-2 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => handleTitleClick(caseId)}
                    >
                      {caseItem.사건명 || '사건명 없음'}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {caseItem.사건번호 && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {caseItem.사건번호}
                        </Badge>
                      )}
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
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {caseItem.판시사항 && (
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    <strong>판시사항:</strong>
                    <p className="mt-1 line-clamp-3">{caseItem.판시사항}</p>
                  </div>
                </CardContent>
              )}

              {/* 제목 클릭용 CaseDetail */}
              <CaseDetail
                caseItem={caseItem}
                trigger={<span style={{ display: 'none' }} />}
                isOpen={isDetailOpen}
                onOpenChange={(open) => open ? handleTitleClick(caseId) : handleDetailClose(caseId)}
              />
            </Card>
          );
        })}
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