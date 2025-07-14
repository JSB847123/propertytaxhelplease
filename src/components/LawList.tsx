import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search, FileText, ExternalLink, Calendar, Building, Star } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/hooks/use-toast";
import type { LawData } from "@/lib/xmlParser";

interface LawListProps {
  laws: LawData[];
  isLoading?: boolean;
  error?: string;
  searchTerm?: string;
}

interface LawItem {
  법령명한글: string;
  법령구분명: string;
  소관부처명: string;
  공포일자: string;
  시행일자: string;
  법령상세링크: string;
  법령약칭명?: string;
  제개정구분명: string;
  법령ID: string;
  id: string;
}

export const LawList = ({ 
  laws, 
  isLoading = false, 
  error,
  searchTerm 
}: LawListProps) => {
  const { toast } = useToast();
  const { 
    isLawBookmarked, 
    addLawBookmark, 
    removeLawBookmarkByLawId 
  } = useBookmarks();
  

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-5 w-5 animate-spin" />
            <span>법령을 검색하고 있습니다...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>검색 중 오류가 발생했습니다: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (laws.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            {searchTerm ? (
              <>
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium">검색 결과가 없습니다</p>
                <p className="text-sm">다른 검색어로 다시 시도해보세요</p>
              </>
            ) : (
              <>
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>법령을 검색해보세요</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLawClick = (law: LawItem) => {
    if (law.법령상세링크) {
      // 법제처 상세 링크로 새 창에서 열기
      const fullUrl = `https://www.law.go.kr${law.법령상세링크}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBookmarkClick = (law: LawItem) => {
    if (isLawBookmarked(law.법령ID)) {
      removeLawBookmarkByLawId(law.법령ID);
      toast({
        title: "즐겨찾기 삭제",
        description: "법령이 즐겨찾기에서 제거되었습니다.",
      });
    } else {
      // 대화상자 없이 바로 즐겨찾기에 추가
      addLawBookmark(law, [], undefined);
      toast({
        title: "즐겨찾기 추가",
        description: "법령이 즐겨찾기에 추가되었습니다.",
      });
    }
  };



  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
  };

  const getLawTypeBadgeColor = (type: string) => {
    switch (type) {
      case '법률': return 'default';
      case '대통령령': return 'secondary';
      case '총리령':
      case '부령': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            법령 검색 결과 ({laws.length}건)
          </CardTitle>
        </CardHeader>
      </Card>
      
      {laws.map((law, index) => {
        const lawItem = law as unknown as LawItem;
        return (
          <Card key={`${lawItem.법령ID || lawItem.id || index}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* 법령명과 약칭 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 
                      className="text-lg font-semibold text-foreground mb-2 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                      onClick={() => handleLawClick(lawItem)}
                    >
                      {lawItem.법령명한글}
                    </h3>
                    {lawItem.법령약칭명 && (
                      <p className="text-sm text-muted-foreground">
                        약칭: {lawItem.법령약칭명}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmarkClick(lawItem)}
                    className={`h-8 w-8 p-0 ml-2 ${
                      isLawBookmarked(lawItem.법령ID) 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        isLawBookmarked(lawItem.법령ID) ? 'fill-current' : ''
                      }`} 
                    />
                  </Button>
                </div>

                {/* 법령 정보 배지들 */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getLawTypeBadgeColor(lawItem.법령구분명)}>
                    {lawItem.법령구분명}
                  </Badge>
                  <Badge variant="outline">
                    <Building className="h-3 w-3 mr-1" />
                    {lawItem.소관부처명}
                  </Badge>
                  <Badge variant="outline">
                    {lawItem.제개정구분명}
                  </Badge>
                </div>

                {/* 날짜 정보 */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>공포: {formatDate(lawItem.공포일자)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>시행: {formatDate(lawItem.시행일자)}</span>
                  </div>
                </div>

                {/* 상세보기 버튼 */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleLawClick(lawItem)}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    법령 상세보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}


    </div>
  );
};