import { useState, useRef } from "react";
import { Button } from "./button";
import { Play, Pause, Volume2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  text: string;
  audioUrl?: string;
  onPlay?: () => void;
  className?: string;
}

export function AudioPlayer({ text, audioUrl, onPlay, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const playAudio = async () => {
    try {
      setIsLoading(true);
      
      // If we have a data URL for TTS, use Web Speech API
      if (audioUrl?.startsWith('data:audio/tts')) {
        await playWithSpeechSynthesis();
      } else if (audioUrl) {
        await playWithAudioElement();
      } else {
        // Fallback to speech synthesis
        await playWithSpeechSynthesis();
      }
      
      onPlay?.();
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playWithSpeechSynthesis = async () => {
    if (!window.speechSynthesis) {
      throw new Error('Speech synthesis not supported');
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a Korean voice
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(voice => 
      voice.lang.startsWith('ko') || voice.name.includes('Korean')
    );
    
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }
    
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      throw new Error('Speech synthesis failed');
    };

    window.speechSynthesis.speak(utterance);
  };

  const playWithAudioElement = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadstart = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      throw new Error('Audio playback failed');
    };

    await audio.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
  };

  const handleClick = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      variant="default"
      size="lg"
    >
      {isLoading ? (
        <>
          <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
          <span>Loading...</span>
        </>
      ) : isPlaying ? (
        <>
          <Pause className="w-4 h-4 mr-2" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4 mr-2" />
          <span>Play Pronunciation</span>
        </>
      )}
    </Button>
  );
}
