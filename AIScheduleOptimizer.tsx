import { useState, useEffect } from 'react';
import { useNervousnessModel } from '@/hooks/useNervousnessModel';
import { useAssessments } from '@/hooks/use-assessments';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HeatMapGrid } from '@/components/admin/HeatMapGrid';
import { format, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, addWeeks } from 'date-fns';
import { BarChart3, Calendar, Brain, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { Assessment } from '@shared/schema';

export function AIScheduleOptimizer() {
  const { assessments, isLoading: isLoadingAssessments } = useAssessments();
  const { isLoading: isLoadingModel, error, analyzeAcademicTerm } = useNervousnessModel();
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizedSchedule, setOptimizedSchedule] = useState<Assessment[] | null>(null);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState('analysis');

  const isLoading = isLoadingAssessments || isLoadingModel;

  useEffect(() => {
    if (!isLoading && assessments.length > 0) {
      analyzeCurrentSchedule();
    }
  }, [assessments, isLoading]);

  const analyzeCurrentSchedule = async () => {
    if (isLoading || !assessments.length) return;

    setIsAnalyzing(true);

    try {
      // Determine the academic period from the assessment dates
      const sortedDates = [...assessments]
        .map(a => new Date(a.date))
        .sort((a, b) => a.getTime() - b.getTime());

      const earliestDate = sortedDates[0];
      const latestDate = sortedDates[sortedDates.length - 1];

      // Ensure we have at least a month of analysis
      const endDate = new Date(latestDate);
      if (endDate.getTime() - earliestDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
        endDate.setDate(earliestDate.getDate() + 30);
      }

      // Analyze the academic term
      const results = await analyzeAcademicTerm(assessments, earliestDate, endDate);
      setWeeklyData(results);

      // Calculate overall nervousness score (average of weekly scores)
      const overallScore = results.reduce((sum, week) => sum + week.value, 0) / results.length;
      setBeforeScore(Number(overallScore.toFixed(1)));
    } catch (err) {
      console.error("Error analyzing schedule:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeSchedule = async () => {
    if (isLoading || !assessments.length || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      // Identify high stress weeks
      const highStressWeeks = weeklyData.filter(week => week.value > 6.5);
      
      if (highStressWeeks.length === 0) {
        // No high stress weeks to optimize
        setOptimizedSchedule([...assessments]);
        setAfterScore(beforeScore);
        setSelectedTab('results');
        return;
      }

      // Create a deep copy of assessments to modify
      const optimizedAssessments = JSON.parse(JSON.stringify(assessments));
      
      // Find assessments in high stress weeks that could be moved
      for (const week of highStressWeeks) {
        // Get assessments in this week
        const weekAssessments = optimizedAssessments.filter(a => {
          const date = new Date(a.date);
          return date >= week.startDate && date <= week.endDate;
        });
        
        // Sort by flexibility (very_flexible first)
        weekAssessments.sort((a, b) => {
          const flexOrder = { very_flexible: 0, somewhat_flexible: 1, fixed: 2 };
          return flexOrder[a.flexibility || 'somewhat_flexible'] - flexOrder[b.flexibility || 'somewhat_flexible'];
        });
        
        // Try to move some assessments to lower stress weeks
        let moved = 0;
        for (const assessment of weekAssessments) {
          // Skip fixed assessments
          if (assessment.flexibility === 'fixed') continue;
          
          // Find a better week (with lower stress)
          const lowerStressWeeks = weeklyData
            .filter(w => w.value < week.value - 2) // At least 2 points lower stress
            .sort((a, b) => a.value - b.value); // Sort by lowest stress
          
          if (lowerStressWeeks.length > 0) {
            // Get the lowest stress week
            const targetWeek = lowerStressWeeks[0];
            
            // Find the index of this assessment in the optimized array
            const index = optimizedAssessments.findIndex(a => a.id === assessment.id);
            if (index !== -1) {
              // Choose a day in the middle of target week
              const midWeekDay = new Date(targetWeek.startDate);
              midWeekDay.setDate(targetWeek.startDate.getDate() + 2); // Wednesday-ish
              
              // Update the date
              optimizedAssessments[index].date = format(midWeekDay, 'yyyy-MM-dd');
              
              // Mark as moved
              moved++;
              
              // Stop after moving at most 2 assessments per week
              if (moved >= 2) break;
            }
          }
        }
      }
      
      // Re-analyze with the optimized schedule
      const sortedDates = [...optimizedAssessments]
        .map(a => new Date(a.date))
        .sort((a, b) => a.getTime() - b.getTime());

      const earliestDate = sortedDates[0];
      const latestDate = sortedDates[sortedDates.length - 1];
      
      // Ensure we have at least a month of analysis
      const endDate = new Date(latestDate);
      if (endDate.getTime() - earliestDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
        endDate.setDate(earliestDate.getDate() + 30);
      }
      
      // Analyze the optimized term
      const results = await analyzeAcademicTerm(optimizedAssessments, earliestDate, endDate);
      
      // Calculate overall nervousness score for optimized schedule
      const overallScore = results.reduce((sum, week) => sum + week.value, 0) / results.length;
      setAfterScore(Number(overallScore.toFixed(1)));
      
      // Set optimized schedule
      setOptimizedSchedule(optimizedAssessments);
      
      // Switch to results tab
      setSelectedTab('results');
    } catch (err) {
      console.error("Error optimizing schedule:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimizedSchedule = () => {
    // This function would call an API to update the schedule
    // For now, we'll just show a success message
    alert("Schedule optimization applied successfully!");
  };

  // Visual components
  const renderAnalysisTab = () => (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                Overall nervousness score for the current schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || isAnalyzing ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {beforeScore !== null ? beforeScore : 'N/A'}
                    <span className="text-base font-normal text-muted-foreground">/10</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {beforeScore !== null && beforeScore > 6.5 
                      ? 'High stress detected - optimization recommended' 
                      : 'Schedule is well balanced'}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={optimizeSchedule} 
                disabled={isLoading || isAnalyzing || !assessments.length}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Optimize Schedule with AI'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Weekly Stress Distribution
              </CardTitle>
              <CardDescription>
                Nervousness levels across the academic term
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || isAnalyzing ? (
                <Skeleton className="h-20 w-full" />
              ) : weeklyData.length > 0 ? (
                <div className="space-y-3">
                  {weeklyData.map((week, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{week.week}</span>
                        <span className={
                          week.value > 7
                            ? 'text-red-500 font-medium'
                            : week.value > 4
                              ? 'text-amber-500 font-medium'
                              : 'text-green-500 font-medium'
                        }>
                          {week.value.toFixed(1)}
                        </span>
                      </div>
                      <Progress 
                        value={week.value * 10} 
                        className={
                          week.value > 7
                            ? 'bg-red-100 dark:bg-red-950'
                            : week.value > 4
                              ? 'bg-amber-100 dark:bg-amber-950'
                              : 'bg-green-100 dark:bg-green-950'
                        }
                        indicatorClassName={
                          week.value > 7
                            ? 'bg-red-500'
                            : week.value > 4
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 text-center text-muted-foreground">
                  No assessment data available for analysis
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {weeklyData.some(week => week.value > 6.5) && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>High stress weeks detected</AlertTitle>
            <AlertDescription>
              The AI has identified potential scheduling issues that could cause high student stress.
              Click "Optimize Schedule" to see AI-recommended improvements.
            </AlertDescription>
          </Alert>
        )}

        {weeklyData.length > 0 && !weeklyData.some(week => week.value > 6.5) && (
          <Alert variant="default" className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Schedule looks good</AlertTitle>
            <AlertDescription>
              The AI analysis indicates the current assessment schedule is well-balanced.
              No significant stress periods detected.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );

  const renderResultsTab = () => (
    <>
      {optimizedSchedule && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Before Optimization</CardTitle>
                <CardDescription>
                  Original nervousness score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {beforeScore}
                    <span className="text-base font-normal text-muted-foreground">/10</span>
                  </div>
                  <Progress 
                    value={beforeScore ? beforeScore * 10 : 0}
                    className="bg-muted h-3"
                    indicatorClassName={
                      beforeScore && beforeScore > 7
                        ? 'bg-red-500'
                        : beforeScore && beforeScore > 4
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">After Optimization</CardTitle>
                <CardDescription>
                  Optimized nervousness score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {afterScore}
                    <span className="text-base font-normal text-muted-foreground">/10</span>
                  </div>
                  <Progress 
                    value={afterScore ? afterScore * 10 : 0}
                    className="bg-muted h-3"
                    indicatorClassName={
                      afterScore && afterScore > 7
                        ? 'bg-red-500'
                        : afterScore && afterScore > 4
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Recommended Changes</CardTitle>
              <CardDescription>
                {optimizedSchedule.some((opt, i) => 
                  opt.date !== assessments[i]?.date
                ) ? 'Suggested assessment date changes to reduce stress' : 'No changes needed'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {optimizedSchedule.some((opt, i) => 
                  assessments[i] && opt.date !== assessments[i].date
                ) ? (
                  optimizedSchedule
                    .map((assessment, index) => ({
                      original: assessments[index],
                      optimized: assessment,
                      id: assessment.id
                    }))
                    .filter(item => 
                      item.original && item.original.date !== item.optimized.date
                    )
                    .map((item, i) => (
                      <div key={i} className="flex items-center space-x-2 p-2 rounded border bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{item.optimized.title}</p>
                          <div className="text-sm flex items-center mt-1">
                            <span className="text-muted-foreground">{format(new Date(item.original.date), 'MMM d, yyyy')}</span>
                            <ArrowRight className="h-3 w-3 mx-2 text-primary" />
                            <span className="font-medium">{format(new Date(item.optimized.date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No scheduling changes required. The current schedule is optimal.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {optimizedSchedule.some((opt, i) => 
                assessments[i] && opt.date !== assessments[i].date
              ) && (
                <Button 
                  onClick={applyOptimizedSchedule} 
                  className="w-full"
                >
                  Apply Optimized Schedule
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTab('analysis')}
            >
              Back to Analysis
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Schedule Optimizer
        </CardTitle>
        <CardDescription>
          Analyze and optimize assessment schedules to reduce student stress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>AI Model Error</AlertTitle>
            <AlertDescription>
              {error}. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="analysis">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!optimizedSchedule}>
                <Calendar className="mr-2 h-4 w-4" />
                Optimization Results
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="mt-0">
              {renderAnalysisTab()}
            </TabsContent>
            <TabsContent value="results" className="mt-0">
              {renderResultsTab()}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}