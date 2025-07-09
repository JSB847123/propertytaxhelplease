import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Gavel, FileText, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

export interface PrecedentData {
  사건명?: string;
  판례정보일련번호?: string;
  사건번호?: string;
  선고일자?: string;
  법원명?: string;
  사건종류?: string;
  사건종류명?: string;
  판결형태?: string;
  판시사항?: string;
  판결요지?: string;
  참조조문?: string;
  참조판례?: string;
}

interface PrecedentCardProps {
  data: PrecedentData;
  searchTerm?: string;
  onClick?: (data: PrecedentData) => void;
  onBookmark?: (data: PrecedentData, isBookmarked: boolean) => void;
  className?: string;
}

export const PrecedentCard = ({ 
  data, 
  searchTerm, 
  onClick, 
  onBookmark,
  className = "" 
}: PrecedentCardProps) => {
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const isBookmarked = bookmarks.some(b => b.id === data.판례정보일련번호);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isBookmarked) {
      removeBookmark(data.판례정보일련번호|| "");
    } else {
      addBookmark({
        id: data.판례정보일련번호 || "",
        type: "prec",
        title: data.사건명 || "사건명 없음",
        data: data,
        tags: [],
        notes: ""
      });
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

  const getCourtBadgeVariant = (court?: string) => {
    if (!court) return "secondary";
    if (court.includes("대법원")) return "default";
    if (court.includes("고등법원")) return "secondary";
    if (court.includes("특허법원")) return "outline";
    return "secondary";
  };

  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 cursor-pointer hover-scale group ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                판례
              </Badge>
              {data.법원명 && (
                <Badge variant={getCourtBadgeVariant(data.법원명)} className="text-xs">
                  {data.법원명}
                </Badge>
              )}
              {data.사건종류명 && (
                <Badge variant="outline" className="text-xs">
                  {data.사건종류명}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {highlightText(data.사건명 || "사건명 없음", searchTerm)}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* 기본 정보 */}
        <div className="space-y-2 text-sm">
          {data.사건번호 && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">사건번호:</span>
              <span className="text-foreground font-mono text-xs">{data.사건번호}</span>
            </div>
          )}
          
          {data.선고일자 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">선고일자:</span>
              <span className="text-foreground">{data.선고일자}</span>
            </div>
          )}
          
          {data.법원명 && (
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">법원명:</span>
              <span className="text-foreground font-medium">{data.법원명}</span>
            </div>
          )}
        </div>

        {/* 판시사항 */}
        {data.판시사항 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">판시사항</div>
            <div className="text-sm text-foreground leading-relaxed line-clamp-2">
              {highlightText(data.판시사항, searchTerm)}
            </div>
          </div>
        )}

        {/* 판결요지 */}
        {data.판결요지 && !data.판시사항 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">판결요지</div>
            <div className="text-sm text-foreground leading-relaxed line-clamp-2">
              {highlightText(data.판결요지, searchTerm)}
            </div>
          </div>
        )}

        {/* 참조조문 */}
        {data.참조조문 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">참조조문</div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {data.참조조문}
            </div>
          </div>
        )}

        {/* 판례 정보 일련번호 */}
        {data.판례정보일련번호 && (
          <div className="text-xs text-muted-foreground border-t pt-2 mt-3">
            판례정보일련번호: {data.판례정보일련번호}
          </div>
        )}
      </CardContent>
    </Card>
  );
};