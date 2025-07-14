import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Star, FileText, Scale } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface LawArticle {
  id: string;
  title: string;
  article: string;
  url: string;
  category: string;
}

export const FavoriteArticles = () => {
  const [favoriteArticles, setFavoriteArticles] = useState<LawArticle[]>([]);
  const { lawBookmarks, removeLawBookmark } = useBookmarks();

  useEffect(() => {
    const loadFavoriteArticles = () => {
      const favorites = JSON.parse(localStorage.getItem("favoriteArticles") || "[]");
      setFavoriteArticles(favorites);
    };

    loadFavoriteArticles();
    
    // localStorage 변경 감지 (다른 탭에서의 변경사항)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favoriteArticles") {
        loadFavoriteArticles();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
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

  const handleLawClick = (law: any) => {
    if (law.법령상세링크) {
      const fullUrl = `https://www.law.go.kr${law.법령상세링크}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
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
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              조문
            </TabsTrigger>
            <TabsTrigger value="laws" className="flex items-center gap-1">
              <Scale className="h-3 w-3" />
              법령
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles" className="mt-4">
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
          </TabsContent>
          
          <TabsContent value="laws" className="mt-4">
            {lawBookmarks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                즐겨찾기한 법령이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {lawBookmarks.map((law, index) => (
                  <div key={`${law.id}-${index}`} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start h-auto p-0 text-left"
                        onClick={() => handleLawClick(law)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate mb-1">{law.법령명한글}</div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            <Badge variant="secondary" className="text-xs">{law.법령구분명}</Badge>
                            <Badge variant="outline" className="text-xs">{law.소관부처명}</Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            공포: {formatDate(law.공포일자)} | 시행: {formatDate(law.시행일자)}
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLawBookmark(law.id);
                        }}
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </Button>
                    </div>
                    
                    {/* 태그 표시 */}
                    {law.tags && law.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {law.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* 메모 표시 */}
                    {law.notes && (
                      <div className="text-xs text-gray-600 italic">
                        {law.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};