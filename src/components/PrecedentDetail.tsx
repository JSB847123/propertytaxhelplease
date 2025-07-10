import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, ExternalLink, AlertCircle, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrecedentDetailProps {
  precedentId: string;
  precedentName?: string;
  children?: React.ReactNode;
  triggerText?: string;
}

interface PrecedentDetailResponse {
  success: boolean;
  data: {
    htmlContent?: string;
    xmlContent?: string;
    contentType: string;
    extractedInfo?: {
      title?: string;
      resultMsg?: string;
      resultCode?: string;
      precedentId: string;
    };
  };
  meta: {
    precedentId: string;
    precedentName?: string;
    type: string;
    timestamp: string;
  };
  error?: string;
}

export const PrecedentDetail = ({ 
  precedentId, 
  precedentName, 
  children, 
  triggerText = "상세보기" 
}: PrecedentDetailProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [precedentData, setPrecedentData] = useState<PrecedentDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPrecedentDetail = async () => {
    if (!precedentId.trim()) {
      setError('판례 ID가 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrecedentData(null);

    try {
      console.log('판례 상세정보 조회 시작:', precedentId);

      const params = new URLSearchParams({
        id: precedentId.trim(),
        type: 'HTML', // HTML 형식으로 조회하여 가독성 높임
        oc: 'bahnntf'
      });

      if (precedentName) {
        params.append('lm', precedentName);
      }

      const functionUrl = `https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/precedent-detail?${params.toString()}`;
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('판례 상세정보 조회 결과:', data);
      
      if (data.success) {
        setPrecedentData(data);
        toast({
          title: "판례 조회 완료",
          description: `${precedentName || precedentId} 판례 내용을 불러왔습니다.`,
        });
      } else {
        throw new Error(data.error || '판례 조회에 실패했습니다.');
      }

    } catch (err: any) {
      console.error('판례 상세정보 조회 오류:', err);
      const errorMessage = err.message || '판례 상세정보 조회 중 오류가 발생했습니다';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "조회 실패",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !precedentData) {
      fetchPrecedentDetail();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>판례 내용을 불러오고 있습니다...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium mb-2">조회 실패</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPrecedentDetail} variant="outline" size="sm">
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    if (!precedentData) {
      return null;
    }

    return (
      <div className="space-y-4">
        {/* 메타 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              판례 정보
              <Badge variant="outline">
                ID: {precedentData.meta.precedentId}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {precedentData.meta.precedentName && (
              <div>
                <span className="text-sm font-medium">판례명: </span>
                <span className="text-sm">{precedentData.meta.precedentName}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium">응답 형식: </span>
              <Badge variant="secondary">{precedentData.data.contentType.toUpperCase()}</Badge>
            </div>
            {precedentData.data.extractedInfo?.resultMsg && (
              <div>
                <span className="text-sm font-medium">상태: </span>
                <span className="text-sm">{precedentData.data.extractedInfo.resultMsg}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* 판례 내용 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              판례 본문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full">
              {precedentData.data.contentType === 'html' && precedentData.data.htmlContent ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: precedentData.data.htmlContent 
                  }}
                />
              ) : (
                <pre className="text-xs bg-muted/30 p-4 rounded whitespace-pre-wrap">
                  {precedentData.data.xmlContent || JSON.stringify(precedentData.data, null, 2)}
                </pre>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 외부 링크 버튼 */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const url = `http://www.law.go.kr/DRF/lawService.do?OC=bahnntf&target=prec&type=HTML&ID=${precedentId}`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            법제처에서 열기
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            판례 상세보기
            {precedentName && (
              <span className="text-sm font-normal text-muted-foreground">
                - {precedentName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};