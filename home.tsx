import { useRole } from "@/components/RoleContext";
import { RoleSelection } from "@/components/RoleSelection";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { userInfo } = useRole();
  const [, navigate] = useLocation();
  
  // Redirect to appropriate dashboard if already logged in
  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.role === 'admin' ? '/admin' : '/teacher');
    }
  }, [userInfo, navigate]);
  
  return (
    <div className="py-4">
      <RoleSelection />
    </div>
  );
}
