
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LawArticleList } from "@/components/LawArticleList";
import { RecentArticles } from "@/components/RecentArticles";
import { FavoriteArticles } from "@/components/FavoriteArticles";
import { FrequentSites } from "@/components/FrequentSites";
import { MemoSection } from "@/components/MemoSection";
import { SearchSection } from "@/components/SearchSection";
import { FAQ } from "@/components/FAQ";
import { UtilityBar } from "@/components/UtilityBar";

const Index = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const [searchResultCount, setSearchResultCount] = useState<number | undefined>(undefined);

  const handleSearch = useCallback((term: string, filters: string[]) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Utility Bar */}
      <UtilityBar />
      
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-foreground">재산세 법령 포털</h1>
          <p className="text-sm text-muted-foreground mt-1">지방세 담당 공무원을 위한 법령 조회 시스템</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Law Articles & Search */}
          <div className="lg:col-span-2 space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
