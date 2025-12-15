import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingRequestSchema, updateBookingStatusSchema, checkConflictsSchema } from "@shared/schema";
import { z } from "zod";

// Simple session storage (in production, use proper session management)
const sessions: Map<string, { adminId: string; expiresAt: Date }> = new Map();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isAuthenticated(sessionId: string | undefined): boolean {
  if (!sessionId) return false;
  const session = sessions.get(sessionId);
  if (!session) return false;
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return false;
  }
  return true;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Initialize default admin account if not exists
  const existingAdmin = await storage.getAdminByUsername("admin");
  if (!existingAdmin) {
    await storage.createAdmin({
      username: "admin",
      password: "admin123", // In production, hash this password
    });
    console.log("Default admin account created: admin / admin123");
  }

  // ===== BOOKING ROUTES =====
  
  // Create a new booking request
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingRequestSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // In production, send confirmation email here
      console.log(`New booking request from ${booking.name} (${booking.email})`);
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Failed to create booking request" });
      }
    }
  });

  // Get all bookings (admin only)
  app.get("/api/bookings", async (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    
    if (!isAuthenticated(sessionId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get single booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    
    if (!isAuthenticated(sessionId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Update booking status (admin only)
  app.patch("/api/bookings/:id/status", async (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    
    if (!isAuthenticated(sessionId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = updateBookingStatusSchema.parse(req.body);
      const booking = await storage.updateBookingStatus(
        req.params.id,
        validatedData.status,
        validatedData.adminNotes
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // In production, send status update email here
      console.log(`Booking ${booking.id} status updated to ${booking.status}`);
      console.log(`Email would be sent to: ${booking.email}`);

      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: error.errors });
      } else {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Failed to update booking status" });
      }
    }
  });

  // Check for conflicts (public endpoint for validation before submission)
  app.post("/api/bookings/check-conflicts", async (req, res) => {
    try {
      const validatedData = checkConflictsSchema.parse(req.body);
      const { bookingDate, timeSlots, pitchType, excludeBookingId } = validatedData;

      const conflicts = await storage.checkConflicts(bookingDate, timeSlots, pitchType, excludeBookingId);
      res.json(conflicts);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error checking conflicts:", error);
        res.status(500).json({ message: "Failed to check conflicts" });
      }
    }
  });

  // Get availability for a specific date (public endpoint for showing taken slots)
  app.get("/api/availability/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      // Get approved bookings for this date
      const approvedBookings = await storage.getApprovedBookingsByDate(date);
      
      // Get pending bookings too for visibility (user can see slots that may be taken)
      const pendingBookings = await storage.getBookingsByDateAndStatus(date, "pending");
      
      // Extract taken slots with pitch type and status info
      const takenSlots: { timeSlot: string; pitchType: string; status: string }[] = [];
      
      for (const booking of approvedBookings) {
        for (const slot of booking.timeSlots) {
          takenSlots.push({
            timeSlot: slot,
            pitchType: booking.pitchType,
            status: "approved",
          });
        }
      }
      
      // Add pending slots (these are not confirmed but show potential conflicts)
      for (const booking of pendingBookings) {
        for (const slot of booking.timeSlots) {
          takenSlots.push({
            timeSlot: slot,
            pitchType: booking.pitchType,
            status: "pending",
          });
        }
      }

      res.json({
        date,
        takenSlots,
        approvedBookingsCount: approvedBookings.length,
        pendingBookingsCount: pendingBookings.length,
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const admin = await storage.getAdminByUsername(username);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      sessions.set(sessionId, { adminId: admin.id, expiresAt });

      res.json({ 
        message: "Login successful", 
        sessionId,
        admin: { id: admin.id, username: admin.username }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    
    if (sessionId) {
      sessions.delete(sessionId);
    }

    res.json({ message: "Logged out successfully" });
  });

  // Check auth status
  app.get("/api/admin/me", async (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    
    if (!isAuthenticated(sessionId)) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const session = sessions.get(sessionId);
    res.json({ authenticated: true, adminId: session?.adminId });
  });

  return httpServer;
}
