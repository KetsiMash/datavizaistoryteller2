import { ChartConfig } from '@/types/analytics';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  ScatterChart,
  AreaChart,
  Activity
} from 'lucide-react';

interface ChartSelectorProps {
  charts: ChartConfig[];
  selectedCharts: number[];
  onSelectionChange: (indices: number[]) => void;
}

const getChartIcon = (type: ChartConfig['type']) => {
  switch (type) {
    case 'bar': return BarChart3;
    case 'line': return LineChart;
    case 'pie': return PieChart;
    case 'scatter': return ScatterChart;
    case 'correlation': return ScatterChart;
    case 'area': return AreaChart;
    case 'histogram': return Activity;
    default: return BarChart3;
  }
};

export function ChartSelector({ charts, selectedCharts, onSelectionChange }: ChartSelectorProps) {
  const handleToggle = (index: number) => {
    if (selectedCharts.includes(index)) {
      onSelectionChange(selectedCharts.filter(i => i !== index));
    } else {
      onSelectionChange([...selectedCharts, index]);
    }
  };

  const selectAll = () => {
    onSelectionChange(charts.map((_, i) => i));
  };

  const selectNone = () => {
    onSelectionChange([]);
  };

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Select Charts to Display</h3>
        <div className="flex gap-2">
          <button 
            onClick={selectAll}
            className="text-xs text-primary hover:underline"
          >
            Select All
          </button>
          <span className="text-muted-foreground">|</span>
          <button 
            onClick={selectNone}
            className="text-xs text-muted-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {charts.map((chart, index) => {
          const Icon = getChartIcon(chart.type);
          const isSelected = selectedCharts.includes(index);
          
          return (
            <div
              key={index}
              onClick={() => handleToggle(index)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => handleToggle(index)}
                className="pointer-events-none"
              />
              <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <Label className="text-xs cursor-pointer truncate flex-1">
                {chart.title}
              </Label>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        {selectedCharts.length} of {charts.length} charts selected
      </p>
    </div>
  );
}
