import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  Plus, 
  Minus, 
  Printer, 
  ArrowUp,
  Type
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const UtilityBar = () => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 폰트 크기 적용
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // 인쇄 모드 스타일 적용
  useEffect(() => {
    if (isPrintMode) {
      document.body.classList.add('print-mode');
    } else {
      document.body.classList.remove('print-mode');
    }
  }, [isPrintMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const resetFontSize = () => {
    setFontSize(16);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 유틸리티 바 */}
      <div className="bg-muted/50 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 브레드크럼 */}
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>홈</span>
              <span>/</span>
              <span className="text-foreground">재산세 법령 포털</span>
            </nav>

            {/* 오른쪽: 유틸리티 버튼들 */}
            <div className="flex items-center space-x-2">
              {/* 텍스트 크기 조정 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Type className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">텍스트 크기</div>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={decreaseFontSize}
                        disabled={fontSize <= 12}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm">{fontSize}px</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseFontSize}
                        disabled={fontSize >= 24}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFontSize}
                      className="w-full"
                    >
                      기본값으로 재설정
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* 인쇄 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                title="인쇄하기"
              >
                인쇄
              </Button>

              {/* 다크 모드 토글 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                title="테마 변경"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 위로 가기 버튼 */}
      {showScrollTop && (
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
          size="sm"
          onClick={scrollToTop}
          title="위로 가기"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};