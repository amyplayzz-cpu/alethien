import { eq } from 'drizzle-orm';
import { db } from './db';
import {
  assessments, users, Assessment, User,
  InsertAssessment, InsertUser
} from '@shared/schema';
import { hashPassword } from './auth';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await hashPassword(insertUser.password);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  // Assessment methods
  async getAssessments(): Promise<Assessment[]> {
    return db.select().from(assessments);
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async updateAssessment(id: number, updateData: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const [updated] = await db
      .update(assessments)
      .set(updateData)
      .where(eq(assessments.id, id))
      .returning();
    
    return updated;
  }

  async deleteAssessment(id: number): Promise<boolean> {
    const result = await db
      .delete(assessments)
      .where(eq(assessments.id, id));
    
    return result.count > 0;
  }

  // Nervousness prediction methods
  async getNervousnessScores(): Promise<Record<string, number>> {
    const allAssessments = await this.getAssessments();
    const nervousnessScores: Record<string, number> = {};
    
    // Get unique dates from assessments
    const uniqueDates = [...new Set(allAssessments.map(a => a.date.toString()))];
    
    // Helper to calculate nervousness score for a given date
    const calculateNervousnessForDate = (date: string): number => {
      const dateAssessments = allAssessments.filter(a => a.date.toString() === date);
      
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
    const allAssessments = await this.getAssessments();
    
    // Group assessments by week
    const weeklyAssessments = new Map<string, Assessment[]>();
    
    allAssessments.forEach(assessment => {
      const date = new Date(assessment.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Set to Sunday
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Set to Saturday
      
      const weekKey = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}`;
      
      if (!weeklyAssessments.has(weekKey)) {
        weeklyAssessments.set(weekKey, []);
      }
      
      weeklyAssessments.get(weekKey)?.push(assessment);
    });
    
    // Calculate nervousness for each week
    const result: Array<{ week: string; value: number; label: string }> = [];
    
    weeklyAssessments.forEach((assessments, week) => {
      // Calculate factors
      const totalAssessments = assessments.length;
      const highStakeCount = assessments.filter(a => a.stakes === 'high').length;
      const mediumStakeCount = assessments.filter(a => a.stakes === 'medium').length;
      
      // Calculate nervousness (simple algorithm)
      let value = (highStakeCount * 2 + mediumStakeCount * 1.2 + (totalAssessments - highStakeCount - mediumStakeCount) * 0.7);
      
      // Add extra nervousness for clustered assessments
      if (totalAssessments > 1) {
        value += Math.min(totalAssessments - 1, 3) * 1.2;
      }
      
      // Cap at 10
      value = Math.min(Math.max(value, 0), 10);
      
      // Get label
      let label = "Low";
      if (value > 7) label = "High";
      else if (value > 4) label = "Moderate";
      
      result.push({ week, value, label });
    });
    
    return result.sort((a, b) => a.week.localeCompare(b.week));
  }
}