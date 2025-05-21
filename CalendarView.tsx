import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Assessment } from "@shared/schema";
import { getAssessmentColor } from "@/lib/assessmentColors";

type CalendarViewProps = {
  assessments: Assessment[];
  isLoading: boolean;
};

type ViewMode = "month" | "week";

// Calendar day interface
interface Day {
  date: number;
  month: number;
  isPreviousMonth: boolean;
  isCurrentMonth: boolean;
  isNextMonth: boolean;
  isHighStress: boolean;
  assessments: Assessment[];
}

export function CalendarView({ assessments, isLoading }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Generate calendar days for the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = (): Day[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month, getDaysInMonth(year, month));
    
    // Find the first day to display (might be from previous month)
    const daysFromPrevMonth = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const firstDay = new Date(year, month, 1 - daysFromPrevMonth);
    
    // Calculate days needed from next month to complete the grid
    const lastDayIndex = lastDayOfMonth.getDay();
    const daysFromNextMonth = 6 - lastDayIndex;
    
    const days: Day[] = [];
    
    // Add days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      days.push({
        date,
        month: prevMonth,
        isPreviousMonth: true,
        isCurrentMonth: false,
        isNextMonth: false,
        isHighStress: false,
        assessments: [],
      });
    }
    
    // Add days from current month
    const daysInCurrentMonth = getDaysInMonth(year, month);
    for (let date = 1; date <= daysInCurrentMonth; date++) {
      const isHighStress = date >= 18 && date <= 22 && month === 8; // Hardcoded for demo (September 18-22)
      
      // Filter assessments for this day
      const dayAssessments = assessments.filter(assessment => {
        const assessmentDate = new Date(assessment.date);
        return assessmentDate.getDate() === date && 
               assessmentDate.getMonth() === month && 
               assessmentDate.getFullYear() === year;
      });
      
      days.push({
        date,
        month,
        isPreviousMonth: false,
        isCurrentMonth: true,
        isNextMonth: false,
        isHighStress,
        assessments: dayAssessments,
      });
    }
    
    // Add days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let date = 1; date <= daysFromNextMonth; date++) {
      days.push({
        date,
        month: nextMonth,
        isPreviousMonth: false,
        isCurrentMonth: false,
        isNextMonth: true,
        isHighStress: false,
        assessments: [],
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const getPrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  const getNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  const renderAssessment = (assessment: Assessment) => {
    const { colorClass, textClass } = getAssessmentColor(assessment.type, assessment.stakeLevel);
    return (
      <div 
        key={assessment.id} 
        className={`assessment-pill ${colorClass} ${textClass} text-xs p-1 rounded mb-1 truncate`}
      >
        {assessment.name} ({assessment.gradeLevel})
      </div>
    );
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-semibold text-xl text-accent">{formatMonthYear(currentMonth)}</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={getPrevMonth} className="bg-gray-100 hover:bg-gray-200 rounded-lg">
              <span className="material-icons text-gray-600">chevron_left</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={getNextMonth} className="bg-gray-100 hover:bg-gray-200 rounded-lg">
              <span className="material-icons text-gray-600">chevron_right</span>
            </Button>
            <div className="border-l border-gray-300 mx-2"></div>
            <Button
              variant={viewMode === "month" ? "secondary" : "ghost"}
              onClick={() => setViewMode("month")}
              className={viewMode === "month" ? "bg-tertiary hover:bg-tertiary-light text-primary" : "text-gray-500 hover:bg-gray-100"}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "secondary" : "ghost"}
              onClick={() => setViewMode("week")}
              className={viewMode === "week" ? "bg-tertiary hover:bg-tertiary-light text-primary" : "text-gray-500 hover:bg-gray-100"}
            >
              Week
            </Button>
          </div>
        </div>
        
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center font-medium text-gray-500">{day}</div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day rounded-lg p-2 ${
                !day.isCurrentMonth 
                  ? "bg-gray-100 text-gray-400" 
                  : day.isHighStress 
                    ? "bg-red-50 border border-gray-200" 
                    : "border border-gray-200"
              }`}
            >
              <div className="text-sm mb-2">{day.date}</div>
              {day.isCurrentMonth && day.assessments.map(assessment => renderAssessment(assessment))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
