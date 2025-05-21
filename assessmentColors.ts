type ColorClasses = {
  colorClass: string;
  textClass: string;
};

/**
 * Get the appropriate color classes for assessment display
 * @param type The assessment type
 * @param stakeLevel Optional stake level for additional styling
 * @returns Object with color and text classes
 */
export function getAssessmentColor(type: string, stakeLevel?: string): ColorClasses {
  // Default to blue (quiz)
  let colorClass = 'bg-blue-100';
  let textClass = 'text-blue-800';
  
  // High stake assessments are highlighted with warning colors
  if (stakeLevel === 'high') {
    return { colorClass: 'bg-red-100', textClass: 'text-red-800' };
  }
  
  // Medium stake assessments use amber/orange colors
  if (stakeLevel === 'medium') {
    return { colorClass: 'bg-orange-100', textClass: 'text-orange-800' };
  }
  
  // Color by type
  switch (type) {
    case 'quiz':
      colorClass = 'bg-green-100';
      textClass = 'text-green-800';
      break;
    case 'test':
      colorClass = 'bg-blue-100';
      textClass = 'text-blue-800';
      break;
    case 'exam':
      colorClass = stakeLevel !== 'low' ? 'bg-red-100' : 'bg-orange-100';
      textClass = stakeLevel !== 'low' ? 'text-red-800' : 'text-orange-800';
      break;
    case 'project':
      colorClass = 'bg-purple-100';
      textClass = 'text-purple-800';
      break;
    case 'presentation':
      colorClass = 'bg-indigo-100';
      textClass = 'text-indigo-800';
      break;
    case 'final':
      colorClass = 'bg-red-100';
      textClass = 'text-red-800';
      break;
    default:
      // Keep default blue
      break;
  }
  
  return { colorClass, textClass };
}
