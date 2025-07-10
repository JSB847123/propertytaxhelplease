
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, Filter, Settings } from "lucide-react";
import { advancedSearch, expandSynonyms } from "@/lib/searchUtils";
import { useSearchAPI } from "@/hooks/useSearchAPI";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import { PrecedentList } from "./PrecedentList";
import { LawList } from "./LawList";
import type { PrecedentData, LawData } from "@/lib/xmlParser";

interface SearchSectionProps {
  onSearch?: (term: string, filters: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resultCount?: number;
}

const LEGAL_TERMS = [
  "과세대상", "과세표준", "세율", "납세의무자", "납세지", "비과세",
  "부과징수", "과세기준일", "납기", "징수방법", "물납", "분할납부",
  "납부유예", "소액징수면제", "세부담상한", "신탁재산", "종교단체",
  "향교", "부동산과세자료분석", "지역자원시설세", "재산세", "지방세",
  "시행령", "시행규칙", "민법", "상속", "가족", "대습상속"
];

const CATEGORIES = [
  "전체", "정의", "과세대상", "납세의무자", "비과세", 
  "과세표준과 세율", "공장 관련", "부과·징수", "물납 관련",
  "분할납부·납부유예", "신탁재산 관련", "종교단체·향교 관련",
  "세 부담 상한", "소액 징수면제", "부동산 과세자료분석",
  "지역자원시설세", "지방교육세", "민법 관련"
];

const SEARCH_SCOPE_OPTIONS = {
  law: [
    { value: "all", label: "전체" },
    { value: "keyword", label: "법령 키워드" },
    { value: "title", label: "조문명" },
    { value: "content", label: "조문 내용" }
  ],
  precedent: [
    { value: "all", label: "전체" },
    { value: "title", label: "판례명" },
    { value: "content", label: "본문" }
  ]
};

const COURT_TYPES = [
  { value: "all", label: "전체" },
  { value: "supreme", label: "대법원" },
  { value: "lower", label: "하위법원" }
];

const SORT_OPTIONS = [
  { value: "relevance", label: "관련도순" },
  { value: "date_desc", label: "선고일자 최신순" },
  { value: "date_asc", label: "선고일자 오래된순" },
  { value: "case_name", label: "사건명순" }
];

const RESULT_COUNT_OPTIONS = [
  { value: "10", label: "10개" },
  { value: "20", label: "20개" },
  { value: "50", label: "50개" },
  { value: "100", label: "100개" }
];

export const SearchSection = ({ onSearch, searchTerm, setSearchTerm, resultCount }: SearchSectionProps) => {
  const { data, isLoading, error, search, retry, reset } = useSearchAPI();
  const { addSearchHistory, getRecentSearches } = useSearchHistory();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // 새로운 상태들
  const [searchType, setSearchType] = useState<"law" | "precedent">("law");
  const [searchScope, setSearchScope] = useState("all");
  const [courtType, setCourtType] = useState("all");
  const [sortOption, setSortOption] = useState("relevance");
  const [resultCountOption, setResultCountOption] = useState("20");
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 실시간 검색 - API 호출
  useEffect(() => {
    if (debouncedSearchTerm.length >= 1) {
      handleAPISearch(debouncedSearchTerm);
    } else {
      reset();
    }
    
    // 기존 onSearch 콜백 호출 (하위 호환성)
    if (onSearch) {
      if (debouncedSearchTerm.length >= 1 || activeFilters.length > 0) {
        onSearch(debouncedSearchTerm, activeFilters);
      } else {
        onSearch("", []);
      }
    }
  }, [debouncedSearchTerm, activeFilters, onSearch, reset]);

  // 자동완성 제안 - 고급 검색 + 검색 기록 적용
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    // 법률 용어 매치
    const matchedTerms = LEGAL_TERMS.filter(term => 
      advancedSearch(term, searchTerm)
    );
    
    // 유의어 매치
    const synonyms = expandSynonyms(searchTerm.toLowerCase());
    const synonymMatches = LEGAL_TERMS.filter(term =>
      synonyms.some(synonym => term.toLowerCase().includes(synonym))
    );
    
    // 최근 검색어 매치  
    const recentSearches = getRecentSearches(searchType === 'precedent' ? 'prec' : 'law', 3)
      .filter(recent => recent.query.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 중복 제거 후 상위 8개 반환 (최근 검색어 우선)
    const allMatches: (string | typeof recentSearches[0])[] = [
      ...recentSearches,
      ...matchedTerms,
      ...synonymMatches
    ];
    
    // 중복 제거 (문자열과 객체 모두 고려)
    const uniqueMatches = allMatches.filter((item, index, self) => {
      const itemText = typeof item === 'string' ? item : item.query;
      return index === self.findIndex(i => (typeof i === 'string' ? i : i.query) === itemText);
    });
    
    return uniqueMatches.slice(0, 8);
  }, [searchTerm, searchType, getRecentSearches]);

  const handleAPISearch = async (query: string) => {
    if (!query.trim()) return;

    const searchParams = {
      target: searchType === 'precedent' ? 'prec' as const : 'law' as const,
      query: query.trim(),
      ...(searchType === 'precedent' && {
        search: searchScope === 'title' ? '1' : searchScope === 'content' ? '2' : '0',
        display: parseInt(resultCountOption),
        page: 1
      })
    };

    const result = await search(searchParams);
    
    // 검색 성공 시 기록 저장
    if (result) {
      addSearchHistory(
        query.trim(), 
        searchType === 'precedent' ? 'prec' : 'law',
        data ? data.length : undefined
      );
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      handleAPISearch(searchTerm);
      setShowSuggestions(false);
      
      // 기존 onSearch 콜백 호출 (하위 호환성)
      if (onSearch) {
        onSearch(searchTerm, activeFilters);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleAPISearch(suggestion);
    
    // 기존 onSearch 콜백 호출 (하위 호환성)  
    if (onSearch) {
      onSearch(suggestion, activeFilters);
    }
  };

  const toggleFilter = (category: string) => {
    if (category === "전체") {
      setActiveFilters([]);
    } else {
      setActiveFilters(prev => 
        prev.includes(category)
          ? prev.filter(f => f !== category)
          : [...prev, category]
      );
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const removeFilter = (category: string) => {
    setActiveFilters(prev => prev.filter(f => f !== category));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            검색
            {typeof resultCount === 'number' && (
              <span className="text-sm font-normal text-muted-foreground">
                {resultCount}개 결과
              </span>
            )}
            {data && Array.isArray(data) && (
              <span className="text-sm font-normal text-muted-foreground">
                {data.length}개 결과
              </span>
            )}
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* 검색 타입 선택 */}
        <div className="flex gap-2">
          <Select value={searchType} onValueChange={(value: "law" | "precedent") => {
            setSearchType(value);
            setSearchScope("all"); // 검색 타입 변경 시 범위 초기화
          }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="law">법령</SelectItem>
              <SelectItem value="precedent">판례</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={searchScope} onValueChange={setSearchScope}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_SCOPE_OPTIONS[searchType].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            고급옵션
          </Button>
        </div>

        {/* 고급 옵션 (판례 검색용) */}
        {showAdvancedOptions && searchType === "precedent" && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">법원 종류</label>
              <Select value={courtType} onValueChange={setCourtType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURT_TYPES.map((court) => (
                    <SelectItem key={court.value} value={court.value}>
                      {court.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">정렬 옵션</label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">결과 개수</label>
              <Select value={resultCountOption} onValueChange={setResultCountOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULT_COUNT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={searchType === "law" ? "키워드, 조문명, 조문내용으로 검색..." : "판례명, 본문으로 검색..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.length >= 1);
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(searchTerm.length >= 1)}
                onBlur={(e) => {
                  // 제안 목록 클릭 시에는 blur 무시
                  if (!e.relatedTarget?.closest('[data-suggestions-container]')) {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }
                }}
                autoFocus
              />
              
              {/* 제안 목록 */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  data-suggestions-container
                  className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => {
                    const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.query;
                    const recentSearches = getRecentSearches(searchType === 'precedent' ? 'prec' : 'law', 3);
                    const isRecentSearch = recentSearches.some(recent => recent.query === suggestionText);
                    return (
                      <div
                        key={typeof suggestion === 'string' ? suggestion : suggestion.id}
                        onClick={() => handleSuggestionClick(suggestionText)}
                        className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        <span className={isRecentSearch ? "font-medium" : ""}>{suggestionText}</span>
                        {isRecentSearch && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            최근
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
            
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4" />
                  {activeFilters.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">카테고리 필터</h4>
                    {activeFilters.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        모두 지우기
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <Badge
                        key={category}
                        variant={activeFilters.includes(category) || (category === "전체" && activeFilters.length === 0) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 활성 필터 표시 */}
        {activeFilters.length > 0 && (
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
        )}
      </CardContent>
    </Card>

    {/* 로딩 상태 */}
    {isLoading && (
      <LoadingSpinner 
        type={searchType} 
        message={searchType === 'law' ? '법령을 검색하고 있습니다...' : '판례를 검색하고 있습니다...'}
      />
    )}

    {/* 에러 상태 */}
    {error && (
      <ErrorDisplay 
        error={error} 
        onRetry={retry}
      />
    )}

    {/* 검색 결과 */}
    {!isLoading && !error && data && searchType === 'precedent' && (
      <PrecedentList 
        precedents={data as import('@/lib/xmlParser').PrecedentData[]}
        searchTerm={searchTerm}
      />
    )}

    {/* 법령 검색 결과 */}
    {!isLoading && !error && data && searchType === 'law' && (
      <LawList 
        laws={data as LawData[]}
        searchTerm={searchTerm}
      />
    )}
  </div>
  );
};
