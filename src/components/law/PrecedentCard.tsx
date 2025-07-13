import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye } from "lucide-react";
import PrecedentDetail from "../PrecedentDetail";

interface PrecedentCardProps {
  data: any;
}

export const PrecedentCard = ({ data }: PrecedentCardProps) => {
  // 판례 정보 추출 및 디버깅
  console.log('PrecedentCard 데이터:', data);
  console.log('원본 데이터 키들:', Object.keys(data));
  
  // 판례일련번호 추출 - 다양한 경로에서 시도
  let precedentId = '';
  
  // 1순위: 원본데이터에서 판례일련번호
  if (data.원본데이터?.판례일련번호) {
    precedentId = data.원본데이터.판례일련번호;
    console.log('원본데이터에서 판례일련번호 추출:', precedentId);
  }
  // 2순위: 직접 필드에서 판례정보일련번호
  else if (data.판례정보일련번호) {
    precedentId = data.판례정보일련번호;
    console.log('판례정보일련번호 필드에서 추출:', precedentId);
  }
  // 3순위: 판례일련번호 필드
  else if (data.판례일련번호) {
    precedentId = data.판례일련번호;
    console.log('판례일련번호 필드에서 추출:', precedentId);
  }
  // 4순위: 원본데이터의 다른 필드들 확인
  else if (data.원본데이터) {
    console.log('원본데이터 내용:', data.원본데이터);
    // 가능한 모든 필드명 확인
    const possibleFields = ['판례일련번호', 'precSeq', 'precedentSeq', 'id'];
    for (const field of possibleFields) {
      if (data.원본데이터[field]) {
        precedentId = data.원본데이터[field];
        console.log(`원본데이터.${field}에서 추출:`, precedentId);
        break;
      }
    }
  }
  
  // 마지막 수단: 사건번호 사용
  if (!precedentId) {
    precedentId = data.사건번호 || '';
    console.log('사건번호 사용:', precedentId);
  }
  
  const precedentName = data.사건명 || data.판례명 || '';
  const court = data.법원명 || '';
  const date = data.선고일자 || '';
  const summary = data.판시사항 || data.요약 || '';
  
  console.log('최종 추출된 판례 ID:', precedentId, '타입:', typeof precedentId);

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