
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Save, FileText, List } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedMemo {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export const MemoSection = () => {
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMemos, setSavedMemos] = useState<SavedMemo[]>([]);

  useEffect(() => {
    // 기존 단일 메모와 새로운 메모 목록 둘 다 불러오기
    const savedMemo = localStorage.getItem("propertyTaxMemo") || "";
    const savedMemosList = localStorage.getItem("propertyTaxMemosList");
    
    if (savedMemosList) {
      try {
        const memosList = JSON.parse(savedMemosList);
        setSavedMemos(memosList.map((memo: any) => ({
          ...memo,
          createdAt: new Date(memo.createdAt)
        })));
      } catch (error) {
        console.error("메모 목록 불러오기 실패:", error);
      }
    }
    
    setMemo(savedMemo);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!memo.trim()) {
        toast({
          title: "저장 실패",
          description: "저장할 내용이 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // 현재 메모를 localStorage에 저장 (기존 방식 유지)
      localStorage.setItem("propertyTaxMemo", memo);
      
      // 메모 목록에도 추가
      const newMemo: SavedMemo = {
        id: Date.now().toString(),
        title: memo.slice(0, 30) + (memo.length > 30 ? "..." : ""),
        content: memo,
        createdAt: new Date()
      };
      
      const updatedMemos = [newMemo, ...savedMemos];
      setSavedMemos(updatedMemos);
      localStorage.setItem("propertyTaxMemosList", JSON.stringify(updatedMemos));
      
      toast({
        title: "저장 완료",
        description: "메모가 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "메모 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadMemo = (savedMemo: SavedMemo) => {
    setMemo(savedMemo.content);
    toast({
      title: "메모 불러오기",
      description: "선택한 메모를 불러왔습니다.",
    });
  };

  const handleDownload = () => {
    if (!memo.trim()) {
      toast({
        title: "다운로드 불가",
        description: "저장할 메모 내용이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([memo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `재산세_메모_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "다운로드 완료",
      description: "메모가 텍스트 파일로 다운로드되었습니다.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-4 w-4" />
          메모장
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="메모란입니다."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "저장 중..." : "메모 저장"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={!memo.trim()}
          >
            다운로드
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" />
                목록
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>저장된 메모 목록</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] mt-4">
                {savedMemos.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    저장된 메모가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedMemos.map((savedMemo) => (
                      <Card key={savedMemo.id} className="cursor-pointer hover:bg-muted/50" onClick={() => loadMemo(savedMemo)}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-medium text-sm">{savedMemo.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {savedMemo.createdAt.toLocaleString('ko-KR')}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {savedMemo.content}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
};
