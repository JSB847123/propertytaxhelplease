import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

export interface LawData {
  법령명?: string;
  법령ID?: string;
  공포일자?: string;
  시행일자?: string;
  소관부처?: string;
  개정일자?: string;
  폐지일자?: string;
  제정일자?: string;
}

interface LawCardProps {
  data: LawData;
  searchTerm?: string;
  onClick?: (data: LawData) => void;
  onBookmark?: (data: LawData, isBookmarked: boolean) => void;
  className?: string;
}

export const LawCard = ({ 
  data, 
  searchTerm, 
  onClick, 
  onBookmark,
  className = "" 
}: LawCardProps) => {
  const { 
    isLawBookmarked, 
    addLawBookmark, 
    removeLawBookmarkByLawId 
  } = useBookmarks();
  
  const isBookmarked = isLawBookmarked(data.법령ID || "");

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isBookmarked) {
      removeLawBookmarkByLawId(data.법령ID || "");
    } else {
      // 법령 데이터를 올바른 형식으로 변환
      const lawData = {
        법령명한글: data.법령명 || "제목 없음",
        법령구분명: "법령", // 기본값
        소관부처명: data.소관부처 || "",
        공포일자: data.공포일자 || "",
        시행일자: data.시행일자 || "",
        법령상세링크: "", // 기본값
        법령약칭명: "",
        제개정구분명: "",
        법령ID: data.법령ID || ""
      };
      addLawBookmark(lawData, [], undefined);
    }
    
    onBookmark?.(data, !isBookmarked);
  };

  const handleCardClick = () => {
    onClick?.(data);
  };

  const highlightText = (text: string, searchTerm?: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 cursor-pointer hover-scale group ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="text-xs">
                법령
              </Badge>
              {data.폐지일자 && (
                <Badge variant="destructive" className="text-xs">
                  폐지
                </Badge>
              )}
            </div>
            <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {highlightText(data.법령명 || "제목 없음", searchTerm)}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              className={`transition-colors ${
                isBookmarked 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* 날짜 정보 */}
        <div className="space-y-2 text-sm">
          {data.공포일자 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">공포일자:</span>
              <span className="text-foreground">{data.공포일자}</span>
            </div>
          )}
          
          {data.시행일자 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">시행일자:</span>
              <span className="text-foreground">{data.시행일자}</span>
            </div>
          )}
          
          {data.개정일자 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">개정일자:</span>
              <span className="text-foreground">{data.개정일자}</span>
            </div>
          )}
          
          {data.폐지일자 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-destructive flex-shrink-0" />
              <span className="text-muted-foreground">폐지일자:</span>
              <span className="text-destructive">{data.폐지일자}</span>
            </div>
          )}
        </div>

        {/* 소관부처 */}
        {data.소관부처 && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">소관부처:</span>
            <span className="text-foreground font-medium">{data.소관부처}</span>
          </div>
        )}

        {/* 법령 ID */}
        {data.법령ID && (
          <div className="text-xs text-muted-foreground border-t pt-2 mt-3">
            법령ID: {data.법령ID}
          </div>
        )}
      </CardContent>
    </Card>
  );
};