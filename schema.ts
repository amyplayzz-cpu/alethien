import { pgTable, text, serial, integer, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the StakeLevel and TimeUnit types as enums in zod
const stakeLevelEnum = z.enum(["low", "medium", "high"]);
const timeUnitEnum = z.enum(["minutes", "hours", "days", "weeks"]);
const assessmentTypeEnum = z.enum([
  "quiz", 
  "test", 
  "exam", 
  "project", 
  "presentation",
  "essay",
  "lab_report",
  "final_exam"
]);

// Define the PrepTime schema
const prepTimeSchema = z.object({
  amount: z.number().int().positive(),
  unit: timeUnitEnum
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type", { enum: ["quiz", "test", "exam", "project", "presentation", "essay", "lab_report", "final_exam"] }).notNull(),
  date: date("date").notNull(),
  weight: integer("weight").notNull(),
  stakes: text("stakes", { enum: ["low", "medium", "high"] }).notNull(),
  prepTime: jsonb("prep_time").notNull().$type<{ amount: number; unit: string }>(),
  notes: text("notes"),
  teacherId: integer("teacher_id")
});

export const insertAssessmentSchema = createInsertSchema(assessments, {
  type: assessmentTypeEnum,
  stakes: stakeLevelEnum,
  prepTime: prepTimeSchema
}).omit({ id: true });

// Extended assessment schema for the teacher form
export const extendedAssessmentSchema = z.object({
  name: z.string().min(1, "Assessment name is required"),
  description: z.string().optional(),
  type: assessmentTypeEnum,
  gradeLevel: z.string().min(1, "Grade level is required"),
  subject: z.string().min(1, "Subject is required"),
  weight: z.number().int().min(1).max(100),
  prepTime: z.number().int().min(1),
  stakeLevel: stakeLevelEnum,
  flexibility: z.enum(["fixed", "low", "medium", "high"]),
  teacherId: z.number().int()
});

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: date("expire").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["admin", "teacher"] }).notNull(),
  createdAt: date("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(["admin", "teacher"]),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Display name is required"),
  email: z.string().email("Must be a valid email").optional()
}).omit({ id: true, createdAt: true });

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Registration schema (extends login schema)
export const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, "Display name is required"),
  email: z.string().email("Must be a valid email").optional(),
  role: z.enum(["admin", "teacher"]),
  confirmPassword: z.string().min(6, "Confirm password is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
