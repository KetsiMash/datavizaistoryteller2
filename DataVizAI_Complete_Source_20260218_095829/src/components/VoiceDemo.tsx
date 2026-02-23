import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoicePlayer } from '@/components/VoicePlayer';
import { Volume2, Play, Pause } from 'lucide-react';

export function VoiceDemo() {
  const sampleNarrative = `
    Welcome to your AI-powered data visualization storyteller! 

    This demo showcases our new voice functionality that brings your data to life through audio narration.

    Key Features:
    - Listen to complete data stories and insights
    - Adjust playback speed from half speed to double speed  
    - Choose from multiple voice options
    - Control playback with play, pause, and stop
    - Download audio for offline listening

    Your data analysis becomes accessible to everyone, whether they prefer reading or listening.
    
    This makes your insights perfect for presentations, accessibility needs, or multitasking scenarios.
    
    Try the voice controls below to experience how AI voice transforms data storytelling!
  `;

  const shortDemo = "This is a quick demo of the AI voice feature. Your data insights can now be heard as well as seen!";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-primary" />
            AI Voice Integration Demo
          </CardTitle>
          <CardDescription>
            Experience how voice narration enhances your data storytelling platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Full Voice Player Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Full Voice Player</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete audio player with all controls - perfect for storytelling pages
            </p>
            <VoicePlayer 
              text={sampleNarrative}
              title="Data Story Demo"
              variant="full"
            />
          </div>

          {/* Compact Voice Player Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Compact Voice Player</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Inline player for dashboards and insight summaries
            </p>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <span className="text-sm font-medium">Quick Demo:</span>
              <VoicePlayer 
                text={shortDemo}
                title="Quick Demo"
                variant="compact"
              />
            </div>
          </div>

          {/* Integration Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Integration Points</h3>
            <div className="grid md:grid-cols-3 gap-4">
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">📖 Storytelling Page</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Full narrative playback for complete data stories
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Play className="w-3 h-3" />
                  <span>Full player with all controls</span>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">💡 Insights Page</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Narrated insights with actionable recommendations
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Volume2 className="w-3 h-3" />
                  <span>Compact player for summaries</span>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">📊 Dashboard Page</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  KPI summaries and chart explanations
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Pause className="w-3 h-3" />
                  <span>Header integration</span>
                </div>
              </Card>

            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">🌐 Browser Support</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Chrome</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Edge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Safari</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Firefox</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}