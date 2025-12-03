# Futsal Pitch Booking System

## Overview

A web-based booking platform for a futsal pitch located at 110 Elizabeth Street, Richmond. The system enables customers to submit booking requests through a multi-step form accessible via QR code, while administrators manage and approve/decline requests through a dedicated dashboard. The application follows a request-approval workflow rather than instant booking confirmation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens

**Design System:**
- Uses the "new-york" style variant from shadcn/ui
- Custom color palette with primary green (#151 55% 36%) representing futsal pitch branding
- Secondary navy blue (#217 75% 30%) for contrast
- Responsive design with mobile-first approach (768px breakpoint)
- Consistent spacing using Tailwind's 4px-based scale

**Routing Structure:**
- `/` - Landing page with hero section and QR code entry point
- `/book` - Multi-step booking form (4 steps: Details → Pitch → Schedule → Review)
- `/booking-success` - Confirmation page after submission
- `/admin` - Admin login page
- `/admin/dashboard` - Admin dashboard for managing booking requests

**State Management:**
- React Query for API calls and caching
- React Hook Form with Zod validation for form state
- Local storage for admin session persistence
- Context API for theme management (light/dark mode support)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running on Node.js
- HTTP server for API endpoints and static file serving
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static files

**API Design:**
The backend follows a RESTful API pattern with the following endpoints:

- `POST /api/bookings` - Create new booking request (public)
- `GET /api/bookings` - Retrieve all booking requests (admin-only)
- `GET /api/bookings/:id` - Retrieve specific booking (admin-only)
- `PATCH /api/bookings/:id/status` - Update booking status (admin-only)
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/logout` - Admin session termination

**Authentication:**
- Simple session-based authentication for admin users
- Session ID transmitted via custom `x-session-id` header
- Default admin credentials: username "admin", password "admin123" (created on first run)

**SECURITY NOTES (Production Deployment):**
Before production deployment, the following security improvements MUST be implemented:
1. Password Hashing: Replace plaintext password storage with bcrypt hashing
2. Session Storage: Move from in-memory Map to Redis or database-backed persistent sessions
3. Session Expiry: Implement automatic session expiration (e.g., 24 hours)
4. HTTPS: Ensure all traffic is encrypted
5. Rate Limiting: Add rate limiting on login and booking creation endpoints
6. Cookie-based Auth: Consider moving from header-based to secure HTTP-only cookies

**Data Validation:**
- Zod schemas defined in shared directory for type safety across client/server
- Input validation on both frontend (user feedback) and backend (security)
- Drizzle-Zod integration for automatic schema generation from database models

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- WebSocket-based connection for serverless environments
- Drizzle ORM for type-safe database queries and migrations

**Schema Design:**

*booking_requests table:*
- Stores all customer booking submissions
- Fields: id, name, email, phone, age, reason, estimatedAttendees, pitchType, bookingDate, timeSlots (array), frequency, status, adminNotes, createdAt
- Status enum: pending (default), approved, declined
- Pitch type enum: single_court, full_pitch
- Frequency enum: one_off, weekly, fortnightly, monthly

*admins table:*
- Stores admin user credentials
- Fields: id, username, password
- Passwords stored in plain text (production requires bcrypt hashing)

**Migration Strategy:**
- Migrations stored in `/migrations` directory
- Schema source of truth: `shared/schema.ts`
- Push schema changes using `npm run db:push`

### External Dependencies

**Third-Party UI Libraries:**
- Radix UI primitives (v1.x) for accessible, unstyled components
- Embla Carousel for potential image carousels
- cmdk for command palette functionality
- date-fns for date manipulation and formatting
- react-day-picker for calendar interface

**Development Tools:**
- ESBuild for server bundling in production
- tsx for TypeScript execution in development
- Replit-specific plugins for runtime error overlay and dev banner

**Database & Infrastructure:**
- Neon Database serverless PostgreSQL
- connect-pg-simple for PostgreSQL session storage (configured but not actively used with current in-memory sessions)
- WebSocket support via ws package for Neon connection

**Potential Integrations (Not Yet Implemented):**
- Email service (Nodemailer configured in package.json) for booking confirmations
- Payment processing (Stripe in package.json) for future paid bookings
- Google Generative AI (in package.json) for potential AI features

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string (required, validates on startup)
- `NODE_ENV` - Environment flag (development/production)