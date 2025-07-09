import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wifi, RefreshCw, Clock, Server, Shield } from "lucide-react";
import { APIError, isRetryableError } from "@/lib/apiClient";

interface ErrorDisplayProps {
  error: APIError;
  onRetry?: () => void;
  className?: string;
}

export const ErrorDisplay = ({ error, onRetry, className }: ErrorDisplayProps) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <Wifi className="h-8 w-8 text-destructive" />;
      case 'cors':
        return <Shield className="h-8 w-8 text-destructive" />;
      case 'api':
        return <Server className="h-8 w-8 text-destructive" />;
      case 'timeout':
        return <Clock className="h-8 w-8 text-destructive" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-destructive" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return '네트워크 연결 오류';
      case 'cors':
        return 'CORS 정책 오류';
      case 'api':
        return 'API 서버 오류';
      case 'timeout':
        return '요청 시간 초과';
      default:
        return '오류 발생';
    }
  };

  const getErrorDescription = () => {
    switch (error.type) {
      case 'network':
        return '인터넷 연결을 확인하고 다시 시도해주세요.';
      case 'cors':
        return '브라우저 보안 정책으로 인해 요청이 차단되었습니다.';
      case 'api':
        return error.details || '서버에서 오류가 발생했습니다.';
      case 'timeout':
        return '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '예상치 못한 오류가 발생했습니다.';
    }
  };

  const canRetry = isRetryableError(error) && onRetry;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        {getErrorIcon()}
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {error.message}
          </p>
          {error.type !== 'network' && (
            <p className="text-xs text-muted-foreground">
              {getErrorDescription()}
            </p>
          )}
        </div>

        {error.type === 'api' && error.statusCode && (
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            상태 코드: {error.statusCode}
          </div>
        )}

        {canRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        )}

        {error.type === 'cors' && (
          <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted rounded-md">
            <p className="font-medium mb-1">해결 방법:</p>
            <ul className="text-left space-y-1">
              <li>• 브라우저를 새로고침해보세요</li>
              <li>• 다른 브라우저를 사용해보세요</li>
              <li>• 잠시 후 다시 시도해보세요</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};