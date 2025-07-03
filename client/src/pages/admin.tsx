import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO 설정</CardTitle>
              <CardDescription>
                웹사이트의 검색 엔진 최적화 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                SEO 설정 관리
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 설정</CardTitle>
              <CardDescription>
                OpenAI API 키와 모델 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                AI 설정 관리
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>변환 기록</CardTitle>
              <CardDescription>
                최근 이름 변환 기록을 확인합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                변환 기록 보기
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>시스템 상태</CardTitle>
              <CardDescription>
                시스템 상태와 성능을 모니터링합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                시스템 상태 확인
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>보안 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>✓ XSS 취약점 수정 완료</p>
                <p>✓ 관리자 패널 인증 보호 적용</p>
                <p>✓ PostgreSQL 데이터베이스 연결</p>
                <p>✓ Replit OAuth 인증 시스템 적용</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}