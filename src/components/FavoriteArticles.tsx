import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";

interface LawArticle {
  id: string;
  title: string;
  article: string;
  url: string;
  category: string;
}

export const FavoriteArticles = () => {
  const [favoriteArticles, setFavoriteArticles] = useState<LawArticle[]>([]);

  useEffect(() => {
    const loadFavoriteArticles = () => {
      const favorites = JSON.parse(localStorage.getItem("favoriteArticles") || "[]");
      setFavoriteArticles(favorites);
    };

    loadFavoriteArticles();
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      loadFavoriteArticles();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // 주기적으로 업데이트 (같은 탭에서의 변경사항 반영)
    const interval = setInterval(loadFavoriteArticles, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleArticleClick = (article: LawArticle) => {
    window.open(article.url, "_blank");
  };

  const removeFavorite = (articleId: string) => {
    const favorites = JSON.parse(localStorage.getItem("favoriteArticles") || "[]");
    const updatedFavorites = favorites.filter((article: LawArticle) => article.id !== articleId);
    localStorage.setItem("favoriteArticles", JSON.stringify(updatedFavorites));
    setFavoriteArticles(updatedFavorites);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          즐겨찾기
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favoriteArticles.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            즐겨찾기한 조문이 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {favoriteArticles.map((article, index) => (
              <div key={`${article.id}-${index}`} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start h-auto p-2 text-left"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(article.id);
                  }}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};