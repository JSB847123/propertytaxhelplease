import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, Gavel, AlertCircle, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type?: "no-search" | "no-results" | "error" | "no-bookmarks";
  searchType?: "law" | "prec";
  searchTerm?: string;
  onRetry?: () => void;
  onClearSearch?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

const SEARCH_SUGGESTIONS = {
  law: [
    "재산세", "지방세", "소득세", "부가가치세", "상속세",
    "민법", "상법", "행정법", "환경법", "건축법"
  ],
  prec: [
    "손해배상", "계약해지", "소유권", "임대차", "상속분할",
    "불법행위", "매매계약", "근로계약", "이혼", "친권"
  ]
};

export const EmptyState = ({
  type = "no-search",
  searchType = "law",
  searchTerm,
  onRetry,
  onClearSearch,
  onSuggestionClick,
  className
}: EmptyStateProps) => {
  const getIcon = () => {
    switch (type) {
      case "no-results":
        return <Search className="h-16 w-16 text-muted-foreground" />;
      case "error":
        return <AlertCircle className="h-16 w-16 text-destructive" />;
      case "no-bookmarks":
        return <BookOpen className="h-16 w-16 text-muted-foreground" />;
      default:
        return searchType === "law" 
          ? <FileText className="h-16 w-16 text-muted-foreground" />
          : <Gavel className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "no-results":
        return "검색 결과가 없습니다";
      case "error":
        return "검색 중 오류가 발생했습니다";
      case "no-bookmarks":
        return "저장된 북마크가 없습니다";
      default:
        return "검색어를 입력하고 검색해보세요";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "no-results":
        return searchTerm 
          ? `"${searchTerm}"에 대한 ${searchType === "law" ? "법령" : "판례"}를 찾을 수 없습니다`
          : `${searchType === "law" ? "법령" : "판례"} 검색 결과가 없습니다`;
      case "error":
        return "네트워크 연결을 확인하고 다시 시도해주세요";
      case "no-bookmarks":
        return "관심 있는 법령이나 판례를 북마크해보세요";
      default:
        return `${searchType === "law" ? "법령" : "판례"}을 검색할 수 있습니다`;
    }
  };

  const suggestions = SEARCH_SUGGESTIONS[searchType];

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="py-12 text-center space-y-6">
        {/* 아이콘 */}
        <div className="flex justify-center">
          {getIcon()}
        </div>

        {/* 텍스트 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {getTitle()}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {getDescription()}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {type === "error" && onRetry && (
            <Button onClick={onRetry} variant="default">
              다시 시도
            </Button>
          )}
          
          {type === "no-results" && onClearSearch && (
            <Button onClick={onClearSearch} variant="outline">
              검색 조건 초기화
            </Button>
          )}
          
          {type === "no-search" && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              검색 팁: 키워드를 간단히 입력해보세요
            </div>
          )}
        </div>

        {/* 추천 검색어 */}
        {(type === "no-search" || type === "no-results") && onSuggestionClick && (
          <div className="space-y-3 max-w-lg mx-auto">
            <div className="text-sm font-medium text-muted-foreground">
              {type === "no-results" ? "다른 검색어를 시도해보세요" : "추천 검색어"}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.slice(0, 6).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSuggestionClick(suggestion)}
                  className="text-xs border border-border hover:border-primary hover:text-primary transition-colors"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 통계 정보 (no-search일 때) */}
        {type === "no-search" && (
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-center pt-4 border-t">
            <div>
              <div className="text-2xl font-bold text-primary">50,000+</div>
              <div className="text-xs text-muted-foreground">현행 법령</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">1,000,000+</div>
              <div className="text-xs text-muted-foreground">판례 정보</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};