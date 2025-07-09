import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Calendar as CalendarIcon, Settings2, History, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSearchHistory } from "@/hooks/useSearchHistory";

export interface SearchFormData {
  query: string;
  searchType: "law" | "prec";
  searchScope: "0" | "1" | "2"; // 0: 전체, 1: 제목, 2: 본문
  dateFrom?: Date;
  dateTo?: Date;
  court?: string;
  department?: string;
  resultCount: number;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<SearchFormData>;
}

const COURT_OPTIONS = [
  { value: "all", label: "전체 법원" },
  { value: "supreme", label: "대법원" },
  { value: "high", label: "고등법원" },
  { value: "district", label: "지방법원" },
  { value: "patent", label: "특허법원" },
  { value: "administrative", label: "행정법원" },
];

const RESULT_COUNT_OPTIONS = [
  { value: 10, label: "10개" },
  { value: 20, label: "20개" },
  { value: 50, label: "50개" },
  { value: 100, label: "100개" },
];

export const SearchForm = ({ onSearch, isLoading = false, defaultValues }: SearchFormProps) => {
  const { getRecentSearches, addSearchHistory } = useSearchHistory();
  const [formData, setFormData] = useState<SearchFormData>({
    query: defaultValues?.query || "",
    searchType: defaultValues?.searchType || "law",
    searchScope: defaultValues?.searchScope || "0",
    dateFrom: defaultValues?.dateFrom,
    dateTo: defaultValues?.dateTo,
    court: defaultValues?.court || "all",
    department: defaultValues?.department || "",
    resultCount: defaultValues?.resultCount || 20,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const recentSearches = getRecentSearches(formData.searchType, 5);

  const handleInputChange = (field: keyof SearchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.query.trim()) return;

    // 검색 히스토리에 추가
    addSearchHistory(formData.query.trim(), formData.searchType);
    
    onSearch(formData);
    setShowHistory(false);
  };

  const handleHistoryClick = (query: string) => {
    setFormData(prev => ({ ...prev, query }));
    setShowHistory(false);
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters(prev => [...prev, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setFormData(prev => ({
      ...prev,
      dateFrom: undefined,
      dateTo: undefined,
      court: "all",
      department: "",
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>검색 조건</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 검색어 입력 */}
          <div className="space-y-2">
            <Label htmlFor="search-query">검색어</Label>
            <div className="relative">
              <Input
                id="search-query"
                placeholder="검색어를 입력하세요..."
                value={formData.query}
                onChange={(e) => handleInputChange("query", e.target.value)}
                onFocus={() => setShowHistory(true)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {recentSearches.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!formData.query.trim() || isLoading}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* 검색 히스토리 */}
              {showHistory && recentSearches.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">최근 검색어</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleHistoryClick(search.query)}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>{search.query}</span>
                        <span className="text-xs text-muted-foreground">
                          {search.resultCount ? `${search.resultCount}건` : ""}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 검색 타입 */}
          <div className="space-y-3">
            <Label>검색 타입</Label>
            <RadioGroup
              value={formData.searchType}
              onValueChange={(value: "law" | "prec") => handleInputChange("searchType", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="law" id="law" />
                <Label htmlFor="law">법령</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prec" id="prec" />
                <Label htmlFor="prec">판례</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 검색 범위 */}
          <div className="space-y-2">
            <Label>검색 범위</Label>
            <Select
              value={formData.searchScope}
              onValueChange={(value: "0" | "1" | "2") => handleInputChange("searchScope", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">전체</SelectItem>
                <SelectItem value="1">제목</SelectItem>
                <SelectItem value="2">본문</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 고급 검색 옵션 */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <Settings2 className="h-4 w-4 mr-2" />
                고급 검색 옵션
                <ChevronDown className={cn(
                  "h-4 w-4 ml-auto transition-transform",
                  showAdvanced && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-4">
              {/* 날짜 범위 (판례용) */}
              {formData.searchType === "prec" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>시작 날짜</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateFrom ? format(formData.dateFrom, "yyyy-MM-dd") : "선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dateFrom}
                          onSelect={(date) => handleInputChange("dateFrom", date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>종료 날짜</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateTo ? format(formData.dateTo, "yyyy-MM-dd") : "선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dateTo}
                          onSelect={(date) => handleInputChange("dateTo", date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* 법원 선택 (판례용) */}
              {formData.searchType === "prec" && (
                <div className="space-y-2">
                  <Label>법원</Label>
                  <Select
                    value={formData.court}
                    onValueChange={(value) => handleInputChange("court", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COURT_OPTIONS.map((court) => (
                        <SelectItem key={court.value} value={court.value}>
                          {court.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 결과 개수 */}
              <div className="space-y-2">
                <Label>결과 개수</Label>
                <Select
                  value={formData.resultCount.toString()}
                  onValueChange={(value) => handleInputChange("resultCount", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULT_COUNT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 활성 필터 표시 */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">활성 필터</Label>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  모두 지우기
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                    {filter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter(filter)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 검색 버튼 */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!formData.query.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                검색 중...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                검색
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};