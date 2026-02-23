import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { ChartConfig } from '@/types/analytics';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLORS = [
  'hsl(175, 84%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(43, 96%, 56%)',
  'hsl(15, 90%, 60%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 71%, 45%)',
];

const getStrengthColor = (strength: string) => {
  switch (strength) {
    case 'strong': return 'text-green-400';
    case 'moderate': return 'text-yellow-400';
    case 'weak': return 'text-orange-400';
    default: return 'text-muted-foreground';
  }
};

const getStrengthBg = (strength: string) => {
  switch (strength) {
    case 'strong': return 'bg-green-400/10 border-green-400/30';
    case 'moderate': return 'bg-yellow-400/10 border-yellow-400/30';
    case 'weak': return 'bg-orange-400/10 border-orange-400/30';
    default: return 'bg-muted/10 border-muted/30';
  }
};

interface ChartCardProps {
  chart: ChartConfig;
}

export function ChartCard({ chart }: ChartCardProps) {
  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 12%)', 
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 12%)', 
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]} 
                strokeWidth={2}
                dot={{ fill: COLORS[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 12%)', 
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[0]} 
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chart.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 12%)', 
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
              <XAxis 
                type="number"
                dataKey="x" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
                name={chart.xAxis}
              />
              <YAxis 
                type="number"
                dataKey="y"
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
                name={chart.yAxis}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 12%)', 
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px'
                }}
              />
              <Scatter data={chart.data} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'correlation':
        // Correlation chart with regression line
        const sortedData = [...chart.data].sort((a, b) => a.x - b.x);
        const correlationValue = chart.correlation?.value ?? 0;
        const isPositive = correlationValue >= 0;
        
        return (
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                <XAxis 
                  type="number"
                  dataKey="x" 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={12}
                  tickLine={false}
                  name={chart.xAxis}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  type="number"
                  dataKey="y"
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={12}
                  tickLine={false}
                  name={chart.yAxis}
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222, 47%, 12%)', 
                    border: '1px solid hsl(217, 33%, 20%)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'y') return [value.toFixed(2), chart.yAxis || 'Y'];
                    if (name === 'regressionY') return [value.toFixed(2), 'Regression'];
                    return [value.toFixed(2), chart.xAxis || 'X'];
                  }}
                />
                <Legend />
                <Scatter 
                  name={`${chart.xAxis} vs ${chart.yAxis}`}
                  dataKey="y" 
                  fill={COLORS[0]} 
                  opacity={0.7}
                />
                <Line 
                  name="Regression Line"
                  type="linear"
                  dataKey="regressionY" 
                  stroke={COLORS[1]} 
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Correlation Info Panel */}
            {chart.correlation && (
              <div className={`mt-4 p-3 rounded-lg border ${getStrengthBg(chart.correlation.strength)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className={`w-4 h-4 ${getStrengthColor(chart.correlation.strength)}`} />
                    ) : correlationValue < -0.1 ? (
                      <TrendingDown className={`w-4 h-4 ${getStrengthColor(chart.correlation.strength)}`} />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={`font-semibold ${getStrengthColor(chart.correlation.strength)}`}>
                      r = {chart.correlation.value.toFixed(3)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStrengthBg(chart.correlation.strength)} ${getStrengthColor(chart.correlation.strength)}`}>
                      {chart.correlation.strength}
                    </span>
                  </div>
                  {chart.regression && (
                    <span className="text-xs text-muted-foreground font-mono">
                      R² = {chart.regression.rSquared.toFixed(3)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {chart.correlation.interpretation}
                </p>
                {chart.regression && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {chart.regression.equation}
                  </p>
                )}
              </div>
            )}
          </div>
        );
        
      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 12%)', 
                  border: '1px solid hsl(217, 33%, 20%)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Chart type not supported</div>;
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold mb-4">{chart.title}</h3>
      {renderChart()}
    </div>
  );
}
