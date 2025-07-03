
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
  {
    id: "ltl-111",
    title: "지방세법 제111조",
    article: "재산세 납세의무자",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271&ancYd=20240101&ancNo=19687&efYd=20240101&nwJoYnInfo=N&efGubun=Y&chrClsCd=010202&ancYnChk=0#0000",
    category: "지방세법"
  },
  {
    id: "ltl-112",
    title: "지방세법 제112조",
    article: "재산세 과세객체",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271&ancYd=20240101&ancNo=19687&efYd=20240101&nwJoYnInfo=N&efGubun=Y&chrClsCd=010202&ancYnChk=0#0000",
    category: "지방세법"
  },
  {
    id: "ltl-113",
    title: "지방세법 제113조",
    article: "재산세 과세표준",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271&ancYd=20240101&ancNo=19687&efYd=20240101&nwJoYnInfo=N&efGubun=Y&chrClsCd=010202&ancYnChk=0#0000",
    category: "지방세법"
  },
  {
    id: "ltl-114",
    title: "지방세법 제114조",
    article: "재산세 세율",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243271&ancYd=20240101&ancNo=19687&efYd=20240101&nwJoYnInfo=N&efGubun=Y&chrClsCd=010202&ancYnChk=0#0000",
    category: "지방세법"
  },
  {
    id: "ltle-50",
    title: "지방세법 시행령 제50조",
    article: "재산세 과세표준 산정방법",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302&ancYd=20240101&ancNo=34204&efYd=20240101&nwJoYnInfo=N&efGubun=Y&chrClsCd=010202&ancYnChk=0#0000",
    category: "지방세법 시행령"
  },
  {
    id: "ltle-51",
    title: "지방세법 시행령 제51조",
    article: "재산세 감면 기준",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=243302&ancYd=20240101&ancNo=34204&efYd=20240101&nwJoYnInfo=N&efGubun=Y&chrClsCd=010202&ancYnChk=0#0000",
    category: "지방세법 시행령"
  }
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
