import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon, 
  AlertTriangle
} from "lucide-react";
import { cn, stakeToColor } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, isToday, subDays } from "date-fns";
import { Assessment } from "@shared/schema";

interface CalendarViewProps {
  assessments: Assessment[];
  nervousnessData: Record<string, number>;
  viewType?: 'month' | 'week';
  onAssessmentClick?: (assessment: Assessment) => void;
}

export function CalendarView({ 
  assessments, 
  nervousnessData, 
  viewType = 'month',
  onAssessmentClick
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedViewType, setSelectedViewType] = useState<'month' | 'week'>(viewType);
  
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Get days in the month
    const days = eachDayOfInterval({ start, end });
    
    // Get what day of the week the first day is (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(start);
    
    // Add days from the previous month to fill in the first row
    const previousMonthDays = Array.from({ length: startDay }, (_, i) => {
      return subDays(start, startDay - i);
    }).reverse();
    
    return [...previousMonthDays, ...days];
  };

  const days = getDaysInMonth();

  const getAssessmentsForDay = (date: Date) => {
    return assessments.filter(assessment => {
      const assessmentDate = new Date(assessment.date);
      return (
        assessmentDate.getDate() === date.getDate() &&
        assessmentDate.getMonth() === date.getMonth() &&
        assessmentDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDayNervousness = (date: Date): number | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return nervousnessData[dateString];
  };

  const isNervousnessHotspot = (nervousness: number | undefined): boolean => {
    return nervousness !== undefined && nervousness >= 7;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="font-poppins text-lg">Assessment Calendar</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={selectedViewType === 'month' ? 'default' : 'outline'} 
            size="sm"
            className={selectedViewType === 'month' ? 'bg-violet text-white' : ''}
            onClick={() => setSelectedViewType('month')}
          >
            Month
          </Button>
          <Button 
            variant={selectedViewType === 'week' ? 'default' : 'outline'} 
            size="sm"
            className={selectedViewType === 'week' ? 'bg-violet text-white' : ''}
            onClick={() => setSelectedViewType('week')}
          >
            Week
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium">{format(currentDate, 'MMMM yyyy')}</h3>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing for: <span className="font-medium">All Grades</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayAssessments = getAssessmentsForDay(day);
            const nervousness = getDayNervousness(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isHotspot = isNervousnessHotspot(nervousness);
            
            return (
              <div 
                key={index}
                className={cn(
                  "calendar-day p-2 rounded-lg transition-all",
                  isCurrentMonth ? "bg-white border border-gray-100" : "bg-gray-50 text-gray-400",
                  isCurrentDay && "border-primary",
                  isHotspot && "border-red-300"
                )}
              >
                <div className={cn(
                  "text-xs mb-1 flex items-center justify-between",
                  !isCurrentMonth && "text-gray-400"
                )}>
                  <span>{format(day, 'd')}</span>
                  {isHotspot && <span className="text-red-500 text-xs"><AlertTriangle className="h-3 w-3" /></span>}
                </div>
                
                {dayAssessments.length > 0 && (
                  <>
                    {dayAssessments.slice(0, 2).map((assessment) => (
                      <div 
                        key={assessment.id}
                        className={cn(
                          "text-xs p-1 rounded mb-1 truncate cursor-pointer",
                          stakeToColor(assessment.stakes)
                        )}
                        onClick={() => onAssessmentClick && onAssessmentClick(assessment)}
                      >
                        {assessment.title}
                      </div>
                    ))}
                    
                    {dayAssessments.length > 2 && (
                      <div className="text-xs text-center mt-1 text-secondary">
                        +{dayAssessments.length - 2} more
                      </div>
                    )}
                    
                    {isHotspot && (
                      <div className="text-xs text-center mt-1 text-red-500">
                        High Anxiety
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--low-stake))] mr-1"></div>
            <span>Low-stake</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--high-stake))] mr-1"></div>
            <span>High-stake</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Anxiety Hotspot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
