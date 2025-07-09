import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  type?: "law" | "prec" | "default";
  size?: "sm" | "md" | "lg";
  variant?: "card" | "inline" | "overlay";
  className?: string;
}

export const LoadingSpinner = ({ 
  message, 
  type = "default", 
  size = "md",
  variant = "card",
  className 
}: LoadingSpinnerProps) => {
  const getDefaultMessage = () => {
    switch (type) {
      case "law":
        return "법령을 검색하고 있습니다...";
      case "prec":
        return "판례를 검색하고 있습니다...";
      default:
        return "검색하고 있습니다...";
    }
  };

  const displayMessage = message || getDefaultMessage();

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "lg":
        return "h-16 w-16";
      default:
        return "h-12 w-12";
    }
  };

  const getSpinnerContent = () => (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* 주 스피너 */}
      <div className="relative">
        <div className={cn(
          "animate-spin rounded-full border-4 border-muted border-t-primary",
          getSizeClasses()
        )}></div>
        {/* 내부 펄스 효과 */}
        <div className={cn(
          "absolute inset-2 rounded-full bg-primary/10 animate-pulse",
          size === "sm" && "inset-1",
          size === "lg" && "inset-4"
        )}></div>
      </div>
      
      {/* 메시지 */}
      <div className="text-center space-y-2">
        <p className={cn(
          "text-muted-foreground font-medium",
          size === "sm" && "text-sm",
          size === "lg" && "text-lg"
        )}>
          {displayMessage}
        </p>
        
        {/* 진행 점들 */}
        <div className="flex items-center justify-center space-x-1">
          <div className={cn(
            "bg-primary rounded-full animate-bounce",
            size === "sm" ? "h-1 w-1" : "h-2 w-2"
          )} style={{ animationDelay: "0ms" }}></div>
          <div className={cn(
            "bg-primary rounded-full animate-bounce",
            size === "sm" ? "h-1 w-1" : "h-2 w-2"
          )} style={{ animationDelay: "150ms" }}></div>
          <div className={cn(
            "bg-primary rounded-full animate-bounce",
            size === "sm" ? "h-1 w-1" : "h-2 w-2"
          )} style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case "inline":
      return (
        <div className={cn("py-8", className)}>
          {getSpinnerContent()}
        </div>
      );
      
    case "overlay":
      return (
        <div className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
          className
        )}>
          <Card className="p-8">
            <CardContent className="p-0">
              {getSpinnerContent()}
            </CardContent>
          </Card>
        </div>
      );
      
    default: // card
      return (
        <Card className={cn("w-full", className)}>
          <CardContent className="py-12">
            {getSpinnerContent()}
          </CardContent>
        </Card>
      );
  }
};