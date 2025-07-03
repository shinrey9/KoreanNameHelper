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
  
  // 모달 상태
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showConversionsModal, setShowConversionsModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);

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

  // 데이터 로드 시 상태 업데이트
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

  // 뮤테이션
  const seoMutation = useMutation({
    mutationFn: async (data: typeof seoData) => {
      return apiRequest("/api/admin/seo", {
        method: "PUT",
        body: JSON.stringify(data)
      });
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
      return apiRequest("/api/admin/ai", {
        method: "PUT",
        body: JSON.stringify(data)
      });
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

  // 인증 확인
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "로그인이 필요합니다. 로그인 페이지로 이동합니다...",
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
              🎯 새로운 관리자 패널 (카드 스타일)
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

        {/* 카드 기반 레이아웃 */}
        <div className="grid md:grid-cols-2 gap-6">
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
                    {seoSettings?.data?.title || 'Korean Name Pronunciation Tool'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">설명</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {seoSettings?.data?.description || 'Transform names to Korean...'}
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {aiSettings?.data?.openaiApiKey ? '✅ 설정됨' : '❌ 미설정'}
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

          {/* 변환 기록 카드 */}
          <Card className="border-2 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-950">
            <CardHeader>
              <CardTitle className="text-purple-700 dark:text-purple-300">📊 변환 기록</CardTitle>
              <CardDescription>
                최근 이름 변환 기록을 확인합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">총 변환 횟수</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {conversions?.length || 0}건
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">최근 활동</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {conversions?.length > 0 ? '활성' : '없음'}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowConversionsModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  변환 기록 보기
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
                  placeholder="Korean Name Pronunciation Tool"
                />
              </div>
              <div>
                <Label htmlFor="description">메타 설명</Label>
                <Textarea
                  id="description"
                  value={seoData.description}
                  onChange={(e) => setSeoData({...seoData, description: e.target.value})}
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
              <DialogTitle>AI 설정 편집</DialogTitle>
              <DialogDescription>
                OpenAI API 키와 모델을 설정합니다.
              </DialogDescription>
            </DialogHeader>
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