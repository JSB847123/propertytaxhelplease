import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { ExternalLink, FileText, Scale } from "lucide-react";
import type { LawData, PrecedentData } from "@/lib/xmlParser";
import type { APIError } from "@/lib/apiClient";

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

const LawResultCard = ({ item }: { item: LawData }) => (
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
      <Button variant="ghost" size="sm">
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
    
    {item.lsRsnCn && (
      <p className="text-sm text-muted-foreground line-clamp-2">
        {item.lsRsnCn}
      </p>
    )}
  </div>
);

const PrecedentResultCard = ({ item }: { item: PrecedentData }) => (
  <div className="space-y-2">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2">
          {item.caseNm || '사건명 없음'}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {item.caseNo || '사건번호 없음'}
          </Badge>
          {item.judmnAdjuDt && (
            <span className="text-xs text-muted-foreground">
              {item.judmnAdjuDt}
            </span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
    
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {item.courtName && (
        <span>{item.courtName}</span>
      )}
      {item.judmnAdjuDeclCd && (
        <Badge variant="secondary" className="text-xs">
          {item.judmnAdjuDeclCd}
        </Badge>
      )}
    </div>
  </div>
);