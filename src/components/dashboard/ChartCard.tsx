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
  Legend
} from 'recharts';
import { ChartConfig } from '@/types/analytics';

const COLORS = [
  'hsl(175, 84%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(43, 96%, 56%)',
  'hsl(15, 90%, 60%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 71%, 45%)',
];

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
