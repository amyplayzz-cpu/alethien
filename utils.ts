import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserRole = 'admin' | 'teacher';

export type AssessmentType = 
  | 'quiz' 
  | 'test' 
  | 'exam' 
  | 'project' 
  | 'presentation'
  | 'essay'
  | 'lab_report'
  | 'final_exam';

export type StakeLevel = 'low' | 'medium' | 'high';

export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export type PrepTime = {
  amount: number;
  unit: TimeUnit;
};

export function stakeToColor(stake: StakeLevel): string {
  switch (stake) {
    case 'low':
      return 'bg-[hsl(var(--low-stake))] text-[hsl(var(--tertiary-foreground))]';
    case 'medium':
      return 'bg-[hsl(var(--medium-stake))] text-white';
    case 'high':
      return 'bg-[hsl(var(--high-stake))] text-white';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}

export function formatPrepTime(prepTime: PrepTime): string {
  if (prepTime.amount === 1) {
    // Singular form
    return `${prepTime.amount} ${prepTime.unit.slice(0, -1)}`;
  }
  return `${prepTime.amount} ${prepTime.unit}`;
}

export function getNervousnessLevel(score: number): { text: string; color: string } {
  if (score < 3.5) {
    return { text: 'Low', color: 'text-green-600' };
  } else if (score < 7) {
    return { text: 'Moderate', color: 'text-amber-500' };
  } else {
    return { text: 'High', color: 'text-red-500' };
  }
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
  return diffDays;
}
