import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "approved", "declined"]);
export const pitchTypeEnum = pgEnum("pitch_type", ["single_court", "full_pitch"]);
export const bookingFrequencyEnum = pgEnum("booking_frequency", ["one_off", "weekly", "fortnightly", "monthly"]);

export const bookingRequests = pgTable("booking_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  reason: text("reason").notNull(),
  estimatedAttendees: integer("estimated_attendees").notNull(),
  pitchType: pitchTypeEnum("pitch_type").notNull(),
  bookingDate: text("booking_date").notNull(),
  timeSlots: text("time_slots").array().notNull(),
  frequency: bookingFrequencyEnum("frequency").notNull().default("one_off"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertBookingRequestSchema = createInsertSchema(bookingRequests).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  age: z.number().min(16, "Must be at least 16 years old").max(100, "Please enter a valid age"),
  reason: z.string().min(10, "Please provide more details about your booking reason"),
  estimatedAttendees: z.number().min(1, "At least 1 attendee required").max(50, "Maximum 50 attendees"),
  pitchType: z.enum(["single_court", "full_pitch"]),
  bookingDate: z.string().min(1, "Please select a date"),
  timeSlots: z.array(z.string()).min(1, "Please select at least one time slot"),
  frequency: z.enum(["one_off", "weekly", "fortnightly", "monthly"]),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "approved", "declined"]),
  adminNotes: z.string().optional(),
});

export const checkConflictsSchema = z.object({
  bookingDate: z.string().min(1, "Please select a date"),
  timeSlots: z.array(z.string()).min(1, "Please select at least one time slot"),
  pitchType: z.enum(["single_court", "full_pitch"]),
  excludeBookingId: z.string().optional(),
});

export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type UpdateBookingStatus = z.infer<typeof updateBookingStatusSchema>;

// Users table (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
