export interface VoiceOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  voice?: string; // voice name
  lang?: string; // language code
}

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number;
  duration: number;
  currentSentence?: string;
  totalSentences?: number;
  currentSentenceIndex?: number;
}

export interface VoiceAnalytics {
  totalWordsSpoken: number;
  totalTimeListened: number;
  averageSpeed: number;
  mostUsedVoice: string;
  sessionsCount: number;
}

export interface VoicePreset {
  name: string;
  description: string;
  options: VoiceOptions;
  useCase: string;
}

class EnhancedVoiceService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onStateChange?: (state: VoiceState) => void;
  private currentState: VoiceState = {
    isPlaying: false,
    isPaused: false,
    currentText: '',
    progress: 0,
    duration: 0
  };
  private analytics: VoiceAnalytics = {
    totalWordsSpoken: 0,
    totalTimeListened: 0,
    averageSpeed: 1,
    mostUsedVoice: '',
    sessionsCount: 0
  };
  private sentences: string[] = [];
  private currentSentenceIndex: number = 0;
  private startTime: number = 0;

  // Voice presets for different use cases
  private presets: VoicePreset[] = [
    {
      name: 'Professional',
      description: 'Clear, authoritative voice for business presentations',
      options: { rate: 0.9, pitch: 1.0, volume: 0.9 },
      useCase: 'Business reports, executive summaries'
    },
    {
      name: 'Casual',
      description: 'Friendly, conversational tone for general use',
      options: { rate: 1.1, pitch: 1.1, volume: 0.8 },
      useCase: 'Data stories, casual explanations'
    },
    {
      name: 'Technical',
      description: 'Precise, measured delivery for complex data',
      options: { rate: 0.8, pitch: 0.9, volume: 1.0 },
      useCase: 'Statistical analysis, technical insights'
    },
    {
      name: 'Quick Summary',
      description: 'Fast-paced for brief overviews',
      options: { rate: 1.3, pitch: 1.0, volume: 0.9 },
      useCase: 'KPI summaries, quick updates'
    }
  ];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    this.loadAnalytics();
    
    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  private loadAnalytics() {
    const stored = localStorage.getItem('voice-analytics');
    if (stored) {
      try {
        this.analytics = { ...this.analytics, ...JSON.parse(stored) };
      } catch (error) {
        console.warn('Failed to load voice analytics:', error);
      }
    }
  }

  private saveAnalytics() {
    try {
      localStorage.setItem('voice-analytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.warn('Failed to save voice analytics:', error);
    }
  }

  private updateAnalytics(text: string, voice: string, rate: number) {
    const wordCount = text.split(' ').length;
    this.analytics.totalWordsSpoken += wordCount;
    this.analytics.averageSpeed = (this.analytics.averageSpeed + rate) / 2;
    this.analytics.mostUsedVoice = voice;
    this.analytics.sessionsCount += 1;
    this.saveAnalytics();
  }

  public getAnalytics(): VoiceAnalytics {
    return { ...this.analytics };
  }

  public getPresets(): VoicePreset[] {
    return [...this.presets];
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  public setStateChangeCallback(callback: (state: VoiceState) => void) {
    this.onStateChange = callback;
  }

  private updateState(updates: Partial<VoiceState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.onStateChange?.(this.currentState);
  }

  public async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any current speech
      this.stop();

      // Clean and prepare text
      const cleanText = this.cleanTextForSpeech(text);
      this.sentences = this.splitIntoSentences(cleanText);
      this.currentSentenceIndex = 0;
      this.startTime = Date.now();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Set voice options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';
      
      // Set voice if specified
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === options.voice || voice.name.includes(options.voice)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Set up event handlers
      utterance.onstart = () => {
        this.updateState({
          isPlaying: true,
          isPaused: false,
          currentText: cleanText,
          progress: 0,
          totalSentences: this.sentences.length,
          currentSentenceIndex: 0,
          currentSentence: this.sentences[0]
        });
      };

      utterance.onend = () => {
        const endTime = Date.now();
        this.analytics.totalTimeListened += (endTime - this.startTime) / 1000;
        this.updateAnalytics(cleanText, utterance.voice?.name || 'default', utterance.rate);
        
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentText: '',
          progress: 100,
          currentSentence: undefined,
          currentSentenceIndex: undefined,
          totalSentences: undefined
        });
        resolve();
      };

      utterance.onerror = (event) => {
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentText: '',
          progress: 0
        });
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      utterance.onboundary = (event) => {
        if (event.name === 'sentence') {
          this.currentSentenceIndex = Math.min(
            this.currentSentenceIndex + 1, 
            this.sentences.length - 1
          );
          
          const progress = (this.currentSentenceIndex / this.sentences.length) * 100;
          this.updateState({ 
            progress,
            currentSentenceIndex: this.currentSentenceIndex,
            currentSentence: this.sentences[this.currentSentenceIndex]
          });
        } else if (event.name === 'word') {
          const progress = (event.charIndex / cleanText.length) * 100;
          this.updateState({ progress });
        }
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  public async speakWithPreset(text: string, presetName: string): Promise<void> {
    const preset = this.presets.find(p => p.name === presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }
    return this.speak(text, preset.options);
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  public pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.updateState({ isPaused: true });
    }
  }

  public resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.updateState({ isPaused: false });
    }
  }

  public stop(): void {
    this.synthesis.cancel();
    this.currentUtterance = null;
    this.updateState({
      isPlaying: false,
      isPaused: false,
      currentText: '',
      progress: 0,
      currentSentence: undefined,
      currentSentenceIndex: undefined,
      totalSentences: undefined
    });
  }

  public getCurrentState(): VoiceState {
    return { ...this.currentState };
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      // Clean up special characters
      .replace(/[•·]/g, '') // Bullet points
      .replace(/\n{3,}/g, '\n\n') // Multiple line breaks
      .replace(/\s{2,}/g, ' ') // Multiple spaces
      // Add pauses for better speech flow
      .replace(/\. /g, '. ... ') // Pause after sentences
      .replace(/: /g, ': ... ') // Pause after colons
      .replace(/; /g, '; ... ') // Pause after semicolons
      // Handle numbers and percentages better
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/(\d+)\.(\d+)/g, '$1 point $2')
      // Handle common data terms
      .replace(/\bKPI\b/g, 'Key Performance Indicator')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bSQL\b/g, 'S Q L')
      .replace(/\bCSV\b/g, 'C S V')
      .trim();
  }

  // Voice quality assessment
  public assessVoiceQuality(voiceName: string): 'excellent' | 'good' | 'fair' | 'poor' {
    const voice = this.voices.find(v => v.name === voiceName);
    if (!voice) return 'poor';
    
    // Simple quality assessment based on voice properties
    if (voice.name.includes('Premium') || voice.name.includes('Enhanced')) {
      return 'excellent';
    } else if (voice.localService) {
      return 'good';
    } else {
      return 'fair';
    }
  }

  // Get recommended voices for different use cases
  public getRecommendedVoices(): { [key: string]: SpeechSynthesisVoice[] } {
    const voices = this.getAvailableVoices();
    
    return {
      professional: voices.filter(v => 
        v.name.toLowerCase().includes('professional') ||
        v.name.toLowerCase().includes('business') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('mark')
      ),
      friendly: voices.filter(v => 
        v.name.toLowerCase().includes('friendly') ||
        v.name.toLowerCase().includes('casual') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('samantha')
      ),
      clear: voices.filter(v => 
        v.name.toLowerCase().includes('clear') ||
        v.name.toLowerCase().includes('articulate') ||
        v.name.toLowerCase().includes('alex')
      ),
      all: voices
    };
  }

  // Generate enhanced audio metadata
  public async generateAudioFile(text: string, options: VoiceOptions = {}): Promise<Blob> {
    const cleanText = this.cleanTextForSpeech(text);
    const metadata = {
      text: cleanText,
      options,
      timestamp: new Date().toISOString(),
      wordCount: cleanText.split(' ').length,
      estimatedDuration: (cleanText.split(' ').length / 200) * 60, // ~200 words per minute
      sentences: this.splitIntoSentences(cleanText).length,
      analytics: this.getAnalytics()
    };
    
    const audioData = new Blob([JSON.stringify(metadata, null, 2)], { 
      type: 'application/json' 
    });
    return audioData;
  }

  // Reset analytics
  public resetAnalytics(): void {
    this.analytics = {
      totalWordsSpoken: 0,
      totalTimeListened: 0,
      averageSpeed: 1,
      mostUsedVoice: '',
      sessionsCount: 0
    };
    this.saveAnalytics();
  }

  // Get usage statistics
  public getUsageStats(): {
    wordsPerSession: number;
    averageSessionLength: number;
    preferredSpeed: number;
    totalHours: number;
  } {
    const { totalWordsSpoken, totalTimeListened, averageSpeed, sessionsCount } = this.analytics;
    
    return {
      wordsPerSession: sessionsCount > 0 ? Math.round(totalWordsSpoken / sessionsCount) : 0,
      averageSessionLength: sessionsCount > 0 ? Math.round(totalTimeListened / sessionsCount) : 0,
      preferredSpeed: Math.round(averageSpeed * 10) / 10,
      totalHours: Math.round((totalTimeListened / 3600) * 10) / 10
    };
  }
}

export const enhancedVoiceService = new EnhancedVoiceService();