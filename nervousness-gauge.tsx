import { cn, getNervousnessLevel } from "@/lib/utils";

interface NervousnessGaugeProps {
  value: number;
  maxValue?: number;
  showText?: boolean;
  className?: string;
}

export function NervousnessGauge({
  value,
  maxValue = 10,
  showText = true,
  className
}: NervousnessGaugeProps) {
  const percentage = (value / maxValue) * 100;
  const { text, color } = getNervousnessLevel(value);
  
  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">Nervousness Level</span>
          <span className="text-sm font-medium">
            {value.toFixed(1)}<span className="text-sm text-muted-foreground">/{maxValue}</span>
          </span>
        </div>
      )}
      
      <div className="relative">
        <div className="nervousness-gauge w-full"></div>
        <div 
          className="nervousness-indicator"
          style={{ left: `${percentage}%` }}
        ></div>
      </div>
      
      {showText && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${color}`}>{text}</span>
        </div>
      )}
    </div>
  );
}

export function WeeklyNervousnessChart({
  data,
  onOptimizeWeek
}: {
  data: { week: string; value: number; label: string }[];
  onOptimizeWeek?: (week: string) => void;
}) {
  const getBarColor = (value: number) => {
    if (value < 3.5) return "bg-tertiary/30";
    if (value < 7) return "bg-tertiary/60";
    return "bg-secondary";
  };
  
  const getBarHeight = (value: number) => {
    // Scale the value to a reasonable height (max 180px)
    return Math.max(40, (value / 10) * 180);
  };
  
  const maxValue = Math.max(...data.map(item => item.value));
  const weekWithMaxValue = data.find(item => item.value === maxValue)?.week || '';
  
  return (
    <div className="w-full">
      <div className="h-64 flex items-end space-x-6 pb-4 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full ${getBarColor(item.value)} rounded-t-lg`} 
              style={{ height: `${getBarHeight(item.value)}px` }}
            ></div>
            <p className="text-xs mt-2">{item.week}</p>
            <p className={`text-xs font-medium ${getNervousnessLevel(item.value).color}`}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
      
      {onOptimizeWeek && maxValue >= 7 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Suggestion:</span> Consider redistributing assessments from {weekWithMaxValue} to reduce anxiety peaks
          </div>
          <button 
            className="px-3 py-1 text-sm bg-primary text-white rounded-lg"
            onClick={() => onOptimizeWeek(weekWithMaxValue)}
          >
            Optimize Week
          </button>
        </div>
      )}
    </div>
  );
}
