import { 
  bookingRequests, 
  admins,
  type BookingRequest, 
  type InsertBookingRequest,
  type Admin,
  type InsertAdmin
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Booking operations
  createBooking(booking: InsertBookingRequest): Promise<BookingRequest>;
  getBookings(): Promise<BookingRequest[]>;
  getBookingById(id: string): Promise<BookingRequest | undefined>;
  updateBookingStatus(id: string, status: "pending" | "approved" | "declined", adminNotes?: string): Promise<BookingRequest | undefined>;
  
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
