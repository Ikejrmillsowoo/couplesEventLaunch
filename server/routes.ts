import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Registration endpoint
  app.post("/api/registrations", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Check if email already exists
      const existingRegistration = await storage.getRegistrationByEmail(validatedData.email);
      if (existingRegistration) {
        return res.status(400).json({ 
          success: false, 
          message: "This email address is already registered for the seminar." 
        });
      }
      
      // Create the registration
      const registration = await storage.createRegistration(validatedData);
      
      res.status(201).json({ 
        success: true, 
        message: "Registration successful! You'll receive a confirmation email shortly.",
        data: registration 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Please fill in all required fields correctly.",
          errors: error.errors 
        });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ 
        success: false, 
        message: "An error occurred during registration. Please try again." 
      });
    }
  });

  // Get all registrations (for admin purposes)
  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      res.json({ success: true, data: registrations });
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching registrations" 
      });
    }
  });



  const httpServer = createServer(app);

  return httpServer;
}
