import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
  const [isInIframe, setIsInIframe] = useState(false);
  const { toast } = useToast();

  // Detect if page is loaded in iframe and send height updates
  useEffect(() => {
    const isInFrame = window.parent !== window;
    setIsInIframe(isInFrame);
    
    if (isInFrame) {
      // Function to send height to parent
      const sendHeightToParent = () => {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage(
          { 
            type: 'resize', 
            height: height,
            source: 'korean-name-converter'
          }, 
          '*'
        );
      };

      // Send initial height
      sendHeightToParent();

      // Create ResizeObserver to monitor content changes
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(sendHeightToParent, 100); // Small delay for layout completion
      });

      // Observe the document body for size changes
      if (document.body) {
        resizeObserver.observe(document.body);
      }

      // Also listen for window resize
      const handleResize = () => setTimeout(sendHeightToParent, 100);
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Send height update when conversion data changes
  useEffect(() => {
    if (isInIframe) {
      const sendHeightToParent = () => {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage(
          { 
            type: 'resize', 
            height: height,
            source: 'korean-name-converter'
          }, 
          '*'
        );
      };
      
      // Delay to ensure DOM is updated
      setTimeout(sendHeightToParent, 200);
    }
  }, [conversionData, isInIframe]);



  // Convert name mutation
  const convertMutation = useMutation({
    mutationFn: async (data: { name: string; sourceLanguage: string }) => {
      const response = await apiRequest("POST", "/api/convert", data);
      const result = await response.json();
      return result.data; // Extract the data field from the API response
    },
    onSuccess: (data) => {
      setConversionData(data);
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
      const result = await response.json();
      return result.data; // Extract the data field from the API response
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
          {!isInIframe && (
            <Link href="/">
              <Button variant="ghost" size="sm" className="sm:mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Button>
            </Link>
          )}
          <div className="flex items-center">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Korean Name Converter</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {!conversionData ? (
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