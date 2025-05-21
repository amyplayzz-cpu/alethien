import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NervousnessGauge } from "@/components/ui/nervousness-gauge";
import { ArrowRight, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminOptimization() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isApplying, setIsApplying] = useState(false);
  
  const handleApplyChanges = () => {
    setIsApplying(true);
    
    setTimeout(() => {
      setIsApplying(false);
      toast({
        title: "Schedule optimized",
        description: "The AI recommendations have been applied successfully.",
      });
      navigate('/admin/dashboard');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="admin" />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins">AI Schedule Optimization</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  The AI has analyzed all assessments and identified opportunities to reduce student nervousness. Below are the suggested changes:
                </p>
                
                <div className="space-y-6">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Current Schedule Issues</h3>
                      <ul className="text-sm space-y-2 text-foreground">
                        <li className="flex items-start">
                          <AlertTriangle className="text-red-500 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>Oct 18 has 3 high-stake assessments, creating an anxiety hotspot</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="text-amber-500 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>Week of Oct 15-21 has 5 assessments (2 more than recommended)</span>
                        </li>
                        <li className="flex items-start">
                          <Info className="text-blue-500 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>English Essay and Science Test scheduled on same day (Oct 17)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Proposed Schedule Changes</h3>
                      <ul className="text-sm space-y-2 text-foreground">
                        <li className="flex items-start">
                          <ArrowRight className="text-green-600 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>Move "Art Project" from Oct 18 to Oct 25 (confirmed flexibility with Art teacher)</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight className="text-green-600 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>Move "English Essay" from Oct 17 to Oct 12 (confirmed with English department)</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight className="text-green-600 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>Schedule "Math Quiz" for Oct 9 instead of Oct 8 (matches teacher preference)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-4">Impact on Nervousness Levels</h3>
                    <div className="flex flex-col md:flex-row md:space-x-8">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Before</span>
                          <span className="text-sm font-medium">6.8/10</span>
                        </div>
                        <NervousnessGauge value={6.8} showText={false} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">After</span>
                          <span className="text-sm font-medium">4.2/10</span>
                        </div>
                        <NervousnessGauge value={4.2} showText={false} />
                      </div>
                    </div>
                    
                    <p className="text-sm text-green-600 flex items-center mt-4">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      38% reduction in predicted student nervousness
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-primary text-white"
                  onClick={handleApplyChanges}
                  disabled={isApplying}
                >
                  {isApplying ? "Applying..." : "Apply Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
