import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye } from "lucide-react";
import PrecedentDetail from "../PrecedentDetail";

interface PrecedentCardProps {
  data: any;
}

export const PrecedentCard = ({ data }: PrecedentCardProps) => {
  // 판례 정보 추출
  const precedentId = data.판례정보일련번호 || data.사건번호 || '';
  const precedentName = data.사건명 || data.판례명 || '';
  const court = data.법원명 || '';
  const date = data.선고일자 || '';
  const summary = data.판시사항 || data.요약 || '';

  // 외부 링크 처리
  const handleExternalLink = () => {
    const searchQuery = precedentId || precedentName;
    const url = `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {precedentName || '판례명 없음'}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {court && <Badge variant="outline">{court}</Badge>}
          {date && <Badge variant="secondary">{date}</Badge>}
          {precedentId && <Badge variant="outline">ID: {precedentId}</Badge>}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {summary && (
            <div>
              <h4 className="font-medium text-sm mb-2">판시사항</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {summary}
              </p>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            {/* 전체 내용 보기 버튼 - precedentId나 사건번호가 있을 때만 표시 */}
            {precedentId && (
              <PrecedentDetail
                precedentId={precedentId}
                precedentName={precedentName}
                trigger={
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    전체 내용 보기
                  </Button>
                }
              />
            )}
            
            {/* 외부 링크 버튼 */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExternalLink}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              법제처에서 보기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};