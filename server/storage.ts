import { 
  bookingRequests, 
  admins,
  type BookingRequest, 
  type InsertBookingRequest,
  type Admin,
  type InsertAdmin
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingBookings: BookingRequest[];
  conflictingSlots: string[];
}

export interface IStorage {
  // Booking operations
  createBooking(booking: InsertBookingRequest): Promise<BookingRequest>;
  getBookings(): Promise<BookingRequest[]>;
  getBookingById(id: string): Promise<BookingRequest | undefined>;
  updateBookingStatus(id: string, status: "pending" | "approved" | "declined", adminNotes?: string): Promise<BookingRequest | undefined>;
  getApprovedBookingsByDate(date: string): Promise<BookingRequest[]>;
  getBookingsByDateAndStatus(date: string, status: string): Promise<BookingRequest[]>;
  checkConflicts(date: string, timeSlots: string[], pitchType: string, excludeBookingId?: string): Promise<ConflictInfo>;
  
  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  async createBooking(booking: InsertBookingRequest): Promise<BookingRequest> {
    const [result] = await db
      .insert(bookingRequests)
      .values(booking)
      .returning();
    return result;
  }

  async getBookings(): Promise<BookingRequest[]> {
    return await db
      .select()
      .from(bookingRequests)
      .orderBy(desc(bookingRequests.createdAt));
  }

  async getBookingById(id: string): Promise<BookingRequest | undefined> {
    const [booking] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, id));
    return booking || undefined;
  }

  async updateBookingStatus(
    id: string, 
    status: "pending" | "approved" | "declined", 
    adminNotes?: string
  ): Promise<BookingRequest | undefined> {
    const [result] = await db
      .update(bookingRequests)
      .set({ status, adminNotes })
      .where(eq(bookingRequests.id, id))
      .returning();
    return result || undefined;
  }

  async getApprovedBookingsByDate(date: string): Promise<BookingRequest[]> {
    return await db
      .select()
      .from(bookingRequests)
      .where(
        and(
          eq(bookingRequests.bookingDate, date),
          eq(bookingRequests.status, "approved")
        )
      );
  }

  async getBookingsByDateAndStatus(date: string, status: string): Promise<BookingRequest[]> {
    return await db
      .select()
      .from(bookingRequests)
      .where(
        and(
          eq(bookingRequests.bookingDate, date),
          eq(bookingRequests.status, status as "pending" | "approved" | "declined")
        )
      );
  }

  async checkConflicts(
    date: string, 
    timeSlots: string[], 
    pitchType: string, 
    excludeBookingId?: string
  ): Promise<ConflictInfo> {
    // Get all approved bookings for this date
    const approvedBookings = await this.getApprovedBookingsByDate(date);
    
    const conflictingBookings: BookingRequest[] = [];
    const conflictingSlots: string[] = [];
    
    for (const booking of approvedBookings) {
      // Skip the booking we're updating (if applicable)
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      
      // Check for overlapping time slots
      const overlappingSlots = timeSlots.filter(slot => booking.timeSlots.includes(slot));
      
      if (overlappingSlots.length > 0) {
        // Full pitch conflicts with everything
        // Single court conflicts with same type or full pitch
        const isConflict = 
          booking.pitchType === "full_pitch" || 
          pitchType === "full_pitch" || 
          booking.pitchType === pitchType;
        
        if (isConflict) {
          conflictingBookings.push(booking);
          conflictingSlots.push(...overlappingSlots.filter(s => !conflictingSlots.includes(s)));
        }
      }
    }
    
    return {
      hasConflict: conflictingBookings.length > 0,
      conflictingBookings,
      conflictingSlots,
    };
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [result] = await db
      .insert(admins)
      .values(admin)
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
