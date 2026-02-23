import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  X, 
  Send,
  Loader2,
  Bot,
  User,
  Minimize2,
  Maximize2,
  BarChart3,
  TrendingUp,
  PieChart,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVoice } from '@/context/VoiceContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import { intelligentAI } from '@/lib/intelligentAI';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: 'speak' | 'navigate' | 'analyze';
}

interface VoiceCommand {
  trigger: string[];
  action: string;
  description: string;
  handler: () => void | Promise<void>;
}

export function VoiceAssistant() {
  const { speak, voiceState, isSupported, stop: stopVoice } = useVoice();
  const { dataset, statistics, charts, narrative } = useData();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [recognition, setRecognition] = React.useState<SpeechRecognition | null>(null);

  // Update AI service context when data changes
  React.useEffect(() => {
    intelligentAI.updateContext(dataset, statistics, narrative);
  }, [dataset, statistics, narrative]);

  // Initialize speech recognition with improved settings
  React.useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Improved recognition settings
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true; // Show interim results for better UX
      recognitionInstance.lang = 'en-US'; // English (US)
      recognitionInstance.maxAlternatives = 3; // Get multiple alternatives
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your command now",
        });
      };
      
      recognitionInstance.onresult = (event: any) => {
        // Get the most confident result
        let transcript = '';
        let confidence = 0;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript = event.results[i][0].transcript;
            confidence = event.results[i][0].confidence;
            break;
          }
        }
        
        if (transcript) {
          console.log('Voice input:', transcript, 'Confidence:', confidence);
          handleVoiceInput(transcript);
        }
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Could not process voice input. Please try again.";
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please try again.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Microphone not available. Please check your settings.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone permission denied. Please allow microphone access.";
        }
        
        toast({
          title: "Voice Recognition Error",
          description: errorMessage,
          variant: "destructive"
        });
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const generateDataSummary = () => {
    if (!dataset || !statistics.length) return 'No data available';
    
    const numericStats = statistics.filter(s => s.mean !== undefined);
    return `Your dataset "${dataset.name}" contains ${dataset.rowCount} records with ${statistics.length} columns. ${numericStats.length} columns contain numeric data. Key insights include patterns in ${statistics.slice(0, 3).map(s => s.column).join(', ')}.`;
  };

  const addMessage = (type: 'user' | 'assistant', content: string, action?: Message['action']) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      action
    };
    setMessages(prev => [...prev, message]);
  };

  const handleVoiceInput = (transcript: string) => {
    addMessage('user', transcript);
    processCommand(transcript);
  };

  const processCommand = async (input: string) => {
    setIsProcessing(true);
    
    try {
      // Use intelligent AI service to generate expert response
      const aiResponse = await intelligentAI.query(input);
      
      // Add AI response to messages
      addMessage('assistant', aiResponse.answer);
      
      // Speak the response
      await speak(aiResponse.answer);
      
    } catch (error) {
      console.error('Error processing command:', error);
      const errorMsg = 'Sorry, I encountered an error processing your question. Please try again.';
      addMessage('assistant', errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      processCommand(inputValue);
      setInputValue('');
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Floating Assistant Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
          >
            {voiceState.isPlaying && (
              <Button
                onClick={stopVoice}
                size="lg"
                variant="destructive"
                className="rounded-full w-14 h-14 shadow-lg animate-pulse"
              >
                <VolumeX className="w-6 h-6" />
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Bot className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 ${
              isMinimized ? 'w-80' : 'w-96'
            } transition-all duration-200`}
          >
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">AI Voice Assistant</CardTitle>
                    {voiceState.isPlaying && (
                      <Badge variant="secondary" className="text-xs">
                        <Volume2 className="w-3 h-3 mr-1" />
                        Speaking
                      </Badge>
                    )}
                    {isProcessing && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Thinking
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="space-y-4">
                  {/* Messages */}
                  <ScrollArea className="h-64 w-full">
                    <div className="space-y-3 pr-4">
                      {messages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="font-medium mb-1">Hi! I'm your AI Data Assistant</p>
                          <p className="text-xs">I can analyze your data and answer questions like:</p>
                          <ul className="text-xs mt-2 space-y-1">
                            <li>"What's in my dataset?"</li>
                            <li>"What's the average of [column]?"</li>
                            <li>"Show me trends"</li>
                            <li>"Compare [column1] and [column2]"</li>
                            <li>"What are the key insights?"</li>
                          </ul>
                        </div>
                      )}
                      
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.type === 'assistant' && (
                            <Bot className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                          )}
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.type === 'user' && (
                            <User className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="space-y-3">
                    <form onSubmit={handleTextInput} className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message or use voice..."
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={isProcessing || !inputValue.trim()}>
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>

                    {/* Voice Controls */}
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant={isListening ? "destructive" : "outline"}
                        size="sm"
                        onClick={isListening ? stopListening : startListening}
                        disabled={!recognition}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Voice Input
                          </>
                        )}
                      </Button>
                      
                      {voiceState.isPlaying && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={stopVoice}
                        >
                          <VolumeX className="w-4 h-4 mr-2" />
                          Stop Speaking
                        </Button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setInputValue('What can you tell me about my data?'); }}
                        className="text-xs"
                        disabled={isProcessing}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        About Data
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setInputValue('What are the key insights?'); }}
                        className="text-xs"
                        disabled={isProcessing}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Insights
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setInputValue('Show me statistics'); }}
                        className="text-xs"
                        disabled={isProcessing}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Statistics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}