import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, FileText, Scale, Building2, Bookmark, BookmarkCheck, Tag, StickyNote } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/hooks/use-toast";
import type { PrecedentData } from "@/lib/xmlParser";

interface PrecedentCardProps extends PrecedentData {
  showBookmarkButton?: boolean;
}

export const PrecedentCard = ({
  caseTitle,
  caseNumber,
  judgmentDate,
  courtName,
  judgmentType,
  caseContent,
  showBookmarkButton = true
}: PrecedentCardProps) => {
  const { toast } = useToast();
  const { 
    isBookmarked, 
    addBookmark, 
    removeBookmarkByCaseNumber, 
    getBookmarkByCaseNumber 
  } = useBookmarks();
  
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [tags, setTags] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const precedentData: PrecedentData = {
    caseTitle,
    caseNumber,
    judgmentDate,
    courtName,
    judgmentType,
    caseContent
  };

  const bookmarked = isBookmarked(caseNumber);
  const existingBookmark = getBookmarkByCaseNumber(caseNumber);
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    // YYYYMMDD 형태를 YYYY-MM-DD로 변환
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    }
    return dateString;
  };

  const handleBookmarkClick = () => {
    if (bookmarked) {
      removeBookmarkByCaseNumber(caseNumber);
      toast({
        title: "북마크 삭제",
        description: "판례가 북마크에서 제거되었습니다.",
      });
    } else {
      setIsBookmarkDialogOpen(true);
    }
  };

  const handleBookmarkSave = () => {
    const tagList = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    addBookmark(precedentData, tagList, notes || undefined);
    
    toast({
      title: "북마크 추가",
      description: "판례가 북마크에 저장되었습니다.",
    });
    
    setIsBookmarkDialogOpen(false);
    setTags("");
    setNotes("");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight pr-4 flex-1">
            {caseTitle}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Scale className="h-3 w-3" />
              {judgmentType}
            </Badge>
            {showBookmarkButton && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmarkClick}
                  className={`h-8 w-8 p-0 ${bookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>

                <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>북마크 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          태그 (쉼표로 구분)
                        </label>
                        <Input
                          placeholder="예: 민법, 계약, 손해배상"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <StickyNote className="h-4 w-4" />
                          메모
                        </label>
                        <Textarea
                          placeholder="이 판례에 대한 메모를 작성하세요..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsBookmarkDialogOpen(false)}>
                          취소
                        </Button>
                        <Button onClick={handleBookmarkSave}>
                          저장
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
        
        {existingBookmark?.tags && existingBookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {existingBookmark.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">사건번호:</span>
            <span>{caseNumber}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">선고일자:</span>
            <span>{formatDate(judgmentDate)}</span>
          </div>
          
          <div className="flex items-center gap-2 md:col-span-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">법원명:</span>
            <span>{courtName}</span>
          </div>
        </div>
        
        {caseContent && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {caseContent}
            </p>
          </div>
        )}

        {existingBookmark?.notes && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground italic">
                {existingBookmark.notes}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};