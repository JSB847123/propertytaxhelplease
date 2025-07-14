
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LawArticleList } from "@/components/LawArticleList";
import { RecentArticles } from "@/components/RecentArticles";
import { FavoriteArticles } from "@/components/FavoriteArticles";
import { FrequentSites } from "@/components/FrequentSites";
import { MemoSection } from "@/components/MemoSection";
import { SearchSection } from "@/components/SearchSection";
import { BasicLawLinks } from "@/components/BasicLawLinks";
import { FAQ } from "@/components/FAQ";
import { UtilityBar } from "@/components/UtilityBar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calculator, ExternalLink } from "lucide-react";

const Index = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const [searchResultCount, setSearchResultCount] = useState<number | undefined>(undefined);

  const handleSearch = useCallback((term: string, filters: string[]) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  }, []);

  const handleCalculatorClick = () => {
    window.open('https://empty-page-seed.lovable.app/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">


      {/* Utility Bar */}
      <UtilityBar />
      
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">재산세 법령 포털</h1>
            <div className="flex gap-2">
              <Link to="/precedent-search">
                <Button className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  판례 검색
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Law Articles & Search */}
          <div className="lg:col-span-2 space-y-6">
            <BasicLawLinks />
            <SearchSection
              onSearch={handleSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              resultCount={searchResultCount}
            />
            <LawArticleList 
              onArticleClick={setSelectedArticle}
              searchTerm={searchTerm}
              searchFilters={searchFilters}
              onResultCountChange={setSearchResultCount}
            />
          </div>

          {/* Right Column - Favorites, Recent Articles, Sites & Memo */}
          <div className="space-y-6">
            <FavoriteArticles />
            <RecentArticles />
            <FrequentSites />
            <FAQ />
            <MemoSection />
            
            {/* 재산세 계산기 */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  재산세(주택) 계산기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    주택 재산세를 간편하게 계산해보세요.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      개발중
                    </span>
                    <span className="text-xs text-muted-foreground">
                      베타 버전 서비스
                    </span>
                  </div>
                  <Button 
                    onClick={handleCalculatorClick}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Calculator className="h-4 w-4" />
                    계산기 사용하기
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
