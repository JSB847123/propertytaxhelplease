import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { SearchForm, type SearchFormData } from "@/components/law/SearchForm";
import { SearchResults } from "@/components/law/SearchResults";
import { LawTextSearch } from "@/components/law/LawTextSearch";
import type { LawData } from "@/components/law/LawCard";
import type { PrecedentData } from "@/components/law/PrecedentCard";

const LawSearch = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState<SearchFormData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // React Query를 사용한 검색 API 호출
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['lawSearch', searchData, currentPage],
    queryFn: async () => {
      if (!searchData?.query.trim()) return null;

      const searchParams = new URLSearchParams({
        q: searchData.query.trim(),
        target: searchData.searchType,
        search: searchData.searchScope,
        display: searchData.resultCount.toString(),
        page: currentPage.toString()
      });

      // 고급 검색 옵션 추가
      if (searchData.sort) {
        searchParams.append('sort', searchData.sort);
      }
      if (searchData.order) {
        searchParams.append('order', searchData.order);
      }
      if (searchData.ancYd) {
        searchParams.append('ancYd', searchData.ancYd);
      }
      if (searchData.ancYdEnd) {
        searchParams.append('ancYdEnd', searchData.ancYdEnd);
      }
      if (searchData.dateFrom) {
        searchParams.append('dateFrom', searchData.dateFrom.toISOString().split('T')[0]);
      }
      if (searchData.dateTo) {
        searchParams.append('dateTo', searchData.dateTo.toISOString().split('T')[0]);
      }
      if (searchData.court && searchData.court !== 'all') {
        searchParams.append('court', searchData.court);
      }
      if (searchData.department) {
        searchParams.append('department', searchData.department);
      }

      const response = await fetch(`https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/law-search?${searchParams.toString()}`, {
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
    enabled: !!searchData?.query.trim(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  const handleSearch = (formData: SearchFormData) => {
    setSearchData(formData);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleItemClick = (item: LawData | PrecedentData) => {
    const id = searchData?.searchType === 'law'
      ? (item as LawData).법령ID 
      : (item as PrecedentData).판례정보일련번호;
    const target = searchData?.searchType === 'law' ? 'lawview' : 'precview';
    
    if (id) {
      const url = `/law-detail?id=${encodeURIComponent(id)}&target=${target}`;
      window.open(url, '_blank');
    }
  };

  const handleClearSearch = () => {
    setSearchData(null);
    setCurrentPage(1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (searchData) {
      setSearchData(prev => prev ? { ...prev, query: suggestion } : null);
    }
  };

  // 결과 데이터 파싱
  const parsedResults = searchResults?.success && searchResults?.data ? 
    (() => {
      const responseData = searchResults.data;
      let results: (LawData | PrecedentData)[] = [];
      
      if (searchData?.searchType === 'law') {
        // 법령 결과 처리
        if (responseData.LawSearch?.law) {
          const laws = Array.isArray(responseData.LawSearch.law) 
            ? responseData.LawSearch.law 
            : [responseData.LawSearch.law];
          
          results = laws.map((law: any) => ({
            법령명: law.법령명 || law['@_법령명'] || law.name,
            공포일자: law.공포일자 || law['@_공포일자'] || law.promulgationDate,
            시행일자: law.시행일자 || law['@_시행일자'] || law.enforcementDate,
            소관부처: law.소관부처 || law['@_소관부처'] || law.department,
            법령ID: law.법령ID || law['@_법령ID'] || law.id,
            개정일자: law.개정일자 || law['@_개정일자'] || law.amendmentDate,
            폐지일자: law.폐지일자 || law['@_폐지일자'] || law.abolitionDate,
            제정일자: law.제정일자 || law['@_제정일자'] || law.enactmentDate
          }));
        }
      } else {
        // 판례 결과 처리
        if (responseData.PrecSearch?.prec) {
          const precs = Array.isArray(responseData.PrecSearch.prec) 
            ? responseData.PrecSearch.prec 
            : [responseData.PrecSearch.prec];
          
          results = precs.map((prec: any) => ({
            사건명: prec.사건명 || prec['@_사건명'] || prec.caseName,
            사건번호: prec.사건번호 || prec['@_사건번호'] || prec.caseNumber,
            선고일자: prec.선고일자 || prec['@_선고일자'] || prec.judgmentDate,
            법원명: prec.법원명 || prec['@_법원명'] || prec.courtName,
            판례정보일련번호: prec.판례정보일련번호 || prec['@_판례정보일련번호'] || prec.serialNumber,
            사건종류: prec.사건종류 || prec['@_사건종류'] || prec.caseType,
            사건종류명: prec.사건종류명 || prec['@_사건종류명'] || prec.caseTypeName,
            판결형태: prec.판결형태 || prec['@_판결형태'] || prec.judgmentType,
            판시사항: prec.판시사항 || prec['@_판시사항'] || prec.issues,
            판결요지: prec.판결요지 || prec['@_판결요지'] || prec.summary,
            참조조문: prec.참조조문 || prec['@_참조조문'] || prec.relatedArticles,
            참조판례: prec.참조판례 || prec['@_참조판례'] || prec.relatedCases
          }));
        }
      }
      
      return results;
    })() : null;

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
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">법령/판례 검색</TabsTrigger>
            <TabsTrigger value="text">법령 원문 검색</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Search Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <SearchForm 
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    defaultValues={searchData || undefined}
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="lg:col-span-3">
                <SearchResults
                  data={parsedResults}
                  isLoading={isLoading}
                  error={error}
                  searchType={searchData?.searchType || "law"}
                  searchTerm={searchData?.query}
                  currentPage={currentPage}
                  hasNextPage={parsedResults ? parsedResults.length >= (searchData?.resultCount || 20) : false}
                  onLoadMore={handleLoadMore}
                  onItemClick={handleItemClick}
                  onRetry={refetch}
                  onClearSearch={handleClearSearch}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="mt-6">
            <LawTextSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LawSearch;