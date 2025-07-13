import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, Filter } from 'lucide-react';
import { SearchParams } from '@/lib/LegalCaseService';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'1' | '2'>('2'); // 1: 판례명, 2: 본문검색
  const [display, setDisplay] = useState(20);
  const [page, setPage] = useState(1);
  const [curt, setCurt] = useState('');
  const [sort, setSort] = useState<'date' | 'score'>('date');
  const [prncYdStart, setPrncYdStart] = useState('20000101');
  const [prncYdEnd, setPrncYdEnd] = useState('20241231');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    const searchParams: SearchParams = {
      query: query.trim(),
      search: searchType,
      display,
      page,
      sort,
      prncYdStart,
      prncYdEnd
    };

    if (curt) {
      searchParams.curt = curt;
    }

    onSearch(searchParams);
  };

  const handleReset = () => {
    setQuery('');
    setSearchType('2');
    setDisplay(20);
    setPage(1);
    setCurt('');
    setSort('date');
    setPrncYdStart('20000101');
    setPrncYdEnd('20241231');
    setShowAdvanced(false);
  };

  const formatDate = (dateString: string) => {
    if (dateString.length === 8) {
      return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    }
    return dateString;
  };

  const parseDate = (dateString: string) => {
    return dateString.replace(/-/g, '');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          판례 검색
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 검색 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="query">검색어</Label>
                <Input
                  id="query"
                  type="text"
                  placeholder="예: 자동차 사고, 담보권, 계약 등"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="searchType">검색 범위</Label>
                <Select value={searchType} onValueChange={(value: '1' | '2') => setSearchType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">판례명</SelectItem>
                    <SelectItem value="2">본문검색</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-32">
                <Label htmlFor="display">결과 개수</Label>
                <Select value={display.toString()} onValueChange={(value) => setDisplay(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10개</SelectItem>
                    <SelectItem value="20">20개</SelectItem>
                    <SelectItem value="50">50개</SelectItem>
                    <SelectItem value="100">100개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label htmlFor="sort">정렬</Label>
                <Select value={sort} onValueChange={(value: 'date' | 'score') => setSort(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">날짜순</SelectItem>
                    <SelectItem value="score">관련도순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex items-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? '검색 중...' : '🔍 검색'}
                </Button>
              </div>
            </div>
          </div>

          {/* 고급 검색 */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                고급 검색
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="curt">법원명</Label>
                  <Select value={curt} onValueChange={setCurt}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      <SelectItem value="대법원">대법원</SelectItem>
                      <SelectItem value="서울고등법원">서울고등법원</SelectItem>
                      <SelectItem value="서울중앙지방법원">서울중앙지방법원</SelectItem>
                      <SelectItem value="서울남부지방법원">서울남부지방법원</SelectItem>
                      <SelectItem value="서울북부지방법원">서울북부지방법원</SelectItem>
                      <SelectItem value="서울동부지방법원">서울동부지방법원</SelectItem>
                      <SelectItem value="서울서부지방법원">서울서부지방법원</SelectItem>
                      <SelectItem value="인천지방법원">인천지방법원</SelectItem>
                      <SelectItem value="수원지방법원">수원지방법원</SelectItem>
                      <SelectItem value="대전지방법원">대전지방법원</SelectItem>
                      <SelectItem value="대구지방법원">대구지방법원</SelectItem>
                      <SelectItem value="부산지방법원">부산지방법원</SelectItem>
                      <SelectItem value="광주지방법원">광주지방법원</SelectItem>
                      <SelectItem value="전주지방법원">전주지방법원</SelectItem>
                      <SelectItem value="청주지방법원">청주지방법원</SelectItem>
                      <SelectItem value="춘천지방법원">춘천지방법원</SelectItem>
                      <SelectItem value="제주지방법원">제주지방법원</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="page">페이지</Label>
                  <Input
                    id="page"
                    type="number"
                    min="1"
                    value={page}
                    onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="prncYdStart">선고일자 시작</Label>
                  <Input
                    id="prncYdStart"
                    type="date"
                    value={formatDate(prncYdStart)}
                    onChange={(e) => setPrncYdStart(parseDate(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="prncYdEnd">선고일자 종료</Label>
                  <Input
                    id="prncYdEnd"
                    type="date"
                    value={formatDate(prncYdEnd)}
                    onChange={(e) => setPrncYdEnd(parseDate(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
                  초기화
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '검색 중...' : '🔍 고급 검색'}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </CardContent>
    </Card>
  );
}; 