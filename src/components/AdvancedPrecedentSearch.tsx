import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { FileText, Search, AlertCircle, Settings } from 'lucide-react';
import { PrecedentCard } from "@/components/law/PrecedentCard";

interface AdvancedPrecedentSearchProps {
  className?: string;
}

interface PrecedentItem {
  판례정보일련번호: string;
  사건명: string;
  사건번호: string;
  선고일자: string;
  법원명: string;
  판결유형: string;
  판시사항: string;
  판결요지: string;
  참조조문: string;
  참조판례: string;
  원본데이터: any;
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
  precedentList?: PrecedentItem[];
  meta: {
    keyword: string;
    id: string;
    target: string;
    type: string;
    search: string;
    display: number;
    page: number;
    totalCount: number;
    extractedInfo: {
      totalCount: number;
      resultMsg: string;
      keyword: string;
      searchType: string;
    };
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
    type: "JSON",
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

  const getScopeText = (scope: string) => {
    switch (scope) {
      case '1': return '제목';
      case '2': return '판시요지와 판시내용';
      case '3': return '전체';
      default: return '알 수 없음';
    }
  };

  const precedentList = searchResult?.precedentList || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 검색 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            고급 판례 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 키워드 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">검색 키워드</label>
            <Input
              value={searchParams.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 종합부동산세, 취득세, 재산세..."
              className="w-full"
            />
          </div>

          {/* 검색 버튼 */}
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '검색 중...' : '검색'}
          </Button>

          {/* 고급 검색 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">사용자 ID</label>
              <Input
                value={searchParams.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                placeholder="bahnntf"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">결과 개수</label>
              <Select value={searchParams.display} onValueChange={(value) => handleInputChange('display', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                  <SelectItem value="100">100개</SelectItem>
                  <SelectItem value="200">200개</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">응답 형식</label>
              <Select value={searchParams.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="XML">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">검색 범위</label>
              <Select value={searchParams.search} onValueChange={(value) => handleInputChange('search', value)}>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">선고일자 시작</label>
              <Input
                value={searchParams.prncYdStart}
                onChange={(e) => handleInputChange('prncYdStart', e.target.value)}
                placeholder="YYYYMMDD"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">선고일자 종료</label>
              <Input
                value={searchParams.prncYdEnd}
                onChange={(e) => handleInputChange('prncYdEnd', e.target.value)}
                placeholder="YYYYMMDD"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">페이지</label>
              <Input
                value={searchParams.page}
                onChange={(e) => handleInputChange('page', e.target.value)}
                placeholder="1"
                type="number"
                min="1"
              />
            </div>
          </div>

          {/* URL 미리보기 */}
          {searchParams.keyword.trim() && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground break-all">
                http://www.law.go.kr/DRF/lawSearch.do?OC={searchParams.id}&target=prec&type={searchParams.type}&query={encodeURIComponent(searchParams.keyword)}&display={searchParams.display}&search={searchParams.search}&page={searchParams.page}&prncYd={searchParams.prncYdStart}~{searchParams.prncYdEnd}
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 검색 결과 */}
      {searchResult && !isLoading && (
        <div className="space-y-4">
          {/* 검색 결과 요약 */}
          {searchResult.meta.totalCount !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  검색 결과
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    총 {searchResult.meta.totalCount.toLocaleString()}건
                  </Badge>
                </CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>키워드: {searchResult.meta.keyword}</span>
                  <span>•</span>
                  <span>{searchResult.meta.searchDescription}</span>
                  <span>•</span>
                  <span>{searchResult.meta.prncYdRange}</span>
                  {searchResult.meta.extractedInfo?.resultMsg && (
                    <>
                      <span>•</span>
                      <span>상태: {searchResult.meta.extractedInfo.resultMsg}</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      총 {searchResult.meta.totalCount.toLocaleString()}건의 판례가 검색되었습니다.
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    현재 페이지: {searchResult.meta.page} / 표시 개수: {searchResult.meta.display}개
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 판례 목록 */}
          {precedentList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>판례 목록 ({precedentList.length}건)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {precedentList.map((precedent, index) => (
                    <PrecedentCard
                      key={`${precedent.판례정보일련번호 || precedent.사건번호 || index}`}
                      data={precedent}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 원본 응답 데이터 (디버깅용) */}
          {searchResult.data.contentType === 'raw' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600">원본 응답 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    파싱 오류가 발생했습니다. 원본 데이터를 확인해주세요.
                  </div>
                  <pre className="max-h-96 overflow-auto bg-muted/30 p-4 rounded text-xs">
                    {JSON.stringify(searchResult.data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};