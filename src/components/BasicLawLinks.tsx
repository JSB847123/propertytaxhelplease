import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const BASIC_LAWS = [
  { name: "지방세법", url: "https://law.go.kr/법령/지방세법" },
  { name: "지방세법 시행령", url: "https://law.go.kr/법령/지방세법%20시행령" },
  { name: "지방세법 시행규칙", url: "https://law.go.kr/법령/지방세법%20시행규칙" },
  { name: "지방세특례제한법", url: "https://law.go.kr/법령/지방세특례제한법" },
  { name: "지방세특례제한법 시행령", url: "https://law.go.kr/법령/지방세특례제한법%20시행령" },
  { name: "지방세특례제한법 시행규칙", url: "https://law.go.kr/법령/지방세특례제한법시행규칙" },
];

export const BasicLawLinks = () => {
  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground font-medium">기본 법령:</span>
          {BASIC_LAWS.map((law, index) => (
            <span key={law.name} className="flex items-center">
              <a
                href={law.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 hover:underline flex items-center gap-1"
              >
                {law.name}
                <ExternalLink className="h-3 w-3" />
              </a>
              {index < BASIC_LAWS.length - 1 && (
                <span className="text-muted-foreground ml-2">•</span>
              )}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};