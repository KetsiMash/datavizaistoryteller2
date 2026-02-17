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
}

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: string | null;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class VoiceService {
  private synthesis: SpeechSynthesis;
  private recognition: any; // SpeechRecognition
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onStateChange?: (state: VoiceState) => void;
  private onRecognitionChange?: (state: SpeechRecognitionState) => void;
  private currentState: VoiceState = {
    isPlaying: false,
    isPaused: false,
    currentText: '',
    progress: 0,
    duration: 0
  };
  private recognitionState: SpeechRecognitionState = {
    isListening: false,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    error: null
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    this.initializeSpeechRecognition();
    
    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private initializeSpeechRecognition() {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.updateRecognitionState({ isListening: true, error: null });
      };
      
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        this.updateRecognitionState({
          transcript: finalTranscript || this.recognitionState.transcript,
          interimTranscript,
          confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0
        });
      };
      
      this.recognition.onerror = (event: any) => {
        this.updateRecognitionState({
          isListening: false,
          error: `Speech recognition error: ${event.error}`
        });
      };
      
      this.recognition.onend = () => {
        this.updateRecognitionState({ isListening: false });
      };
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  public setStateChangeCallback(callback: (state: VoiceState) => void) {
    this.onStateChange = callback;
  }

  public setRecognitionChangeCallback(callback: (state: SpeechRecognitionState) => void) {
    this.onRecognitionChange = callback;
  }

  private updateState(updates: Partial<VoiceState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.onStateChange?.(this.currentState);
  }

  private updateRecognitionState(updates: Partial<SpeechRecognitionState>) {
    this.recognitionState = { ...this.recognitionState, ...updates };
    this.onRecognitionChange?.(this.recognitionState);
  }

  public async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any current speech
      this.stop();

      // Clean text for better speech synthesis
      const cleanText = this.cleanTextForSpeech(text);
      
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
          progress: 0
        });
      };

      utterance.onend = () => {
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentText: '',
          progress: 100
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
        if (event.name === 'word') {
          const progress = (event.charIndex / cleanText.length) * 100;
          this.updateState({ progress });
        }
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
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
      progress: 0
    });
  }

  public getCurrentState(): VoiceState {
    return { ...this.currentState };
  }

  public getRecognitionState(): SpeechRecognitionState {
    return { ...this.recognitionState };
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  public startListening(): void {
    if (!this.recognition) {
      throw new Error('Speech recognition is not supported');
    }
    
    // Stop any current speech before listening
    this.stop();
    
    this.recognition.start();
  }

  public stopListening(): void {
    if (this.recognition && this.recognitionState.isListening) {
      this.recognition.stop();
    }
  }

  public clearTranscript(): void {
    this.updateRecognitionState({
      transcript: '',
      interimTranscript: '',
      confidence: 0,
      error: null
    });
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
      .trim();
  }

  // Generate audio file for download (using Web Audio API)
  public async generateAudioFile(text: string, options: VoiceOptions = {}): Promise<Blob> {
    // Note: This is a simplified implementation
    // For production, consider using a server-side TTS service
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(this.cleanTextForSpeech(text));
      
      // Configure utterance
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // For now, we'll create a simple text file
      // In production, you'd want to use a proper TTS service that returns audio
      const audioData = new Blob([text], { type: 'text/plain' });
      resolve(audioData);
    });
  }
}

export const voiceService = new VoiceService();