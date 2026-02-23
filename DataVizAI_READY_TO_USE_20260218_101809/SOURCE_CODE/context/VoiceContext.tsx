import * as React from 'react';
import { voiceService, VoiceOptions, VoiceState } from '@/lib/voiceService';

interface VoiceContextType {
  // State
  voiceState: VoiceState;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: string;
  playbackRate: number;
  
  // Actions
  speak: (text: string, options?: VoiceOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSelectedVoice: (voiceName: string) => void;
  setPlaybackRate: (rate: number) => void;
  downloadAudio: (text: string, filename: string) => Promise<void>;
  
  // Utilities
  isSupported: boolean;
}

const VoiceContext = React.createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [voiceState, setVoiceState] = React.useState<VoiceState>({
    isPlaying: false,
    isPaused: false,
    currentText: '',
    progress: 0,
    duration: 0
  });
  
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = React.useState<string>('');
  const [playbackRate, setPlaybackRate] = React.useState<number>(1);
  const [isSupported] = React.useState<boolean>(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  React.useEffect(() => {
    if (!isSupported) return;

    // Set up voice service callback
    voiceService.setStateChangeCallback(setVoiceState);
    
    // Load available voices
    const loadVoices = () => {
      const voices = voiceService.getAvailableVoices();
      setAvailableVoices(voices);
      
      // Set default voice (prefer female English voices)
      if (voices.length > 0 && !selectedVoice) {
        const preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen')
        ) || voices[0];
        
        setSelectedVoice(preferredVoice.name);
      }
    };

    loadVoices();
    
    // Handle voices loading asynchronously
    const handleVoicesChanged = () => loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      voiceService.stop();
    };
  }, [isSupported, selectedVoice]);

  const speak = async (text: string, options: VoiceOptions = {}) => {
    if (!isSupported) {
      throw new Error('Speech synthesis is not supported in this browser');
    }

    const voiceOptions: VoiceOptions = {
      rate: playbackRate,
      voice: selectedVoice,
      ...options
    };

    return voiceService.speak(text, voiceOptions);
  };

  const pause = () => {
    voiceService.pause();
  };

  const resume = () => {
    voiceService.resume();
  };

  const stop = () => {
    voiceService.stop();
  };

  const downloadAudio = async (text: string, filename: string) => {
    try {
      const audioBlob = await voiceService.generateAudioFile(text, {
        rate: playbackRate,
        voice: selectedVoice
      });
      
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`; // For now, downloading as text
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating audio file:', error);
      throw error;
    }
  };

  const contextValue: VoiceContextType = {
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
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = React.useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}