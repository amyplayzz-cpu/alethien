import * as tf from '@tensorflow/tfjs';
import { Assessment } from '@shared/schema';

// Model interface definition
interface ModelInputs {
  assessmentFrequency: number;   // Number of assessments per week
  timeBetweenAssessments: number; // Average days between assessments
  highStakeRatio: number;        // Ratio of high stake assessments
  totalPrepHours: number;        // Combined prep time in hours
}

// Create the nervousness prediction model
export function createModel() {
  const model = tf.sequential();

  // Create a model architecture to predict nervousness
  model.add(tf.layers.dense({ 
    inputShape: [4], 
    units: 8, 
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  
  model.add(tf.layers.dense({ 
    units: 4, 
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  
  // Output layer gives a value between 0-1, which we'll scale to 0-10 for nervousness
  model.add(tf.layers.dense({ 
    units: 1, 
    activation: 'sigmoid',
    kernelInitializer: 'varianceScaling' 
  }));

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

// Train the model with example data (this would normally use real data)
export async function trainModel(model: tf.Sequential) {
  // Sample training data - would be replaced with real data in production
  // Format: [assessmentFrequency, timeBetweenAssessments, highStakeRatio, totalPrepHours]
  const xs = tf.tensor2d([
    [1, 7, 0.0, 2],    // 1 low-stakes quiz per week, low nervousness
    [2, 4, 0.0, 4],    // 2 low-stakes quizzes with good spacing, low-moderate nervousness
    [2, 3, 0.5, 6],    // 2 assessments (mix of stakes) with decent spacing, moderate nervousness
    [3, 2, 0.33, 8],   // 3 assessments (1 high stake) with close spacing, high nervousness
    [4, 1, 0.5, 12],   // 4 assessments (2 high stake) with very close spacing, very high nervousness
    [5, 1, 0.6, 15],   // 5 assessments (3 high stake) with very close spacing, extreme nervousness
    [3, 5, 0.33, 10],  // 3 assessments (1 high stake) with good spacing, moderate nervousness
    [2, 6, 1.0, 14],   // 2 high-stakes assessments with good spacing, high nervousness
    [1, 14, 1.0, 10],  // 1 high-stakes assessment with plenty of time, moderate nervousness
  ]);
  
  // Nervousness scores (0-1 scale, will be converted to 0-10 for display)
  const ys = tf.tensor2d([
    [0.2],  // Low nervousness  
    [0.3],  // Low-moderate nervousness
    [0.5],  // Moderate nervousness
    [0.7],  // High nervousness
    [0.9],  // Very high nervousness
    [1.0],  // Extreme nervousness
    [0.6],  // Moderate-high nervousness
    [0.7],  // High nervousness
    [0.4],  // Moderate nervousness
  ]);

  // Train the model
  await model.fit(xs, ys, {
    epochs: 150,
    batchSize: 3,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 10 === 0) {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    }
  });

  return model;
}

// Convert assessment data into model inputs
export function prepareModelInputs(assessments: Assessment[], startDate: Date, endDate: Date): ModelInputs {
  // Filter assessments to only include those in the date range
  const filteredAssessments = assessments.filter(assessment => {
    const assessmentDate = new Date(assessment.date);
    return assessmentDate >= startDate && assessmentDate <= endDate;
  });

  if (filteredAssessments.length === 0) {
    return {
      assessmentFrequency: 0,
      timeBetweenAssessments: 14, // Default to 2 weeks if no assessments
      highStakeRatio: 0,
      totalPrepHours: 0
    };
  }

  // Calculate days in the range
  const daysBetween = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const weeks = Math.max(1, Math.ceil(daysBetween / 7));
  
  // Calculate assessment frequency (per week)
  const assessmentFrequency = filteredAssessments.length / weeks;
  
  // Calculate average time between assessments
  const sortedDates = filteredAssessments
    .map(a => new Date(a.date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  let totalGapDays = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const gapDays = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
    totalGapDays += gapDays;
  }
  
  const timeBetweenAssessments = sortedDates.length > 1 
    ? totalGapDays / (sortedDates.length - 1) 
    : 7; // Default to 1 week if only one assessment
  
  // Calculate high stake ratio
  const highStakeCount = filteredAssessments.filter(a => a.stakes === 'high').length;
  const highStakeRatio = filteredAssessments.length > 0 
    ? highStakeCount / filteredAssessments.length 
    : 0;
  
  // Calculate total prep hours
  let totalPrepHours = 0;
  for (const assessment of filteredAssessments) {
    const prepTime = assessment.prepTime;
    let hours = 0;
    
    if (prepTime.unit === 'minutes') {
      hours = prepTime.amount / 60;
    } else if (prepTime.unit === 'hours') {
      hours = prepTime.amount;
    } else if (prepTime.unit === 'days') {
      hours = prepTime.amount * 8; // Assume 8 hours per day
    } else if (prepTime.unit === 'weeks') {
      hours = prepTime.amount * 40; // Assume 40 hours per week
    }
    
    totalPrepHours += hours;
  }
  
  return {
    assessmentFrequency,
    timeBetweenAssessments,
    highStakeRatio,
    totalPrepHours
  };
}

// Get nervousness prediction for a set of assessments
export async function predictNervousness(
  model: tf.Sequential,
  assessments: Assessment[],
  startDate: Date,
  endDate: Date
): Promise<number> {
  // If no assessments, return 0
  if (!assessments.length) return 0;
  
  // Prepare inputs for the model
  const inputs = prepareModelInputs(assessments, startDate, endDate);
  
  // Convert to tensor
  const inputTensor = tf.tensor2d([
    [
      inputs.assessmentFrequency,
      inputs.timeBetweenAssessments,
      inputs.highStakeRatio,
      inputs.totalPrepHours
    ]
  ]);
  
  // Get prediction
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const value = await prediction.data();
  
  // Cleanup tensors
  inputTensor.dispose();
  prediction.dispose();
  
  // Scale to 0-10 range and return
  return Math.round((value[0] * 10) * 10) / 10;
}

// Initialize and load the model (call this once when the app starts)
export async function initializeModel() {
  const model = createModel();
  await trainModel(model);
  return model;
}