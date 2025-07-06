
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Edit } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { advancedSearch, findMatchedParts } from "@/lib/searchUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LawArticle {
  id: string;
  title: string;
  article: string;
  url: string;
  category: string;
  preview?: string;
}

interface LawArticleListProps {
  onArticleClick: (articleId: string) => void;
  searchTerm?: string;
  searchFilters?: string[];
  onResultCountChange?: (count: number) => void;
}

const lawArticles: LawArticle[] = [
  // 정의 관련
  { 
    id: "ltl-104", 
    title: "지방세법 제104조", 
    article: "정의", 
    url: "https://www.law.go.kr/법령/지방세법/제104조", 
    category: "정의",
    preview: "재산세 관련 용어의 정의를 규정합니다. 토지, 건축물, 주택 등의 개념을 명확히 하여 과세 기준을 제시합니다."
  },

  // 과세대상 관련
  { 
    id: "ltl-105", 
    title: "지방세법 제105조", 
    article: "과세대상", 
    url: "https://www.law.go.kr/법령/지방세법/제105조", 
    category: "과세대상",
    preview: "재산세 과세대상인 토지와 건축물의 범위를 명시합니다. 소유자에게 부과되는 재산세의 기본 대상을 규정합니다."
  },
  { 
    id: "ltl-106", 
    title: "지방세법 제106조", 
    article: "과세대상의 구분 등", 
    url: "https://www.law.go.kr/법령/지방세법/제106조", 
    category: "과세대상",
    preview: "과세대상을 토지분과 건축물분으로 구분하고, 각각의 적용 기준과 계산 방법을 규정합니다."
  },
  { id: "ltl-106-2", title: "지방세법 제106조의2", article: "분리과세 대상 토지 타당성 평가 등", url: "https://www.law.go.kr/법령/지방세법/제106조의2", category: "과세대상" },
  { id: "ltle-101", title: "지방세법 시행령 제101조", article: "별도합산과세 대상 토지의 범위", url: "https://www.law.go.kr/법령/지방세법 시행령/제101조", category: "과세대상" },
  { id: "ltle-102", title: "지방세법 시행령 제102조", article: "분리과세대상 토지의 범위", url: "https://www.law.go.kr/법령/지방세법 시행령/제102조", category: "과세대상" },
  { id: "ltle-103", title: "지방세법 시행령 제103조", article: "건축물의 범위 등", url: "https://www.law.go.kr/법령/지방세법 시행령/제103조", category: "과세대상" },
  { id: "ltle-103-2", title: "지방세법 시행령 제103조의2", article: "철거·멸실된 건축물 또는 주택의 범위", url: "https://www.law.go.kr/법령/지방세법 시행령/제103조의2", category: "과세대상" },
  { id: "ltle-104", title: "지방세법 시행령 제104조", article: "도시지역", url: "https://www.law.go.kr/법령/지방세법 시행령/제104조", category: "과세대상" },
  { id: "ltle-105", title: "지방세법 시행령 제105조", article: "주택 부속토지의 범위 산정", url: "https://www.law.go.kr/법령/지방세법 시행령/제105조", category: "과세대상" },
  { id: "ltle-105-2", title: "지방세법 시행령 제105조의2", article: "공부상 등재현황에 따른 부과", url: "https://www.law.go.kr/법령/지방세법 시행령/제105조의2", category: "과세대상" },
  { id: "ltle-105-3", title: "지방세법 시행령 제105조의3", article: "분리과세대상 토지 타당성 평가등", url: "https://www.law.go.kr/법령/지방세법 시행령/제105조의3", category: "과세대상" },
  { id: "ltle-111", title: "지방세법 시행령 제111조", article: "토지 등의 범위", url: "https://www.law.go.kr/법령/지방세법 시행령/제111조", category: "과세대상" },
  { id: "ltlr-50-2", title: "지방세법 시행규칙 제50조의2", article: "분리과세대상 토지 적용의 신청", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제50조의2", category: "과세대상" },
  { id: "ltlr-51", title: "지방세법 시행규칙 제51조", article: "지상정착물의 범위", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제51조", category: "과세대상" },
  { id: "ltlr-57", title: "지방세법 시행규칙 제57조", article: "재산세 도시지역분 과세대상 토지의 범위", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제57조", category: "과세대상" },

  // 납세의무자 관련
  { 
    id: "ltl-107", 
    title: "지방세법 제107조", 
    article: "납세의무자", 
    url: "https://www.law.go.kr/법령/지방세법/제107조", 
    category: "납세의무자",
    preview: "재산세를 납부할 의무가 있는 자를 규정합니다. 과세기준일 현재 소유자가 납세의무자가 되며, 특수한 경우의 납세의무도 포함합니다."
  },
  { 
    id: "ltl-108", 
    title: "지방세법 제108조", 
    article: "납세지", 
    url: "https://www.law.go.kr/법령/지방세법/제108조", 
    category: "납세의무자",
    preview: "재산세를 납부해야 할 지역(납세지)을 정합니다. 일반적으로 부동산 소재지가 납세지가 됩니다."
  },
  { id: "ltle-106", title: "지방세법 시행령 제106조", article: "납세의무자의 범위 등", url: "https://www.law.go.kr/법령/지방세법 시행령/제106조", category: "납세의무자" },
  { id: "ltle-107", title: "지방세법 시행령 제107조", article: "수익사업의 범위", url: "https://www.law.go.kr/법령/지방세법 시행령/제107조", category: "납세의무자" },
  { id: "ltlr-53", title: "지방세법 시행규칙 제53조", article: "주된 상속자의 기준", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제53조", category: "납세의무자" },
  { id: "ltlr-54", title: "지방세법 시행규칙 제54조", article: "납세의무 통지", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제54조", category: "납세의무자" },
  { id: "ltlr-62", title: "지방세법 시행규칙 제62조", article: "재산세 납세의무자의 신고 등", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제62조", category: "납세의무자" },

  // 비과세 관련
  { id: "ltl-109", title: "지방세법 제109조", article: "비과세", url: "https://www.law.go.kr/법령/지방세법/제109조", category: "비과세" },
  { id: "ltle-108", title: "지방세법 시행령 제108조", article: "비과세", url: "https://www.law.go.kr/법령/지방세법 시행령/제108조", category: "비과세" },

  // 과세표준과 세율 관련
  { id: "ltl-110", title: "지방세법 제110조", article: "과세표준", url: "https://www.law.go.kr/법령/지방세법/제110조", category: "과세표준과 세율" },
  { id: "ltl-111", title: "지방세법 제111조", article: "세율", url: "https://www.law.go.kr/법령/지방세법/제111조", category: "과세표준과 세율" },
  { id: "ltl-111-2", title: "지방세법 제111조의2", article: "1세대 1주택 세율 특례", url: "https://www.law.go.kr/법령/지방세법/제111조의2", category: "과세표준과 세율" },
  { id: "ltl-112", title: "지방세법 제112조", article: "재산세 도시지역분", url: "https://www.law.go.kr/법령/지방세법/제112조", category: "과세표준과 세율" },
  { id: "ltl-113", title: "지방세법 제113조", article: "세율적용", url: "https://www.law.go.kr/법령/지방세법/제113조", category: "과세표준과 세율" },
  { id: "ltle-109", title: "지방세법 시행령 제109조", article: "공정시장가액비율", url: "https://www.law.go.kr/법령/지방세법 시행령/제109조", category: "과세표준과 세율" },
  { id: "ltle-109-2", title: "지방세법 시행령 제109조의2", article: "과세표준상한액", url: "https://www.law.go.kr/법령/지방세법 시행령/제109조의2", category: "과세표준과 세율" },
  { id: "ltle-110-2", title: "지방세법 시행령 제110조의2", article: "재산세 세율 특례 대상 1세대 1주택의 범위", url: "https://www.law.go.kr/법령/지방세법 시행령/제110조의2", category: "과세표준과 세율" },
  { id: "ltle-112", title: "지방세법 시행령 제112조", article: "주택의 구분", url: "https://www.law.go.kr/법령/지방세법 시행령/제112조", category: "과세표준과 세율" },
  { id: "ltlr-49", title: "지방세법 시행규칙 제49조", article: "건축물 시가표준액의 기준", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제49조", category: "과세표준과 세율" },
  { id: "ltlr-56-2", title: "지방세법 시행규칙 제56조의2", article: "재산세 세율 특례 적용을 위한 신청", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제56조의2", category: "과세표준과 세율" },
  { id: "ltlr-58", title: "지방세법 시행규칙 제58조", article: "재산세의 합산 및 세액산정 등", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제58조", category: "과세표준과 세율" },
  { id: "ltlr-60", title: "지방세법 시행규칙 제60조", article: "시가로 인정되는 부동산가액", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제60조", category: "과세표준과 세율" },
  { id: "ltlr-64-2", title: "지방세법 시행규칙 제64조의2", article: "직전 연도의 재산세액 상당액 계산식", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제64조의2", category: "과세표준과 세율" },

  // 공장 관련
  { id: "ltle-110", title: "지방세법 시행령 제110조", article: "공장용 건축물", url: "https://www.law.go.kr/법령/지방세법 시행령/제110조", category: "공장 관련" },
  { id: "ltlr-50", title: "지방세법 시행규칙 제50조", article: "공장입지기준면적", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제50조", category: "공장 관련" },
  { id: "ltlr-52", title: "지방세법 시행규칙 제52조", article: "공장용 건축물의 범위", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제52조", category: "공장 관련" },
  { id: "ltlr-55", title: "지방세법 시행규칙 제55조", article: "공장용 건축물의 범위", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제55조", category: "공장 관련" },
  { id: "ltlr-56", title: "지방세법 시행규칙 제56조", article: "공장의 범위와 적용기준", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제56조", category: "공장 관련" },

  // 부과·징수 일반
  { id: "ltl-114", title: "지방세법 제114조", article: "과세기준일", url: "https://www.law.go.kr/법령/지방세법/제114조", category: "부과·징수" },
  { id: "ltl-115", title: "지방세법 제115조", article: "납기", url: "https://www.law.go.kr/법령/지방세법/제115조", category: "부과·징수" },
  { id: "ltl-116", title: "지방세법 제116조", article: "징수방법 등", url: "https://www.law.go.kr/법령/지방세법/제116조", category: "부과·징수" },
  { id: "ltl-120", title: "지방세법 제120조", article: "신고의무", url: "https://www.law.go.kr/법령/지방세법/제120조", category: "부과·징수" },
  { id: "ltl-121", title: "지방세법 제121조", article: "재산세과세대장의 비치등", url: "https://www.law.go.kr/법령/지방세법/제121조", category: "부과·징수" },
  { id: "ltle-117", title: "지방세법 시행령 제117조", article: "과세대장 등재 통지", url: "https://www.law.go.kr/법령/지방세법 시행령/제117조", category: "부과·징수" },
  { id: "ltlr-63", title: "지방세법 시행규칙 제63조", article: "과세대장 직권등재", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제63조", category: "부과·징수" },
  { id: "ltlr-64", title: "지방세법 시행규칙 제64조", article: "과세대장 비치", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제64조", category: "부과·징수" },

  // 물납 관련
  { id: "ltl-117", title: "지방세법 제117조", article: "물납", url: "https://www.law.go.kr/법령/지방세법/제117조", category: "물납 관련" },
  { id: "ltle-113", title: "지방세법 시행령 제113조", article: "물납의 신청 및 허가", url: "https://www.law.go.kr/법령/지방세법 시행령/제113조", category: "물납 관련" },
  { id: "ltle-114", title: "지방세법 시행령 제114조", article: "관리·처분이 부적당한 부동산의 처리", url: "https://www.law.go.kr/법령/지방세법 시행령/제114조", category: "물납 관련" },
  { id: "ltle-115", title: "지방세법 시행령 제115조", article: "물납허가 부동산의 평가", url: "https://www.law.go.kr/법령/지방세법 시행령/제115조", category: "물납 관련" },
  { id: "ltlr-59", title: "지방세법 시행규칙 제59조", article: "재산세의 물납 절차 등", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제59조", category: "물납 관련" },

  // 분할납부·납부유예 관련
  { id: "ltl-118", title: "지방세법 제118조", article: "분할납부", url: "https://www.law.go.kr/법령/지방세법/제118조", category: "분할납부·납부유예" },
  { id: "ltl-118-2", title: "지방세법 제118조의2", article: "납부유예", url: "https://www.law.go.kr/법령/지방세법/제118조의2", category: "분할납부·납부유예" },
  { id: "ltle-116", title: "지방세법 시행령 제116조", article: "분할납부세액의 기준 및 분할납부 신청", url: "https://www.law.go.kr/법령/지방세법 시행령/제116조", category: "분할납부·납부유예" },
  { id: "ltle-116-2", title: "지방세법 시행령 제116조의2", article: "주택 재산세의 납부유예", url: "https://www.law.go.kr/법령/지방세법 시행령/제116조의2", category: "분할납부·납부유예" },
  { id: "ltlr-61-4", title: "지방세법 시행규칙 제61조의4", article: "주택 재산세액의 납부유예", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제61조의4", category: "분할납부·납부유예" },

  // 신탁재산 관련
  { id: "ltl-119-2", title: "지방세법 제119조의2", article: "신탁재산 수탁자의 물적납세의무", url: "https://www.law.go.kr/법령/지방세법/제119조의2", category: "신탁재산 관련" },
  { id: "ltle-116-3", title: "지방세법 시행령 제116조의3", article: "신탁재산 수탁자의 물적납세의무", url: "https://www.law.go.kr/법령/지방세법 시행령/제116조의3", category: "신탁재산 관련" },
  { id: "ltlr-61-2", title: "지방세법 시행규칙 제61조의2", article: "신탁재산 물적납세의무 납부통지서", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제61조의2", category: "신탁재산 관련" },

  // 종교단체·향교 관련
  { id: "ltl-119-3", title: "지방세법 제119조의3", article: "향교 및 종교단체에 대한 특례", url: "https://www.law.go.kr/법령/지방세법/제119조의3", category: "종교단체·향교 관련" },
  { id: "ltle-116-4", title: "지방세법 시행령 제116조의4", article: "향교 및 종교단체에 대한 재산세 특례 대상 및 신청 등", url: "https://www.law.go.kr/법령/지방세법 시행령/제116조의4", category: "종교단체·향교 관련" },
  { id: "ltlr-61-3", title: "지방세법 시행규칙 제61조의3", article: "향교 및 종교단체에 대한 재산세 특례 신청", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제61조의3", category: "종교단체·향교 관련" },

  // 세 부담 상한
  { id: "ltl-122", title: "지방세법 제122조", article: "세 부담의 상한", url: "https://www.law.go.kr/법령/지방세법/제122조", category: "세 부담 상한" },
  { id: "ltle-118", title: "지방세법 시행령 제118조", article: "세 부담 상한의 계산방법", url: "https://www.law.go.kr/법령/지방세법 시행령/제118조", category: "세 부담 상한" },

  // 소액 징수면제
  { id: "ltl-119", title: "지방세법 제119조", article: "소액 징수면제", url: "https://www.law.go.kr/법령/지방세법/제119조", category: "소액 징수면제" },

  // 부동산 과세자료분석
  { id: "ltl-123", title: "지방세법 제123조", article: "부동산 과세자료분석 전담기구의 설치 등", url: "https://www.law.go.kr/법령/지방세법/제123조", category: "부동산 과세자료분석" },
  { id: "ltle-119-2", title: "지방세법 시행령 제119조의2", article: "부동산 과세자료분석 전담기구의 조직·운영 및 자료통보 등", url: "https://www.law.go.kr/법령/지방세법 시행령/제119조의2", category: "부동산 과세자료분석" },
  { id: "ltle-119-3", title: "지방세법 시행령 제119조의3", article: "종합부동산세 과세자료 관련 정보시스템", url: "https://www.law.go.kr/법령/지방세법 시행령/제119조의3", category: "부동산 과세자료분석" },

  // 지방세특례제한법
  { id: "ltsl-19-2", title: "지방세특례제한법 제19조의2", article: "아동복지시설에 대한 감면", url: "https://law.go.kr/법령/지방세특례제한법/제19조의2", category: "지방세특례제한법" },
  { id: "ltsl-20", title: "지방세특례제한법 제20조", article: "노인복지시설에 대한 감면", url: "https://law.go.kr/법령/지방세특례제한법/제20조", category: "지방세특례제한법" },
  { id: "ltsl-31", title: "지방세특례제한법 제31조", article: "공공임대주택 등에 대한 감면", url: "https://law.go.kr/법령/지방세특례제한법/제31조", category: "지방세특례제한법" },
  { id: "ltsl-31-3", title: "지방세특례제한법 제31조의3", article: "장기일반민간임대주택 등에 대한 감면", url: "https://law.go.kr/법령/지방세특례제한법/제31조의3", category: "지방세특례제한법" },
  { id: "ltsl-35", title: "지방세특례제한법 제35조", article: "주택담보노후연금보증 대상 주택에 대한 감면", url: "https://law.go.kr/법령/지방세특례제한법/제35조", category: "지방세특례제한법" },
  { id: "ltsl-36-4", title: "지방세특례제한법 제36조의4", article: "전세사기피해자 지원을 위한 감면", url: "https://law.go.kr/법령/지방세특례제한법/제36조의4", category: "지방세특례제한법" },

  // 지방세특례제한법시행령
  { id: "ltslr-8-3", title: "지방세특례제한법시행령 제8조의3", article: "영유아어린이집 등에 사용하는 부동산의 범위 등", url: "https://law.go.kr/법령/지방세특례제한법시행령/제8조의3", category: "지방세특례제한법시행령" },
  { id: "ltslr-8-4", title: "지방세특례제한법시행령 제8조의4", article: "무료 노인복지시설의 범위", url: "https://law.go.kr/법령/지방세특례제한법시행령/제8조의4", category: "지방세특례제한법시행령" },
  { id: "ltslr-13-2", title: "지방세특례제한법시행령 제13조의2", article: "다가구주택의 범위", url: "https://law.go.kr/법령/지방세특례제한법시행령/제13조의2", category: "지방세특례제한법시행령" },
  { id: "ltslr-13-3", title: "지방세특례제한법시행령 제13조의3", article: "공공주택사업자의 임대가 목적인 주택 및 건축물의 범위", url: "https://law.go.kr/법령/지방세특례제한법시행령/제13조의3", category: "지방세특례제한법시행령" },
  { id: "ltslr-16", title: "지방세특례제한법시행령 제16조", article: "주택담보노후연금보증 대상 주택의 1가구 1주택 범위", url: "https://law.go.kr/법령/지방세특례제한법시행령/제16조", category: "지방세특례제한법시행령" },

  // 지역자원시설세 관련
  { id: "ltl-141", title: "지방세법 제141조", article: "목적", url: "https://www.law.go.kr/법령/지방세법/제141조", category: "지역자원시설세" },
  { id: "ltl-142", title: "지방세법 제142조", article: "과세대상", url: "https://www.law.go.kr/법령/지방세법/제142조", category: "지역자원시설세" },
  { id: "ltl-143", title: "지방세법 제143조", article: "납세의무자", url: "https://www.law.go.kr/법령/지방세법/제143조", category: "지역자원시설세" },
  { id: "ltl-144", title: "지방세법 제144조", article: "납세지", url: "https://www.law.go.kr/법령/지방세법/제144조", category: "지역자원시설세" },
  { id: "ltl-145", title: "지방세법 제145조", article: "비과세", url: "https://www.law.go.kr/법령/지방세법/제145조", category: "지역자원시설세" },
  { id: "ltl-146", title: "지방세법 제146조", article: "과세표준과 세율", url: "https://www.law.go.kr/법령/지방세법/제146조", category: "지역자원시설세" },
  { id: "ltl-147", title: "지방세법 제147조", article: "부과·징수", url: "https://www.law.go.kr/법령/지방세법/제147조", category: "지역자원시설세" },
  { id: "ltl-148", title: "지방세법 제148조", article: "소액 징수면제", url: "https://www.law.go.kr/법령/지방세법/제148조", category: "지역자원시설세" },
  { id: "ltle-136", title: "지방세법 시행령 제136조", article: "과세대상", url: "https://www.law.go.kr/법령/지방세법 시행령/제136조", category: "지역자원시설세" },
  { id: "ltle-137", title: "지방세법 시행령 제137조", article: "비과세", url: "https://www.law.go.kr/법령/지방세법 시행령/제137조", category: "지역자원시설세" },
  { id: "ltle-138", title: "지방세법 시행령 제138조", article: "화재위험 건축물 등", url: "https://www.law.go.kr/법령/지방세법 시행령/제138조", category: "지역자원시설세" },
  { id: "ltle-139", title: "지방세법 시행령 제139조", article: "납세고지", url: "https://www.law.go.kr/법령/지방세법 시행령/제139조", category: "지역자원시설세" },
  { id: "ltlr-74", title: "지방세법 시행규칙 제74조", article: "건축물 시가표준액의 기준", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제74조", category: "지역자원시설세" },
  { id: "ltlr-75", title: "지방세법 시행규칙 제75조", article: "건축물 시가표준액의 기준", url: "https://www.law.go.kr/법령/지방세법 시행규칙/제75조", category: "지역자원시설세" },

  // 지방교육세 관련
  { id: "ltl-149", title: "지방세법 제149조", article: "목적", url: "https://www.law.go.kr/법령/지방세법/제149조", category: "지방교육세" },
  { id: "ltl-150", title: "지방세법 제150조", article: "납세의무자", url: "https://www.law.go.kr/법령/지방세법/제150조", category: "지방교육세" },
  { id: "ltl-151", title: "지방세법 제151조", article: "과세표준과 세율", url: "https://www.law.go.kr/법령/지방세법/제151조", category: "지방교육세" },
  { id: "ltl-152", title: "지방세법 제152조", article: "신고 및 납부와 부과·징수", url: "https://www.law.go.kr/법령/지방세법/제152조", category: "지방교육세" },
  { id: "ltl-153", title: "지방세법 제153조", article: "부족세액의 추징 및 가산세", url: "https://www.law.go.kr/법령/지방세법/제153조", category: "지방교육세" },
  { id: "ltl-154", title: "지방세법 제154조", article: "환급", url: "https://www.law.go.kr/법령/지방세법/제154조", category: "지방교육세" },
  { id: "ltle-140", title: "지방세법 시행령 제140조", article: "납세고지", url: "https://www.law.go.kr/법령/지방세법 시행령/제140조", category: "지방교육세" },
  { id: "ltle-141", title: "지방세법 시행령 제141조", article: "신고납부와 부과·징수", url: "https://www.law.go.kr/법령/지방세법 시행령/제141조", category: "지방교육세" },

  // 민법 관련
  { id: "civil-779", title: "민법 제779조", article: "가족의 범위", url: "https://www.law.go.kr/법령/민법/제779조", category: "민법 관련" },
  { id: "civil-1000", title: "민법 제1000조", article: "상속의 순위", url: "https://www.law.go.kr/법령/민법/제1000조", category: "민법 관련" },
  { id: "civil-1001", title: "민법 제1001조", article: "대습상속", url: "https://www.law.go.kr/법령/민법/제1001조", category: "민법 관련" },
  { id: "civil-1003", title: "민법 제1003조", article: "배우자의 상속순위", url: "https://www.law.go.kr/법령/민법/제1003조", category: "민법 관련" }
];

export const LawArticleList = ({ 
  onArticleClick, 
  searchTerm = "", 
  searchFilters = [], 
  onResultCountChange 
}: LawArticleListProps) => {
  const [favoriteArticles, setFavoriteArticles] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<{ [key: string]: string[] }>({});
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editTagsInput, setEditTagsInput] = useState<string>("");

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favoriteArticles") || "[]");
    setFavoriteArticles(favorites.map((article: LawArticle) => article.id));
    
    // 커스텀 태그 로드
    const savedCustomTags = JSON.parse(localStorage.getItem("customTags") || "{}");
    setCustomTags(savedCustomTags);
  }, []);

  // 검색 필터링
  const filteredArticles = useMemo(() => {
    let filtered = lawArticles;

    // 텍스트 검색 - 고급 검색 적용
    if (searchTerm) {
      filtered = filtered.filter(article =>
        advancedSearch(article.title, searchTerm) ||
        advancedSearch(article.article, searchTerm)
      );
    }

    // 카테고리 필터
    if (searchFilters.length > 0) {
      filtered = filtered.filter(article =>
        searchFilters.includes(article.category)
      );
    }

    return filtered;
  }, [searchTerm, searchFilters]);

  // 검색 결과 수 업데이트
  useEffect(() => {
    if (onResultCountChange) {
      onResultCountChange(filteredArticles.length);
    }
  }, [filteredArticles.length, onResultCountChange]);

  // 검색어 강조 표시 함수 - 고급 매치 지원
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const matches = findMatchedParts(text, searchTerm);
    if (matches.length === 0) return text;
    
    const result = [];
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      // 매치 이전 텍스트 추가
      if (match.start > lastIndex) {
        result.push(text.slice(lastIndex, match.start));
      }
      
      // 매치된 텍스트 강조
      const matchedText = text.slice(match.start, match.end);
      const bgColor = match.type === 'direct' ? 'bg-yellow-200' : 
                     match.type === 'synonym' ? 'bg-blue-200' : 'bg-green-200';
      
      result.push(
        <span key={index} className={`${bgColor} px-1 rounded font-semibold`}>
          {matchedText}
        </span>
      );
      
      lastIndex = match.end;
    });
    
    // 마지막 남은 텍스트 추가
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }
    
    return result;
  };

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

  const toggleFavorite = (article: LawArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favoriteArticles") || "[]");
    const isAlreadyFavorite = favorites.some((fav: LawArticle) => fav.id === article.id);
    
    let updatedFavorites;
    if (isAlreadyFavorite) {
      updatedFavorites = favorites.filter((fav: LawArticle) => fav.id !== article.id);
    } else {
      updatedFavorites = [article, ...favorites];
    }
    
    localStorage.setItem("favoriteArticles", JSON.stringify(updatedFavorites));
    setFavoriteArticles(updatedFavorites.map((fav: LawArticle) => fav.id));
  };

  // 키워드 추출 함수 (기본 키워드 + 커스텀 키워드)
  const extractKeywords = (article: LawArticle): string[] => {
    // 커스텀 태그가 있으면 우선 사용
    if (customTags[article.id]) {
      return customTags[article.id].slice(0, 7);
    }

    // 사용자 제공 키워드 매핑
    const predefinedKeywords: { [key: string]: string[] } = {
      "ltl-104": ["용어", "재산세", "토지", "건축물", "주택"],
      "ltl-105": ["토지", "건축물", "주택", "선박", "항공기"],
      "ltl-106": ["합산과세", "별도합산", "분리과세", "토지구분", "세부담"],
      "ltl-106-2": ["타당성평가", "분리과세", "토지획정", "가치평가", "실적보고"],
      "ltl-107": ["소유자", "납세자", "점유자", "수익자", "연대책임"],
      "ltl-108": ["주소지", "사업장", "납세지", "과세권", "결정"],
      "ltl-109": ["국유재산", "공공시설", "비과세", "면제", "요건"],
      "ltl-110": ["시가표준액", "공정시장가액비율", "과세표준", "산정방법", "공시가격"],
      "ltl-111": ["세율", "과세구간", "주택", "토지", "건축물"],
      "ltl-111-2": ["1세대1주택", "경감세율", "특례", "장기보유", "주거복지"],
      "ltl-112": ["도시지역", "추가세", "토지", "건축물", "면세구역"],
      "ltl-113": ["세부담조정", "세율적용", "주택", "토지", "건축물"],
      "ltl-114": ["기준일", "6월1일", "소유확정", "과세연도", "과세기준"],
      "ltl-115": ["납기", "7월", "9월", "분납", "기한"],
      "ltl-116": ["고지징수", "특별징수", "전자납부", "체납", "가산금"],
      "ltl-117": ["물납", "부동산", "허가", "평가", "절차"],
      "ltl-118": ["분납", "500만원", "신청", "분할액", "기한"],
      "ltl-118-2": ["납부유예", "재해", "경제사정", "이자", "승인"],
      "ltl-119": ["소액", "면제", "2천원", "행정효율", "경감"],
      "ltl-119-2": ["신탁재산", "수탁자", "물적납세", "책임", "통지"],
      "ltl-119-3": ["향교", "종교단체", "비과세특례", "교육용", "종교시설"],
      "ltl-120": ["신고", "재산변동", "기한", "과태료", "신고서"],
      "ltl-121": ["과세대장", "비치", "직권등재", "정비", "관리"],
      "ltl-122": ["세부담상한", "상승률", "상한율", "전년세액", "주택"],
      "ltl-123": ["과세자료", "분석기구", "설치", "정보시스템", "자료제공"],
      "ltl-141": ["지역자원시설세", "목적", "환경개선", "안전관리", "지역개발"],
      "ltl-142": ["과세대상", "발전시설", "원자력", "화력", "수력"],
      "ltl-143": ["납세의무자", "시설소유자", "사업자", "운영자", "책임"],
      "ltl-144": ["납세지", "사업장소재지", "발전소위치", "과세구역", "신고"],
      "ltl-145": ["비과세", "국가시설", "공공시설", "군사시설", "면제"],
      "ltl-146": ["과세표준", "세율", "발전량", "기계출력", "산정"],
      "ltl-147": ["부과", "징수", "고지", "납부", "특별징수"],
      "ltl-148": ["소액", "면제", "효율성", "한도", "경감"],
      "ltl-149": ["지방교육세", "목적", "교육재정", "교육환경", "세목"],
      "ltl-150": ["납세의무자", "소득세납부자", "부가세납부자", "담배제조사", "수입자"],
      "ltl-151": ["과세표준", "세율", "담배수량", "소득세액", "연동"],
      "ltl-152": ["신고납부", "부과징수", "전자신고", "특별징수", "기한"],
      "ltl-153": ["추징", "가산세", "과소신고", "무신고", "지연가산"],
      "ltl-154": ["환급", "오납금", "환급절차", "이자", "결정"],
      "ltle-101": ["별도합산", "토지범위", "사업용", "비사업용", "평가기준"],
      "ltle-102": ["분리과세", "토지범위", "주택부속", "개발제한", "평가"],
      "ltle-103": ["건축물범위", "부속시설", "이동식", "위락시설", "공작물"],
      "ltle-103-2": ["철거주택", "멸실", "과세기준", "사유", "기간"],
      "ltle-104": ["도시지역", "지정", "도시계획", "시장군수", "도농복합"],
      "ltle-105": ["주택부속토지", "범위", "면적기준", "배율", "구분"],
      "ltle-105-2": ["공부상등재", "등기", "토지대장", "부과", "기준"],
      "ltle-105-3": ["타당성평가", "분리과세", "절차", "서류", "심사"],
      "ltle-106": ["납세의무자", "소유자", "공동소유", "시설관리자", "예외"],
      "ltle-107": ["수익사업", "범위", "학교", "병원", "사회복지"],
      "ltle-108": ["비과세", "공공용", "국가", "지방자치단체", "면제기준"],
      "ltle-109": ["공정시장가액비율", "조정", "고시", "시가표준액", "적용"],
      "ltle-109-2": ["과세표준상한", "상한액", "조정", "주택", "한도"],
      "ltle-110": ["공장용", "건축물", "범위", "산업단지", "제조시설"],
      "ltle-110-2": ["1세대1주택", "특례범위", "면적", "공시가격", "기준"],
      "ltle-111": ["토지범위", "토지등", "분류", "산정", "건축물부속"],
      "ltle-112": ["주택구분", "공동주택", "단독주택", "오피스텔", "숙박시설"],
      "ltle-113": ["물납신청", "허가절차", "서류", "심사", "통보"],
      "ltle-114": ["부적당부동산", "처분", "보류", "관리", "대체"],
      "ltle-115": ["평가", "부동산", "감정", "기준일", "방법"],
      "ltle-116": ["분할납부", "기준세액", "신청절차", "분할횟수", "기한"],
      "ltle-116-2": ["납부유예", "주택소유자", "재해", "상환", "이자"],
      "ltle-116-3": ["신탁재산", "수탁자", "물적납세", "책임범위", "절차"],
      "ltle-116-4": ["향교", "종교단체", "특례", "신청", "요건"],
      "ltle-117": ["등재통지", "과세대장", "통지방법", "기한", "이의"],
      "ltle-118": ["세부담상한", "계산", "직전세액", "상승률", "적용"],
      "ltle-119-2": ["전담기구", "조직", "자료분석", "운영", "통보"],
      "ltle-119-3": ["종부세자료", "정보시스템", "연계", "제공", "관리"],
      "ltle-136": ["과세대상", "지역자원시설세", "시설", "위험물", "지하수"],
      "ltle-137": ["비과세", "국가", "지방", "공공시설", "면제"],
      "ltle-138": ["화재위험", "건축물", "안전시설", "지정", "세율가산"],
      "ltle-139": ["납세고지", "서식", "발송", "기한", "전자고지"],
      "ltle-140": ["납세고지", "내용", "고지방법", "수정고지", "이의"],
      "ltle-141": ["신고납부", "부과징수", "전자신고", "과태료", "특별징수"],
      "ltlr-49": ["시가표준액", "건축물", "기준", "감정", "공시"],
      "ltlr-50": ["공장입지", "기준면적", "산정", "입지규제", "면적제한"],
      "ltlr-50-2": ["분리과세", "토지신청", "서식", "기한", "증빙"],
      "ltlr-51": ["지상정착물", "정의", "이동물", "구조물", "과세대상"],
      "ltlr-52": ["공장용", "건축물범위", "제조시설", "창고", "부속시설"],
      "ltlr-53": ["주된상속자", "기준", "상속세", "판정", "거주지"],
      "ltlr-54": ["납세의무통지", "서식", "방법", "전자통보", "기한"],
      "ltlr-55": ["공장용", "건축물", "범위", "지역자원시설세", "특례"],
      "ltlr-56": ["공장범위", "적용기준", "제조업", "산업단지", "시설면적"],
      "ltlr-56-2": ["세율특례", "신청", "1주택", "서류", "기한"],
      "ltlr-57": ["도시지역분", "과세토지", "범위", "도시계획", "면적"],
      "ltlr-58": ["세액산정", "합산", "과세표준", "경감", "할인"],
      "ltlr-59": ["물납절차", "서류", "심사", "허가", "평가"],
      "ltlr-60": ["시가", "부동산가액", "인정기준", "감정평가", "공시가격"],
      "ltlr-61-2": ["납부통지서", "신탁재산", "서식", "책임", "기한"],
      "ltlr-61-3": ["특례신청", "향교", "종교단체", "서류", "요건"],
      "ltlr-61-4": ["납부유예", "주택", "신청", "이자", "기한"],
      "ltlr-62": ["신고", "납세의무자", "서식", "기한", "제출"],
      "ltlr-63": ["직권등재", "과세대장", "절차", "통지", "이의"],
      "ltlr-64": ["과세대장", "비치", "관리", "보관", "열람"],
      "ltlr-64-2": ["계산식", "직전세액", "상한", "세부담", "산정"],
      "ltlr-74": ["시가표준액", "건축물", "기준", "개선", "보고"],
      "ltlr-75": ["시가표준액", "건축물", "특례", "면세", "한도"],
      "civil-779": ["가족", "범위", "민법", "상속", "관계"],
      "civil-1000": ["상속", "순위", "민법", "법정상속", "순서"],
      "civil-1001": ["대습상속", "민법", "상속권", "승계", "요건"],
      "civil-1003": ["배우자", "상속순위", "민법", "상속권", "지분"]
    };

    // 미리 정의된 키워드가 있으면 사용
    if (predefinedKeywords[article.id]) {
      return predefinedKeywords[article.id];
    }

    // 기본 키워드 매핑 (fallback)
    return [article.category];
  };

  // 태그 편집 시작
  const startEditTags = (article: LawArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticleId(article.id);
    const currentTags = customTags[article.id] || extractKeywords(article);
    setEditTagsInput(currentTags.join(', '));
  };

  // 태그 편집 저장
  const saveTags = () => {
    if (!editingArticleId) return;
    
    const newTags = editTagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 7);

    const updatedCustomTags = {
      ...customTags,
      [editingArticleId]: newTags
    };

    setCustomTags(updatedCustomTags);
    localStorage.setItem("customTags", JSON.stringify(updatedCustomTags));
    
    setEditingArticleId(null);
    setEditTagsInput("");
  };

  // 태그 편집 취소
  const cancelEditTags = () => {
    setEditingArticleId(null);
    setEditTagsInput("");
  };

  const categories = [...new Set(filteredArticles.map(article => article.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">재산세 관련 법령 조문</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredArticles.length === 0 && (searchTerm || searchFilters.length > 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-sm">다른 키워드나 필터를 시도해보세요</p>
          </div>
        ) : (
          <TooltipProvider>
            <Accordion type="multiple" className="w-full">
              {categories.map(category => {
                const categoryArticles = filteredArticles.filter(article => article.category === category);
                if (categoryArticles.length === 0) return null;
                
                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{category}</span>
                        <span className="text-xs text-muted-foreground">({categoryArticles.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {categoryArticles.map(article => {
                          const keywords = extractKeywords(article);
                          return (
                            <div key={article.id} className="relative">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Card 
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleArticleClick(article)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-sm text-primary">
                                              {highlightText(article.title, searchTerm)} - {highlightText(article.article, searchTerm)}
                                            </h4>
                                            <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                          </div>
                                          {article.preview && (
                                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                              {article.preview}
                                            </p>
                                          )}
                                           <div className="flex flex-wrap gap-1 items-center">
                                             {keywords.map((keyword, index) => (
                                               <Badge 
                                                 key={index} 
                                                 variant="secondary" 
                                                 className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                               >
                                                 {keyword}
                                               </Badge>
                                             ))}
                                             <Dialog open={editingArticleId === article.id} onOpenChange={(open) => !open && cancelEditTags()}>
                                               <DialogTrigger asChild>
                                                 <Button
                                                   variant="ghost"
                                                   size="sm"
                                                   className="p-1 h-6 w-6 opacity-50 hover:opacity-100"
                                                   onClick={(e) => startEditTags(article, e)}
                                                 >
                                                   <Edit className="h-3 w-3" />
                                                 </Button>
                                               </DialogTrigger>
                                               <DialogContent className="sm:max-w-md">
                                                 <DialogHeader>
                                                   <DialogTitle className="text-sm">태그 편집</DialogTitle>
                                                 </DialogHeader>
                                                 <div className="space-y-4">
                                                   <div>
                                                      <Label htmlFor="tags" className="text-sm">
                                                        태그 (쉼표로 구분, 최대 7개)
                                                      </Label>
                                                     <Input
                                                       id="tags"
                                                       value={editTagsInput}
                                                       onChange={(e) => setEditTagsInput(e.target.value)}
                                                       placeholder="시가표준액, 결정기준, 토지..."
                                                       className="mt-1"
                                                     />
                                                   </div>
                                                   <div className="flex justify-end gap-2">
                                                     <Button variant="outline" size="sm" onClick={cancelEditTags}>
                                                       취소
                                                     </Button>
                                                     <Button size="sm" onClick={saveTags}>
                                                       저장
                                                     </Button>
                                                   </div>
                                                 </div>
                                               </DialogContent>
                                             </Dialog>
                                           </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto absolute top-2 right-2"
                                          onClick={(e) => toggleFavorite(article, e)}
                                        >
                                          <Star 
                                            className={`h-4 w-4 ${
                                              favoriteArticles.includes(article.id) 
                                                ? 'fill-yellow-400 text-yellow-400' 
                                                : 'text-gray-400'
                                            }`} 
                                          />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TooltipTrigger>
                                {article.preview && (
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">{article.preview}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};
