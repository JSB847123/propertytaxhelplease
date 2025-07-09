import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bookmark, Tag, Search, Trash2, StickyNote, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { PrecedentCard } from "./PrecedentCard";
import { useToast } from "@/hooks/use-toast";

export const BookmarksList = () => {
  const { toast } = useToast();
  const { 
    bookmarks, 
    clearBookmarks, 
    getAllTags,
    getBookmarksByTag 
  } = useBookmarks();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "date">("recent");

  const allTags = getAllTags();

  // 필터링 및 정렬된 북마크
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // 태그 필터링
    if (selectedTag !== "all") {
      filtered = getBookmarksByTag(selectedTag);
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(bookmark => 
        bookmark.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 정렬
    switch (sortBy) {
      case "recent":
        return filtered.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
      case "title":
        return filtered.sort((a, b) => a.caseTitle.localeCompare(b.caseTitle));
      case "date":
        return filtered.sort((a, b) => b.judgmentDate.localeCompare(a.judgmentDate));
      default:
        return filtered;
    }
  }, [bookmarks, selectedTag, searchTerm, sortBy, getBookmarksByTag]);

  const handleClearBookmarks = () => {
    if (window.confirm("모든 북마크를 삭제하시겠습니까?")) {
      clearBookmarks();
      toast({
        title: "북마크 삭제",
        description: "모든 북마크가 삭제되었습니다.",
      });
    }
  };

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">북마크된 판례가 없습니다</h3>
          <p className="text-sm text-muted-foreground text-center">
            관심 있는 판례를 북마크하여 나중에 쉽게 찾아보세요
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              북마크된 판례 ({bookmarks.length}개)
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearBookmarks}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              모두 삭제
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="판례명, 사건번호, 메모에서 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 태그</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: "recent" | "title" | "date") => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최근순</SelectItem>
                  <SelectItem value="title">제목순</SelectItem>
                  <SelectItem value="date">선고일순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 태그 필터 빠른 선택 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedTag === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag("all")}
              >
                전체
              </Badge>
              {allTags.slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {filteredAndSortedBookmarks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Filter className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">조건에 맞는 북마크가 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedBookmarks.map((bookmark) => (
            <PrecedentCard
              key={bookmark.id}
              caseTitle={bookmark.caseTitle}
              caseNumber={bookmark.caseNumber}
              judgmentDate={bookmark.judgmentDate}
              courtName={bookmark.courtName}
              judgmentType={bookmark.judgmentType}
              caseContent={bookmark.caseContent}
              showBookmarkButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};