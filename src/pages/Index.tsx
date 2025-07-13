
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
import { Search } from "lucide-react";

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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">재산세 법령 포털</h1>
            <div className="flex gap-2">
              <Link to="/law-search">
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  기존 검색
                </Button>
              </Link>
              <Link to="/precedent-search">
                <Button className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  새로운 판례 검색
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
