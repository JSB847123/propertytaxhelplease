import { PrecedentCard } from "./PrecedentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search, FileText } from "lucide-react";
import type { PrecedentData } from "@/lib/xmlParser";

interface PrecedentListProps {
  precedents: PrecedentData[];
  isLoading?: boolean;
  error?: string;
  searchTerm?: string;
}

export const PrecedentList = ({ 
  precedents, 
  isLoading = false, 
  error,
  searchTerm 
}: PrecedentListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-5 w-5 animate-spin" />
            <span>판례를 검색하고 있습니다...</span>
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

  if (precedents.length === 0) {
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
                <p>판례를 검색해보세요</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            판례 검색 결과 ({precedents.length}건)
          </CardTitle>
        </CardHeader>
      </Card>
      
      {precedents.map((precedent, index) => (
        <PrecedentCard
          key={`${precedent.caseNo || index}-${index}`}
          caseTitle={precedent.caseNm || ''}
          caseNumber={precedent.caseNo || ''}
          judgmentDate={precedent.judmnAdjuDt || ''}
          courtName={precedent.courtName || ''}
          judgmentType={precedent.judmnAdjuDeclCd || ''}
          caseContent={precedent.abstrct}
        />
      ))}
    </div>
  );
};

