import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { Assessment, InsertAssessment } from "@shared/schema";

export async function fetchAssessments(): Promise<Assessment[]> {
  const response = await apiRequest("GET", "/api/assessments");
  return response.json();
}

export async function fetchAssessment(id: number): Promise<Assessment> {
  const response = await apiRequest("GET", `/api/assessments/${id}`);
  return response.json();
}

export async function createAssessment(assessment: InsertAssessment): Promise<Assessment> {
  const response = await apiRequest("POST", "/api/assessments", assessment);
  // Invalidate assessments query to refresh the list
  queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
  return response.json();
}

export async function updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment> {
  const response = await apiRequest("PATCH", `/api/assessments/${id}`, assessment);
  // Invalidate both the list and the specific assessment
  queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
  queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
  return response.json();
}

export async function deleteAssessment(id: number): Promise<void> {
  await apiRequest("DELETE", `/api/assessments/${id}`);
  // Invalidate assessments query to refresh the list
  queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
}

export async function runOptimization(): Promise<{ before: number; after: number; changes: any[] }> {
  const response = await apiRequest("POST", "/api/optimize");
  return response.json();
}

export async function applyOptimization(): Promise<void> {
  await apiRequest("POST", "/api/optimize/apply");
  // Invalidate relevant queries after optimization is applied
  queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
  queryClient.invalidateQueries({ queryKey: ["/api/nervousness/daily"] });
  queryClient.invalidateQueries({ queryKey: ["/api/nervousness/weekly"] });
}
