
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";

interface LawArticle {
  id: string;
  title: string;
  article: string;
  url: string;
  category: string;
}

export const RecentArticles = () => {
  const [recentArticles, setRecentArticles] = useState<LawArticle[]>([]);

  useEffect(() => {
    const loadRecentArticles = () => {
      const recent = JSON.parse(localStorage.getItem("recentArticles") || "[]");
      setRecentArticles(recent);
    };

    loadRecentArticles();
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      loadRecentArticles();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // 주기적으로 업데이트 (같은 탭에서의 변경사항 반영)
    const interval = setInterval(loadRecentArticles, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleArticleClick = (article: LawArticle) => {
    window.open(article.url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4" />
          최근 본 조문
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentArticles.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            최근 조회한 조문이 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {recentArticles.map((article, index) => (
              <Button
                key={`${article.id}-${index}`}
                variant="ghost"
                className="w-full justify-start h-auto p-2 text-left"
                onClick={() => handleArticleClick(article)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{article.title}</div>
                    <div className="text-xs text-gray-600 truncate">{article.article}</div>
                  </div>
                  <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
