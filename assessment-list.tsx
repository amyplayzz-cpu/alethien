import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Assessment } from "@shared/schema";
import { formatPrepTime, stakeToColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AssessmentListProps {
  assessments: Assessment[];
  onEdit?: (assessment: Assessment) => void;
  onAdd?: () => void;
}

export function AssessmentList({ 
  assessments, 
  onEdit,
  onAdd
}: AssessmentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const { toast } = useToast();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleDeleteClick = (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
  };

  const handleDeleteConfirm = async () => {
    if (!assessmentToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/assessments/${assessmentToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Assessment deleted",
        description: "The assessment has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssessmentToDelete(null);
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || assessment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="font-poppins text-lg">Assessment List</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search assessments..."
                className="pl-8 pr-4 py-1 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="text-muted-foreground absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            </div>
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="lab_report">Lab Report</SelectItem>
                <SelectItem value="final_exam">Final Exam</SelectItem>
              </SelectContent>
            </Select>
            
            {onAdd && (
              <Button 
                className="bg-primary text-white" 
                size="sm"
                onClick={onAdd}
              >
                Add Assessment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Title</th>
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Type</th>
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Date</th>
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Weight</th>
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Stake</th>
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Prep Time</th>
                  <th className="py-2 px-4 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No assessments found. {onAdd ? "Create one by clicking 'Add Assessment'." : ""}
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map(assessment => (
                    <tr 
                      key={assessment.id} 
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{assessment.title}</td>
                      <td className="py-3 px-4 capitalize">{assessment.type.replace('_', ' ')}</td>
                      <td className="py-3 px-4">{formatDate(assessment.date)}</td>
                      <td className="py-3 px-4">{assessment.weight}%</td>
                      <td className="py-3 px-4">
                        <span className={`${stakeToColor(assessment.stakes)} px-2 py-0.5 rounded text-xs capitalize`}>
                          {assessment.stakes}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatPrepTime(assessment.prepTime)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {onEdit && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onEdit(assessment)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(assessment)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog 
        open={!!assessmentToDelete} 
        onOpenChange={open => !open && setAssessmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assessment "{assessmentToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
