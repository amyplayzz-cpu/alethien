import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RecommendedActionsProps = {
  onOptimize: () => void;
};

export function RecommendedActions({ onOptimize }: RecommendedActionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-heading font-semibold text-xl text-accent mb-4">AI Recommendations</h2>
        <div className="space-y-4">
          <div className="flex p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <span className="material-icons text-red-500 mr-3">priority_high</span>
            <div>
              <h3 className="font-semibold text-gray-800">High Assessment Density (Week of Sept 18)</h3>
              <p className="text-gray-600 mt-1">This week has 7 assessments with 4 high-stake tests. Consider redistributing some assessments to reduce student nervousness.</p>
              <Button variant="link" className="mt-2 text-primary hover:text-primary-light text-sm font-medium">
                View Optimization Suggestions
              </Button>
            </div>
          </div>
          
          <div className="flex p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <span className="material-icons text-yellow-500 mr-3">schedule</span>
            <div>
              <h3 className="font-semibold text-gray-800">Pending Teacher Submissions</h3>
              <p className="text-gray-600 mt-1">4 teachers haven't submitted their assessment plans for the quarter. Send reminders to complete the schedule.</p>
              <Button variant="link" className="mt-2 text-primary hover:text-primary-light text-sm font-medium">
                Send Reminders
              </Button>
            </div>
          </div>
          
          <div className="flex p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <span className="material-icons text-blue-500 mr-3">auto_fix_high</span>
            <div>
              <h3 className="font-semibold text-gray-800">Schedule Optimization Available</h3>
              <p className="text-gray-600 mt-1">Our AI can generate an optimized schedule that reduces overall student nervousness by an estimated 32%.</p>
              <Button 
                variant="link" 
                className="mt-2 text-primary hover:text-primary-light text-sm font-medium"
                onClick={onOptimize}
              >
                Generate Optimized Schedule
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
