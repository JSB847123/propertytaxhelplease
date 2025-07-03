
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LawArticleList } from "@/components/LawArticleList";
import { RecentArticles } from "@/components/RecentArticles";
import { MemoSection } from "@/components/MemoSection";
import { SearchSection } from "@/components/SearchSection";

const Index = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">재산세 법령 포털</h1>
          <p className="text-sm text-gray-600 mt-1">지방세 담당 공무원을 위한 법령 조회 시스템</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Law Articles & Search */}
          <div className="lg:col-span-2 space-y-6">
            <SearchSection />
            <LawArticleList onArticleClick={setSelectedArticle} />
          </div>

          {/* Right Column - Recent Articles & Memo */}
          <div className="space-y-6">
            <RecentArticles />
            <MemoSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
