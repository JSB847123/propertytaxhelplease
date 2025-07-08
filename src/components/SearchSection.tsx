
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, Filter } from "lucide-react";
import { advancedSearch, expandSynonyms } from "@/lib/searchUtils";

interface SearchSectionProps {
  onSearch: (term: string, filters: string[]) => void;
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

export const SearchSection = ({ onSearch, searchTerm, setSearchTerm, resultCount }: SearchSectionProps) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 실시간 검색
  useEffect(() => {
    if (debouncedSearchTerm.length >= 1 || activeFilters.length > 0) {
      onSearch(debouncedSearchTerm, activeFilters);
    } else {
      onSearch("", []);
    }
  }, [debouncedSearchTerm, activeFilters, onSearch]);

  // 자동완성 제안 - 고급 검색 적용
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    // 직접 매치 + 유의어 매치 + 초성 매치
    const matchedTerms = LEGAL_TERMS.filter(term => 
      advancedSearch(term, searchTerm)
    );
    
    // 검색어의 유의어도 제안에 포함
    const synonyms = expandSynonyms(searchTerm.toLowerCase());
    const synonymMatches = LEGAL_TERMS.filter(term =>
      synonyms.some(synonym => term.toLowerCase().includes(synonym))
    );
    
    // 중복 제거 후 상위 8개 반환
    const allMatches = [...new Set([...matchedTerms, ...synonymMatches])];
    return allMatches.slice(0, 8);
  }, [searchTerm]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm, activeFilters);
      setShowSuggestions(false);
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
    onSearch(suggestion, activeFilters);
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          법령 검색
          {typeof resultCount === 'number' && (
            <span className="text-sm font-normal text-muted-foreground">
              {resultCount}개 결과
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검색 입력 */}
        <div className="relative">
          <div className="flex gap-2">
            <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
              <PopoverTrigger asChild>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="키워드, 조문명, 조문내용으로 검색..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(e.target.value.length >= 1);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(searchTerm.length >= 1)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 0);
                      setShowSuggestions(searchTerm.length >= 1);
                    }}
                    autoFocus
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start" side="bottom">
                {suggestions.length > 0 && (
                  <div className="max-h-[300px] overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
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
  );
};
