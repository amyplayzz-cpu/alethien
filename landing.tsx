import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, BrainCircuit, BarChart3, UserCog } from "lucide-react";

export default function LandingPage() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  // If already authenticated, redirect to the appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/teacher");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Alethien</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/login")}
            >
              Log In
            </Button>
            <Button 
              onClick={() => setLocation("/register")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Smart Assessment Scheduling for <span className="text-primary">Beteseb Academy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Alethien helps reduce student stress and improve academic performance through AI-driven scheduling of tests, quizzes, and assignments.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/register")}
              className="px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setLocation("/login")}
              className="px-8"
            >
              Sign In
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-16">How Alethien Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <CalendarDays className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Intelligently schedules assessments to prevent clustering and reduce student anxiety.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Nervousness Analytics</h3>
              <p className="text-muted-foreground">
                Visualize student stress levels across the semester to identify and address pressure points.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <UserCog className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User-Friendly Interface</h3>
              <p className="text-muted-foreground">
                Separate dashboards for administrators and teachers to manage assessments effectively.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="bg-secondary/20 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Why Educators Choose Alethien</h2>
            <div className="max-w-3xl mx-auto bg-card rounded-lg p-8 shadow-lg">
              <p className="text-lg italic mb-6">
                "Alethien has transformed how we schedule assessments at Beteseb Academy. Our students report feeling less overwhelmed, and we've seen improved performance across all subjects."
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">DA</span>
                </div>
                <div>
                  <p className="font-semibold">Dr. Abebe</p>
                  <p className="text-sm text-muted-foreground">Principal, Beteseb Academy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Assessment Scheduling?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join Beteseb Academy and hundreds of other schools using Alethien to create
            better academic experiences.
          </p>
          <Button 
            size="lg" 
            onClick={() => setLocation("/register")}
            className="px-8"
          >
            Create Your Account
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <p className="font-semibold">Alethien</p>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Beteseb Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}