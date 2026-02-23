import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  Settings, 
  Play, 
  Save, 
  RotateCcw,
  Mic,
  Speaker,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVoice } from '@/context/VoiceContext';
import { enhancedVoiceService } from '@/lib/enhancedVoiceService';
import { toast } from '@/hooks/use-toast';

export function VoiceSettings() {
  const { 
    availableVoices, 
    selectedVoice, 
    playbackRate, 
    setSelectedVoice, 
    setPlaybackRate,
    speak 
  } = useVoice();

  const [tempSettings, setTempSettings] = React.useState({
    voice: selectedVoice,
    rate: playbackRate,
    pitch: 1.0,
    volume: 0.8
  });

  const [presets] = React.useState(enhancedVoiceService.getPresets());
  const [recommendedVoices] = React.useState(enhancedVoiceService.getRecommendedVoices());

  const testText = "This is a test of your voice settings. Your data insights will sound like this when narrated.";

  const handlePresetSelect = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setTempSettings(prev => ({
        ...prev,
        rate: preset.options.rate || 1,
        pitch: preset.options.pitch || 1,
        volume: preset.options.volume || 0.8
      }));
    }
  };

  const handleTestVoice = async () => {
    try {
      await speak(testText, {
        voice: tempSettings.voice,
        rate: tempSettings.rate,
        pitch: tempSettings.pitch,
        volume: tempSettings.volume
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not test voice settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = () => {
    setSelectedVoice(tempSettings.voice);
    setPlaybackRate(tempSettings.rate);
    
    // Save to localStorage for persistence
    localStorage.setItem('voice-settings', JSON.stringify(tempSettings));
    
    toast({
      title: "Settings Saved",
      description: "Your voice preferences have been updated.",
    });
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      voice: availableVoices[0]?.name || '',
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8
    };
    setTempSettings(defaultSettings);
    localStorage.removeItem('voice-settings');
    
    toast({
      title: "Settings Reset",
      description: "Voice settings have been reset to defaults.",
    });
  };

  // Load saved settings on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('voice-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setTempSettings(prev => ({ ...prev, ...settings }));
      } catch (error) {
        console.warn('Failed to load saved voice settings:', error);
      }
    }
  }, []);

  const getVoiceQuality = (voiceName: string) => {
    return enhancedVoiceService.assessVoiceQuality(voiceName);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Voice Settings
          </h2>
          <p className="text-muted-foreground">Customize your AI voice experience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestVoice}>
            <Play className="w-4 h-4 mr-2" />
            Test Voice
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Voice Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Voice Selection
            </CardTitle>
            <CardDescription>
              Choose from available system voices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="voice-select">Current Voice</Label>
              <Select 
                value={tempSettings.voice} 
                onValueChange={(value) => setTempSettings(prev => ({ ...prev, voice: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{voice.name}</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${getQualityColor(getVoiceQuality(voice.name))}`}
                        >
                          {getVoiceQuality(voice.name)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recommended Voices */}
            <div>
              <Label>Recommended Voices</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(recommendedVoices).slice(0, 3).map(([category, voices]) => (
                  <div key={category} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground capitalize">
                      {category}
                    </p>
                    {voices.slice(0, 2).map((voice) => (
                      <Button
                        key={voice.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setTempSettings(prev => ({ ...prev, voice: voice.name }))}
                      >
                        {voice.name}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" />
              Voice Controls
            </CardTitle>
            <CardDescription>
              Adjust speed, pitch, and volume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Speed: {tempSettings.rate}x</Label>
              <Slider
                value={[tempSettings.rate]}
                onValueChange={([value]) => setTempSettings(prev => ({ ...prev, rate: value }))}
                min={0.5}
                max={2}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slow (0.5x)</span>
                <span>Normal (1x)</span>
                <span>Fast (2x)</span>
              </div>
            </div>

            <div>
              <Label>Pitch: {tempSettings.pitch}</Label>
              <Slider
                value={[tempSettings.pitch]}
                onValueChange={([value]) => setTempSettings(prev => ({ ...prev, pitch: value }))}
                min={0.5}
                max={2}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low (0.5)</span>
                <span>Normal (1)</span>
                <span>High (2)</span>
              </div>
            </div>

            <div>
              <Label>Volume: {Math.round(tempSettings.volume * 100)}%</Label>
              <Slider
                value={[tempSettings.volume]}
                onValueChange={([value]) => setTempSettings(prev => ({ ...prev, volume: value }))}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Quiet (0%)</span>
                <span>Medium (50%)</span>
                <span>Loud (100%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Speaker className="w-5 h-5 text-primary" />
            Voice Presets
          </CardTitle>
          <CardDescription>
            Quick settings for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presets.map((preset, index) => (
              <motion.div
                key={preset.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-start"
                  onClick={() => handlePresetSelect(preset.name)}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="font-semibold">{preset.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {preset.options.rate}x
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {preset.description}
                  </p>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground text-left">
                    <strong>Best for:</strong> {preset.useCase}
                  </p>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Reset Settings</h4>
              <p className="text-sm text-muted-foreground">
                Restore all voice settings to their default values
              </p>
            </div>
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}