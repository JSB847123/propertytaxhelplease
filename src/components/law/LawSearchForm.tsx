import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface LawSearchFormProps {
  onSearch: (query: string, type: 'law' | 'prec') => void;
  isLoading: boolean;
  onReset: () => void;
}

export const LawSearchForm = ({ onSearch, isLoading, onReset }: LawSearchFormProps) => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<'law' | 'prec'>('law');
  const { addSearchHistory, getRecentSearches } = useSearchHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    addSearchHistory(query, searchType);
    onSearch(query, searchType);
  };

  const handleReset = () => {
    setQuery("");
    setSearchType('law');
    onReset();
  };

  const recentSearches = getRecentSearches().slice(0, 5);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">검색 유형</Label>
          <RadioGroup 
            value={searchType} 
            onValueChange={(value) => setSearchType(value as 'law' | 'prec')}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="law" id="law" />
              <Label htmlFor="law" className="text-sm">법령</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prec" id="prec" />
              <Label htmlFor="prec" className="text-sm">판례</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search-query" className="text-sm font-medium">
            검색어
          </Label>
          <Input
            id="search-query"
            type="text"
            placeholder={searchType === 'law' ? "법령명을 입력하세요" : "사건명, 키워드를 입력하세요"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Search Buttons */}
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "검색 중..." : "검색"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            최근 검색
          </Label>
          <div className="space-y-1">
            {recentSearches.map((search, index) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent 
                  className="p-2 text-sm"
                  onClick={() => {
                    setQuery(search.query);
                    setSearchType(search.type);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{search.query}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {search.type === 'law' ? '법령' : '판례'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};