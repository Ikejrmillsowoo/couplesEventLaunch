import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";

const MemoryStoreSession = MemoryStore(session);

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  } else {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'couples-journey-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple hardcoded credentials (you can make this more secure later)
      if (username === "admin" && password === "couples2025") {
        (req.session as any).isAuthenticated = true;
        (req.session as any).username = username;
        
        res.json({ 
          success: true, 
          message: "Login successful" 
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Login error occurred" 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Could not log out" 
        });
      }
      res.json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });

  // Check auth status
  app.get("/api/auth/status", (req, res) => {
    const isAuthenticated = req.session && (req.session as any).isAuthenticated;
    res.json({ 
      success: true, 
      isAuthenticated: !!isAuthenticated,
      username: isAuthenticated ? (req.session as any).username : null
    });
  });
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

  // Get all registrations (for admin purposes) - protected route
  app.get("/api/registrations", requireAuth, async (req, res) => {
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

  // Export registrations as CSV - protected route
  app.get("/api/registrations/export", requireAuth, async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      
      // CSV headers
      const headers = [
        'ID',
        'First Name',
        'Last Name', 
        'Email',
        'Phone',
        'Expectations',
        'Newsletter Opt-in',
        'Registration Date'
      ];
      
      // Convert data to CSV format
      const csvRows = [headers.join(',')];
      
      registrations.forEach(registration => {
        const row = [
          registration.id,
          `"${registration.firstName || ''}"`,
          `"${registration.lastName || ''}"`,
          `"${registration.email || ''}"`,
          `"${registration.phone || ''}"`,
          `"${(registration.expectations || '').replace(/"/g, '""')}"`,
          registration.newsletterOptIn ? 'Yes' : 'No',
          registration.registeredAt ? new Date(registration.registeredAt).toLocaleString() : ''
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Set headers for file download
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="seminar-registrations-${timestamp}.csv"`);
      res.send(csvContent);
      
    } catch (error) {
      console.error("Error exporting registrations:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error exporting registrations" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
