import { useQuery } from "@tanstack/react-query";

// Dates and nervousness scores for days
type NervousnessData = Record<string, number>;

// Weekly nervousness data format
type WeeklyNervousness = {
  week: string;
  value: number;
  label: string;
};

export function useNervousnessPrediction() {
  const { data: nervousnessData = {}, isLoading: isLoadingDaily } = useQuery<NervousnessData>({
    queryKey: ["/api/nervousness/daily"],
  });

  const { data: weeklyData = [], isLoading: isLoadingWeekly } = useQuery<WeeklyNervousness[]>({
    queryKey: ["/api/nervousness/weekly"],
  });

  const isLoading = isLoadingDaily || isLoadingWeekly;

  return {
    nervousnessData,
    weeklyNervousnessData: weeklyData,
    isLoading,
  };
}
