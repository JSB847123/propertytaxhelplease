import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Filter, SortAsc, SortDesc, Grid, List, Download } from "lucide-react";
import { LawCard, type LawData } from "./LawCard";
import { PrecedentCard } from "./PrecedentCard";
import type { PrecedentData } from "@/lib/xmlParser";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

type SearchResultData = LawData | PrecedentData;

interface SearchResultsProps {
  data: SearchResultData[] | null;
  isLoading: boolean;
  error?: Error | null;
  searchType: "law" | "prec";
  searchTerm?: string;
  totalCount?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onItemClick?: (item: SearchResultData) => void;
  onRetry?: () => void;
  onClearSearch?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

type SortOption = "relevance" | "date_desc" | "date_asc" | "name_asc" | "name_desc";
type ViewMode = "grid" | "list";

export const SearchResults = ({
  data,
  isLoading,
  error,
  searchType,
  searchTerm,
  totalCount,
  currentPage = 1,
  hasNextPage = false,
  onLoadMore,
  onItemClick,
  onRetry,
  onClearSearch,
  onSuggestionClick,
  className
}: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterText, setFilterText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 데이터 필터링 및 정렬
  const processedData = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // 텍스트 필터링
    if (filterText) {
      filtered = filtered.filter(item => {
        const searchFields = searchType === "law"
          ? [(item as LawData).법령명, (item as LawData).소관부처]
          : [(item as PrecedentData).사건명, (item as PrecedentData).법원명, (item as PrecedentData).판시사항];
        
        return searchFields.some(field => 
          field?.toLowerCase().includes(filterText.toLowerCase())
        );
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          const dateA = searchType === "law" 
            ? (a as LawData).공포일자 || (a as LawData).시행일자 || ""
            : (a as PrecedentData).선고일자 || "";
          const dateB = searchType === "law"
            ? (b as LawData).공포일자 || (b as LawData).시행일자 || ""
            : (b as PrecedentData).선고일자 || "";
          return dateB.localeCompare(dateA);
          
        case "date_asc":
          const dateA2 = searchType === "law" 
            ? (a as LawData).공포일자 || (a as LawData).시행일자 || ""
            : (a as PrecedentData).선고일자 || "";
          const dateB2 = searchType === "law"
            ? (b as LawData).공포일자 || (b as LawData).시행일자 || ""
            : (b as PrecedentData).선고일자 || "";
          return dateA2.localeCompare(dateB2);
          
        case "name_asc":
          const nameA = searchType === "law" 
            ? (a as LawData).법령명 || ""
            : (a as PrecedentData).사건명 || "";
          const nameB = searchType === "law"
            ? (b as LawData).법령명 || ""
            : (b as PrecedentData).사건명 || "";
          return nameA.localeCompare(nameB);
          
        case "name_desc":
          const nameA2 = searchType === "law" 
            ? (a as LawData).법령명 || ""
            : (a as PrecedentData).사건명 || "";
          const nameB2 = searchType === "law"
            ? (b as LawData).법령명 || ""
            : (b as PrecedentData).사건명 || "";
          return nameB2.localeCompare(nameA2);
          
        default: // relevance
          return 0;
      }
    });

    return filtered;
  }, [data, filterText, sortBy, searchType]);

  const handleItemClick = (item: SearchResultData) => {
    onItemClick?.(item);
  };

  const handleExport = () => {
    if (!processedData.length) return;
    
    // CSV 형태로 데이터 내보내기
    const headers = searchType === "law" 
      ? ["법령명", "공포일자", "시행일자", "소관부처", "법령ID"]
      : ["사건명", "사건번호", "선고일자", "법원명", "판례정보일련번호"];
    
    const rows = processedData.map(item => {
      if (searchType === "law") {
        const law = item as LawData;
        return [
          law.법령명 || "",
          law.공포일자 || "",
          law.시행일자 || "",
          law.소관부처 || "",
          law.법령ID || ""
        ];
      } else {
        const prec = item as PrecedentData;
        return [
          prec.사건명 || "",
          prec.사건번호 || "",
          prec.선고일자 || "",
          prec.법원명 || "",
          prec.판례정보일련번호 || ""
        ];
      }
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${searchType === "law" ? "법령" : "판례"}_검색결과_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <LoadingSpinner 
        type={searchType}
        message={`${searchType === "law" ? "법령" : "판례"}을 검색하고 있습니다...`}
        className={className}
      />
    );
  }

  // 에러 상태
  if (error) {
    return (
      <EmptyState
        type="error"
        searchType={searchType}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  // 검색하지 않은 상태
  if (!data) {
    return (
      <EmptyState
        type="no-search"
        searchType={searchType}
        onSuggestionClick={onSuggestionClick}
        className={className}
      />
    );
  }

  // 검색 결과 없음
  if (data.length === 0) {
    return (
      <EmptyState
        type="no-results"
        searchType={searchType}
        searchTerm={searchTerm}
        onClearSearch={onClearSearch}
        onSuggestionClick={onSuggestionClick}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 결과 헤더 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">
                검색 결과
              </CardTitle>
              <Badge variant="secondary" className="text-sm">
                {processedData.length}건
                {totalCount && totalCount !== processedData.length && (
                  <span className="ml-1 text-muted-foreground">/ {totalCount}</span>
                )}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {searchType === "law" ? "법령" : "판례"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 필터 토글 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-muted")}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">필터</span>
              </Button>
              
              {/* 보기 모드 */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* 내보내기 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">내보내기</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* 필터 및 정렬 옵션 */}
        {showFilters && (
          <CardContent className="pt-0 space-y-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 텍스트 필터 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">결과 내 검색</label>
                <Input
                  placeholder="결과 내에서 검색..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              {/* 정렬 옵션 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">정렬</label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">관련도순</SelectItem>
                    <SelectItem value="date_desc">날짜 최신순</SelectItem>
                    <SelectItem value="date_asc">날짜 오래된순</SelectItem>
                    <SelectItem value="name_asc">이름 가나다순</SelectItem>
                    <SelectItem value="name_desc">이름 역순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 현재 필터 상태 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">활성 필터</label>
                <div className="flex flex-wrap gap-1">
                  {filterText && (
                    <Badge variant="secondary" className="text-xs">
                      텍스트: {filterText}
                    </Badge>
                  )}
                  {sortBy !== "relevance" && (
                    <Badge variant="secondary" className="text-xs">
                      정렬: {sortBy}
                    </Badge>
                  )}
                  {(filterText || sortBy !== "relevance") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterText("");
                        setSortBy("relevance");
                      }}
                      className="h-5 px-2 text-xs"
                    >
                      초기화
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 검색 결과 리스트 */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 gap-4"
          : "space-y-3"
      )}>
        {processedData.map((item, index) => (
          searchType === "law" ? (
            <LawCard
              key={index}
              data={item as LawData}
              searchTerm={searchTerm}
              onClick={handleItemClick}
              className={cn(viewMode === "list" && "hover:bg-muted/50")}
            />
          ) : (
            <PrecedentCard
              key={index}
              data={item as PrecedentData}
              onClick={handleItemClick}
              className={cn(viewMode === "list" && "hover:bg-muted/50")}
            />
          )
        ))}
      </div>

      {/* 더보기 버튼 */}
      {hasNextPage && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            className="min-w-32"
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            더 보기
          </Button>
        </div>
      )}

      {/* 페이지 정보 */}
      {currentPage > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          페이지 {currentPage} • {processedData.length}건 표시
          {totalCount && ` (전체 ${totalCount}건)`}
        </div>
      )}
    </div>
  );
};