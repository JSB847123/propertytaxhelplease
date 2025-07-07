import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { HelpCircle, Edit, Plus, Trash2, Save, X } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const defaultFaqItems: FAQItem[] = [
  {
    id: "urban-area-tax",
    question: "도시지역분은 무엇인가요? 납부해야 하나요?",
    answer: "**근거**\n지방세법 제112조(재산세 도시지역분)\n\n구 도시계획세가 재산세에 통합되면서 도시지역분으로 규정되었습니다.\n\n**과세대상**\n• 국토의 계획 및 이용에 관한 법률 제6조에 따른 도시지역 안의 토지 또는 건축물\n• 제외대상: 공공시설용지, 개발제한구역내 지상건축물·골프장·유원지·기타이용시설이 없는 토지\n• 부과지역은 자치단체 조례로 고시됩니다\n\n**세율**\n시가표준액의 1,000분의 1.4 (0.14%)\n\n**쉬운 설명**\n도시지역분은 도시계획구역 안에 있는 부동산에 재산세와 함께 추가로 부과되는 세금입니다.\n\n이 세금은 도시의 도로, 상하수도, 공원 등 각종 도시계획 사업 비용을 마련하기 위해 도시 지역 내 집이나 건물 소유자에게 일률적으로 부과됩니다.\n\n**계산 방법**\n재산세 과세표준 × 0.14% = 도시지역분 세액"
  },
  {
    id: "regional-resource-tax",
    question: "지역자원시설세는 뭔가요? 왜 납부하나요?",
    answer: "**근거**\n지방세법 제141~146조, 지방세법시행령 제136~제138조, 지방세법시행규칙 제75조 등\n\n**1. 과세 목적**\n소유 또는 사용 중인 부동산이 지역 보호, 소방 및 안전 시설 확충, 환경 개선을 위한 목적으로 부과\n\n**2. 과세대상**\n소방분 지역자원시설세의 납세의무자: 건축물 또는 선박의 소유자\n다만, 건축물의 경우 취득세 및 재산세 과세대상이 되는데 건축물 중 시설에 대해서는 과세하지 않음\n\n**간편 설명**\n지역자원시설세는 지역 환경 보호와 주민 편의시설, 안전시설 등의 확충에 필요한 비용을 마련하기 위해 부과되는 지방세입니다. 여러 종류가 있지만, 재산세와 함께 부과되는 것은 주로 건축물 소유자에게 매겨지는 \"소방분\" 세금입니다. 이는 화재 등 위급 상황에서 소방 서비스를 받는 건물 소유자가 함께 납부하는 세금으로, 재산세 고지서에 포함되어 고지됩니다."
  },
  {
    id: "local-education-tax",
    question: "지방교육세는 뭔가요?",
    answer: "**근거**\n지방세법 제149~151조, 지방세법시행령 제140조\n\n**1. 과세목적**\n지방교육의 질적 향상에 필요한 지방교육재정의 확충에 드는 재원을 확보하기 위함.\n\n**2. 과세대상**\n지방교육세의 납세의무자: 취득세, 등록에 대한 등록면허세, 레저세, 담배소비세, 주민세 균등분, 재산세, 비영업용 승용자동차에 대한 자동차세 등의 납세의무자\n\n**3. 세율**\n재산세의 20%\n\n**설명**\n지방교육세는 지역 교육에 필요한 재원을 확보하기 위해 주요 세금에 추가로 붙는 목적세입니다. 재산세를 납부할 때 해당 재산세액의 20%가 지방교육세로 함께 부과되며, 이렇게 걷힌 세금은 지방 교육 예산으로 사용됩니다. 쉽게 말해, 지역 학교 등 교육 서비스 향상을 위한 비용을 부담하기 위해 재산세 등에 곁들여 내는 세금입니다."
  },
  {
    id: "property-tax-increase",
    question: "주택분 재산세가 작년보다 더 많이 나온 이유가 무엇인가요?",
    answer: "**체크리스트**\n\n**1. 주택공시가격**\n→ 주택 면적 상승 등으로 급등 가능성(근생을 주거로 바꾸면 주택 비율 상승으로 공시가 상승), 공시가격에 따른 상한제 % 차이 존재, 과세표준에 따른 세율 구간 확인\n\n**2. 전년도와 주택 수 차이**\n→ 공정시장가액비율, 특례세율, 임대 감면 적용 확인\n\n**3. 주택 소유비율 차이**\n\n**4. 감면 혜택 확인**\n→ 감면율이 감소했거나 받던 혜택이 없어진 부분 확인"
  }
];

export const FAQ = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const form = useForm<FAQItem>({
    defaultValues: {
      id: "",
      question: "",
      answer: ""
    }
  });

  // localStorage에서 FAQ 데이터 불러오기
  useEffect(() => {
    const savedFAQs = localStorage.getItem('customFAQs');
    if (savedFAQs) {
      setFaqItems(JSON.parse(savedFAQs));
    } else {
      setFaqItems(defaultFaqItems);
    }
  }, []);

  // FAQ 데이터를 localStorage에 저장
  const saveFAQs = (items: FAQItem[]) => {
    localStorage.setItem('customFAQs', JSON.stringify(items));
    setFaqItems(items);
  };

  // 새 질문 추가
  const addNewFAQ = (data: FAQItem) => {
    if (faqItems.length >= 10) {
      alert('최대 10개까지만 질문을 등록할 수 있습니다.');
      return;
    }
    
    const newItem = {
      ...data,
      id: `faq-${Date.now()}`
    };
    
    const updatedItems = [...faqItems, newItem];
    saveFAQs(updatedItems);
    form.reset();
    setIsSheetOpen(false);
  };

  // 질문 수정
  const updateFAQ = (data: FAQItem) => {
    const updatedItems = faqItems.map(item => 
      item.id === editingItem?.id ? { ...data, id: editingItem.id } : item
    );
    saveFAQs(updatedItems);
    setEditingItem(null);
    form.reset();
    setIsSheetOpen(false);
  };

  // 질문 삭제
  const deleteFAQ = (id: string) => {
    const updatedItems = faqItems.filter(item => item.id !== id);
    saveFAQs(updatedItems);
  };

  // 편집 모드 시작
  const startEdit = (item: FAQItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsSheetOpen(true);
  };

  // 새 질문 추가 모드 시작
  const startAdd = () => {
    setEditingItem(null);
    form.reset({ id: "", question: "", answer: "" });
    setIsSheetOpen(true);
  };

  const onSubmit = (data: FAQItem) => {
    if (editingItem) {
      updateFAQ(data);
    } else {
      addNewFAQ(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            자주 묻는 질문
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-3 w-3 mr-1" />
              편집
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startAdd}
                  disabled={faqItems.length >= 10}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  추가
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>
                    {editingItem ? "질문 수정" : "새 질문 추가"}
                  </SheetTitle>
                  <SheetDescription>
                    질문과 답변을 입력해주세요. 마크다운 형식으로 작성할 수 있습니다.
                  </SheetDescription>
                </SheetHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>질문</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="질문을 입력하세요"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>답변</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="답변을 입력하세요"
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        취소
                      </Button>
                      <Button type="submit">
                        <Save className="h-3 w-3 mr-1" />
                        저장
                      </Button>
                    </div>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {faqItems.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {faqItems.length}/10개 질문
          </p>
        )}
      </CardHeader>
      <CardContent>
        {faqItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>등록된 질문이 없습니다.</p>
            <p className="text-xs">상단의 추가 버튼을 눌러 질문을 등록해보세요.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="text-left text-sm font-medium flex-1 mr-2">
                    {item.question}
                  </AccordionTrigger>
                  {isEditing && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFAQ(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};