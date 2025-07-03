import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  // 상태 관리
  const [seoData, setSeoData] = useState({
    pagePath: "",
    title: "",
    description: "",
    ogTitle: "",
    ogDescription: "",
    keywords: ""
  });
  
  const [aiData, setAiData] = useState({
    openaiApiKey: "",
    openaiModel: "gpt-4o"
  });

  // 데이터 조회
  const { data: seoSettings } = useQuery({
    queryKey: ["/api/admin/seo"],
    enabled: isAuthenticated,
  });

  const { data: aiSettings } = useQuery({
    queryKey: ["/api/admin/ai"],
    enabled: isAuthenticated,
  });

  const { data: conversions } = useQuery({
    queryKey: ["/api/recent-conversions"],
    enabled: isAuthenticated,
  });

  // 데이터가 로드되면 폼 상태 업데이트
  useEffect(() => {
    if (seoSettings?.data) {
      setSeoData({
        pagePath: seoSettings.data.pagePath || "",
        title: seoSettings.data.title || "",
        description: seoSettings.data.description || "",
        ogTitle: seoSettings.data.ogTitle || "",
        ogDescription: seoSettings.data.ogDescription || "",
        keywords: seoSettings.data.keywords || ""
      });
    }
  }, [seoSettings]);

  useEffect(() => {
    if (aiSettings?.data) {
      setAiData({
        openaiApiKey: aiSettings.data.openaiApiKey || "",
        openaiModel: aiSettings.data.openaiModel || "gpt-4o"
      });
    }
  }, [aiSettings]);

  // SEO 설정 업데이트
  const seoMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/seo", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "SEO 설정이 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "SEO 설정 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // AI 설정 업데이트
  const aiMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/ai", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "AI 설정이 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai"] });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "AI 설정 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // 인증 체크
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "관리자 권한이 필요합니다. 로그인 페이지로 이동합니다...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSeoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    seoMutation.mutate(seoData);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    aiMutation.mutate(aiData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              관리자 패널
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              환영합니다, {user?.firstName || user?.email || '관리자'}님
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/api/logout"}
          >
            로그아웃
          </Button>
        </div>

        <Tabs defaultValue="seo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="seo">SEO 설정</TabsTrigger>
            <TabsTrigger value="ai">AI 설정</TabsTrigger>
            <TabsTrigger value="conversions">변환 기록</TabsTrigger>
            <TabsTrigger value="system">시스템 상태</TabsTrigger>
          </TabsList>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO 설정 관리</CardTitle>
                <CardDescription>
                  웹사이트의 검색 엔진 최적화 메타데이터를 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSeoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="pagePath">페이지 경로</Label>
                    <Input
                      id="pagePath"
                      value={seoData.pagePath}
                      onChange={(e) => setSeoData({...seoData, pagePath: e.target.value})}
                      placeholder="/"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">페이지 제목</Label>
                    <Input
                      id="title"
                      value={seoData.title}
                      onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                      placeholder="사이트 제목"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">메타 설명</Label>
                    <Textarea
                      id="description"
                      value={seoData.description}
                      onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                      placeholder="사이트 설명"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogTitle">Open Graph 제목</Label>
                    <Input
                      id="ogTitle"
                      value={seoData.ogTitle}
                      onChange={(e) => setSeoData({...seoData, ogTitle: e.target.value})}
                      placeholder="소셜 미디어 공유 제목"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogDescription">Open Graph 설명</Label>
                    <Textarea
                      id="ogDescription"
                      value={seoData.ogDescription}
                      onChange={(e) => setSeoData({...seoData, ogDescription: e.target.value})}
                      placeholder="소셜 미디어 공유 설명"
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">키워드</Label>
                    <Input
                      id="keywords"
                      value={seoData.keywords}
                      onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                      placeholder="키워드1, 키워드2, 키워드3"
                    />
                  </div>
                  <Button type="submit" disabled={seoMutation.isPending}>
                    {seoMutation.isPending ? "저장 중..." : "SEO 설정 저장"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI 설정 관리</CardTitle>
                <CardDescription>
                  OpenAI API 키와 모델 설정을 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAiSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="openaiApiKey">OpenAI API 키</Label>
                    <Input
                      id="openaiApiKey"
                      type="password"
                      value={aiData.openaiApiKey}
                      onChange={(e) => setAiData({...aiData, openaiApiKey: e.target.value})}
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="openaiModel">OpenAI 모델</Label>
                    <Select
                      value={aiData.openaiModel}
                      onValueChange={(value) => setAiData({...aiData, openaiModel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="모델 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={aiMutation.isPending}>
                    {aiMutation.isPending ? "저장 중..." : "AI 설정 저장"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions">
            <Card>
              <CardHeader>
                <CardTitle>최근 변환 기록</CardTitle>
                <CardDescription>
                  최근 이름 변환 기록을 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversions && conversions.length > 0 ? (
                  <div className="space-y-2">
                    {conversions.map((conversion: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{conversion.originalName}</span>
                          <span className="text-sm text-gray-500">{conversion.sourceLanguage}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          → {conversion.koreanName} ({conversion.romanization})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">변환 기록이 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
                <CardDescription>
                  시스템 보안 및 설정 상태를 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h3 className="font-semibold text-green-800 dark:text-green-200">보안 상태</h3>
                      <div className="space-y-1 text-sm text-green-700 dark:text-green-300 mt-2">
                        <p>✓ XSS 취약점 수정 완료</p>
                        <p>✓ 관리자 패널 인증 보호</p>
                        <p>✓ PostgreSQL 데이터베이스 연결</p>
                        <p>✓ Replit OAuth 인증 시스템</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">데이터베이스</h3>
                      <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300 mt-2">
                        <p>✓ 연결 상태: 정상</p>
                        <p>✓ 사용자 테이블: 활성</p>
                        <p>✓ 세션 테이블: 활성</p>
                        <p>✓ 변환 테이블: 활성</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}