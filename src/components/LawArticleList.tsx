
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface LawArticle {
  id: string;
  title: string;
  article: string;
  url: string;
  category: string;
}

interface LawArticleListProps {
  onArticleClick: (articleId: string) => void;
}

const lawArticles: LawArticle[] = [
  // 정의 관련
  { id: "ltl-104", title: "지방세법 제104조", article: "정의", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "정의" },

  // 과세대상 관련
  { id: "ltl-105", title: "지방세법 제105조", article: "과세대상", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세대상" },
  { id: "ltl-106", title: "지방세법 제106조", article: "과세대상의 구분 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세대상" },
  { id: "ltl-106-2", title: "지방세법 제106조의2", article: "분리과세 대상 토지의 합리화 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세대상" },
  { id: "ltle-101", title: "지방세법 시행령 제101조", article: "별도합산과세 대상 토지의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-102", title: "지방세법 시행령 제102조", article: "분리과세대상 토지의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-103", title: "지방세법 시행령 제103조", article: "건축물의 범위 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-103-2", title: "지방세법 시행령 제103조의2", article: "철거·멸실된 건축물 또는 주택의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-104", title: "지방세법 시행령 제104조", article: "도시지역", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-105", title: "지방세법 시행령 제105조", article: "주택 부속토지의 범위 산정", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-105-2", title: "지방세법 시행령 제105조의2", article: "공부상 등재현황에 따른 부과", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-105-3", title: "지방세법 시행령 제105조의3", article: "분리과세대상 토지 타당성 평가등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltle-111", title: "지방세법 시행령 제111조", article: "토지 등의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세대상" },
  { id: "ltlr-50-2", title: "지방세법 시행규칙 제50조의2", article: "분리과세대상 토지 적용의 신청", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세대상" },
  { id: "ltlr-51", title: "지방세법 시행규칙 제51조", article: "지상정착물의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세대상" },
  { id: "ltlr-57", title: "지방세법 시행규칙 제57조", article: "재산세 도시지역분 과세대상 토지의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세대상" },

  // 납세의무자 관련
  { id: "ltl-107", title: "지방세법 제107조", article: "납세의무자", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "납세의무자" },
  { id: "ltl-108", title: "지방세법 제108조", article: "납세지", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "납세의무자" },
  { id: "ltle-106", title: "지방세법 시행령 제106조", article: "납세의무자의 범위 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "납세의무자" },
  { id: "ltle-107", title: "지방세법 시행령 제107조", article: "수익사업의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "납세의무자" },
  { id: "ltlr-53", title: "지방세법 시행규칙 제53조", article: "주된 상속자의 기준", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "납세의무자" },
  { id: "ltlr-54", title: "지방세법 시행규칙 제54조", article: "납세의무 통지", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "납세의무자" },
  { id: "ltlr-62", title: "지방세법 시행규칙 제62조", article: "재산세 납세의무자의 신고 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "납세의무자" },

  // 비과세 관련
  { id: "ltl-109", title: "지방세법 제109조", article: "비과세", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "비과세" },
  { id: "ltle-108", title: "지방세법 시행령 제108조", article: "비과세", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "비과세" },

  // 과세표준과 세율 관련
  { id: "ltl-110", title: "지방세법 제110조", article: "과세표준", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세표준과 세율" },
  { id: "ltl-111", title: "지방세법 제111조", article: "세율", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세표준과 세율" },
  { id: "ltl-111-2", title: "지방세법 제111조의2", article: "1세대 1주택 세율 특례", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세표준과 세율" },
  { id: "ltl-112", title: "지방세법 제112조", article: "재산세 도시지역분", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세표준과 세율" },
  { id: "ltl-113", title: "지방세법 제113조", article: "세율적용", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "과세표준과 세율" },
  { id: "ltle-109", title: "지방세법 시행령 제109조", article: "공정시장가액비율", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세표준과 세율" },
  { id: "ltle-109-2", title: "지방세법 시행령 제109조의2", article: "과세표준상한액", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세표준과 세율" },
  { id: "ltle-110-2", title: "지방세법 시행령 제110조의2", article: "재산세 세율 특례 대상 1세대 1주택의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세표준과 세율" },
  { id: "ltle-112", title: "지방세법 시행령 제112조", article: "주택의 구분", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "과세표준과 세율" },
  { id: "ltlr-49", title: "지방세법 시행규칙 제49조", article: "건축물 시가표준액의 기준", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세표준과 세율" },
  { id: "ltlr-56-2", title: "지방세법 시행규칙 제56조의2", article: "재산세 세율 특례 적용을 위한 신청", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세표준과 세율" },
  { id: "ltlr-58", title: "지방세법 시행규칙 제58조", article: "재산세의 합산 및 세액산정 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세표준과 세율" },
  { id: "ltlr-60", title: "지방세법 시행규칙 제60조", article: "시가로 인정되는 부동산가액", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세표준과 세율" },
  { id: "ltlr-64-2", title: "지방세법 시행규칙 제64조의2", article: "직전 연도의 재산세액 상당액 계산식", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "과세표준과 세율" },

  // 공장 관련
  { id: "ltle-110", title: "지방세법 시행령 제110조", article: "공장용 건축물", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "공장 관련" },
  { id: "ltlr-50", title: "지방세법 시행규칙 제50조", article: "공장입지기준면적", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "공장 관련" },
  { id: "ltlr-52", title: "지방세법 시행규칙 제52조", article: "공장용 건축물의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "공장 관련" },
  { id: "ltlr-55", title: "지방세법 시행규칙 제55조", article: "공장용 건축물의 범위", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "공장 관련" },
  { id: "ltlr-56", title: "지방세법 시행규칙 제56조", article: "공장의 범위와 적용기준", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "공장 관련" },

  // 부과·징수 일반
  { id: "ltl-114", title: "지방세법 제114조", article: "과세기준일", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "부과·징수" },
  { id: "ltl-115", title: "지방세법 제115조", article: "납기", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "부과·징수" },
  { id: "ltl-116", title: "지방세법 제116조", article: "징수방법 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "부과·징수" },
  { id: "ltl-120", title: "지방세법 제120조", article: "신고의무", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "부과·징수" },
  { id: "ltl-121", title: "지방세법 제121조", article: "재산세과세대장의 비치등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "부과·징수" },
  { id: "ltle-117", title: "지방세법 시행령 제117조", article: "과세대장 등재 통지", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "부과·징수" },
  { id: "ltlr-63", title: "지방세법 시행규칙 제63조", article: "과세대장 직권등재", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "부과·징수" },
  { id: "ltlr-64", title: "지방세법 시행규칙 제64조", article: "과세대장 비치", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "부과·징수" },

  // 물납 관련
  { id: "ltl-117", title: "지방세법 제117조", article: "물납", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "물납 관련" },
  { id: "ltle-113", title: "지방세법 시행령 제113조", article: "물납의 신청 및 허가", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "물납 관련" },
  { id: "ltle-114", title: "지방세법 시행령 제114조", article: "관리·처분이 부적당한 부동산의 처리", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "물납 관련" },
  { id: "ltle-115", title: "지방세법 시행령 제115조", article: "물납허가 부동산의 평가", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "물납 관련" },
  { id: "ltlr-59", title: "지방세법 시행규칙 제59조", article: "재산세의 물납 절차 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "물납 관련" },

  // 분할납부·납부유예 관련
  { id: "ltl-118", title: "지방세법 제118조", article: "분할납부", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "분할납부·납부유예" },
  { id: "ltl-118-2", title: "지방세법 제118조의2", article: "납부유예", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "분할납부·납부유예" },
  { id: "ltle-116", title: "지방세법 시행령 제116조", article: "분할납부세액의 기준 및 분할납부 신청", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "분할납부·납부유예" },
  { id: "ltle-116-2", title: "지방세법 시행령 제116조의2", article: "주택 재산세의 납부유예", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "분할납부·납부유예" },
  { id: "ltlr-61-4", title: "지방세법 시행규칙 제61조의4", article: "주택 재산세액의 납부유예", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "분할납부·납부유예" },

  // 신탁재산 관련
  { id: "ltl-119-2", title: "지방세법 제119조의2", article: "신탁재산 수탁자의 물적납세의무", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "신탁재산 관련" },
  { id: "ltle-116-3", title: "지방세법 시행령 제116조의3", article: "신탁재산 수탁자의 물적납세의무", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "신탁재산 관련" },
  { id: "ltlr-61-2", title: "지방세법 시행규칙 제61조의2", article: "신탁재산 물적납세의무 납부통지서", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "신탁재산 관련" },

  // 종교단체·향교 관련
  { id: "ltl-119-3", title: "지방세법 제119조의3", article: "향교 및 종교단체에 대한 특례", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "종교단체·향교 관련" },
  { id: "ltle-116-4", title: "지방세법 시행령 제116조의4", article: "향교 및 종교단체에 대한 재산세 특례 대상 및 신청 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "종교단체·향교 관련" },
  { id: "ltlr-61-3", title: "지방세법 시행규칙 제61조의3", article: "향교 및 종교단체에 대한 재산세 특례 신청", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243303#0000", category: "종교단체·향교 관련" },

  // 세 부담 상한
  { id: "ltl-122", title: "지방세법 제122조", article: "세 부담의 상한", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "세 부담 상한" },
  { id: "ltle-118", title: "지방세법 시행령 제118조", article: "세 부담 상한의 계산방법", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "세 부담 상한" },

  // 소액 징수면제
  { id: "ltl-119", title: "지방세법 제119조", article: "소액 징수면제", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "소액 징수면제" },

  // 부동산 과세자료분석
  { id: "ltl-123", title: "지방세법 제123조", article: "부동산 과세자료분석 전담기구의 설치 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271#0000", category: "부동산 과세자료분석" },
  { id: "ltle-119-2", title: "지방세법 시행령 제119조의2", article: "부동산 과세자료분석 전담기구의 조직·운영 및 자료통보 등", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "부동산 과세자료분석" },
  { id: "ltle-119-3", title: "지방세법 시행령 제119조의3", article: "종합부동산세 과세자료 관련 정보시스템", url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302#0000", category: "부동산 과세자료분석" }
];

export const LawArticleList = ({ onArticleClick }: LawArticleListProps) => {
  const handleArticleClick = (article: LawArticle) => {
    // 최근 조회 목록에 추가
    const recentArticles = JSON.parse(localStorage.getItem("recentArticles") || "[]");
    const updatedRecent = [
      article,
      ...recentArticles.filter((item: LawArticle) => item.id !== article.id)
    ].slice(0, 5);
    localStorage.setItem("recentArticles", JSON.stringify(updatedRecent));
    
    // 외부 링크 열기
    window.open(article.url, "_blank");
    
    // 선택된 조문 ID 전달
    onArticleClick(article.id);
  };

  const categories = [...new Set(lawArticles.map(article => article.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">재산세 관련 법령 조문</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category} className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-1">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {lawArticles
                  .filter(article => article.category === category)
                  .map(article => (
                    <Button
                      key={article.id}
                      variant="outline"
                      className="justify-start h-auto p-3 text-left"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{article.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{article.article}</div>
                        </div>
                        <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
