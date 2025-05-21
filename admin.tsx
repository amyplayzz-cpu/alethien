import { useRole } from "@/components/RoleContext";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Admin() {
  const { userInfo } = useRole();
  const [, navigate] = useLocation();
  
  // Redirect to home if not logged in or not an admin
  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    } else if (userInfo.role !== 'admin') {
      navigate('/teacher');
    }
  }, [userInfo, navigate]);
  
  if (!userInfo || userInfo.role !== 'admin') {
    return null;
  }
  
  return (
    <AdminDashboard />
  );
}
