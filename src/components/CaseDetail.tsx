import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, ExternalLink, AlertCircle, FileText, Calendar, Building2, Scale } from 'lucide-react';
import { CaseItem } from '@/lib/LegalCaseService';
import { legalCaseService } from '@/lib/LegalCaseService';

interface CaseDetailProps {
  caseItem: CaseItem;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ 
  caseItem, 
  trigger, 
  isOpen: propIsOpen,
  onOpenChange: propOnOpenChange 
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 외부에서 제어되는 경우와 내부에서 제어되는 경우를 구분
  const isControlledExternally = propIsOpen !== undefined && propOnOpenChange !== undefined;
  const isOpen = isControlledExternally ? propIsOpen : internalIsOpen;

  const handleOpenChange = (open: boolean) => {
    if (isControlledExternally) {
      propOnOpenChange!(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // HTML 태그를 제거하고 br 태그를 줄바꿈으로 변환하는 함수
  const cleanHtmlText = (text: string): string => {
    if (!text) return '';
    
    return text
      // br 태그를 줄바꿈으로 변환
      .replace(/<br\s*\/?>/gi, '\n')
      // 다른 HTML 태그 제거
      .replace(/<[^>]*>/g, '')
      // HTML 엔티티 디코딩
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // 연속된 공백 정리
      .replace(/\s+/g, ' ')
      // 앞뒤 공백 제거
      .trim();
  };

  const fetchCaseDetail = async () => {
    if (!caseItem.판례정보일련번호) {
      setError('판례일련번호가 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await legalCaseService.getCaseDetail(caseItem.판례정보일련번호);
      
      if (response.success && response.data) {
        setDetailData(response.data);
      } else {
        setError(response.error || '판례 상세 정보를 가져올 수 없습니다.');
      }
    } catch (err: any) {
      setError(err.message || '판례 상세 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 다이얼로그가 열릴 때 데이터 로딩
  useEffect(() => {
    if (isOpen && !detailData && !loading) {
      fetchCaseDetail();
    }
  }, [isOpen, detailData, loading]);

  const handleRetry = () => {
    setError(null);
    fetchCaseDetail();
  };

  const handleExternalLink = () => {
    const url = `https://www.law.go.kr/LSW/precSc.do?menuId=1&subMenuId=25&tabMenuId=106&eventGubun=060101&query=${encodeURIComponent(caseItem.사건번호 || '')}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    }
    return dateString;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Scale className="h-5 w-5" />
            판례 상세 내용
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {caseItem.사건명 || '사건명 없음'}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  {caseItem.사건번호}
                </Badge>
                {caseItem.선고일자 && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(caseItem.선고일자)}
                  </Badge>
                )}
                {caseItem.법원명 && (
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
                    {caseItem.법원명}
                  </Badge>
                )}
                {caseItem.판결유형 && (
                  <Badge variant="outline">
                    {caseItem.판결유형}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="text-lg font-medium">판례 상세 내용을 불러오는 중...</p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <strong>오류:</strong> {error}
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      className="mr-2"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      다시 시도
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 상세 내용 */}
          {detailData && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* 판시사항 */}
                    {detailData.판시사항 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 판시사항</h4>
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded whitespace-pre-wrap">
                          {cleanHtmlText(detailData.판시사항)}
                        </div>
                      </div>
                    )}

                    {/* 판결요지 */}
                    {detailData.판결요지 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">⚖️ 판결요지</h4>
                        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded whitespace-pre-wrap">
                          {cleanHtmlText(detailData.판결요지)}
                        </div>
                      </div>
                    )}

                    {/* 참조조문 */}
                    {detailData.참조조문 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">📖 참조조문</h4>
                        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded whitespace-pre-wrap">
                          {cleanHtmlText(detailData.참조조문)}
                        </div>
                      </div>
                    )}

                    {/* 참조판례 */}
                    {detailData.참조판례 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">🔗 참조판례</h4>
                        <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded whitespace-pre-wrap">
                          {cleanHtmlText(detailData.참조판례)}
                        </div>
                      </div>
                    )}

                    {/* 판례 전문 */}
                    {detailData.판례내용 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">📄 판례 전문</h4>
                        <div className="text-sm text-gray-700 bg-white border p-4 rounded max-h-96 overflow-y-auto leading-relaxed">
                          {cleanHtmlText(detailData.판례내용).split(/\n\s*\n+/).map((paragraph, index) => {
                            const trimmedParagraph = paragraph.trim();
                            if (!trimmedParagraph) return null;
                            
                            return (
                              <div key={index} className="mb-8 last:mb-0">
                                {trimmedParagraph.split('\n').map((line, lineIndex) => {
                                  const trimmedLine = line.trim();
                                  if (!trimmedLine) return null;
                                  
                                  // 더 정교한 헤더/제목 인식 패턴
                                  const isMainHeader = 
                                    /^[【】『』「」].+[【】『』「」]$/.test(trimmedLine) || // 괄호로 둘러싸인 제목
                                    /^[가-힣\s]*\s*:$/.test(trimmedLine) || // 콜론으로 끝나는 제목
                                    /^[가-힣\s]*판시사항|^[가-힣\s]*판결요지|^[가-힣\s]*참조조문|^[가-힣\s]*참조판례/.test(trimmedLine) || // 판례 섹션 헤더
                                    /^주\s*문|^이\s*유|^판\s*결|^사\s*실|^당사자/.test(trimmedLine); // 주요 섹션

                                  const isSubHeader = 
                                    /^[0-9]+\.|^[가-힣]\.|^[ㄱ-ㅎ]\.|^[①-⑳]|^[㉠-㉯]/.test(trimmedLine) || // 숫자나 한글 순서
                                    /^○|^●|^■|^□|^▶|^◆|^◇|^▲|^△/.test(trimmedLine) || // 특수 기호
                                    /^\([가-힣0-9]+\)|^\[[가-힣0-9]+\]/.test(trimmedLine) || // 괄호 안의 순서
                                    (trimmedLine.length < 40 && /判|判事|判決|裁判|事件|號|法院|審|원고|피고|상고|항소|재심/.test(trimmedLine)); // 법률 용어가 포함된 짧은 텍스트

                                  const isLegalReference = 
                                    /제\s*\d+\s*조|제\s*\d+\s*항|제\s*\d+\s*호|제\s*\d+\s*목/.test(trimmedLine) || // 조항 참조
                                    /법률\s*제\s*\d+호|대통령령\s*제\s*\d+호|부령\s*제\s*\d+호/.test(trimmedLine) || // 법령 참조
                                    /민법|상법|형법|헌법|행정법|세법|노동법/.test(trimmedLine); // 법률명

                                  const isCourtInfo = 
                                    /대법원|고등법원|지방법원|가정법원|행정법원|특허법원/.test(trimmedLine) || // 법원명
                                    /\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.|\d{4}년\s*\d{1,2}월\s*\d{1,2}일/.test(trimmedLine) || // 날짜
                                    /사건번호|선고일|판결일|접수일/.test(trimmedLine); // 사건 정보

                                  const isQuote = 
                                    /^"|"|'|'/.test(trimmedLine) || // 인용부호로 시작
                                    /라고\s*판시|라고\s*설시|라고\s*판단|라고\s*결정/.test(trimmedLine); // 인용 표현

                                  // 스타일 적용
                                  let className = 'text-gray-700 mb-3 leading-relaxed';
                                  let additionalElements = null;

                                  if (isMainHeader) {
                                    className = 'font-bold text-gray-900 text-base mt-6 mb-4 first:mt-0 border-l-4 border-blue-600 pl-4 bg-blue-50 py-3 rounded-r shadow-sm';
                                  } else if (isSubHeader) {
                                    className = 'font-semibold text-gray-800 mt-4 mb-3 border-l-3 border-green-500 pl-3 bg-green-50 py-2 rounded-r';
                                  } else if (isLegalReference) {
                                    className = 'text-gray-700 mb-3 leading-relaxed bg-yellow-50 p-2 rounded border-l-2 border-yellow-400';
                                  } else if (isCourtInfo) {
                                    className = 'text-gray-600 mb-3 leading-relaxed bg-gray-50 p-2 rounded italic';
                                  } else if (isQuote) {
                                    className = 'text-gray-700 mb-3 leading-relaxed bg-purple-50 p-3 rounded border-l-2 border-purple-400 italic';
                                  }

                                  // 긴 문단의 경우 추가 여백
                                  if (trimmedLine.length > 100) {
                                    className += ' mb-4';
                                  }

                                  // 문장 끝 처리 개선
                                  const processedLine = trimmedLine
                                    .replace(/\.\s+/g, '. ') // 문장 끝 공백 정리
                                    .replace(/,\s+/g, ', ') // 쉼표 뒤 공백 정리
                                    .replace(/;\s+/g, '; ') // 세미콜론 뒤 공백 정리
                                    .replace(/:\s+/g, ': '); // 콜론 뒤 공백 정리

                                  return (
                                    <div key={lineIndex} className={className}>
                                      {processedLine}
                                      {additionalElements}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                          
                          {/* 추가 가독성 개선 요소 */}
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-3 h-3 bg-blue-50 border-l-2 border-blue-600 rounded-r"></div>
                              <span>주요 섹션</span>
                              <div className="w-3 h-3 bg-green-50 border-l-2 border-green-500 rounded-r ml-4"></div>
                              <span>하위 항목</span>
                              <div className="w-3 h-3 bg-yellow-50 border-l-2 border-yellow-400 rounded-r ml-4"></div>
                              <span>법령 참조</span>
                              <div className="w-3 h-3 bg-purple-50 border-l-2 border-purple-400 rounded-r ml-4"></div>
                              <span>인용문</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* 메타 정보 및 외부 링크 */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>판례일련번호: {detailData.판례정보일련번호}</p>
                        <p>💡 법제처 국가법령정보센터에서 제공하는 정보입니다.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExternalLink}
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