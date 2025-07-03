import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Languages, ArrowRight, Sparkles, Globe, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">NameAtlas</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                환영합니다, {user?.firstName || user?.email || '사용자'}님
              </span>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  관리자
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NameAtlas
            </h1>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-6">
            Discover your name in every language
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful conversion tools for names, text, and more. Connect with global languages using AI-powered accuracy.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Korean Name Converter */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-700">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Languages className="h-8 w-8 text-blue-600 mr-3" />
                <CardTitle className="text-xl">Korean Name Converter</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Convert your name to Korean Hangul with accurate pronunciation guides and audio playback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                  AI-powered transliteration
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Languages className="h-4 w-4 mr-2 text-green-500" />
                  20+ source languages supported
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="h-4 w-4 mr-2 text-blue-500" />
                  Pronunciation audio playback
                </div>
              </div>
              <Link href="/korean-name-converter">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Convert My Name
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Coming Soon Tools */}
          <Card className="opacity-60 border-dashed border-gray-300 dark:border-gray-600">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Languages className="h-8 w-8 text-gray-400 mr-3" />
                <CardTitle className="text-xl text-gray-600 dark:text-gray-400">Chinese Name Converter</CardTitle>
              </div>
              <CardDescription className="text-gray-500 dark:text-gray-500">
                Convert names to traditional and simplified Chinese characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60 border-dashed border-gray-300 dark:border-gray-600">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Languages className="h-8 w-8 text-gray-400 mr-3" />
                <CardTitle className="text-xl text-gray-600 dark:text-gray-400">Japanese Name Converter</CardTitle>
              </div>
              <CardDescription className="text-gray-500 dark:text-gray-500">
                Transform names into Hiragana, Katakana, and Kanji scripts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">See it. Say it. In every language.</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced AI models ensure precise translations and natural pronunciation.
              </p>
            </div>
            <div className="p-6">
              <Languages className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Language Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Support for dozens of languages from around the world.
              </p>
            </div>
            <div className="p-6">
              <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cultural Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Respect for cultural naming conventions and pronunciation nuances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}