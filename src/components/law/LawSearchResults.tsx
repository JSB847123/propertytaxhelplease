import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { ExternalLink, FileText, Scale, Star } from "lucide-react";
import type { LawData, PrecedentData } from "@/lib/xmlParser";
import type { APIError } from "@/lib/apiClient";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/hooks/use-toast";
import PrecedentDetail from "../PrecedentDetail";
import { useState } from "react";

interface LawSearchResultsProps {
  data: LawData[] | PrecedentData[] | null;
  isLoading: boolean;
  error: APIError | null;
  searchType: 'law' | 'prec';
  onItemClick: (item: LawData | PrecedentData) => void;
  onRetry: () => void;
}

export const LawSearchResults = ({
  data,
  isLoading,
  error,
  searchType,
  onItemClick,
  onRetry
}: LawSearchResultsProps) => {
  if (isLoading) {
    return (
      <LoadingSpinner 
        type={searchType === 'law' ? 'law' : 'precedent'}
        message={`${searchType === 'law' ? '법령' : '판례'}을 검색하고 있습니다...`}
      />
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={onRetry}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mb-4">
            {searchType === 'law' ? (
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            ) : (
              <Scale className="h-12 w-12 mx-auto text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground">
            검색 결과가 없습니다. 다른 검색어를 시도해보세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {searchType === 'law' ? (
              <FileText className="h-5 w-5" />
            ) : (
              <Scale className="h-5 w-5" />
            )}
            검색 결과 ({data.length}건)
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {data.map((item, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onItemClick(item)}
          >
            <CardContent className="p-4">
              {searchType === 'law' ? (
                <LawResultCard item={item as LawData} />
              ) : (
                <PrecedentResultCard item={item as PrecedentData} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const LawResultCard = ({ item }: { item: LawData }) => {
  const { isLawBookmarked, addLawBookmark, removeLawBookmarkByLawId } = useBookmarks();
  const { toast } = useToast();
  
  const isBookmarked = isLawBookmarked(item.lsId || "");

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isBookmarked) {
      removeLawBookmarkByLawId(item.lsId || "");
      toast({
        title: "즐겨찾기 삭제",
        description: "법령이 즐겨찾기에서 제거되었습니다.",
      });
    } else {
      // 법령 데이터를 올바른 형식으로 변환
      const lawData = {
        법령명한글: item.lsNm || "제목 없음",
        법령구분명: "법령",
        소관부처명: "",
        공포일자: item.promulgationDt || "",
        시행일자: "",
        법령상세링크: "",
        법령약칭명: "",
        제개정구분명: "",
        법령ID: item.lsId || ""
      };
      addLawBookmark(lawData, [], undefined);
      toast({
        title: "즐겨찾기 추가",
        description: "법령이 즐겨찾기에 추가되었습니다.",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2">
            {item.lsNm || '제목 없음'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {item.lsId || 'ID 없음'}
            </Badge>
            {item.promulgationDt && (
              <span className="text-xs text-muted-foreground">
                {item.promulgationDt}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkClick}
            className={isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}
          >
            <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {item.lsRsnCn && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.lsRsnCn}
        </p>
      )}
    </div>
  );
};

const PrecedentResultCard = ({ item }: { item: PrecedentData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 상위 Card의 onClick 이벤트 전파 방지
    setIsModalOpen(true);
  };

  // 판례 ID 추출 - 다양한 필드에서 시도
  const getPrecedentId = () => {
    return item.판례정보일련번호 || item.caseNo || item.사건번호 || "";
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 
              className="font-semibold text-foreground line-clamp-2 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
              onClick={handleTitleClick}
            >
              {item.caseNm || item.사건명 || '사건명 없음'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {item.caseNo || item.사건번호 || '사건번호 없음'}
              </Badge>
              {(item.judmnAdjuDt || item.선고일자) && (
                <span className="text-xs text-muted-foreground">
                  {item.judmnAdjuDt || item.선고일자}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {(item.courtName || item.법원명) && (
            <span>{item.courtName || item.법원명}</span>
          )}
          {(item.judmnAdjuDeclCd || item.판결형태) && (
            <Badge variant="secondary" className="text-xs">
              {item.judmnAdjuDeclCd || item.판결형태}
            </Badge>
          )}
        </div>
      </div>

      {/* PrecedentDetail 모달 */}
      <PrecedentDetail 
        precedentId={getPrecedentId()}
        precedentName={item.caseNm || item.사건명 || '사건명 없음'}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        trigger={<span style={{ display: 'none' }} />}
      />
    </>
  );
};