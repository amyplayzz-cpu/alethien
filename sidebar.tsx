import { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  CalendarIcon, 
  BarChart, 
  Users,
  Settings,
  FileText,
  UserCog,
  HelpCircle
} from "lucide-react";
import { UserRole } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const NavItem = ({ icon, label, href, isActive }: NavItemProps) => (
  <li>
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 rounded-lg transition-all",
          isActive
            ? "text-primary bg-tertiary/30 font-medium"
            : "text-gray-600 hover:text-primary hover:bg-tertiary/20"
        )}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </a>
    </Link>
  </li>
);

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const [location] = useLocation();
  
  const isActive = useCallback(
    (path: string) => location === path,
    [location]
  );
  
  return (
    <aside className="w-64 bg-white shadow-md h-full flex flex-col">
      <div className="p-4 flex-1">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Current Quarter</p>
          <div className="flex items-center justify-between">
            <h2 className="font-poppins font-semibold text-lg">Fall 2023</h2>
            <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {role === 'admin' ? (
              // Admin navigation items
              <>
                <NavItem
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  label="Dashboard"
                  href="/admin/dashboard"
                  isActive={isActive("/admin/dashboard")}
                />
                <NavItem
                  icon={<CalendarIcon className="h-5 w-5" />}
                  label="Assessment Calendar"
                  href="/admin/calendar"
                  isActive={isActive("/admin/calendar")}
                />
                <NavItem
                  icon={<BarChart className="h-5 w-5" />}
                  label="Analytics"
                  href="/admin/analytics"
                  isActive={isActive("/admin/analytics")}
                />
                <NavItem
                  icon={<Users className="h-5 w-5" />}
                  label="Teachers"
                  href="/admin/teachers"
                  isActive={isActive("/admin/teachers")}
                />
                <NavItem
                  icon={<Settings className="h-5 w-5" />}
                  label="Settings"
                  href="/admin/settings"
                  isActive={isActive("/admin/settings")}
                />
              </>
            ) : (
              // Teacher navigation items
              <>
                <NavItem
                  icon={<LayoutDashboard className="h-5 w-5" />}
                  label="My Assessments"
                  href="/teacher/dashboard"
                  isActive={isActive("/teacher/dashboard")}
                />
                <NavItem
                  icon={<CalendarIcon className="h-5 w-5" />}
                  label="Schedule"
                  href="/teacher/schedule"
                  isActive={isActive("/teacher/schedule")}
                />
                <NavItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Assessment Templates"
                  href="/teacher/templates"
                  isActive={isActive("/teacher/templates")}
                />
                <NavItem
                  icon={<UserCog className="h-5 w-5" />}
                  label="My Profile"
                  href="/teacher/profile"
                  isActive={isActive("/teacher/profile")}
                />
              </>
            )}
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t">
        <div className="bg-tertiary/30 rounded-lg p-3">
          <h3 className="text-sm font-medium text-violet">Need Help?</h3>
          <p className="text-xs text-gray-600 mt-1">Learn how to optimize your assessment scheduling</p>
          <Button variant="link" className="mt-2 text-xs text-primary font-medium p-0 flex items-center">
            <span>View Tutorial</span>
            <HelpCircle className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
