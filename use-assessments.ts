import { useQuery, useMutation } from "@tanstack/react-query";
import { Assessment } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function useAssessments() {
  const { data = [], isLoading, error } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  return {
    assessments: data,
    isLoading,
    error,
  };
}

export function useAssessment(id: number) {
  const { data, isLoading, error } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id,
  });

  return {
    assessment: data,
    isLoading,
    error,
  };
}
