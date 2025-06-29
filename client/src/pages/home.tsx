import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageConverter } from "@/components/LanguageConverter";
import { ConversionResults } from "@/components/ConversionResults";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Languages, Cog, Lightbulb, CheckCircle } from "lucide-react";

interface ConversionData {
  id: number;
  originalName: string;
  sourceLanguage: string;
  koreanName: string;
  romanization: string;
  breakdown: any[];
}

export default function Home() {
  const [conversionResult, setConversionResult] = useState<ConversionData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>();
  const { toast } = useToast();

  const conversionMutation = useMutation({
    mutationFn: async (data: { name: string; sourceLanguage: string }) => {
      const response = await apiRequest("POST", "/api/convert", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setConversionResult(data.data);
        // Auto-generate audio URL
        generateAudio(data.data.koreanName);
      } else {
        throw new Error(data.error || 'Conversion failed');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Please try again with a different name",
        variant: "destructive",
      });
    },
  });

  const audioMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/tts", { text });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAudioUrl(data.data.audioUrl);
      }
    },
    onError: (error: any) => {
      console.error('Audio generation failed:', error);
      // Don't show error toast for audio - it's optional
    },
  });

  const generateAudio = (text: string) => {
    audioMutation.mutate(text);
  };

  const handleConvert = (data: { name: string; sourceLanguage: string }) => {
    conversionMutation.mutate(data);
  };

  const handleTryAnother = () => {
    setConversionResult(null);
    setAudioUrl(undefined);
  };

  const handlePlayAudio = () => {
    // Track audio play event if needed
    console.log('Audio played');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Languages className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Korean Name Pronunciation</h1>
                <p className="text-sm text-gray-600">Convert your name to Korean</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">🇰🇷</span>
              <span className="text-lg font-medium">한국어</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Your Korean Name</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Enter your name and instantly see how it's written and pronounced in Korean. 
            Perfect for learning Korean, creating Korean social media profiles, or just for fun!
          </p>
          <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">Powered by AI for accurate pronunciation</span>
          </div>
        </div>

        {/* Converter Section */}
        <div className="mb-8">
          <LanguageConverter 
            onConvert={handleConvert} 
            isLoading={conversionMutation.isPending}
          />
        </div>

        {/* Results Section */}
        {conversionResult && (
          <div className="mb-8">
            <ConversionResults
              data={conversionResult}
              audioUrl={audioUrl}
              onTryAnother={handleTryAnother}
              onPlayAudio={handlePlayAudio}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* How It Works */}
          <Card className="shadow-md border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Cog className="text-blue-600 mr-2" />
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <p className="text-gray-600">Enter your name in any supported language</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <p className="text-gray-600">AI analyzes pronunciation and converts to accurate Korean Hangul</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <p className="text-gray-600">Get your Korean name with AI-generated audio pronunciation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Languages */}
          <Card className="shadow-md border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Languages className="text-green-600 mr-2" />
                Supported Languages
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-gray-700">English</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇪🇸</span>
                  <span className="text-gray-700">Spanish</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇫🇷</span>
                  <span className="text-gray-700">French</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇩🇪</span>
                  <span className="text-gray-700">German</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇮🇹</span>
                  <span className="text-gray-700">Italian</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇵🇹</span>
                  <span className="text-gray-700">Portuguese</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇷🇺</span>
                  <span className="text-gray-700">Russian</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇯🇵</span>
                  <span className="text-gray-700">Japanese</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">And many more languages with auto-detection</p>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="text-yellow-500 mr-2" />
              Tips for Better Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-green-500 text-sm mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Use your first and last name for most accurate conversion</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-green-500 text-sm mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Include diacritics and special characters when applicable</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-green-500 text-sm mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Select the correct source language for best phonetic matching</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-green-500 text-sm mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Try different spellings if the result doesn't sound right</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Languages className="text-white" />
              </div>
              <span className="text-xl font-semibold">Korean Name Pronunciation</span>
            </div>
            <p className="text-gray-400 mb-4">Bridging cultures through language</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
