import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Assessment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssessmentColor } from "@/lib/assessmentColors";

type AssessmentListProps = {
  assessments: Assessment[];
  isLoading: boolean;
  onEdit: (id: number) => void;
};

export function AssessmentList({ assessments, isLoading, onEdit }: AssessmentListProps) {
  const { toast } = useToast();

  const handleDeleteAssessment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/assessments/${id}`);
      
      toast({
        title: "Assessment Deleted",
        description: "The assessment has been successfully deleted.",
      });
      
      // Refresh assessments
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to delete the assessment.",
        variant: "destructive",
      });
    }
  };

  // Get the type display text and style
  const getTypeDisplay = (type: string) => {
    const { colorClass, textClass } = getAssessmentColor(type);
    return { displayText: type.charAt(0).toUpperCase() + type.slice(1), colorClass, textClass };
  };

  // Get the stake level display text and style
  const getStakeLevelDisplay = (stakeLevel: string) => {
    switch (stakeLevel) {
      case 'high':
        return { displayText: 'High', colorClass: 'bg-red-100', textClass: 'text-red-700' };
      case 'medium':
        return { displayText: 'Medium', colorClass: 'bg-yellow-100', textClass: 'text-yellow-700' };
      case 'low':
        return { displayText: 'Low', colorClass: 'bg-green-100', textClass: 'text-green-700' };
      default:
        return { displayText: stakeLevel, colorClass: 'bg-gray-100', textClass: 'text-gray-700' };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="font-heading font-semibold text-xl text-accent mb-6">My Assessments</h2>
        
        <div className="bg-tertiary-light bg-opacity-30 p-4 rounded-lg mb-6">
          <div className="flex items-center text-accent">
            <span className="material-icons mr-2">info</span>
            <p className="text-sm">Note: High stake assessments are highlighted in orange/red and contribute more to student nervousness scores.</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {assessments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No assessments found. Add your first assessment!</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="py-3 px-4 font-semibold text-gray-500 rounded-tl-lg">Assessment</th>
                    <th className="py-3 px-4 font-semibold text-gray-500">Type</th>
                    <th className="py-3 px-4 font-semibold text-gray-500">Date</th>
                    <th className="py-3 px-4 font-semibold text-gray-500">Grade</th>
                    <th className="py-3 px-4 font-semibold text-gray-500">Weight</th>
                    <th className="py-3 px-4 font-semibold text-gray-500">Stake</th>
                    <th className="py-3 px-4 font-semibold text-gray-500 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => {
                    const typeDisplay = getTypeDisplay(assessment.type);
                    const stakeLevelDisplay = getStakeLevelDisplay(assessment.stakeLevel);
                    
                    return (
                      <tr key={assessment.id} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{assessment.name}</div>
                          <div className="text-xs text-gray-500">{assessment.description || 'No description'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`${typeDisplay.colorClass} ${typeDisplay.textClass} px-2 py-1 rounded text-xs`}>
                            {typeDisplay.displayText}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatDate(assessment.date)}</td>
                        <td className="py-3 px-4">{assessment.gradeLevel}</td>
                        <td className="py-3 px-4">{assessment.weight}%</td>
                        <td className="py-3 px-4">
                          <span className={`${stakeLevelDisplay.colorClass} ${stakeLevelDisplay.textClass} px-2 py-1 rounded text-xs`}>
                            {stakeLevelDisplay.displayText}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-secondary hover:text-secondary-light mr-2"
                            onClick={() => onEdit(assessment.id)}
                          >
                            <span className="material-icons">edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => handleDeleteAssessment(assessment.id)}
                          >
                            <span className="material-icons">delete</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
