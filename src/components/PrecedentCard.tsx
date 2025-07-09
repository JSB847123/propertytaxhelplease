import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Scale, Building2 } from "lucide-react";

interface PrecedentCardProps {
  caseTitle: string;
  caseNumber: string;
  judgmentDate: string;
  courtName: string;
  judgmentType: string;
  caseContent?: string;
}

export const PrecedentCard = ({
  caseTitle,
  caseNumber,
  judgmentDate,
  courtName,
  judgmentType,
  caseContent
}: PrecedentCardProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    // YYYYMMDD 형태를 YYYY-MM-DD로 변환
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    }
    return dateString;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight pr-4">
            {caseTitle}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
            <Scale className="h-3 w-3" />
            {judgmentType}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">사건번호:</span>
            <span>{caseNumber}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">선고일자:</span>
            <span>{formatDate(judgmentDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 md:col-span-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">법원명:</span>
            <span>{courtName}</span>
          </div>
        </div>
        
        {caseContent && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {caseContent}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};