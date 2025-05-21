import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";
import { comparePassword, configureSession, isAuthenticated, hasRole } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session handling
  configureSession(app);

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: validationResult.error.format() 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validationResult.data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create the user (password hashing is handled in the storage implementation)
      const { confirmPassword, ...userData } = validationResult.data;
      const newUser = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: validationResult.error.format() 
        });
      }
      
      const { username, password } = validationResult.data;
      
      // Find the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      const passwordMatches = await comparePassword(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role
        };
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error("Error logging out:", err);
          return res.status(500).json({ message: "Failed to log out" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });
  
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json(req.session.user);
  });
  // Assessments endpoints
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });
  
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assessment ID" });
      }
      
      const assessment = await storage.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error(`Error fetching assessment ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });
  
  app.post("/api/assessments", async (req, res) => {
    try {
      const validationResult = insertAssessmentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid assessment data", 
          errors: validationResult.error.format() 
        });
      }
      
      const newAssessment = await storage.createAssessment(validationResult.data);
      res.status(201).json(newAssessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });
  
  app.patch("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assessment ID" });
      }
      
      // Validate only the fields that are present in the request body
      const partialSchema = insertAssessmentSchema.partial();
      const validationResult = partialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid assessment data", 
          errors: validationResult.error.format() 
        });
      }
      
      const updatedAssessment = await storage.updateAssessment(id, validationResult.data);
      if (!updatedAssessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      console.error(`Error updating assessment ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });
  
  app.delete("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assessment ID" });
      }
      
      const success = await storage.deleteAssessment(id);
      if (!success) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting assessment ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });
  
  // Nervousness prediction endpoints
  app.get("/api/nervousness/daily", async (req, res) => {
    try {
      const nervousnessScores = await storage.getNervousnessScores();
      res.json(nervousnessScores);
    } catch (error) {
      console.error("Error fetching daily nervousness scores:", error);
      res.status(500).json({ message: "Failed to fetch nervousness scores" });
    }
  });
  
  app.get("/api/nervousness/weekly", async (req, res) => {
    try {
      const weeklyNervousnessData = await storage.getWeeklyNervousnessData();
      res.json(weeklyNervousnessData);
    } catch (error) {
      console.error("Error fetching weekly nervousness data:", error);
      res.status(500).json({ message: "Failed to fetch weekly nervousness data" });
    }
  });
  
  // Optimization endpoints
  app.post("/api/optimize", async (req, res) => {
    try {
      // For demo purposes, return a predefined optimization result
      res.json({
        before: 6.8,
        after: 4.2,
        changes: [
          { assessment: "Art Project", from: "2023-10-18", to: "2023-10-25" },
          { assessment: "English Essay", from: "2023-10-17", to: "2023-10-12" },
          { assessment: "Math Quiz", from: "2023-10-08", to: "2023-10-09" }
        ]
      });
    } catch (error) {
      console.error("Error running optimization:", error);
      res.status(500).json({ message: "Failed to run optimization" });
    }
  });
  
  app.post("/api/optimize/apply", async (req, res) => {
    try {
      // In a real implementation, this would apply the optimization changes to the assessments
      // For demo purposes, just return success
      res.status(200).json({ message: "Optimization applied successfully" });
    } catch (error) {
      console.error("Error applying optimization:", error);
      res.status(500).json({ message: "Failed to apply optimization" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
