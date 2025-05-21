import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NervousnessChart } from "./NervousnessChart";
import { CalendarView } from "./CalendarView";
import { RecommendedActions } from "./RecommendedActions";
import { AIScheduleOptimizer } from "./AIScheduleOptimizer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "../RoleContext";
import { Brain, BarChart3, Calendar } from "lucide-react";

export function AdminDashboard() {
  const { userInfo } = useRole();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Query to get all assessments
  const { data: assessments, isLoading: isAssessmentsLoading } = useQuery({
    queryKey: ['/api/assessments', refreshKey],
    enabled: !!userInfo?.id,
  });

  // Stats calculations
  const stats = {
    totalAssessments: assessments?.length || 0,
    highStressWeeks: 3, // For demo, would be calculated based on nervousness data
    scheduleCompletion: '86%', // For demo, would be calculated based on teacher submissions
  };

  const handleGenerateOptimalSchedule = async () => {
    try {
      // Get current date for start date
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // End date is 3 months from now
      const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);
      
      await apiRequest('POST', '/api/optimize-schedule', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      toast({
        title: "Schedule Optimized",
        description: "The assessment schedule has been optimized to reduce student nervousness.",
      });
      
      // Refresh the assessments data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not optimize the schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportSchedule = () => {
    // In a real app, this would generate a PDF or CSV export
    toast({
      title: "Export Schedule",
      description: "Schedule export functionality would be implemented here.",
    });
  };

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button 
            onClick={handleGenerateOptimalSchedule}
          >
            <Brain className="mr-2 h-4 w-4" />
            Generate Optimal Schedule
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportSchedule}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="ml-4 font-semibold text-lg">Total Assessments</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalAssessments}</p>
            <p className="text-muted-foreground text-sm mt-1">Across all grades and subjects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-amber-500/10 p-3 rounded-full">
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="ml-4 font-semibold text-lg">High Stress Weeks</h3>
            </div>
            <p className="text-3xl font-bold text-amber-500">{stats.highStressWeeks}</p>
            <p className="text-muted-foreground text-sm mt-1">Weeks with nervousness score &gt; 7</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <Brain className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="ml-4 font-semibold text-lg">Schedule Completion</h3>
            </div>
            <p className="text-3xl font-bold text-green-500">{stats.scheduleCompletion}</p>
            <p className="text-muted-foreground text-sm mt-1">Based on teacher submissions</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content with Tabs */}
      <Tabs defaultValue="ai-optimizer" className="w-full space-y-8">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="ai-optimizer" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>AI Schedule Optimizer</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </TabsTrigger>
        </TabsList>
        
        {/* AI Optimizer Tab */}
        <TabsContent value="ai-optimizer" className="mt-4 space-y-8">
          <AIScheduleOptimizer />
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4 space-y-8">
          <NervousnessChart />
          <RecommendedActions onOptimize={handleGenerateOptimalSchedule} />
        </TabsContent>
        
        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-4 space-y-8">
          <CalendarView assessments={assessments || []} isLoading={isAssessmentsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
