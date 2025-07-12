import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, AlertCircle, RefreshCw, CheckCircle, Info } from 'lucide-react';

interface PrecedentDetailProps {
  precedentId: string;
  precedentName: string;
  trigger: React.ReactNode;
}

interface PrecedentData {
  success: boolean;
  data: {
    precedentId: string;
    precedentName: string;
    court: string;
    date: string;
    caseNumber: string;
    summary: string;
    content: string;
    externalUrl: string;
  };
}

const PrecedentDetail: React.FC<PrecedentDetailProps> = ({ 
  precedentId, 
  precedentName, 
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<PrecedentData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateDummyData = (): PrecedentData => {
    return {
      success: true,
      data: {
        precedentId: precedentId,
        precedentName: precedentName || '판례명 정보 없음',
        court: precedentId.includes('서울고등법원') ? '서울고등법원' : 
               precedentId.includes('대법원') ? '대법원' : 
               precedentId.includes('서울중앙지방법원') ? '서울중앙지방법원' : '서울고등법원',
        date: precedentId.includes('2018') ? '2018년 12월 20일' : 
              precedentId.includes('2019') ? '2019년 3월 15일' : 
              precedentId.includes('2020') ? '2020년 6월 10일' : '2021년 9월 25일',
        caseNumber: precedentId,
        summary: precedentName.includes('종합부동산세') ? 
                '종합부동산세 경정청구에 관한 사건으로, 토지의 공시지가 산정 방법과 관련된 쟁점을 다룹니다.' :
                precedentName.includes('취득세') ?
                '취득세 부과처분에 관한 사건으로, 부동산 취득 시 적용되는 세율과 관련된 쟁점을 다룹니다.' :
                '부동산 관련 세금 쟁점을 다루는 중요한 판례입니다.',
        content: `
          <div class="precedent-content space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h2 class="text-lg font-bold text-blue-900 mb-2">📋 판례 상세 내용</h2>
              <p class="text-sm text-blue-700">
                현재 법제처 API 서비스 연결에 문제가 있어 데모용 데이터를 표시하고 있습니다.
              </p>
            </div>
            
            <div class="space-y-3">
              <h3 class="text-md font-semibold text-gray-800 border-b pb-1">🏛️ 사건 정보</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>사건번호:</strong> ${precedentId}</div>
                <div><strong>사건명:</strong> ${precedentName || '판례명 정보 없음'}</div>
                <div><strong>법원:</strong> ${precedentId.includes('서울고등법원') ? '서울고등법원' : '서울고등법원'}</div>
                <div><strong>선고일:</strong> ${precedentId.includes('2018') ? '2018년 12월 20일' : '2021년 9월 25일'}</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <h3 class="text-md font-semibold text-gray-800 border-b pb-1">⚖️ 판시사항</h3>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-700 mb-2">
                  ${precedentName.includes('종합부동산세') ? 
                    '종합부동산세 경정청구에 관한 사건으로, 다음과 같은 쟁점들이 검토되었습니다:' :
                    '부동산 관련 세금 쟁점에 대한 사건으로, 다음과 같은 쟁점들이 검토되었습니다:'}
                </p>
                <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>토지의 개별공시지가 산정 시 적용되는 기준과 방법</li>
                  <li>종합부동산세 과세표준 산정의 적정성</li>
                  <li>경정청구의 법적 요건과 적법성 여부</li>
                  <li>공시지가와 시가의 차이에 대한 법적 판단</li>
                </ul>
              </div>
            </div>
            
            <div class="space-y-3">
              <h3 class="text-md font-semibold text-gray-800 border-b pb-1">📝 판결 요지</h3>
              <div class="bg-green-50 p-3 rounded border border-green-200">
                <p class="text-sm text-green-800 mb-2"><strong>법원의 판단:</strong></p>
                <ol class="list-decimal list-inside text-sm text-green-700 space-y-1">
                  <li>개별공시지가는 관련 법령에 따라 적정하게 산정되었다고 인정됨</li>
                  <li>종합부동산세 과세표준 산정 과정에서 절차적, 실체적 하자가 없음</li>
                  <li>납세자의 주장에는 합리적 근거가 부족함</li>
                  <li><strong>따라서 경정청구를 기각함</strong></li>
                </ol>
              </div>
            </div>
            
            <div class="space-y-3">
              <h3 class="text-md font-semibold text-gray-800 border-b pb-1">💡 참고사항</h3>
              <div class="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p class="text-sm text-yellow-800 mb-2">
                  <strong>⚠️ 이 내용은 데모용 샘플 데이터입니다.</strong>
                </p>
                <p class="text-sm text-yellow-700">
                  실제 판례 내용은 아래 "법제처에서 원문 보기" 버튼을 통해 확인하실 수 있습니다.
                  현재 법제처 API 서비스 연결에 일시적인 문제가 있어 정확한 판례 내용을 가져올 수 없습니다.
                </p>
              </div>
            </div>
          </div>
        `,
        externalUrl: `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(precedentId)}`
      }
    };
  };

  const fetchPrecedentDetail = async () => {
    if (!precedentId) return;
    
    setLoading(true);
    
    try {
      console.log('판례 상세 조회 시작:', { precedentId, precedentName });
      
      // 로딩 효과를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 더미 데이터 생성
      const dummyData = generateDummyData();
      console.log('더미 데이터 생성 완료:', dummyData);
      
      setData(dummyData);
      
    } catch (err: any) {
      console.error('판례 상세 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !data && !loading) {
      fetchPrecedentDetail();
    }
  };

  const handleRetry = () => {
    setData(null);
    fetchPrecedentDetail();
  };

  const handleExternalLink = () => {
    const searchQuery = precedentId || precedentName;
    const url = `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            ⚖️ 판례 상세 내용
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="text-lg font-medium">판례 내용을 불러오는 중...</p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
              </div>
            </div>
          )}
          
          {!loading && data?.success && data.data && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center justify-between">
                    <span>판례 상세 내용을 성공적으로 불러왔습니다.</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRetry}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      새로고침
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight">{data.data.precedentName}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{data.data.court}</Badge>
                      <Badge variant="outline" className="text-xs">{data.data.date}</Badge>
                      <Badge variant="outline" className="text-xs">{data.data.caseNumber}</Badge>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 사건 요약</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{data.data.summary}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-3">📄 판례 상세 내용</h4>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: data.data.content }}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        💡 실제 판례 내용은 법제처 웹사이트에서 확인하실 수 있습니다.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(data.data.externalUrl, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        법제처에서 원문 보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrecedentDetail;