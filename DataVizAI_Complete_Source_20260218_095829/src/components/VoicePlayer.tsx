import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Download,
  Settings,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVoice } from '@/context/VoiceContext';
import { toast } from '@/hooks/use-toast';

interface VoicePlayerProps {
  text: string;
  title?: string;
  className?: string;
  variant?: 'compact' | 'full';
  autoPlay?: boolean;
}

export function VoicePlayer({ 
  text, 
  title = 'Audio Player', 
  className = '',
  variant = 'full',
  autoPlay = false
}: VoicePlayerProps) {
  const {
    voiceState,
    availableVoices,
    selectedVoice,
    playbackRate,
    speak,
    pause,
    resume,
    stop,
    setSelectedVoice,
    setPlaybackRate,
    downloadAudio,
    isSupported
  } = useVoice();

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (autoPlay && text && !voiceState.isPlaying) {
      handlePlay();
    }
  }, [autoPlay, text]);

  const handlePlay = async () => {
    if (!text.trim()) {
      toast({
        title: "No content to play",
        description: "There's no text content available for narration.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await speak(text);
    } catch (error) {
      toast({
        title: "Playback Error",
        description: "Failed to start audio playback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (voiceState.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!text.trim()) return;
    
    try {
      const filename = title.toLowerCase().replace(/\s+/g, '-');
      await downloadAudio(text, filename);
      toast({
        title: "Download Started",
        description: "Audio content is being prepared for download.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate audio file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (progress: number, text: string) => {
    // Rough estimation: average reading speed is ~200 words per minute
    const wordCount = text.split(' ').length;
    const estimatedDuration = (wordCount / 200) * 60; // in seconds
    const currentTime = (progress / 100) * estimatedDuration;
    
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const totalMinutes = Math.floor(estimatedDuration / 60);
    const totalSeconds = Math.floor(estimatedDuration % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className={`p-4 border border-border rounded-lg bg-muted/50 ${className}`}>
        <p className="text-sm text-muted-foreground">
          Voice playback is not supported in this browser.
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={voiceState.isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : voiceState.isPlaying && !voiceState.isPaused ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        {(voiceState.isPlaying || voiceState.isPaused) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStop}
            title="Stop playback"
          >
            <Square className="w-4 h-4" />
          </Button>
        )}
        
        {voiceState.isPlaying && (
          <div className="flex-1 min-w-0">
            <Progress value={voiceState.progress} className="h-1" />
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 border border-border rounded-lg bg-card/50 backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Speed: {playbackRate}x
                  </label>
                  <Slider
                    value={[playbackRate]}
                    onValueChange={([value]) => setPlaybackRate(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!text.trim()}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Progress value={voiceState.progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(voiceState.progress, text)}</span>
          <span>{text.split(' ').length} words</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={voiceState.isPlaying ? handlePause : handlePlay}
          disabled={isLoading || !text.trim()}
          className="w-16 h-16 rounded-full"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : voiceState.isPlaying && !voiceState.isPaused ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleStop}
          disabled={!voiceState.isPlaying && !voiceState.isPaused}
          className="w-12 h-12 rounded-full"
          title="Stop playback"
        >
          <Square className="w-5 h-5" />
        </Button>
      </div>

      {/* Current Text Preview */}
      {voiceState.isPlaying && voiceState.currentText && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {voiceState.currentText.substring(0, 150)}...
          </p>
        </div>
      )}
    </motion.div>
  );
}