import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { 
  CalendarCheck, 
  Bell, 
  Settings, 
  Moon, 
  Sun
} from "lucide-react";

interface HeaderProps {
  onRoleChange?: (role: UserRole) => void;
}

export function Header({ onRoleChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { role, setRole } = useUser();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };
  
  return (
    <header className="gradient-bg text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <CalendarCheck className="h-7 w-7" />
            <h1 className="text-2xl font-poppins font-bold">Alethien</h1>
          </a>
        </Link>
        
        {/* Role Selector */}
        <div className="bg-white/20 rounded-lg overflow-hidden flex">
          <Button 
            variant="ghost" 
            size="sm"
            className={`px-4 py-2 font-medium text-sm transition-all ${
              role === 'admin' ? 'bg-white text-primary' : 'text-white'
            }`}
            onClick={() => handleRoleChange('admin')}
          >
            Administrator
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`px-4 py-2 font-medium text-sm transition-all ${
              role === 'teacher' ? 'bg-white text-primary' : 'text-white'
            }`}
            onClick={() => handleRoleChange('teacher')}
          >
            Teacher
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 rounded-full"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost" 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center text-primary font-medium">
            MS
          </div>
        </div>
      </div>
    </header>
  );
}
