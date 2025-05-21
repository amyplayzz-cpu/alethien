import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AssessmentList } from "./AssessmentList";
import { AssessmentForm } from "./AssessmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "../RoleContext";
import { queryClient } from "@/lib/queryClient";

export function TeacherDashboard() {
  const { userInfo } = useRole();
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<number | null>(null);

  // Query to get teacher's assessments
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['/api/assessments', { teacherId: userInfo?.id }],
    enabled: !!userInfo?.id,
  });

  // Calculate stats
  const stats = {
    totalAssessments: assessments?.length || 0,
    upcomingAssessments: assessments?.filter(a => new Date(a.date) > new Date() && !a.completed)?.length || 0,
    completedAssessments: assessments?.filter(a => a.completed)?.length || 0,
  };

  const handleAddAssessment = () => {
    setIsAddingAssessment(true);
    setEditingAssessment(null);
  };

  const handleViewCalendar = () => {
    // In a full app, this would navigate to a calendar view
    window.alert("This would show a full calendar view");
  };

  const handleEditAssessment = (id: number) => {
    setEditingAssessment(id);
    setIsAddingAssessment(true);
  };

  const handleFormClose = () => {
    setIsAddingAssessment(false);
    setEditingAssessment(null);
    // Refresh assessments
    queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
  };

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-accent">Teacher Dashboard</h1>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button 
            className="bg-secondary hover:bg-secondary-light text-white"
            onClick={handleAddAssessment}
          >
            <span className="material-icons mr-2">add</span>
            Add New Assessment
          </Button>
          <Button 
            variant="outline" 
            className="bg-white border border-neutral hover:bg-gray-50 text-accent"
            onClick={handleViewCalendar}
          >
            <span className="material-icons mr-2">calendar_month</span>
            View Full Calendar
          </Button>
        </div>
      </div>
      
      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-secondary-light bg-opacity-20 p-3 rounded-full">
                <span className="material-icons text-secondary">assignment</span>
              </div>
              <h3 className="ml-4 font-heading font-semibold text-lg text-accent">My Assessments</h3>
            </div>
            <p className="text-3xl font-bold text-accent">{stats.totalAssessments}</p>
            <p className="text-neutral-dark text-sm mt-1">Planned for this quarter</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-primary-light bg-opacity-20 p-3 rounded-full">
                <span className="material-icons text-primary">event</span>
              </div>
              <h3 className="ml-4 font-heading font-semibold text-lg text-accent">Upcoming</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{stats.upcomingAssessments}</p>
            <p className="text-neutral-dark text-sm mt-1">In the next two weeks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="material-icons text-green-600">done_all</span>
              </div>
              <h3 className="ml-4 font-heading font-semibold text-lg text-accent">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completedAssessments}</p>
            <p className="text-neutral-dark text-sm mt-1">Assessments given this quarter</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Assessment List */}
      {!isAddingAssessment && (
        <AssessmentList 
          assessments={assessments || []} 
          isLoading={isLoading} 
          onEdit={handleEditAssessment} 
        />
      )}
      
      {/* Assessment Form */}
      {isAddingAssessment && (
        <AssessmentForm 
          onClose={handleFormClose} 
          assessmentId={editingAssessment} 
          teacherId={userInfo?.id || 0}
        />
      )}
    </div>
  );
}
