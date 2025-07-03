import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            한국어 이름 변환 도구
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            다양한 언어의 이름을 한국어로 변환하고 정확한 발음을 제공합니다
          </p>
          <Button 
            className="px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            로그인하기
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                다국어 지원
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                영어, 중국어, 일본어 등 다양한 언어의 이름을 한국어로 정확하게 변환합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                발음 가이드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                변환된 한국어 이름의 정확한 발음과 음성 재생 기능을 제공합니다.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                관리자 패널
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                로그인 후 관리자 권한으로 시스템 설정과 SEO 관리가 가능합니다.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Replit 계정으로 로그인하여 모든 기능을 이용하세요
          </p>
        </div>
      </div>
    </div>
  );
}