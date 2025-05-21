import { format, isToday, isWeekend } from 'date-fns';
import { cn } from '@/lib/utils';
import { Assessment } from '@shared/schema';

interface HeatMapGridProps {
  month: Date;
  data: {
    date: Date;
    value: number;
    assessments: Assessment[];
  }[];
  maxValue?: number;
  className?: string;
}

export function HeatMapGrid({ month, data, maxValue = 10, className }: HeatMapGridProps) {
  // Generate days in month
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
  
  return (
    <div className={cn("grid grid-cols-7 gap-1", className)}>
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
        <div key={`header-${i}`} className="text-center text-xs text-muted-foreground font-medium py-1">
          {day}
        </div>
      ))}
      
      {/* Empty cells for days before the first of month */}
      {Array.from({ length: days[0].getDay() }).map((_, i) => (
        <div key={`empty-start-${i}`} className="aspect-square"></div>
      ))}
      
      {/* Actual days */}
      {days.map((day) => {
        // Find data point for this day
        const dataPoint = data.find(d => 
          d.date.getDate() === day.getDate() && 
          d.date.getMonth() === day.getMonth() && 
          d.date.getFullYear() === day.getFullYear()
        );
        
        // Get stress color based on nervousness value
        const getStressColor = (value: number) => {
          if (value >= 7) return 'bg-red-500/30 dark:bg-red-500/40 hover:bg-red-500/40 dark:hover:bg-red-500/50';
          if (value >= 4) return 'bg-amber-500/30 dark:bg-amber-500/40 hover:bg-amber-500/40 dark:hover:bg-amber-500/50';
          return 'bg-green-500/20 dark:bg-green-500/30 hover:bg-green-500/30 dark:hover:bg-green-500/40';
        };
        
        // Get nervousness value (default to 0)
        const value = dataPoint?.value || 0;
        const hasAssessments = dataPoint?.assessments && dataPoint.assessments.length > 0;
        
        return (
          <div 
            key={day.toISOString()} 
            className={cn(
              "aspect-square flex flex-col items-center justify-start p-1 rounded text-xs relative",
              isWeekend(day) ? "bg-muted/70" : "bg-muted/40",
              isToday(day) && "ring-2 ring-primary/40",
              value > 0 && getStressColor(value),
              "transition-colors duration-200"
            )}
          >
            <span className={cn(
              "flex items-center justify-center rounded-full w-5 h-5 mb-1",
              isToday(day) && "bg-primary text-primary-foreground font-medium",
            )}>
              {format(day, 'd')}
            </span>
            
            {hasAssessments && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Empty cells for days after the end of month */}
      {Array.from({ length: 6 - days[days.length - 1].getDay() }).map((_, i) => (
        <div key={`empty-end-${i}`} className="aspect-square"></div>
      ))}
    </div>
  );
}