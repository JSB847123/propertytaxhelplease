import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Bookmark, BookmarkCheck, AlertCircle } from "lucide-react";

interface LawDetailData {
  법령명?: string;
  공포일자?: string;
  시행일자?: string;
  소관부처?: string;
  조문내용?: string;
  본문?: string;
}

interface PrecedentDetailData {
  사건명?: string;
  사건번호?: string;
  선고일자?: string;
  법원명?: string;
  판결요지?: string;
  전문?: string;
  본문?: string;
}

const LawDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const target = searchParams.get("target"); // lawview 또는 precview
  
  // 상세 정보 조회 API 호출
  const { data: detailData, isLoading, error, refetch } = useQuery({
    queryKey: ['lawDetail', id, target],
    queryFn: async () => {
      if (!id || !target) throw new Error("필수 파라미터가 없습니다");

      const response = await fetch(`https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/law-search?id=${encodeURIComponent(id)}&target=${target}`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
          'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBmbmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
        }
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!id && !!target,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });

  const isLaw = target === 'lawview';
  const isPrecedent = target === 'precview';

  // 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  // 본문 포맷팅 함수
  const formatContent = (content: string) => {
    if (!content) return null;

    // 조문 번호 및 항목 포맷팅
    const formattedContent = content
      // 조문 번호 굵게 (제1조, 제2조 등)
      .replace(/(제\d+조(?:의\d+)?)/g, '<strong class="text-lg font-bold text-primary mb-2 block">$1</strong>')
      // 항목 번호 굵게 (①, ②, 1., 2. 등)
      .replace(/(①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/(\d+\.\s)/g, '<strong class="font-semibold text-foreground">$1</strong>')
      // 호 번호 처리 (1호, 2호 등)
      .replace(/(\d+호)/g, '<span class="font-medium">$1</span>')
      // 목 번호 처리 (가목, 나목 등)
      .replace(/([가-힣]목)/g, '<span class="font-medium">$1</span>')
      // 단락 구분
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');

    return (
      <div 
        className="prose prose-slate max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: `<p class="mb-4">${formattedContent}</p>` 
        }}
      />
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">
                  {isLaw ? '법령' : '판례'} 상세 정보를 불러오고 있습니다...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !detailData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <AlertCircle className="h-16 w-16 text-destructive" />
                <div>
                  <h3 className="text-lg font-semibold text-destructive mb-2">
                    상세 정보를 불러올 수 없습니다
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    잠시 후 다시 시도해주세요
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                      다시 시도
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="outline" size="sm">
                      뒤로가기
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 데이터 파싱
  let parsedData: LawDetailData | PrecedentDetailData = {};
  if (detailData?.success && detailData?.data) {
    parsedData = detailData.data;
  }

  const getTitle = () => {
    if (isLaw) {
      return (parsedData as LawDetailData).법령명 || "법령명 없음";
    }
    return (parsedData as PrecedentDetailData).사건명 || "사건명 없음";
  };

  const getContent = () => {
    if (isLaw) {
      const lawData = parsedData as LawDetailData;
      return lawData.조문내용 || lawData.본문 || "내용이 없습니다.";
    }
    const precData = parsedData as PrecedentDetailData;
    return precData.판결요지 || precData.전문 || precData.본문 || "내용이 없습니다.";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:break-before { page-break-before: always; }
          .print\\:break-after { page-break-after: always; }
          .print\\:no-break { page-break-inside: avoid; }
          .max-w-4xl { max-width: 100% !important; }
          .px-4, .px-6, .px-8 { padding-left: 0 !important; padding-right: 0 !important; }
          .py-4, .py-6, .py-8 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .shadow-sm, .border-b, .border { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-card shadow-sm border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
              <Badge variant={isLaw ? "default" : "secondary"}>
                {isLaw ? "법령" : "판례"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                인쇄
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-4">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:pb-4">
            <div className="text-center space-y-4">
              <CardTitle className="text-2xl md:text-3xl font-bold text-center leading-tight print:text-xl">
                {getTitle()}
              </CardTitle>
              
              {isLaw && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(parsedData as LawDetailData).공포일자 && (
                    <p>공포일자: {(parsedData as LawDetailData).공포일자}</p>
                  )}
                  {(parsedData as LawDetailData).시행일자 && (
                    <p>시행일자: {(parsedData as LawDetailData).시행일자}</p>
                  )}
                  {(parsedData as LawDetailData).소관부처 && (
                    <p>소관부처: {(parsedData as LawDetailData).소관부처}</p>
                  )}
                </div>
              )}
              
              {isPrecedent && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  {(parsedData as PrecedentDetailData).사건번호 && (
                    <p>사건번호: {(parsedData as PrecedentDetailData).사건번호}</p>
                  )}
                  {(parsedData as PrecedentDetailData).선고일자 && (
                    <p>선고일자: {(parsedData as PrecedentDetailData).선고일자}</p>
                  )}
                  {(parsedData as PrecedentDetailData).법원명 && (
                    <p>법원명: {(parsedData as PrecedentDetailData).법원명}</p>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <Separator className="print:hidden" />
          
          <CardContent className="p-8 print:p-4">
            <div className="prose prose-slate max-w-none print:prose-sm">
              <div className="text-base leading-relaxed space-y-6 print:space-y-4 print:text-sm print:leading-normal">
                {formatContent(getContent())}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LawDetail;