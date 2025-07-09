import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LawSearchForm } from "@/components/law/LawSearchForm";
import { LawSearchResults } from "@/components/law/LawSearchResults";
import { useSearchAPI } from "@/hooks/useSearchAPI";
import type { LawData, PrecedentData } from "@/lib/xmlParser";

const LawSearch = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, search, retry, reset } = useSearchAPI();
  const [searchType, setSearchType] = useState<'law' | 'prec'>('law');

  const handleSearch = async (query: string, type: 'law' | 'prec') => {
    setSearchType(type);
    await search({
      target: type,
      query: query,
      display: 20,
      page: 1
    });
  };

  const handleItemClick = (item: LawData | PrecedentData) => {
    // ID 생성 로직 (실제 구현에서는 API 응답의 고유 식별자 사용)
    const id = 'lsSeq' in item ? item.lsSeq : 
               'caseNm' in item ? encodeURIComponent(item.caseNm || '') : 
               'unknown';
    
    navigate(`/law-detail/${searchType}/${id}`, { 
      state: { item } 
    });
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
              <CardContent>
                <LawSearchForm 
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  onReset={reset}
                />
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <LawSearchResults
              data={data}
              isLoading={isLoading}
              error={error}
              searchType={searchType}
              onItemClick={handleItemClick}
              onRetry={retry}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawSearch;