import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Building2, FileText, Gavel } from "lucide-react";
import type { LawData, PrecedentData } from "@/lib/xmlParser";

interface LawDetailContentProps {
  item: LawData | PrecedentData;
  type: 'law' | 'prec';
}

export const LawDetailContent = ({ item, type }: LawDetailContentProps) => {
  if (type === 'law') {
    return <LawContent item={item as LawData} />;
  } else {
    return <PrecedentContent item={item as PrecedentData} />;
  }
};

const LawContent = ({ item }: { item: LawData }) => (
  <div className="space-y-6">
    {/* Basic Information */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          기본 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">법령 ID</dt>
            <dd className="text-sm">{item.lsId || '정보 없음'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">공포일자</dt>
            <dd className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {item.promulgationDt || '정보 없음'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">소관부처</dt>
            <dd className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {item.admstNm || '정보 없음'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">법령종류</dt>
            <dd>
              <Badge variant="secondary">
                {item.lsTypeCd || '정보 없음'}
              </Badge>
            </dd>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Enactment Reason */}
    {item.lsRsnCn && (
      <Card>
        <CardHeader>
          <CardTitle>제정·개정 이유</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {item.lsRsnCn}
          </p>
        </CardContent>
      </Card>
    )}

    {/* Additional Information */}
    <Card>
      <CardHeader>
        <CardTitle>상세 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.enfcDt && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">시행일자</dt>
            <dd className="text-sm">{item.enfcDt}</dd>
          </div>
        )}
        
        <Separator />
        
        <div className="text-xs text-muted-foreground">
          법제처 Open API를 통해 제공되는 정보입니다.
        </div>
      </CardContent>
    </Card>
  </div>
);

const PrecedentContent = ({ item }: { item: PrecedentData }) => (
  <div className="space-y-6">
    {/* Basic Information */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          기본 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">사건번호</dt>
            <dd className="text-sm">{item.caseNo || '정보 없음'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">선고일자</dt>
            <dd className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {item.judmnAdjuDt || '정보 없음'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">법원명</dt>
            <dd className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {item.courtName || '정보 없음'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">판결유형</dt>
            <dd>
              <Badge variant="secondary">
                {item.judmnAdjuDeclCd || '정보 없음'}
              </Badge>
            </dd>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Case Summary */}
    {item.abstrct && (
      <Card>
        <CardHeader>
          <CardTitle>판례요약</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {item.abstrct}
          </p>
        </CardContent>
      </Card>
    )}

    {/* Reference Information */}
    {item.refrnc && (
      <Card>
        <CardHeader>
          <CardTitle>참조조문</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            {item.refrnc}
          </p>
        </CardContent>
      </Card>
    )}

    {/* Additional Information */}
    <Card>
      <CardHeader>
        <CardTitle>상세 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.judmnAdjuGbnCd && (
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">심급구분</dt>
            <dd className="text-sm">{item.judmnAdjuGbnCd}</dd>
          </div>
        )}
        
        <Separator />
        
        <div className="text-xs text-muted-foreground">
          법제처 Open API를 통해 제공되는 정보입니다.
        </div>
      </CardContent>
    </Card>
  </div>
);