import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertCircle } from "lucide-react";
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
  
  // 커스터마이징 가능한 검색 파라미터
  const [type, setType] = useState("html");
  const [display, setDisplay] = useState("100");
  const [prncYdStart, setPrncYdStart] = useState("20000101");
  const [prncYdEnd, setPrncYdEnd] = useState("20231231");
  const [searchScope, setSearchScope] = useState("2");

  // 고정 파라미터 (API 호출용)
  const fixedParams = {
    id: "bahnntf",           // API 호출을 위한 고정 ID
    target: "prec",          // 판례 검색
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
        type: type,
        display: display,
        prncYdStart: prncYdStart,
        prncYdEnd: prncYdEnd,
        search: searchScope,
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

  const getScopeText = (scope: string) => {
    switch (scope) {
      case "1": return "제목";
      case "2": return "판시요지와 판시내용";
      case "3": return "전체";
      default: return "판시요지와 판시내용";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            판례 검색
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            검색 조건을 설정하여 판례를 검색하세요
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

          {/* 검색 조건 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">형식</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">개수</label>
              <Select value={display} onValueChange={setDisplay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                  <SelectItem value="100">100개</SelectItem>
                  <SelectItem value="200">200개</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">시작일</label>
              <Input
                value={prncYdStart}
                onChange={(e) => setPrncYdStart(e.target.value)}
                placeholder="YYYYMMDD"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">종료일</label>
              <Input
                value={prncYdEnd}
                onChange={(e) => setPrncYdEnd(e.target.value)}
                placeholder="YYYYMMDD"
                maxLength={8}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">검색 범위</label>
              <Select value={searchScope} onValueChange={setSearchScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">제목</SelectItem>
                  <SelectItem value="2">판시요지와 판시내용</SelectItem>
                  <SelectItem value="3">전체</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL 미리보기 */}
          {keyword.trim() && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground break-all">
                http://www.law.go.kr/DRF/lawSearch.do?OC={fixedParams.id}&target={fixedParams.target}&type={type}&query={encodeURIComponent(keyword)}&display={display}&prncYd={prncYdStart}~{prncYdEnd}&search={searchScope}
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
                  • 검색 범위: {getScopeText(searchScope)}
                  <br />
                  • 기간: {prncYdStart.slice(0,4)}년 {prncYdStart.slice(4,6)}월 {prncYdStart.slice(6,8)}일 ~ {prncYdEnd.slice(0,4)}년 {prncYdEnd.slice(4,6)}월 {prncYdEnd.slice(6,8)}일
                  <br />
                  • 결과 형식: {type.toUpperCase()} ({display}개씩 표시)
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