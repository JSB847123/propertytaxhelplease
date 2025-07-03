
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Save, FileText } from "lucide-react";

export const MemoSection = () => {
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedMemo = localStorage.getItem("propertyTaxMemo") || "";
    setMemo(savedMemo);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("propertyTaxMemo", memo);
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
          placeholder="민원 응대 내용을 메모하세요..."
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
        </div>
      </CardContent>
    </Card>
  );
};
