import { Assessment } from "@shared/schema";

// Weights for different factors that contribute to nervousness
const NERVOUSNESS_WEIGHTS = {
  DENSITY: 0.4, // How many assessments in a given time period
  STAKES: 0.3, // High-stake vs low-stake
  PREP_TIME: 0.2, // Required preparation time
  WEIGHT: 0.1, // Percentage weight in grade
};

// Date utility functions
const getDaysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Class to optimize assessment schedules
 */
export class AIScheduler {
  /**
   * Calculate nervousness score for a given set of assessments
   * @param assessments List of assessments
   * @param startDate Start date of the evaluation period
   * @param endDate End date of the evaluation period
   * @returns Nervousness score (0-10 scale)
   */
  static calculateNervousnessScore(
    assessments: Assessment[],
    startDate: Date,
    endDate: Date
  ): number {
    if (assessments.length === 0) return 0;

    // Calculate days in evaluation period
    const daysInPeriod = getDaysBetween(startDate, endDate);
    
    // DENSITY score: Adjust based on number of assessments per day
    const densityScore = Math.min(assessments.length / daysInPeriod * 5, 10);
    
    // STAKES score: Percentage of high-stake assessments
    const highStakeCount = assessments.filter(a => a.stakeLevel === 'high').length;
    const mediumStakeCount = assessments.filter(a => a.stakeLevel === 'medium').length;
    const stakesScore = ((highStakeCount * 10) + (mediumStakeCount * 5)) / assessments.length;
    
    // PREP_TIME score: Total prep time required per day
    const totalPrepTime = assessments.reduce((sum, a) => sum + a.prepTime, 0);
    const prepTimeScore = Math.min(totalPrepTime / (daysInPeriod * 60) * 10, 10); // Assuming 60 min prep time per day is reasonable
    
    // WEIGHT score: Average weight of assessments
    const avgWeight = assessments.reduce((sum, a) => sum + a.weight, 0) / assessments.length;
    const weightScore = avgWeight / 10; // Assuming 10% is an average weight
    
    // Combine scores using weights
    const nervousnessScore = 
      (densityScore * NERVOUSNESS_WEIGHTS.DENSITY) +
      (stakesScore * NERVOUSNESS_WEIGHTS.STAKES) +
      (prepTimeScore * NERVOUSNESS_WEIGHTS.PREP_TIME) +
      (weightScore * NERVOUSNESS_WEIGHTS.WEIGHT);
    
    return Math.min(Math.round(nervousnessScore * 10) / 10, 10);
  }

  /**
   * Optimize the schedule to minimize nervousness
   * @param assessments Assessments to schedule
   * @param startDate Start date of scheduling period
   * @param endDate End date of scheduling period
   * @returns Optimized assessment schedule
   */
  static optimizeSchedule(
    assessments: Assessment[],
    startDate: Date,
    endDate: Date
  ): Assessment[] {
    if (assessments.length === 0) return [];

    // Clone assessments to avoid modifying originals
    const clonedAssessments = JSON.parse(JSON.stringify(assessments));
    
    // Sort assessments by flexibility and stake level
    const sortedAssessments = clonedAssessments.sort((a: Assessment, b: Assessment) => {
      // Sort by flexibility first (fixed dates first)
      const flexibilityOrder = {
        fixed: 0,
        low: 1,
        medium: 2,
        high: 3,
      };
      
      const flexDiff = flexibilityOrder[a.flexibility as keyof typeof flexibilityOrder] - 
                        flexibilityOrder[b.flexibility as keyof typeof flexibilityOrder];
      
      if (flexDiff !== 0) return flexDiff;
      
      // Then by stake level (high stakes first)
      const stakeOrder = {
        high: 0,
        medium: 1,
        low: 2,
      };
      
      return stakeOrder[a.stakeLevel as keyof typeof stakeOrder] - 
             stakeOrder[b.stakeLevel as keyof typeof stakeOrder];
    });
    
    // Keep fixed dates as is
    const fixedAssessments = sortedAssessments.filter((a: Assessment) => a.flexibility === 'fixed');
    const flexibleAssessments = sortedAssessments.filter((a: Assessment) => a.flexibility !== 'fixed');
    
    // Create date buckets for the scheduling period
    const totalDays = getDaysBetween(startDate, endDate);
    const dateBuckets: { date: Date; assessmentIds: number[] }[] = [];
    
    for (let i = 0; i < totalDays; i++) {
      const bucketDate = new Date(startDate);
      bucketDate.setDate(startDate.getDate() + i);
      
      // Add fixed assessments for this date
      const fixedForDate = fixedAssessments.filter((a: Assessment) => {
        const assessmentDate = new Date(a.date);
        return assessmentDate.toDateString() === bucketDate.toDateString();
      });
      
      dateBuckets.push({
        date: bucketDate,
        assessmentIds: fixedForDate.map((a: Assessment) => a.id),
      });
    }
    
    // Distribute flexible assessments to minimize nervousness
    for (const assessment of flexibleAssessments) {
      const originalDate = new Date(assessment.date);
      
      // Determine range based on flexibility
      let flexDays = 0;
      switch (assessment.flexibility) {
        case 'low': flexDays = 2; break;
        case 'medium': flexDays = 5; break;
        case 'high': flexDays = 7; break;
      }
      
      // Find the best date within the flexibility range
      let bestDate = originalDate;
      let lowestScore = Number.MAX_VALUE;
      
      for (let dayOffset = -flexDays; dayOffset <= flexDays; dayOffset++) {
        const candidateDate = new Date(originalDate);
        candidateDate.setDate(originalDate.getDate() + dayOffset);
        
        // Skip if outside scheduling period
        if (candidateDate < startDate || candidateDate > endDate) continue;
        
        // Find bucket for this date
        const bucketIndex = dateBuckets.findIndex(
          bucket => bucket.date.toDateString() === candidateDate.toDateString()
        );
        
        if (bucketIndex === -1) continue;
        
        // Temporarily add assessment to this date and calculate nervousness
        dateBuckets[bucketIndex].assessmentIds.push(assessment.id);
        
        // Calculate weekly nervousness (consider 3 days before and after)
        const weekStart = new Date(candidateDate);
        weekStart.setDate(candidateDate.getDate() - 3);
        const weekEnd = new Date(candidateDate);
        weekEnd.setDate(candidateDate.getDate() + 3);
        
        // Get assessments in this week
        const weeklyAssessmentIds = dateBuckets.filter(bucket => 
          bucket.date >= weekStart && bucket.date <= weekEnd
        ).flatMap(bucket => bucket.assessmentIds);
        
        const weeklyAssessments = assessments.filter(a => 
          weeklyAssessmentIds.includes(a.id)
        );
        
        const nervousnessScore = this.calculateNervousnessScore(
          weeklyAssessments,
          weekStart,
          weekEnd
        );
        
        // Remove assessment from this bucket for now
        dateBuckets[bucketIndex].assessmentIds.pop();
        
        // Keep track of date with lowest nervousness
        if (nervousnessScore < lowestScore) {
          lowestScore = nervousnessScore;
          bestDate = candidateDate;
        }
      }
      
      // Assign assessment to best date
      const bestBucketIndex = dateBuckets.findIndex(
        bucket => bucket.date.toDateString() === bestDate.toDateString()
      );
      
      if (bestBucketIndex !== -1) {
        dateBuckets[bestBucketIndex].assessmentIds.push(assessment.id);
        assessment.date = bestDate;
      }
    }
    
    return [...fixedAssessments, ...flexibleAssessments];
  }
}
