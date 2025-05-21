import { useLocation } from "wouter";
import { useRole } from "./RoleContext";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function RoleSelection() {
  const { setUserInfo } = useRole();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = async (role: 'admin' | 'teacher') => {
    setIsLoading(true);
    
    try {
      // In a real app, this would use a proper login flow
      // For demo, we're just using the default users
      const username = role === 'admin' ? 'admin' : 'teacher';
      const password = role === 'admin' ? 'admin123' : 'teacher123';
      
      const response = await apiRequest('POST', '/api/login', { 
        username, 
        password 
      });
      
      const userData = await response.json();
      
      setUserInfo({
        id: userData.id,
        username: userData.username,
        displayName: userData.displayName,
        role: userData.role,
      });
      
      navigate(role === 'admin' ? '/admin' : '/teacher');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: "Could not log in with selected role.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="fade-in">
      <h1 className="text-3xl font-heading font-bold text-accent text-center mb-12">Select Your Role</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Administrator Role Card */}
        <div 
          className="role-selector bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
          onClick={() => !isLoading && handleSelectRole('admin')}
        >
          <div className="h-48 bg-primary relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-icons text-8xl text-white opacity-20">admin_panel_settings</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-70"></div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-heading font-semibold text-accent mb-2">Administrator</h2>
            <p className="text-gray-600">Oversee assessment schedules across all grades and generate optimal calendars with AI assistance.</p>
            <div className="mt-4 flex items-center text-primary">
              <span className="material-icons mr-2">admin_panel_settings</span>
              <span className="font-medium">Access to school-wide scheduling</span>
            </div>
          </div>
        </div>
        
        {/* Teacher Role Card */}
        <div 
          className="role-selector bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer" 
          onClick={() => !isLoading && handleSelectRole('teacher')}
        >
          <div className="h-48 bg-secondary relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-icons text-8xl text-white opacity-20">school</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-70"></div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-heading font-semibold text-accent mb-2">Teacher</h2>
            <p className="text-gray-600">Submit and manage your planned assessments with detailed information to help optimize the schedule.</p>
            <div className="mt-4 flex items-center text-secondary">
              <span className="material-icons mr-2">school</span>
              <span className="font-medium">Submit and track your assessments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
