import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ExternalLink, Calendar, Building, FileText, Gavel } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LawResult {
  법령명?: string;
  공포일자?: string;
  시행일자?: string;
  소관부처?: string;
  법령ID?: string;
}

interface PrecedentResult {
  사건명?: string;
  사건번호?: string;
  선고일자?: string;
  법원명?: string;
  판례정보일련번호?: string;
}

type SearchResult = LawResult | PrecedentResult;

const LawSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"law" | "prec">("law");
  const [searchScope, setSearchScope] = useState("0"); // 0: 전체, 1: 제목, 2: 본문
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);

  const resultsPerPage = 20;

  // React Query를 사용한 검색 API 호출
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['lawSearch', searchQuery, searchType, searchScope, currentPage],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;

      const { data, error } = await supabase.functions.invoke('law-search', {
        body: {
          q: searchQuery.trim(),
          target: searchType,
          search: searchScope,
          display: resultsPerPage.toString(),
          page: currentPage.toString()
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: isSearchTriggered && !!searchQuery.trim(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentPage(1);
      setIsSearchTriggered(true);
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCardClick = (result: SearchResult) => {
    let id = '';
    if (searchType === 'law' && '법령ID' in result) {
      id = result.법령ID || '';
    } else if (searchType === 'prec' && '판례정보일련번호' in result) {
      id = result.판례정보일련번호 || '';
    }
    
    const target = searchType === 'law' ? 'lawview' : 'precview';
    const url = `/law-detail?id=${encodeURIComponent(id)}&target=${target}`;
    window.open(url, '_blank');
  };

  const renderSearchResults = () => {
    if (!isSearchTriggered) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              검색어를 입력하고 검색해보세요
            </h3>
            <p className="text-sm text-muted-foreground">
              법령이나 판례를 검색할 수 있습니다
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">
                {searchType === 'law' ? '법령을' : '판례를'} 검색하고 있습니다...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="text-center py-12 border-destructive">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <ExternalLink className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-destructive mb-2">검색 중 오류가 발생했습니다</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  잠시 후 다시 시도해주세요
                </p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  다시 시도
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!searchResults?.data || (Array.isArray(searchResults.data) && searchResults.data.length === 0)) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-sm text-muted-foreground">
              다른 검색어를 시도해보세요
            </p>
          </CardContent>
        </Card>
      );
    }

    // 결과 데이터 처리
    let results: SearchResult[] = [];
    if (searchResults?.success && searchResults?.data) {
      // XML 파싱된 결과 처리 로직 필요
      results = Array.isArray(searchResults.data) ? searchResults.data : [];
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            검색 결과 ({results.length}건)
          </h2>
          <Badge variant="secondary">
            {searchType === 'law' ? '법령' : '판례'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer hover-scale"
              onClick={() => handleCardClick(result)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {searchType === 'law' 
                      ? (result as LawResult).법령명 
                      : (result as PrecedentResult).사건명
                    }
                  </CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {searchType === 'law' ? (
                  <div className="space-y-2 text-sm">
                    {(result as LawResult).공포일자 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">공포일자:</span>
                        <span>{(result as LawResult).공포일자}</span>
                      </div>
                    )}
                    {(result as LawResult).시행일자 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">시행일자:</span>
                        <span>{(result as LawResult).시행일자}</span>
                      </div>
                    )}
                    {(result as LawResult).소관부처 && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">소관부처:</span>
                        <span>{(result as LawResult).소관부처}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {(result as PrecedentResult).사건번호 && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">사건번호:</span>
                        <span>{(result as PrecedentResult).사건번호}</span>
                      </div>
                    )}
                    {(result as PrecedentResult).선고일자 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">선고일자:</span>
                        <span>{(result as PrecedentResult).선고일자}</span>
                      </div>
                    )}
                    {(result as PrecedentResult).법원명 && (
                      <div className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">법원명:</span>
                        <span>{(result as PrecedentResult).법원명}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 페이지네이션 (향후 구현) */}
        {results.length === resultsPerPage && (
          <div className="flex justify-center pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                refetch();
              }}
            >
              더 보기
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">법령/판례 검색</h1>
              <p className="text-sm text-muted-foreground">법제처 Open API를 통한 통합 검색</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">검색 조건</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 검색어 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="search-query">검색어</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-query"
                      placeholder="검색어를 입력하세요"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 검색 타입 */}
                <div className="space-y-3">
                  <Label>검색 타입</Label>
                  <RadioGroup value={searchType} onValueChange={(value: "law" | "prec") => setSearchType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="law" id="law" />
                      <Label htmlFor="law">법령</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prec" id="prec" />
                      <Label htmlFor="prec">판례</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 검색 범위 */}
                <div className="space-y-2">
                  <Label>검색 범위</Label>
                  <Select value={searchScope} onValueChange={setSearchScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">전체</SelectItem>
                      <SelectItem value="1">제목</SelectItem>
                      <SelectItem value="2">본문</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 검색 버튼 */}
                <Button 
                  onClick={handleSearch} 
                  className="w-full"
                  disabled={!searchQuery.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      검색 중...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      검색
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {renderSearchResults()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawSearch;