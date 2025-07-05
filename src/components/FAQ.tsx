import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: "urban-area-tax",
    question: "도시지역분은 무엇인가요? 납부해야 하나요?",
    answer: "근거: 지방세법 제112조(재산세 도시지역분)\n구 도시계획세가 재산세에 통합되면서 도시지역분으로 규정됨\n\n1. 과세대상\n- 국토의 계획 및 이용에 관한 법률 제6조의 규정에 의거 도시지역 안에 있는 토지 또는 건축물(공공시설용지, 개발제한구역내의 지상건축물·골프장·유원지·기타이용시설이 없는 토지는 제외)\n→ 국토계획법상 도시지역에 있는 부동산\n※ 부과지역의 고시 : 자치단체조례로 부과지역을 고시\n\n2. 세율 : 시가표준액의 1,000분의 1.4\n\n3. 간편 설명: 도시지역분은 도시계획구역 안에 있는 부동산에 재산세와 함께 추가로 부과되는 세금입니다. 도시의 도로·상하수도·공원 등 각종 도시계획 사업 비용을 마련하기 위한 것으로, 도시 지역에 사는 집이나 건물 소유자에게 일률적으로 부과됩니다. (재산세 과세표준에 0.14%의 세율을 적용하여 계산됩니다.)"
  },
  {
    id: "regional-resource-tax",
    question: "지역자원시설세는 뭔가요? 왜 납부하나요?",
    answer: "답변을 준비 중입니다."
  },
  {
    id: "local-education-tax",
    question: "지방교육세는 뭔가요?",
    answer: "답변을 준비 중입니다."
  },
  {
    id: "property-tax-difference",
    question: "옆집과 우리 집, 면적은 똑같은데 왜 재산세가 다른가요?",
    answer: "답변을 준비 중입니다."
  },
  {
    id: "officetel-property-tax",
    question: "주거용으로 사용하는 오피스텔의 재산세는 어떻게 되나요?",
    answer: "답변을 준비 중입니다."
  },
  {
    id: "price-vs-tax",
    question: "작년보다 주택공시가격이 내렸는데, 재산세는 왜 그대로이거나 올랐나요?",
    answer: "답변을 준비 중입니다."
  },
  {
    id: "deceased-property-tax",
    question: "돌아가신 분 주택의 재산세는 누가 내야 하나요?",
    answer: "답변을 준비 중입니다."
  },
  {
    id: "property-tax-increase",
    question: "주택분 재산세가 작년보다 더 많이 나온 이유가 무엇인가요?",
    answer: "답변을 준비 중입니다."
  }
];

export const FAQ = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          자주 묻는 질문
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};