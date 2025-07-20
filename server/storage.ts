import { users, registrations, type User, type InsertUser, type Registration, type InsertRegistration } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getAllRegistrations(): Promise<Registration[]>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private registrations: Map<number, Registration>;
  currentUserId: number;
  currentRegistrationId: number;

  constructor() {
    this.users = new Map();
    this.registrations = new Map();
    this.currentUserId = 1;
    this.currentRegistrationId = 1;
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.currentRegistrationId++;
    const registration: Registration = { 
      ...insertRegistration, 
      id,
      registeredAt: new Date()
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (registration) => registration.email === email,
    );
  }
}

export const storage = new MemStorage();
