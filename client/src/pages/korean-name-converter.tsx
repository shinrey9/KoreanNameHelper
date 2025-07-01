import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LanguageConverter } from "@/components/LanguageConverter";
import { ConversionResults } from "@/components/ConversionResults";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface ConversionData {
  id: number;
  originalName: string;
  sourceLanguage: string;
  koreanName: string;
  romanization: string;
  breakdown: any[];
}

export default function KoreanNameConverter() {
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent conversions
  const { data: recentConversions } = useQuery({
    queryKey: ["/api/recent-conversions"],
    enabled: !conversionData,
  });

  // Convert name mutation
  const convertMutation = useMutation({
    mutationFn: async (data: { name: string; sourceLanguage: string }) => {
      const response = await apiRequest("POST", "/api/convert", data);
      return response.json();
    },
    onSuccess: (data) => {
      setConversionData(data);
      queryClient.invalidateQueries({ queryKey: ["/api/recent-conversions"] });
      toast({
        title: "Conversion Complete",
        description: `Your name "${data.originalName}" has been converted to Korean!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert name. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate audio mutation
  const audioMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/tts", { text });
      return response.json();
    },
    onSuccess: (data) => {
      setAudioUrl(data.audioUrl);
    },
    onError: () => {
      toast({
        title: "Audio Generation Failed",
        description: "Could not generate audio. Using browser speech instead.",
        variant: "destructive",
      });
    },
  });

  const handleConvert = (data: { name: string; sourceLanguage: string }) => {
    convertMutation.mutate(data);
  };

  const handleTryAnother = () => {
    setConversionData(null);
    setAudioUrl(undefined);
  };

  const handlePlayAudio = () => {
    if (conversionData && !audioUrl) {
      audioMutation.mutate(conversionData.koreanName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
          </Link>
          <div className="flex items-center">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Korean Name Converter</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {!conversionData ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Converter */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-2xl text-gray-800 dark:text-gray-200">
                      Convert Your Name to Korean
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LanguageConverter 
                      onConvert={handleConvert} 
                      isLoading={convertMutation.isPending}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Conversions Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Conversions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentConversions && Array.isArray(recentConversions) && recentConversions.length > 0 ? (
                      <div className="space-y-3">
                        {recentConversions.slice(0, 5).map((conversion: any) => (
                          <div key={conversion.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {conversion.originalName}
                            </div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {conversion.koreanName}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {conversion.romanization}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        No recent conversions yet. Try converting your name!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <ConversionResults
              data={conversionData}
              audioUrl={audioUrl}
              onTryAnother={handleTryAnother}
              onPlayAudio={handlePlayAudio}
            />
          )}
        </div>
      </div>
    </div>
  );
}