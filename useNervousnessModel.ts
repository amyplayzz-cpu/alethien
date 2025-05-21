import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { 
  createModel,
  trainModel, 
  predictNervousness 
} from '@/lib/nervousnessModel';
import { Assessment } from '@shared/schema';

export function useNervousnessModel() {
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the model on component mount
  useEffect(() => {
    async function initModel() {
      try {
        setIsLoading(true);
        
        // Make sure TensorFlow is ready
        await tf.ready();
        
        // Create and train the model
        const newModel = createModel();
        await trainModel(newModel);
        
        setModel(newModel);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize nervousness model:", err);
        setError("Failed to initialize AI model");
      } finally {
        setIsLoading(false);
      }
    }

    initModel();

    // Clean up when component unmounts
    return () => {
      if (model) {
        try {
          model.dispose();
        } catch (err) {
          console.error("Error disposing model:", err);
        }
      }
    };
  }, []);

  // Function to predict nervousness for a week or any date range
  const predictWeeklyNervousness = async (
    assessments: Assessment[], 
    weekStart: Date
  ) => {
    if (!model || isLoading) return 0;
    
    try {
      // Create end date (7 days after start)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Get nervousness prediction
      return await predictNervousness(model, assessments, weekStart, weekEnd);
    } catch (err) {
      console.error("Error predicting nervousness:", err);
      return 0;
    }
  };

  // Function to predict nervousness for a specific day
  const predictDailyNervousness = async (
    assessments: Assessment[],
    date: Date
  ) => {
    if (!model || isLoading) return 0;
    
    try {
      // Use the same date for start and end to focus on a single day
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      // Get nervousness prediction
      return await predictNervousness(model, assessments, date, nextDay);
    } catch (err) {
      console.error("Error predicting nervousness:", err);
      return 0;
    }
  };

  // Function to predict nervousness for a month
  const predictMonthlyNervousness = async (
    assessments: Assessment[],
    year: number,
    month: number // 0-11 (January is 0)
  ) => {
    if (!model || isLoading) return 0;
    
    try {
      // Create start and end dates for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of month
      
      // Get nervousness prediction
      return await predictNervousness(model, assessments, startDate, endDate);
    } catch (err) {
      console.error("Error predicting nervousness:", err);
      return 0;
    }
  };

  // Function to analyze an entire academic term
  const analyzeAcademicTerm = async (
    assessments: Assessment[],
    startDate: Date,
    endDate: Date
  ) => {
    if (!model || isLoading) return [];
    
    try {
      const results = [];
      
      // Clone start date so we don't modify the original
      const currentWeekStart = new Date(startDate);
      
      // Loop through each week in the term
      while (currentWeekStart <= endDate) {
        // End of this week
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        
        // Predict nervousness for this week
        const nervousness = await predictNervousness(
          model, 
          assessments, 
          currentWeekStart, 
          weekEnd
        );
        
        // Format dates for display
        const weekLabel = `${currentWeekStart.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} - ${weekEnd.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })}`;
        
        // Determine stress level label
        let stressLabel = "Low";
        if (nervousness > 7) stressLabel = "High";
        else if (nervousness > 4) stressLabel = "Moderate";
        
        // Add to results
        results.push({
          week: weekLabel,
          value: nervousness,
          label: stressLabel,
          isHighStress: nervousness > 7,
          startDate: new Date(currentWeekStart),
          endDate: new Date(weekEnd)
        });
        
        // Move to next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
      
      return results;
    } catch (err) {
      console.error("Error analyzing academic term:", err);
      return [];
    }
  };

  return {
    model,
    isLoading,
    error,
    predictWeeklyNervousness,
    predictDailyNervousness,
    predictMonthlyNervousness,
    analyzeAcademicTerm
  };
}