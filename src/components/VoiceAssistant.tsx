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
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVoice } from '@/context/VoiceContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';

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
  const { speak, voiceState, isSupported } = useVoice();
  const { dataset, statistics, charts, narrative } = useData();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [recognition, setRecognition] = React.useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive"
        });
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Voice commands configuration
  const voiceCommands: VoiceCommand[] = React.useMemo(() => [
    {
      trigger: ['read story', 'tell story', 'narrate story', 'play story'],
      action: 'speak_narrative',
      description: 'Read the complete data story',
      handler: async () => {
        if (narrative) {
          await speak(narrative);
          addMessage('assistant', 'Reading your data story now.');
        } else {
          addMessage('assistant', 'No story available. Please analyze some data first.');
        }
      }
    },
    {
      trigger: ['summarize data', 'data summary', 'overview', 'tell me about the data'],
      action: 'summarize',
      description: 'Provide a data summary',
      handler: async () => {
        if (dataset && statistics.length > 0) {
          const summary = generateDataSummary();
          await speak(summary);
          addMessage('assistant', summary);
        } else {
          addMessage('assistant', 'No data loaded. Please upload and analyze data first.');
        }
      }
    },
    {
      trigger: ['show charts', 'display charts', 'what charts', 'available charts'],
      action: 'list_charts',
      description: 'List available charts',
      handler: () => {
        if (charts.length > 0) {
          const chartList = `Available charts: ${charts.map(c => c.type).join(', ')}`;
          addMessage('assistant', chartList);
          speak(chartList);
        } else {
          addMessage('assistant', 'No charts available. Generate some visualizations first.');
        }
      }
    },
    {
      trigger: ['help', 'what can you do', 'commands', 'voice commands'],
      action: 'help',
      description: 'Show available commands',
      handler: () => {
        const helpText = `I can help you with: ${voiceCommands.map(cmd => cmd.description).join(', ')}. Just speak naturally or type your request.`;
        addMessage('assistant', helpText);
        speak(helpText);
      }
    }
  ], [narrative, dataset, statistics, charts, speak]);

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
    const lowerInput = input.toLowerCase();
    
    // Find matching command
    const matchedCommand = voiceCommands.find(cmd => 
      cmd.trigger.some(trigger => lowerInput.includes(trigger))
    );
    
    if (matchedCommand) {
      try {
        await matchedCommand.handler();
      } catch (error) {
        addMessage('assistant', 'Sorry, I encountered an error processing that command.');
      }
    } else {
      // Generic response for unrecognized commands
      const response = `I didn't understand "${input}". Try saying "help" to see available commands.`;
      addMessage('assistant', response);
      speak(response);
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
            className="fixed bottom-6 right-6 z-50"
          >
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
                        Speaking...
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
                          <p>Hi! I'm your AI voice assistant.</p>
                          <p>Ask me about your data or say "help" for commands.</p>
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
                      <Button type="submit" size="sm">
                        <Send className="w-4 h-4" />
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
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Voice stop handled by VoiceContext */}}
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
                        onClick={() => processCommand('help')}
                        className="text-xs"
                      >
                        Help
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => processCommand('summarize data')}
                        className="text-xs"
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Summary
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => processCommand('read story')}
                        className="text-xs"
                      >
                        <Volume2 className="w-3 h-3 mr-1" />
                        Read Story
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