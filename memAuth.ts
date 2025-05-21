// Simple in-memory authentication for development
import { User } from "@shared/schema";
import bcrypt from 'bcryptjs';

// Store for users
const users: User[] = [];
let nextId = 1;

// Initialize with test users
async function initializeTestUsers() {
  if (users.length === 0) {
    // Create admin user
    const adminPassword = await hashPassword("admin123");
    users.push({
      id: nextId++,
      username: "admin",
      password: adminPassword,
      displayName: "Administrator",
      role: "admin",
      email: null,
      createdAt: new Date().toISOString()
    });

    // Create teacher user
    const teacherPassword = await hashPassword("teacher123");
    users.push({
      id: nextId++,
      username: "teacher",
      password: teacherPassword,
      displayName: "Test Teacher",
      role: "teacher",
      email: null,
      createdAt: new Date().toISOString()
    });

    console.log("Test users initialized");
  }
}

// Hash a password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Find a user by username
function findUserByUsername(username: string): User | undefined {
  return users.find(user => user.username === username);
}

// Find a user by ID
function findUserById(id: number): User | undefined {
  return users.find(user => user.id === id);
}

// Register a new user
async function registerUser(username: string, password: string, displayName: string, role: "admin" | "teacher", email?: string): Promise<User> {
  // Check if username already exists
  if (findUserByUsername(username)) {
    throw new Error("Username already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser: User = {
    id: nextId++,
    username,
    password: hashedPassword,
    displayName,
    role,
    email: email || null,
    createdAt: new Date().toISOString()
  };

  // Add to users
  users.push(newUser);

  return newUser;
}

// Authenticate a user
async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = findUserByUsername(username);
  if (!user) {
    return null;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return null;
  }

  return user;
}

// Initialize on module load
initializeTestUsers();

export {
  findUserByUsername,
  findUserById,
  registerUser,
  authenticateUser,
  hashPassword,
  comparePassword
};