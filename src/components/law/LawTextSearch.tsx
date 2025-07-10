import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Search, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LawTextSearch = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"ID" | "LM">("ID");
  const [shouldSearch, setShouldSearch] = useState(false);

  // React Query를 사용한 검색 API 호출
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['lawTextSearch', searchValue, searchType],
    queryFn: async () => {
      if (!searchValue.trim()) return null;

      const searchParams = new URLSearchParams({
        searchValue: searchValue.trim(),
        searchType: searchType
      });

      const response = await fetch(`https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/law-text-search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
          'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
        }
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: shouldSearch && !!searchValue.trim(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setShouldSearch(true);
      refetch();
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setShouldSearch(false);
  };

  // HTML 내용을 파싱하여 읽기 쉽게 표시
  const parseHTMLContent = (html: string) => {
    // 기본적인 HTML 태그 제거 및 텍스트 정리
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // script 태그 제거
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // style 태그 제거
      .replace(/<[^>]*>/g, ' ') // 모든 HTML 태그 제거
      .replace(/\s+/g, ' ') // 여러 공백을 하나로
      .trim();
    
    return cleaned;
  };

  return (
    <div className="space-y-6">
      {/* 검색 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            법령 원문 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchType">검색 타입</Label>
                <Select value={searchType} onValueChange={(value: "ID" | "LM") => setSearchType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="검색 타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ID">법령번호</SelectItem>
                    <SelectItem value="LM">법령명</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="searchValue">
                  {searchType === "ID" ? "법령번호" : "법령명"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="searchValue"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === "ID" ? "예: 334617, 315191" : "예: 건강가정기본법"}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !searchValue.trim()}>
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        검색
                      </>
                    )}
                  </Button>
                  {searchValue && (
                    <Button type="button" variant="outline" onClick={handleClear}>
                      초기화
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
          
          {/* 샘플 데이터 안내 */}
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>샘플 데이터:</strong> 법령번호 334617 (법령해석사례에 관한 업무처리 규정), 315191 (건강가정기본법)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {shouldSearch && (
        <Card>
          <CardHeader>
            <CardTitle>검색 결과</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">검색 중...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  검색 중 오류가 발생했습니다: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {searchResults?.success && searchResults?.data?.html && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  검색어: {searchResults.data.searchValue} ({searchResults.data.searchType === 'ID' ? '법령번호' : '법령명'})
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {parseHTMLContent(searchResults.data.html)}
                  </div>
                </div>
              </div>
            )}

            {searchResults?.success && !searchResults?.data?.html && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  검색 결과가 없습니다. 다른 검색어를 시도해보세요.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};