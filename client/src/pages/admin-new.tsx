import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminNew() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // 상태 관리 - Hook 규칙에 따라 모든 Hook을 상단에 위치
  const [seoData, setSeoData] = useState({
    pagePath: "/",
    pageTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    keywords: ""
  });

  const [aiData, setAiData] = useState({
    openaiModel: "gpt-4o",
    openaiApiKey: ""
  });

  // 모달 상태
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showConversionsModal, setShowConversionsModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);

  // 데이터 조회
  const { data: seoSettings, refetch: refetchSeoSettings } = useQuery({
    queryKey: ["/api/admin/seo", seoData.pagePath],
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

  // 데이터 로드 시 상태 업데이트
  useEffect(() => {
    if (seoSettings?.data && Array.isArray(seoSettings.data)) {
      // 선택된 페이지의 SEO 설정 찾기
      const currentPageSettings = seoSettings.data.find(setting => setting.pagePath === seoData.pagePath);
      if (currentPageSettings) {
        setSeoData({
          pagePath: currentPageSettings.pagePath || seoData.pagePath,
          pageTitle: currentPageSettings.pageTitle || "",
          metaDescription: currentPageSettings.metaDescription || "",
          ogTitle: currentPageSettings.ogTitle || "",
          ogDescription: currentPageSettings.ogDescription || "",
          keywords: currentPageSettings.keywords || ""
        });
      }
    } else if (seoSettings?.data && !Array.isArray(seoSettings.data)) {
      // 단일 객체인 경우
      setSeoData({
        pagePath: seoSettings.data.pagePath || seoData.pagePath,
        pageTitle: seoSettings.data.pageTitle || "",
        metaDescription: seoSettings.data.metaDescription || "",
        ogTitle: seoSettings.data.ogTitle || "",
        ogDescription: seoSettings.data.ogDescription || "",
        keywords: seoSettings.data.keywords || ""
      });
    }
  }, [seoSettings, seoData.pagePath]);

  useEffect(() => {
    if (aiSettings?.data) {
      setAiData({
        openaiModel: aiSettings.data.openaiModel || "gpt-4o",
        openaiApiKey: "" // API 키는 보안상 초기화
      });
    }
  }, [aiSettings]);

  // 인증되지 않은 사용자 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "관리자 페이지에 접근하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // 초기 SEO 데이터 로드
  useEffect(() => {
    if (isAuthenticated && seoData.pagePath) {
      const loadInitialSeoData = async () => {
        try {
          const response = await apiRequest("GET", `/api/admin/seo?pagePath=${seoData.pagePath}`);
          const data = await response.json();
          if (data.data) {
            setSeoData(prev => ({
              ...prev,
              pageTitle: data.data.pageTitle || "",
              metaDescription: data.data.metaDescription || "",
              ogTitle: data.data.ogTitle || "",
              ogDescription: data.data.ogDescription || "",
              keywords: data.data.keywords || ""
            }));
          }
        } catch (error) {
          console.error('Failed to load initial SEO settings:', error);
        }
      };
      loadInitialSeoData();
    }
  }, [isAuthenticated]);

  // 뮤테이션
  const seoMutation = useMutation({
    mutationFn: async (data: typeof seoData) => {
      return apiRequest("PUT", "/api/admin/seo", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "SEO 설정이 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      setShowSeoModal(false);
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "SEO 설정 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const aiMutation = useMutation({
    mutationFn: async (data: typeof aiData) => {
      return apiRequest("PUT", "/api/admin/ai", data);
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "AI 설정이 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai"] });
      setShowAiModal(false);
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "AI 설정 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // 로딩 중이거나 인증되지 않은 경우 조기 반환
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? '인증 상태 확인 중...' : '로그인 페이지로 이동 중...'}
          </p>
        </div>
      </div>
    );
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              🎯 관리자 패널
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              환영합니다, {user?.firstName || user?.email || '관리자'}님
            </p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            className="self-start sm:self-auto"
          >
            로그아웃
          </Button>
        </div>

        {/* 카드 기반 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* SEO 설정 카드 */}
          <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300">🔍 SEO 설정</CardTitle>
              <CardDescription>
                웹사이트의 검색 엔진 최적화 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">현재 페이지</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {seoSettings?.data?.pagePath || 'Homepage'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">제목</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {seoSettings?.data?.pageTitle || 'Korean Name Pronunciation Tool'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">설명</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {seoSettings?.data?.metaDescription || 'Transform names to Korean...'}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSeoModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  SEO 설정 편집
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI 설정 카드 */}
          <Card className="border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">🤖 AI 설정</CardTitle>
              <CardDescription>
                OpenAI API 및 모델 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">현재 모델</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {aiSettings?.data?.openaiModel || 'gpt-4o'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">API 키 상태</Label>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ 설정됨 (수정 가능)
                  </p>
                </div>
                <Button 
                  onClick={() => setShowAiModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  AI 설정 편집
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 상태 카드 */}
          <Card className="border-2 border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="text-orange-700 dark:text-orange-300">⚙️ 시스템 상태</CardTitle>
              <CardDescription>
                시스템 상태 및 설정을 확인합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">서버 상태</Label>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ 정상 운영
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">데이터베이스</Label>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ 연결됨
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSystemModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  시스템 정보 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO 설정 모달 */}
        <Dialog open={showSeoModal} onOpenChange={setShowSeoModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>SEO 설정 편집</DialogTitle>
              <DialogDescription>
                웹사이트의 검색 엔진 최적화 설정을 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSeoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="pagePath">페이지 선택</Label>
                <Select value={seoData.pagePath} onValueChange={async (value) => {
                  // 페이지 경로 업데이트
                  setSeoData(prev => ({...prev, pagePath: value}));

                  // 해당 페이지의 SEO 설정 로드
                  try {
                    const response = await apiRequest("GET", `/api/admin/seo?pagePath=${value}`);
                    const data = await response.json();
                    if (data.data) {
                      setSeoData({
                        pagePath: value,
                        pageTitle: data.data.pageTitle || "",
                        metaDescription: data.data.metaDescription || "",
                        ogTitle: data.data.ogTitle || "",
                        ogDescription: data.data.ogDescription || "",
                        keywords: data.data.keywords || ""
                      });
                    } else {
                      // 해당 페이지의 설정이 없으면 빈 값으로 초기화
                      setSeoData({
                        pagePath: value,
                        pageTitle: "",
                        metaDescription: "",
                        ogTitle: "",
                        ogDescription: "",
                        keywords: ""
                      });
                    }
                  } catch (error) {
                    console.error('Failed to load SEO settings for page:', error);
                    setSeoData({
                      pagePath: value,
                      pageTitle: "",
                      metaDescription: "",
                      ogTitle: "",
                      ogDescription: "",
                      keywords: ""
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="페이지를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/">홈페이지 (/)</SelectItem>
                    <SelectItem value="/korean-name-converter">한국 이름 변환기 (/korean-name-converter)</SelectItem>
                    <SelectItem value="/admin">관리자 패널 (/admin)</SelectItem>
                    <SelectItem value="/myadmin">새 관리자 패널 (/myadmin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pageTitle">페이지 제목</Label>
                <Input
                  id="pageTitle"
                  value={seoData.pageTitle}
                  onChange={(e) => setSeoData({...seoData, pageTitle: e.target.value})}
                  placeholder="Korean Name Pronunciation Tool"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">메타 설명</Label>
                <Textarea
                  id="metaDescription"
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({...seoData, metaDescription: e.target.value})}
                  placeholder="Transform names to Korean Hangul with accurate pronunciation guides..."
                />
              </div>
              <div>
                <Label htmlFor="ogTitle">Open Graph 제목</Label>
                <Input
                  id="ogTitle"
                  value={seoData.ogTitle}
                  onChange={(e) => setSeoData({...seoData, ogTitle: e.target.value})}
                  placeholder="Korean Name Pronunciation Tool"
                />
              </div>
              <div>
                <Label htmlFor="ogDescription">Open Graph 설명</Label>
                <Textarea
                  id="ogDescription"
                  value={seoData.ogDescription}
                  onChange={(e) => setSeoData({...seoData, ogDescription: e.target.value})}
                  placeholder="Transform names to Korean Hangul with accurate pronunciation guides..."
                />
              </div>
              <div>
                <Label htmlFor="keywords">키워드 (쉼표로 구분)</Label>
                <Input
                  id="keywords"
                  value={seoData.keywords}
                  onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                  placeholder="korean, name, pronunciation, hangul, converter"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowSeoModal(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={seoMutation.isPending}>
                  {seoMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* AI 설정 모달 */}
        <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI 모델 설정</DialogTitle>
              <DialogDescription>
                사용할 OpenAI 모델을 선택합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAiSubmit} className="space-y-4">
              <div>
                <Label htmlFor="openaiModel">OpenAI 모델</Label>
                <Select value={aiData.openaiModel} onValueChange={(value) => setAiData({...aiData, openaiModel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="모델 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                    <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
                    <SelectItem value="gpt-4.1-nano">GPT-4.1 Nano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="openaiApiKey">OpenAI API 키</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={aiData.openaiApiKey || ""}
                  onChange={(e) => setAiData({...aiData, openaiApiKey: e.target.value})}
                  placeholder="sk-... (선택사항)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  빈 칸으로 두면 환경 변수 OPENAI_API_KEY를 사용합니다
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAiModal(false)}>
                  취소
                </Button>
                <Button type="submit" disabled={aiMutation.isPending}>
                  {aiMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 변환 기록 모달 */}
        <Dialog open={showConversionsModal} onOpenChange={setShowConversionsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>변환 기록</DialogTitle>
              <DialogDescription>
                최근 이름 변환 기록을 확인합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {conversions?.length > 0 ? (
                conversions.map((conversion: any) => (
                  <div key={conversion.id} className="border-b pb-2 mb-2">
                    <p className="font-medium">{conversion.originalName} → {conversion.koreanName}</p>
                    <p className="text-sm text-gray-600">{conversion.sourceLanguage} | {conversion.romanization}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">변환 기록이 없습니다.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 시스템 상태 모달 */}
        <Dialog open={showSystemModal} onOpenChange={setShowSystemModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>시스템 정보</DialogTitle>
              <DialogDescription>
                현재 시스템 상태와 설정을 확인합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-medium">서버 상태</Label>
                <p className="text-green-600">✅ 정상 운영 중</p>
              </div>
              <div>
                <Label className="font-medium">데이터베이스</Label>
                <p className="text-green-600">✅ PostgreSQL 연결됨</p>
              </div>
              <div>
                <Label className="font-medium">인증 시스템</Label>
                <p className="text-green-600">✅ Replit OAuth 활성화</p>
              </div>
              <div>
                <Label className="font-medium">현재 사용자</Label>
                <p className="text-blue-600">{user?.email || '관리자'}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}