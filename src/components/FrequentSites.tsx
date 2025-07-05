import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe } from "lucide-react";

interface SiteLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

const frequentSites: SiteLink[] = [
  {
    id: "realty-price",
    title: "부동산공시가격 알리미",
    url: "https://www.realtyprice.kr/notice/main/mainBody.htm",
    description: "부동산 공시가격 조회"
  }
];

export const FrequentSites = () => {
  const handleSiteClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-4 w-4" />
          자주가는 사이트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {frequentSites.map((site) => (
            <Button
              key={site.id}
              variant="outline"
              className="w-full justify-start h-auto p-3 text-left"
              onClick={() => handleSiteClick(site.url)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1">
                  <div className="font-medium text-sm">{site.title}</div>
                  {site.description && (
                    <div className="text-xs text-gray-600 mt-1">{site.description}</div>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};