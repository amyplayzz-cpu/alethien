import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarView } from "@/components/ui/calendar-view";
import { NervousnessGauge, WeeklyNervousnessChart } from "@/components/ui/nervousness-gauge";
import { 
  Download, 
  Sparkles,
  TrendingDown,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { useAssessments } from "@/hooks/use-assessments";
import { useNervousnessPrediction } from "@/hooks/use-nervousness-prediction";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { assessments, isLoading: isLoadingAssessments } = useAssessments();
  const { nervousnessData, weeklyNervousnessData, isLoading: isLoadingNervousness } = useNervousnessPrediction();
  
  const handleOptimize = () => {
    navigate('/admin/optimization');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="admin" />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-poppins font-bold text-violet">Assessment Dashboard</h1>
            <div className="flex space-x-3">
              <Button variant="outline" className="shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button className="bg-primary text-white shadow-sm" onClick={handleOptimize}>
                <Sparkles className="mr-2 h-4 w-4" /> Run AI Optimizer
              </Button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground">Total Assessments</h3>
                  <span className="text-xs bg-tertiary/30 text-primary px-2 py-1 rounded-full">This Quarter</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-3xl font-poppins font-bold">
                    {isLoadingAssessments ? "..." : assessments.length}
                  </p>
                  <div className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3" /> +12% from last quarter
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground">Anxiety Hotspots</h3>
                  <span className="text-xs bg-tertiary/30 text-primary px-2 py-1 rounded-full">Detected</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-3xl font-poppins font-bold">
                    {isLoadingNervousness ? "..." : Object.values(nervousnessData).filter(score => score >= 7).length}
                  </p>
                  <div className="text-xs text-green-600 flex items-center">
                    <TrendingDown className="mr-1 h-3 w-3" /> -2 from last quarter
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground">Average Anxiety Level</h3>
                  <span className="text-xs bg-tertiary/30 text-primary px-2 py-1 rounded-full">All Classes</span>
                </div>
                <div className="mt-2">
                  {isLoadingNervousness ? (
                    <p className="text-3xl font-poppins font-bold">...</p>
                  ) : (
                    <>
                      <p className="text-3xl font-poppins font-bold">
                        {(Object.values(nervousnessData).reduce((sum, score) => sum + score, 0) / Object.values(nervousnessData).length).toFixed(1)}
                        <span className="text-sm text-muted-foreground">/10</span>
                      </p>
                      <NervousnessGauge 
                        value={Object.values(nervousnessData).reduce((sum, score) => sum + score, 0) / Object.values(nervousnessData).length} 
                        className="mt-2"
                        showText={false}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Calendar Section */}
          <div className="mb-6">
            <CalendarView 
              assessments={assessments} 
              nervousnessData={nervousnessData}
            />
          </div>
          
          {/* Weekly Anxiety Graph */}
          <Card>
            <CardContent className="p-4">
              <h2 className="font-poppins font-semibold text-lg mb-4">Weekly Anxiety Forecast</h2>
              
              {isLoadingNervousness ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading forecast data...</p>
                </div>
              ) : (
                <WeeklyNervousnessChart 
                  data={weeklyNervousnessData} 
                  onOptimizeWeek={handleOptimize}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
