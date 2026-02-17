import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Clock, 
  Volume2, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw,
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { enhancedVoiceService } from '@/lib/enhancedVoiceService';

export function VoiceAnalytics() {
  const [analytics, setAnalytics] = React.useState(enhancedVoiceService.getAnalytics());
  const [usageStats, setUsageStats] = React.useState(enhancedVoiceService.getUsageStats());
  const [presets] = React.useState(enhancedVoiceService.getPresets());

  const refreshAnalytics = () => {
    setAnalytics(enhancedVoiceService.getAnalytics());
    setUsageStats(enhancedVoiceService.getUsageStats());
  };

  const resetAnalytics = () => {
    enhancedVoiceService.resetAnalytics();
    refreshAnalytics();
  };

  React.useEffect(() => {
    const interval = setInterval(refreshAnalytics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getUsageLevel = (sessions: number) => {
    if (sessions >= 50) return { level: 'Expert', color: 'text-purple-500', progress: 100 };
    if (sessions >= 20) return { level: 'Advanced', color: 'text-blue-500', progress: 80 };
    if (sessions >= 10) return { level: 'Intermediate', color: 'text-green-500', progress: 60 };
    if (sessions >= 5) return { level: 'Beginner', color: 'text-yellow-500', progress: 40 };
    return { level: 'New User', color: 'text-gray-500', progress: 20 };
  };

  const usageLevel = getUsageLevel(analytics.sessionsCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Analytics</h2>
          <p className="text-muted-foreground">Track your AI voice usage and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={resetAnalytics}>
            Reset Data
          </Button>
        </div>
      </div>

      {/* Usage Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Usage Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge variant="secondary" className={usageLevel.color}>
                {usageLevel.level}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {analytics.sessionsCount} sessions completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{analytics.sessionsCount}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </div>
          </div>
          <Progress value={usageLevel.progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Words Spoken</span>
            </div>
            <p className="text-2xl font-bold">{analytics.totalWordsSpoken.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              ~{usageStats.wordsPerSession} per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Time Listened</span>
            </div>
            <p className="text-2xl font-bold">{usageStats.totalHours}h</p>
            <p className="text-xs text-muted-foreground">
              ~{usageStats.averageSessionLength}s per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Preferred Speed</span>
            </div>
            <p className="text-2xl font-bold">{usageStats.preferredSpeed}x</p>
            <p className="text-xs text-muted-foreground">
              Average playback rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Favorite Voice</span>
            </div>
            <p className="text-lg font-bold truncate">
              {analytics.mostUsedVoice || 'None'}
            </p>
            <p className="text-xs text-muted-foreground">
              Most frequently used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Voice Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voice Presets</CardTitle>
          <CardDescription>
            Optimized voice settings for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {presets.map((preset, index) => (
              <motion.div
                key={preset.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{preset.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {preset.options.rate}x speed
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {preset.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Best for:</strong> {preset.useCase}
                </p>
                <div className="flex gap-2 mt-3 text-xs">
                  <span>Rate: {preset.options.rate}</span>
                  <span>Pitch: {preset.options.pitch}</span>
                  <span>Volume: {preset.options.volume}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Usage Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.sessionsCount === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Start using voice features to see insights here!
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Most productive speed range</span>
                  <Badge variant="secondary">
                    {usageStats.preferredSpeed - 0.2}x - {usageStats.preferredSpeed + 0.2}x
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Average session efficiency</span>
                  <Badge variant="secondary">
                    {Math.round(usageStats.wordsPerSession / (usageStats.averageSessionLength / 60))} words/min
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Voice feature adoption</span>
                  <Badge variant="secondary">
                    {analytics.sessionsCount > 10 ? 'High' : analytics.sessionsCount > 5 ? 'Medium' : 'Getting Started'}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}