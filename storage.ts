import { assessments, Assessment, InsertAssessment, users, User, InsertUser } from "@shared/schema";
import { DatabaseStorage } from "./database";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Assessment operations
  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: number): Promise<boolean>;
  
  // Nervousness prediction
  getNervousnessScores(): Promise<Record<string, number>>;
  getWeeklyNervousnessData(): Promise<Array<{ week: string; value: number; label: string }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assessments: Map<number, Assessment>;
  currentUserId: number;
  currentAssessmentId: number;

  constructor() {
    this.users = new Map();
    this.assessments = new Map();
    this.currentUserId = 1;
    this.currentAssessmentId = 1;
    
    // Add some initial users
    this.createUser({
      username: "admin",
      password: "password", // In a real app, this would be hashed
      displayName: "Admin User",
      role: "admin"
    });
    
    this.createUser({
      username: "teacher",
      password: "password", // In a real app, this would be hashed
      displayName: "Teacher User",
      role: "teacher"
    });
    
    // Add some sample assessments
    const sampleAssessments: InsertAssessment[] = [
      {
        title: "Math Quiz: Algebra",
        type: "quiz",
        date: new Date(2023, 9, 9).toISOString(),
        weight: 10,
        stakes: "low",
        prepTime: { amount: 30, unit: "minutes" },
        notes: "Basic algebra concepts",
        teacherId: 2
      },
      {
        title: "History Exam: World War II",
        type: "exam",
        date: new Date(2023, 9, 11).toISOString(),
        weight: 25,
        stakes: "high",
        prepTime: { amount: 2, unit: "hours" },
        notes: "Comprehensive exam on WWII",
        teacherId: 2
      },
      {
        title: "Science Test: Periodic Table",
        type: "test",
        date: new Date(2023, 9, 17).toISOString(),
        weight: 15,
        stakes: "medium",
        prepTime: { amount: 1, unit: "hours" },
        notes: "Focus on element properties and reactions",
        teacherId: 2
      },
      {
        title: "English Essay: Literature Analysis",
        type: "essay",
        date: new Date(2023, 9, 17).toISOString(),
        weight: 20,
        stakes: "low",
        prepTime: { amount: 2, unit: "days" },
        notes: "Analysis of Shakespeare's Macbeth",
        teacherId: 2
      },
      {
        title: "Bio Midterm",
        type: "exam",
        date: new Date(2023, 9, 18).toISOString(),
        weight: 30,
        stakes: "high",
        prepTime: { amount: 3, unit: "days" },
        notes: "Comprehensive midterm covering all material to date",
        teacherId: 2
      },
      {
        title: "Art Project",
        type: "project",
        date: new Date(2023, 9, 18).toISOString(),
        weight: 25,
        stakes: "high",
        prepTime: { amount: 1, unit: "weeks" },
        notes: "Creative portfolio submission",
        teacherId: 2
      },
      {
        title: "Math Final: Comprehensive",
        type: "final_exam",
        date: new Date(2023, 11, 15).toISOString(),
        weight: 30,
        stakes: "high",
        prepTime: { amount: 1, unit: "weeks" },
        notes: "Covers all semester material",
        teacherId: 2
      }
    ];
    
    sampleAssessments.forEach(assessment => this.createAssessment(assessment));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { 
      ...insertUser, 
      id,
      email: null,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Assessment methods
  async getAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values());
  }
  
  async getAssessment(id: number): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }
  
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentAssessmentId++;
    const assessment = { 
      ...insertAssessment, 
      id,
      notes: insertAssessment.notes || null,
      teacherId: insertAssessment.teacherId || null
    };
    this.assessments.set(id, assessment);
    return assessment;
  }
  
  async updateAssessment(id: number, updateData: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const assessment = this.assessments.get(id);
    if (!assessment) return undefined;
    
    const updatedAssessment = { ...assessment, ...updateData };
    this.assessments.set(id, updatedAssessment);
    return updatedAssessment;
  }
  
  async deleteAssessment(id: number): Promise<boolean> {
    return this.assessments.delete(id);
  }
  
  // Nervousness prediction methods
  async getNervousnessScores(): Promise<Record<string, number>> {
    const assessments = await this.getAssessments();
    const nervousnessScores: Record<string, number> = {};
    
    // Get unique dates from assessments
    const uniqueDates = Array.from(new Set(assessments.map(a => a.date.toString())));
    
    // Helper to calculate nervousness score for a given date
    const calculateNervousnessForDate = (date: string): number => {
      const dateAssessments = assessments.filter(a => a.date.toString() === date);
      
      // Base factors
      const totalAssessments = dateAssessments.length;
      const highStakeCount = dateAssessments.filter(a => a.stakes === 'high').length;
      const mediumStakeCount = dateAssessments.filter(a => a.stakes === 'medium').length;
      
      // Weights
      const highStakeWeight = 2.0;
      const mediumStakeWeight = 1.2;
      const lowStakeWeight = 0.7;
      
      // Calculate base nervousness (0-10 scale)
      let nervousness = 0;
      
      // Add weighted contribution from each assessment type
      nervousness += highStakeCount * highStakeWeight;
      nervousness += mediumStakeCount * mediumStakeWeight;
      nervousness += (totalAssessments - highStakeCount - mediumStakeCount) * lowStakeWeight;
      
      // Add extra nervousness for each assessment beyond the first
      if (totalAssessments > 1) {
        nervousness += (totalAssessments - 1) * 1.5;
      }
      
      // Cap at 10
      return Math.min(Math.max(nervousness, 0), 10);
    };
    
    // Calculate nervousness for each date
    uniqueDates.forEach(date => {
      nervousnessScores[date] = calculateNervousnessForDate(date);
    });
    
    return nervousnessScores;
  }
  
  async getWeeklyNervousnessData(): Promise<Array<{ week: string; value: number; label: string }>> {
    // Define sample weekly data
    return [
      { week: "Oct 1-7", value: 2.5, label: "Low" },
      { week: "Oct 8-14", value: 4.8, label: "Moderate" },
      { week: "Oct 15-21", value: 8.1, label: "High" },
      { week: "Oct 22-28", value: 5.2, label: "Moderate" },
      { week: "Oct 29-Nov 4", value: 3.0, label: "Low" }
    ];
  }
}

// For production use DatabaseStorage, for development use MemStorage
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
