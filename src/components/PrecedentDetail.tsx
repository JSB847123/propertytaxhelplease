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
  data?: {
    판례정보일련번호: string;
    사건명: string;
    사건번호: string;
    선고일자: string;
    법원명: string;
    판결유형: string;
    판시사항: string;
    판결요지: string;
    참조조문: string;
    참조판례: string;
    판례내용: string;
    원본HTML?: string;
  };
  error?: string;
  code?: string;
  message?: string;
  details?: {
    externalLink: string;
    suggestedAction: string;
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

  const fetchPrecedentDetail = async () => {
    if (!precedentId) {
      console.error('판례 ID가 없습니다:', { precedentId, precedentName });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('판례 상세 조회 시작:', { precedentId, precedentName });
      
      // 1차 시도: Edge Function을 통해 판례 상세 조회
      const apiUrl = `https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/precedent-detail?ID=${precedentId}${precedentName ? `&LM=${encodeURIComponent(precedentName)}` : ''}`;
      console.log('Edge Function API 호출:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
          'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API 응답 데이터:', result);
        setData(result);
        return;
      }
      
      // Edge Function 실패 시 에러 응답을 JSON으로 파싱 시도
      try {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        if (errorData.success === false) {
          setData(errorData);
          return;
        }
      } catch (parseError) {
        console.error('에러 응답 파싱 실패:', parseError);
      }
      
      // 2차 시도: 직접 법제처 API 호출 (숫자 ID인 경우만)
      const isNumericId = /^\d+$/.test(precedentId);
      if (isNumericId) {
        console.log('2차 시도: 직접 법제처 API 호출');
        await tryDirectLawApiCall(precedentId, precedentName);
        return;
      }
      
      // 3차 시도: 사건번호를 판례일련번호로 변환 후 직접 호출
      console.log('3차 시도: 사건번호 변환 후 직접 호출');
      const convertedId = await tryConvertCaseNumber(precedentId);
      if (convertedId) {
        await tryDirectLawApiCall(convertedId, precedentName);
        return;
      }
      
      throw new Error(`판례를 찾을 수 없습니다: ${precedentId}`);
      
    } catch (err: any) {
      console.error('판례 상세 조회 실패:', err);
      
      // 에러 발생 시 대체 데이터 설정
      setData({
        success: false,
        error: '판례 상세 조회 중 오류가 발생했습니다',
        message: err.message || '알 수 없는 오류가 발생했습니다',
        details: {
          externalLink: `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(precedentId)}`,
          suggestedAction: '법제처 국가법령정보센터에서 직접 조회해보세요'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // 사건번호를 판례일련번호로 변환 시도
  const tryConvertCaseNumber = async (caseNumber: string): Promise<string | null> => {
    try {
      // 하드코딩된 매핑 먼저 확인
      const knownMappings: { [key: string]: string } = {
        '2005두2261': '68257',
        '2014다51015': '228541',
        '2020다296604': '606191',
        '2024다317332': '606173',
        '2023다283401': '605333',
        '2023다318857': '606200' // 임시 매핑
      };
      
      if (knownMappings[caseNumber]) {
        console.log('하드코딩된 매핑 사용:', caseNumber, '->', knownMappings[caseNumber]);
        return knownMappings[caseNumber];
      }
      
      // 고급 검색 API를 통한 변환 시도
      const searchResponse = await fetch(`https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/advanced-precedent-search?keyword=${encodeURIComponent(caseNumber)}&display=10&type=JSON`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdXdhaWZxZ3psd25rdnBubmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjkwMjcsImV4cCI6MjA2NzUwNTAyN30.Grlranxe25fw4tRElDsf399zCfhHtEbxCO5b1coAVMQ'
        }
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const precedentList = searchData.precedentList || [];
        
        for (const prec of precedentList) {
          const foundCaseNumber = prec.사건번호 || prec.원본데이터?.사건번호;
          if (foundCaseNumber === caseNumber) {
            const possibleIds = [
              prec.판례정보일련번호,
              prec.판례일련번호,
              prec.원본데이터?.판례일련번호,
              prec.원본데이터?.판례정보일련번호
            ];
            
            for (const id of possibleIds) {
              if (id && /^\d+$/.test(String(id))) {
                console.log('검색을 통한 변환 성공:', caseNumber, '->', id);
                return String(id);
              }
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('사건번호 변환 실패:', error);
      return null;
    }
  };

  // 직접 법제처 API 호출 시도 (JSONP 방식)
  const tryDirectLawApiCall = async (precedentId: string, precedentName?: string): Promise<void> => {
    try {
      console.log('직접 법제처 API 호출 시도:', precedentId);
      
      // JSONP 콜백을 위한 고유 함수명 생성
      const callbackName = `lawApiCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return new Promise((resolve, reject) => {
        // 타임아웃 설정 (10초)
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('법제처 API 호출 시간 초과'));
        }, 10000);
        
        // 콜백 함수 등록
        (window as any)[callbackName] = (data: any) => {
          cleanup();
          
          try {
            if (data && typeof data === 'object') {
              setData({
                success: true,
                data: {
                  판례정보일련번호: precedentId,
                  사건명: precedentName || data.사건명 || '',
                  사건번호: data.사건번호 || '',
                  선고일자: data.선고일자 || '',
                  법원명: data.법원명 || '',
                  판결유형: data.판결유형 || '',
                  판시사항: data.판시사항 || '',
                  판결요지: data.판결요지 || '',
                  참조조문: data.참조조문 || '',
                  참조판례: data.참조판례 || '',
                  판례내용: data.판례내용 || '판례 내용을 불러올 수 없습니다.',
                  원본HTML: JSON.stringify(data)
                }
              });
              resolve();
            } else {
              reject(new Error('법제처 API에서 유효하지 않은 응답을 받았습니다'));
            }
          } catch (error) {
            reject(error);
          }
        };
        
        // 정리 함수
        const cleanup = () => {
          clearTimeout(timeout);
          delete (window as any)[callbackName];
          const script = document.getElementById(callbackName);
          if (script) {
            document.head.removeChild(script);
          }
        };
        
        // JSONP 스크립트 태그 생성
        const script = document.createElement('script');
        script.id = callbackName;
        script.src = `http://www.law.go.kr/DRF/lawService.do?OC=bahnntf&target=prec&ID=${precedentId}&type=JSON&callback=${callbackName}${precedentName ? `&LM=${encodeURIComponent(precedentName)}` : ''}`;
        
        script.onerror = () => {
          cleanup();
          reject(new Error('법제처 API 스크립트 로드 실패'));
        };
        
        document.head.appendChild(script);
      });
      
    } catch (error) {
      console.error('직접 API 호출 실패:', error);
      throw error;
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

  const handleExternalLink = (url?: string) => {
    const searchQuery = precedentId || precedentName;
    const defaultUrl = `https://www.law.go.kr/precSc.do?menuId=1&subMenuId=25&tabMenuId=117&query=${encodeURIComponent(searchQuery)}`;
    window.open(url || defaultUrl, '_blank');
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
          
          {!loading && data && !data.success && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <strong>오류:</strong> {data.error}
                  </div>
                  {data.message && (
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {data.message}
                    </div>
                  )}
                  {data.details?.suggestedAction && (
                    <div className="text-sm text-gray-600">
                      💡 {data.details.suggestedAction}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      다시 시도
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleExternalLink(data.details?.externalLink)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      법제처에서 보기
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {!loading && data && data.success && data.data && (
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight">
                    {data.data.사건명 || precedentName || '사건명 없음'}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.data.법원명 && (
                        <Badge variant="secondary" className="text-xs">
                          {data.data.법원명}
                        </Badge>
                      )}
                      {data.data.선고일자 && (
                        <Badge variant="outline" className="text-xs">
                          {data.data.선고일자}
                        </Badge>
                      )}
                      {data.data.사건번호 && (
                        <Badge variant="outline" className="text-xs">
                          {data.data.사건번호}
                        </Badge>
                      )}
                      {data.data.판결유형 && (
                        <Badge variant="outline" className="text-xs">
                          {data.data.판결유형}
                        </Badge>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 판시사항 */}
                    {data.data.판시사항 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 판시사항</h4>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                          {data.data.판시사항}
                        </div>
                      </div>
                    )}
                    
                    {/* 판결요지 */}
                    {data.data.판결요지 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">⚖️ 판결요지</h4>
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded whitespace-pre-wrap">
                          {data.data.판결요지}
                        </div>
                      </div>
                    )}
                    
                    {/* 참조조문 */}
                    {data.data.참조조문 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">📖 참조조문</h4>
                        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded whitespace-pre-wrap">
                          {data.data.참조조문}
                        </div>
                      </div>
                    )}
                    
                    {/* 참조판례 */}
                    {data.data.참조판례 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">🔗 참조판례</h4>
                        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded whitespace-pre-wrap">
                          {data.data.참조판례}
                        </div>
                      </div>
                    )}
                    
                    {/* 판례내용 */}
                    {data.data.판례내용 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">📄 판례 전문</h4>
                        <div className="text-sm text-gray-700 bg-white border p-4 rounded max-h-96 overflow-y-auto whitespace-pre-wrap">
                          {data.data.판례내용}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        💡 법제처 국가법령정보센터에서 제공하는 정보입니다.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExternalLink()}
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