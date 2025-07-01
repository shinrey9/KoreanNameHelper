import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Copy, Share, RotateCcw, SpellCheck, Volume2, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatKoreanBreakdown, getLanguageByCode } from "@/lib/transliterationMaps";

interface CharacterBreakdown {
  hangul: string;
  romanization: string;
  type: 'family' | 'given' | 'syllable';
}

interface ConversionResultsProps {
  data: {
    id: number;
    originalName: string;
    sourceLanguage: string;
    koreanName: string;
    romanization: string;
    breakdown: CharacterBreakdown[];
  };
  audioUrl?: string;
  onTryAnother: () => void;
  onPlayAudio: () => void;
}

export function ConversionResults({ 
  data, 
  audioUrl, 
  onTryAnother, 
  onPlayAudio 
}: ConversionResultsProps) {
  const { toast } = useToast();
  const sourceLanguage = getLanguageByCode(data.sourceLanguage);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareResult = async () => {
    const shareData = {
      title: "My Korean Name",
      text: `My name "${data.originalName}" in Korean is: ${data.koreanName} (${data.romanization})`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(shareData.text, "Korean name");
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Korean Name Display */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Your Korean Name</h3>
          <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 font-serif">
            {data.koreanName}
          </div>
          <p className="text-xl text-gray-600 mb-2">{data.originalName}</p>
          {sourceLanguage && (
            <p className="text-sm text-gray-500">
              {sourceLanguage.flag} From {sourceLanguage.name}
            </p>
          )}
        </div>
      </div>

      {/* Pronunciation Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Romanization */}
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <SpellCheck className="w-4 h-4 text-green-600 mr-2" />
              Romanized Pronunciation
            </h4>
            <div className="text-2xl font-semibold text-gray-900 mb-2">
              {data.romanization}
            </div>
            <p className="text-sm text-gray-600">Korean phonetic spelling</p>
            <Button
              onClick={() => copyToClipboard(data.romanization, "Romanization")}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </CardContent>
        </Card>

        {/* Audio Playback */}
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <Volume2 className="w-4 h-4 text-orange-600 mr-2" />
              Audio Pronunciation
            </h4>
            <AudioPlayer
              text={data.koreanName}
              audioUrl={audioUrl}
              onPlay={onPlayAudio}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-md mb-2"
            />
            <p className="text-sm text-gray-600">
              Click to hear Korean pronunciation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Character Breakdown */}
      {data.breakdown && data.breakdown.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h4 className="font-medium text-gray-700 mb-4 flex items-center">
              <List className="w-4 h-4 text-gray-500 mr-2" />
              Name Parts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.breakdown.map((item, index) => (
                <div key={index} className="text-center bg-white rounded-lg p-4 border">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {item.hangul}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {item.romanization}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {item.type === 'family' ? 'Family name' : 
                     item.type === 'given' ? 'Given name' : 'Syllable'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button
          onClick={() => copyToClipboard(data.koreanName, "Korean name")}
          variant="outline"
          className="inline-flex items-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Korean Name</span>
        </Button>

        <Button
          onClick={shareResult}
          variant="outline"
          className="inline-flex items-center space-x-2"
        >
          <Share className="w-4 h-4" />
          <span>Share</span>
        </Button>

        <Button
          onClick={onTryAnother}
          variant="outline"
          className="inline-flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Another Name</span>
        </Button>
      </div>
    </div>
  );
}
