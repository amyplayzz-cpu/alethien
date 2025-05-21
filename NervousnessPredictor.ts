import * as tf from '@tensorflow/tfjs';
import { Assessment } from '@shared/schema';

interface ModelInputs {
  assessmentFrequency: number;   // Number of assessments per week
  timeBetweenAssessments: number; // Average days between assessments
  highStakeRatio: number;        // Ratio of high stake assessments
  totalWeeklyLoad: number;       // Combined weight percentage
  avgPrepTime: number;           // Average prep time in hours
}

/**
 * Neural network model for predicting student nervousness based on assessment schedules
 */
export class NervousnessPredictor {
  private model: tf.LayersModel | null = null;
  
  /**
   * Creates and trains the nervousness prediction model
   */
  async initialize(): Promise<void> {
    // Define the model architecture
    const model = tf.sequential();
    
    // Input layer with 5 features
    model.add(tf.layers.dense({
      units: 10,
      activation: 'relu',
      inputShape: [5]
    }));
    
    // Hidden layer
    model.add(tf.layers.dense({
      units: 8,
      activation: 'relu'
    }));
    
    // Output layer (nervousness score 0-10)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError'
    });
    
    // Training data based on typical assessment patterns
    // format: [assessmentFrequency, timeBetweenAssessments, highStakeRatio, totalWeeklyLoad, avgPrepTime]
    const trainingData = tf.tensor2d([
      [1, 7, 0, 10, 1],     // Once a week, low stake quiz: nervousness = 2
      [2, 3.5, 0, 20, 2],   // Twice a week, low stake: nervousness = 4
      [3, 2.3, 0.33, 35, 3], // Three times a week, one high stake: nervousness = 6
      [4, 1.75, 0.5, 45, 4], // Four times a week, half high stake: nervousness = 8
      [5, 1.4, 0.6, 70, 5],  // Five times a week, mostly high stake: nervousness = 9.5
      [3, 2.3, 1, 50, 6],    // Three a week, all high stake: nervousness = 8.5
      [2, 3.5, 1, 40, 5],    // Two a week, all high stake: nervousness = 7
      [1, 7, 1, 20, 3],      // One a week, high stake: nervousness = 5
      [0, 0, 0, 0, 0],       // No assessments: nervousness = 0
    ]);
    
    // Target data - nervousness scores (0-10) scaled to 0-1
    const targetData = tf.tensor2d([
      [0.2], [0.4], [0.6], [0.8], [0.95], [0.85], [0.7], [0.5], [0]
    ]);
    
    // Train the model
    await model.fit(trainingData, targetData, {
      epochs: 200,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 50 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      }
    });
    
    this.model = model;
  }
  
  /**
   * Predicts nervousness score from a list of assessments scheduled for a specific week
   * @param assessments List of assessments in a given week
   * @returns Predicted nervousness score (0-10)
   */
  predictNervousness(assessments: Assessment[]): number {
    if (!this.model) {
      console.error("Model not initialized. Call initialize() first.");
      return 0;
    }
    
    if (!assessments || assessments.length === 0) {
      return 0; // No assessments, no nervousness
    }
    
    // Calculate input features
    const inputs = this.calculateFeatures(assessments);
    
    // Make prediction
    const inputTensor = tf.tensor2d([
      [
        inputs.assessmentFrequency,
        inputs.timeBetweenAssessments,
        inputs.highStakeRatio,
        inputs.totalWeeklyLoad,
        inputs.avgPrepTime
      ]
    ]);
    
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const nervousnessScore = prediction.dataSync()[0] * 10; // Scale back to 0-10
    
    return Math.round(nervousnessScore * 10) / 10; // Round to 1 decimal place
  }
  
  /**
   * Calculate input features from assessment data
   * @param assessments List of assessments
   * @returns Input features for the model
   */
  private calculateFeatures(assessments: Assessment[]): ModelInputs {
    const count = assessments.length;
    
    // Sort assessments by date
    const sortedAssessments = [...assessments].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate time between assessments (in days)
    let totalDaysBetween = 0;
    for (let i = 1; i < sortedAssessments.length; i++) {
      const prevDate = new Date(sortedAssessments[i-1].date);
      const currDate = new Date(sortedAssessments[i].date);
      const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      totalDaysBetween += daysDiff;
    }
    
    const avgDaysBetween = count > 1 ? totalDaysBetween / (count - 1) : 7;
    
    // Calculate high stake ratio
    const highStakeCount = assessments.filter(a => a.stakeLevel === 'high').length;
    const highStakeRatio = count > 0 ? highStakeCount / count : 0;
    
    // Calculate total weekly load (sum of weights)
    const totalWeeklyLoad = assessments.reduce((sum, a) => sum + a.weight, 0);
    
    // Calculate average prep time (convert minutes to hours)
    const totalPrepTimeHours = assessments.reduce((sum, a) => sum + (a.prepTime / 60), 0);
    const avgPrepTime = count > 0 ? totalPrepTimeHours / count : 0;
    
    return {
      assessmentFrequency: count,
      timeBetweenAssessments: avgDaysBetween,
      highStakeRatio,
      totalWeeklyLoad,
      avgPrepTime
    };
  }
}
