import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertCircle, Calendar } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

interface SimplePrecedentSearchProps {
  className?: string;
}

interface SearchResult {
  success: boolean;
  data: {
    htmlContent?: string;
    contentType: string;
    extractedInfo?: {
      totalCount: number;
      resultMsg: string;
      keyword: string;
    };
  };
  meta: {
    keyword: string;
    totalCount: number;
    searchDescription: string;
    prncYdRange: string;
  };
  error?: string;
}

export const SimplePrecedentSearch = ({ className }: SimplePrecedentSearchProps) => {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 고정된 검색 파라미터
  const fixedParams = {
    id: "bahnntf",           // 고정 ID
    target: "prec",          // 판례 검색
    type: "html",            // HTML 형식
    display: "100",          // 한 번에 100개
    prncYdStart: "20000101", // 2000년부터
    prncYdEnd: "20231231",   // 2023년까지
    search: "2",             // 판시요지와 판시내용
    page: "1"
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('검색 키워드를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      console.log('간편 판례 검색 시작:', keyword);

      // URLSearchParams로 파라미터 구성
      const paramObject: Record<string, string> = {
        keyword: keyword.trim(),
        ...fixedParams
      };
      
      const queryParams = new URLSearchParams(paramObject);
      const functionUrl = `https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/advanced-precedent-search?${queryParams.toString()}`;
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('검색 결과:', data);
      setSearchResult(data);

    } catch (err: any) {
      console.error('검색 오류:', err);
      setError(err.message || '검색 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            간편 판례 검색
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            고정 설정: HTML 형식, 100개씩, 2000-2023년, 판시요지와 판시내용
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 입력 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="판례 검색 키워드를 입력하세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !keyword.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? '검색 중...' : '검색'}
            </Button>
          </div>

          {/* 고정 설정 표시 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">ID: {fixedParams.id}</Badge>
            <Badge variant="secondary">형식: {fixedParams.type.toUpperCase()}</Badge>
            <Badge variant="secondary">개수: {fixedParams.display}개</Badge>
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1" />
              {fixedParams.prncYdStart}~{fixedParams.prncYdEnd}
            </Badge>
            <Badge variant="secondary">범위: 판시요지와 판시내용</Badge>
          </div>

          {/* URL 미리보기 */}
          {keyword.trim() && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground break-all">
                http://www.law.go.kr/DRF/lawSearch.do?OC={fixedParams.id}&target={fixedParams.target}&type={fixedParams.type}&query={encodeURIComponent(keyword)}&display={fixedParams.display}&prncYd={fixedParams.prncYdStart}~{fixedParams.prncYdEnd}&search={fixedParams.search}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingSpinner 
          type="precedent"
          message="판례 검색을 진행하고 있습니다..."
        />
      )}

      {/* 오류 표시 */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>오류: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 결과 */}
      {searchResult && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              검색 결과
              {searchResult.meta.totalCount !== undefined && (
                <Badge variant="default" className="text-lg px-3 py-1">
                  총 {searchResult.meta.totalCount.toLocaleString()}건
                </Badge>
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              키워드: <span className="font-medium">{searchResult.meta.keyword}</span> • 
              {searchResult.meta.searchDescription} • 
              {searchResult.meta.prncYdRange}
            </div>
          </CardHeader>
          <CardContent>
            {/* 검색 결과 요약 */}
            {searchResult.meta.totalCount !== undefined && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">
                    총 {searchResult.meta.totalCount.toLocaleString()}건의 판례가 검색되었습니다.
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  • 검색 범위: 판시요지와 판시내용
                  <br />
                  • 기간: 2000년 1월 1일 ~ 2023년 12월 31일
                  <br />
                  • 결과 형식: HTML (100개씩 표시)
                </div>
              </div>
            )}

            {/* HTML 응답 내용 */}
            {searchResult.data.contentType === 'html' && searchResult.data.htmlContent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">HTML 응답 내용</div>
                  <Badge variant="outline">
                    크기: {searchResult.data.htmlContent.length.toLocaleString()}자
                  </Badge>
                </div>
                
                {/* HTML 내용 미리보기 */}
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <div 
                    className="p-4 text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: searchResult.data.htmlContent.substring(0, 5000) + 
                              (searchResult.data.htmlContent.length > 5000 ? '...' : '')
                    }}
                  />
                </div>

                {searchResult.data.htmlContent.length > 5000 && (
                  <div className="text-sm text-muted-foreground text-center">
                    첫 5,000자만 표시됩니다. 전체 내용은 {searchResult.data.htmlContent.length.toLocaleString()}자입니다.
                  </div>
                )}
              </div>
            )}

            {/* 기타 응답 타입 */}
            {searchResult.data.contentType !== 'html' && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  응답 형식: {searchResult.data.contentType}
                </div>
                <pre className="max-h-96 overflow-auto bg-muted/30 p-4 rounded text-xs">
                  {JSON.stringify(searchResult.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};