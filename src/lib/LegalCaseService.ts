import { APIError, NetworkError, APIResponseError } from './apiClient';

// 검색 파라미터 인터페이스
export interface SearchParams {
  query: string;
  search?: '1' | '2'; // 1: 판례명, 2: 본문검색
  display?: number; // 결과 개수 (최대 100)
  page?: number; // 페이지 번호
  curt?: string; // 법원명
  sort?: 'date' | 'score'; // 정렬 옵션
  prncYdStart?: string; // 시작 선고일자 (YYYYMMDD)
  prncYdEnd?: string; // 종료 선고일자 (YYYYMMDD)
}

// 판례 목록 응답 인터페이스
export interface CaseListResponse {
  success: boolean;
  data: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    cases: CaseItem[];
  };
  error?: string;
}

// 판례 아이템 인터페이스
export interface CaseItem {
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
}

// 판례 상세 응답 인터페이스
export interface CaseDetailResponse {
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
  message?: string;
}

/**
 * 법제처 OPEN API를 활용한 판례 검색 서비스
 */
export class LegalCaseService {
  private readonly OC = 'bahnntf';
  private readonly baseUrl = 'https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/advanced-precedent-search';
  private readonly detailUrl = 'https://wouwaifqgzlwnkvpnndg.supabase.co/functions/v1/precedent-detail';

  /**
   * 판례 목록 검색
   */
  async searchCases(params: SearchParams): Promise<CaseListResponse> {
    try {
      console.log('판례 목록 검색 시작:', params);

      // 파라미터 검증
      if (!params.query?.trim()) {
        throw new Error('검색어를 입력해주세요');
      }

      // API 파라미터 구성 - Supabase function 형식
      const searchParams = new URLSearchParams({
        q: params.query.trim(),
        search: params.search || '2',
        display: Math.min(params.display || 20, 100).toString(),
        page: (params.page || 1).toString(),
        sort: params.sort || 'date',
        prncYdStart: params.prncYdStart || '20000101',
        prncYdEnd: params.prncYdEnd || '20241231'
      });

      // 법원명 필터 추가
      if (params.curt) {
        searchParams.append('curt', params.curt);
      }

      // Supabase function 호출
      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new APIResponseError(`API 호출 실패: ${response.status}`, response.status);
      }

      const responseText = await response.text();
      console.log('API 응답:', responseText);
      
      // JSON 파싱
      const data = JSON.parse(responseText);
      
      // 응답 구조 확인
      const precSearch = data.PrecSearch;
      if (!precSearch) {
        throw new Error('올바르지 않은 API 응답 형식입니다');
      }

      // 총 개수 추출
      const totalCount = parseInt(precSearch.totalCnt || '0');
      
      // 판례 목록 추출
      const precList = precSearch.prec || [];
      const cases: CaseItem[] = precList.map((prec: any) => ({
        판례정보일련번호: prec.판례정보일련번호 || prec.판례일련번호 || '',
        사건명: prec.사건명 || '',
        사건번호: prec.사건번호 || '',
        선고일자: prec.선고일자 || '',
        법원명: prec.법원명 || '',
        판결유형: prec.판결유형 || '',
        판시사항: prec.판시사항 || '',
        판결요지: prec.판결요지 || '',
        참조조문: prec.참조조문 || '',
        참조판례: prec.참조판례 || ''
      }));

      const currentPage = parseInt(params.page?.toString() || '1');
      const pageSize = parseInt(params.display?.toString() || '20');
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        success: true,
        data: {
          totalCount,
          currentPage,
          totalPages,
          cases
        }
      };

    } catch (error: any) {
      console.error('판례 목록 검색 오류:', error);
      return {
        success: false,
        data: {
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
          cases: []
        },
        error: error.message || '판례 검색 중 오류가 발생했습니다'
      };
    }
  }

  /**
   * 판례 상세 조회
   */
  async getCaseDetail(caseId: string): Promise<CaseDetailResponse> {
    try {
      console.log('판례 상세 조회 시작:', caseId);

      if (!caseId?.trim()) {
        throw new Error('판례 ID를 입력해주세요');
      }

      // Supabase function 호출
      const detailParams = new URLSearchParams({
        id: caseId
      });

      const response = await fetch(`${this.detailUrl}?${detailParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new APIResponseError(`API 호출 실패: ${response.status}`, response.status);
      }

      const responseText = await response.text();
      console.log('상세 조회 응답:', responseText);
      
      // JSON 파싱
      const jsonData = JSON.parse(responseText);
      
      // 응답 구조 확인
      const precService = jsonData.PrecService;
      if (!precService) {
        throw new Error('판례 정보를 찾을 수 없습니다');
      }

      const data = {
        판례정보일련번호: precService.판례정보일련번호 || '',
        사건명: precService.사건명 || '',
        사건번호: precService.사건번호 || '',
        선고일자: precService.선고일자 || '',
        법원명: precService.법원명 || '',
        판결유형: precService.판결유형 || '',
        판시사항: precService.판시사항 || '',
        판결요지: precService.판결요지 || '',
        참조조문: precService.참조조문 || '',
        참조판례: precService.참조판례 || '',
        판례내용: precService.판례내용 || ''
      };

      return {
        success: true,
        data
      };

    } catch (error: any) {
      console.error('판례 상세 조회 오류:', error);
      return {
        success: false,
        error: error.message || '판례 상세 조회 중 오류가 발생했습니다'
      };
    }
  }

  /**
   * 에러 분류 및 처리
   */
  private handleError(error: any): APIError {
    if (!navigator.onLine) {
      return new NetworkError('인터넷 연결을 확인해주세요.');
    }
    
    if (error.status || error.statusCode) {
      const statusCode = error.status || error.statusCode;
      let message = '서버 오류가 발생했습니다.';
      
      switch (statusCode) {
        case 400:
          message = '잘못된 요청입니다. 검색 조건을 확인해주세요.';
          break;
        case 404:
          message = '요청한 판례를 찾을 수 없습니다.';
          break;
        case 429:
          message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 500:
          message = '서버 내부 오류가 발생했습니다.';
          break;
      }
      
      return new APIResponseError(message, statusCode, error.message);
    }
    
    return new APIResponseError(error.message || '알 수 없는 오류가 발생했습니다.', 500);
  }
}

// 싱글톤 인스턴스 생성
export const legalCaseService = new LegalCaseService(); 