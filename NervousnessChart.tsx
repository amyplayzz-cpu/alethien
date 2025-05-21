import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type WeekData = {
  weekName: string;
  level: number; // 0-10 scale
  height: string;
  isHighStress: boolean;
};

// Sample data for the nervousness chart
const initialWeeksData: WeekData[] = [
  { weekName: "Week of Sept 4", level: 3, height: "h-20", isHighStress: false },
  { weekName: "Week of Sept 11", level: 5, height: "h-32", isHighStress: false },
  { weekName: "Week of Sept 18", level: 9, height: "h-48", isHighStress: true },
  { weekName: "Week of Sept 25", level: 4, height: "h-24", isHighStress: false },
  { weekName: "Week of Oct 2", level: 2, height: "h-16", isHighStress: false },
];

export function NervousnessChart() {
  const [weeksData, setWeeksData] = useState<WeekData[]>(initialWeeksData);

  const getBarColor = (level: number) => {
    if (level > 7) return "from-red-500 to-red-200";
    if (level > 4) return "from-yellow-500 to-yellow-200";
    return "from-green-500 to-green-200";
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="font-heading font-semibold text-xl text-accent mb-4">Predicted Student Nervousness</h2>
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            {weeksData.map((week, index) => (
              <span key={index}>{week.weekName}</span>
            ))}
          </div>
          <div className="nervousness-gradient w-full"></div>
          <div className="flex justify-between mt-2">
            {weeksData.map((week, index) => (
              <div 
                key={index} 
                className={`${week.height} w-8 bg-gradient-to-t ${getBarColor(week.level)} rounded-t-lg relative`}
              >
                {week.isHighStress && (
                  <div className="absolute -top-8 -left-16 bg-accent text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    High stress week!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-icons text-sm text-accent mr-1">info</span>
            <span className="text-sm text-gray-600">Based on assessment density, weight, and preparation time</span>
          </div>
          <Button variant="link" className="text-primary hover:text-primary-light text-sm font-medium flex items-center">
            View Detailed Analysis
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
