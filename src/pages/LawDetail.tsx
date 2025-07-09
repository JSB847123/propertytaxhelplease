import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { LawDetailContent } from "@/components/law/LawDetailContent";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { LawData, PrecedentData } from "@/lib/xmlParser";

const LawDetail = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  
  const item = location.state?.item as LawData | PrecedentData;
  
  if (!item || !type || !id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">항목을 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/law-search')}>
              검색으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBookmarked = bookmarks.some(b => b.id === id);
  const isLaw = type === 'law';
  const isPrecedent = type === 'prec';

  const handleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(id);
    } else {
      const title = isLaw 
        ? (item as LawData).lsNm || '제목 없음'
        : (item as PrecedentData).caseNm || '사건명 없음';
      
      addBookmark({
        id,
        type: type as 'law' | 'prec',
        title,
        data: item,
        tags: [],
        notes: ''
      });
    }
  };

  const getTitle = () => {
    if (isLaw) {
      return (item as LawData).lsNm || '법령 제목 없음';
    }
    if (isPrecedent) {
      return (item as PrecedentData).caseNm || '사건명 없음';
    }
    return '상세 정보';
  };

  const getSubtitle = () => {
    if (isLaw) {
      const lawItem = item as LawData;
      return `${lawItem.lsId || ''} | ${lawItem.promulgationDt || ''}`;
    }
    if (isPrecedent) {
      const precItem = item as PrecedentData;
      return `${precItem.caseNo || ''} | ${precItem.courtName || ''}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/law-search')}
                className="flex items-center gap-2 mt-1"
              >
                <ArrowLeft className="h-4 w-4" />
                검색으로
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={isLaw ? "default" : "secondary"}>
                    {isLaw ? "법령" : "판례"}
                  </Badge>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground line-clamp-2">
                    {getTitle()}
                  </h1>
                </div>
                {getSubtitle() && (
                  <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className="flex items-center gap-2"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isBookmarked ? "북마크됨" : "북마크"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(window.location.href, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">새 탭</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LawDetailContent 
          item={item} 
          type={type as 'law' | 'prec'} 
        />
      </div>
    </div>
  );
};

export default LawDetail;