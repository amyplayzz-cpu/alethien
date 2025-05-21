import { useRole } from "@/components/RoleContext";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Teacher() {
  const { userInfo } = useRole();
  const [, navigate] = useLocation();
  
  // Redirect to home if not logged in or not a teacher
  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    } else if (userInfo.role !== 'teacher') {
      navigate('/admin');
    }
  }, [userInfo, navigate]);
  
  if (!userInfo || userInfo.role !== 'teacher') {
    return null;
  }
  
  return (
    <TeacherDashboard />
  );
}
