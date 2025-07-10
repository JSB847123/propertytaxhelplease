import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, FileText, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedPrecedentSearchProps {
  className?: string;
}

interface SearchParams {
  keyword: string;
  id: string;
  display: string;
  type: string;
  search: string;
  prncYdStart: string;
  prncYdEnd: string;
  page: string;
}

interface SearchResponse {
  success: boolean;
  data: any;
  meta: {
    keyword: string;
    id: string;
    target: string;
    type: string;
    search: string;
    display: number;
    page: number;
    prncYdRange: string;
    timestamp: string;
    searchDescription: string;
  };
  error?: string;
}

export const AdvancedPrecedentSearch = ({ className }: AdvancedPrecedentSearchProps) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: "",
    id: "bahnntf", // 기본 ID
    display: "100",
    type: "html",
    search: "2", // 판시요지와 판시내용
    prncYdStart: "20000101",
    prncYdEnd: "20231231",
    page: "1"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!searchParams.keyword.trim()) {
      setError('검색 키워드를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      console.log('고급 판례 검색 시작:', searchParams);

      // URLSearchParams를 위한 파라미터 객체 변환
      const paramObject: Record<string, string> = {
        keyword: searchParams.keyword,
        id: searchParams.id,
        display: searchParams.display,
        type: searchParams.type,
        search: searchParams.search,
        prncYdStart: searchParams.prncYdStart,
        prncYdEnd: searchParams.prncYdEnd,
        page: searchParams.page
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
            고급 판례 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 기본 검색 파라미터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">검색 키워드</label>
              <Input
                placeholder="검색할 키워드를 입력하세요"
                value={searchParams.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">API ID</label>
              <Input
                placeholder="API 인증 ID"
                value={searchParams.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
              />
            </div>
          </div>

          {/* 고급 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">응답 형식</label>
              <Select value={searchParams.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">검색 범위</label>
              <Select value={searchParams.search} onValueChange={(value) => handleInputChange('search', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">전체</SelectItem>
                  <SelectItem value="1">제목</SelectItem>
                  <SelectItem value="2">판시요지와 판시내용</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">결과 개수</label>
              <Select value={searchParams.display} onValueChange={(value) => handleInputChange('display', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="20">20개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                  <SelectItem value="100">100개</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 선고일자 범위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                선고일자 시작 (YYYYMMDD)
              </label>
              <Input
                placeholder="20000101"
                value={searchParams.prncYdStart}
                onChange={(e) => handleInputChange('prncYdStart', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                선고일자 종료 (YYYYMMDD)
              </label>
              <Input
                placeholder="20231231"
                value={searchParams.prncYdEnd}
                onChange={(e) => handleInputChange('prncYdEnd', e.target.value)}
              />
            </div>
          </div>

          {/* 검색 버튼 */}
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !searchParams.keyword.trim()}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? '검색 중...' : '판례 검색'}
          </Button>

          {/* 검색 파라미터 표시 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              범위: {searchParams.search === '2' ? '판시요지와 판시내용' : 
                    searchParams.search === '1' ? '제목' : '전체'}
            </Badge>
            <Badge variant="outline">
              기간: {searchParams.prncYdStart}~{searchParams.prncYdEnd}
            </Badge>
            <Badge variant="outline">
              형식: {searchParams.type}
            </Badge>
            <Badge variant="outline">
              개수: {searchParams.display}개
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {isLoading && (
        <LoadingSpinner 
          type="precedent"
          message="고급 판례 검색을 진행하고 있습니다..."
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
            <CardTitle className="text-lg">
              검색 결과
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>키워드: {searchResult.meta.keyword}</span>
              <span>•</span>
              <span>{searchResult.meta.searchDescription}</span>
              <span>•</span>
              <span>{searchResult.meta.prncYdRange}</span>
            </div>
          </CardHeader>
          <CardContent>
            {searchResult.data.contentType === 'html' ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  HTML 응답을 받았습니다. 응답 크기: {searchResult.data.htmlContent?.length || 0}자
                </div>
                <div 
                  className="max-h-96 overflow-y-auto border rounded p-4 bg-muted/30"
                  dangerouslySetInnerHTML={{ 
                    __html: searchResult.data.htmlContent?.substring(0, 2000) + '...' 
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {searchResult.data.contentType} 형식의 응답
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