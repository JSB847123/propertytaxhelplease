import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Scale, FileText } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  type?: 'law' | 'precedent' | 'general';
  className?: string;
}

export const LoadingSpinner = ({ 
  message, 
  type = 'general',
  className 
}: LoadingSpinnerProps) => {
  const getIcon = () => {
    switch (type) {
      case 'law':
        return <FileText className="h-8 w-8 text-primary animate-pulse" />;
      case 'precedent':
        return <Scale className="h-8 w-8 text-primary animate-pulse" />;
      default:
        return <Search className="h-8 w-8 text-primary animate-pulse" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'law':
        return '법령을 검색하고 있습니다...';
      case 'precedent':
        return '판례를 검색하고 있습니다...';
      default:
        return '검색하고 있습니다...';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          {getIcon()}
          <Loader2 className="h-6 w-6 absolute -top-1 -right-1 animate-spin text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">
            {message || getDefaultMessage()}
          </p>
          <p className="text-sm text-muted-foreground">
            잠시만 기다려주세요
          </p>
        </div>

        {/* 진행 표시 애니메이션 */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{
                animationDelay: `${index * 0.15}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};