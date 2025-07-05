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
    answer: "답변을 준비 중입니다."
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
    question: "작년보다 공시가격이 내렸는데, 재산세는 왜 그대로이거나 오히려 올랐나요?",
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