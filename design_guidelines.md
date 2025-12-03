# Futsal Pitch Booking System - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing from Airbnb's booking flow (clean form progression, date selection) and OpenTable's reservation system (time slot grids, confirmation patterns). This creates an intuitive, trustworthy booking experience optimized for mobile QR code access.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter for UI elements, forms, and navigation
- **Secondary Font**: Roboto for body text and descriptions
- **Hierarchy**:
  - H1: 32px/40px (mobile: 24px/32px) - Bold - Page titles
  - H2: 24px/32px (mobile: 20px/28px) - Semibold - Section headers
  - H3: 18px/28px - Medium - Card titles, form sections
  - Body: 16px/24px - Regular - Forms, descriptions
  - Small: 14px/20px - Regular - Helper text, labels

### B. Layout System
**Tailwind Spacing Units**: Consistently use 4, 6, 8, 12, 16, 20 units (p-4, m-6, gap-8, py-12, px-16, mb-20)
- Form sections: py-12 spacing between major steps
- Card padding: p-6 for mobile, p-8 for desktop
- Grid gaps: gap-6 for card layouts
- Button padding: px-6 py-3

### C. Component Library

**QR Landing Page**:
- Full-screen welcome section with pitch background image (80vh, blurred overlay)
- Centered content: Venue name, address, single CTA button with blurred background
- Brief 2-line description of the booking process below CTA
- No navigation header needed (direct entry point)

**Booking Form (Multi-Step)**:
- Progress indicator at top: 4 steps (Details → Pitch → Schedule → Review)
- Step 1 - User Details: Single column form with floating labels, 2-column grid for phone/age on desktop
- Step 2 - Pitch Selection: Large visual cards showing court layout diagrams (single court vs full pitch)
- Step 3 - Schedule: Calendar widget (Airbnb-style) + Time slot grid with 30-min intervals, toggle for one-off/recurring
- Step 4 - Review: Summary card with edit buttons per section
- Sticky footer with Back/Next/Submit buttons

**Admin Dashboard**:
- Top navigation bar: Logo, search bar, filter dropdowns (status, date range), admin profile
- Main content: 3-column card grid (mobile: single column) displaying booking requests
- Booking request cards include: User name, pitch type badge, date/time, status pill, attendee count, quick action buttons (Approve/Decline)
- Sidebar: Stats overview (pending count, approval rate, calendar mini-view)
- Modal for detailed booking view with full information and email communication history

**Email Templates** (visual consistency):
- Header with pitch green accent bar and venue name
- White content area with clear hierarchy
- Status badges matching dashboard design
- Call-to-action buttons in deep blue

### D. Color Application
- **Primary Green (#2E8B57)**: CTA buttons, selected states, approval status, active time slots
- **Deep Blue (#1E3A8A)**: Secondary buttons, links, progress indicator, admin nav
- **Light Grey (#F8FAFC)**: Page backgrounds, card hover states
- **Dark Grey (#1F2937)**: All text content, form labels
- **Success Green (#10B981)**: Approved status badges, success messages
- **Amber (#F59E0B)**: Pending status badges, warning alerts

### E. Interaction Patterns
- Form inputs: Border highlight transitions on focus (green accent)
- Time slots: Toggle selection with subtle scale animation
- Cards: Slight elevation on hover (shadow-md to shadow-lg)
- Buttons: Implement standard hover/active states (no custom treatments on blurred backgrounds)
- Calendar: Highlight today, disable past dates, show selected range
- Status changes: Toast notifications appearing top-right

### F. Images
**Hero Image**: Full-width background on QR landing page showing the futsal pitch from an aerial/attractive angle - professionally captured, bright, inviting
**Pitch Diagrams**: Simple illustrated SVGs for court selection cards showing layout dimensions
**No additional decorative images needed** - focus on functional clarity

### G. Mobile Optimization
- Single column layouts throughout
- Bottom sheet modals for filters and detailed views
- Enlarged tap targets (minimum 44px height)
- Sticky form navigation
- Collapsible admin sidebar
- Date picker optimized for touch (larger calendar cells)

### H. Accessibility
- High contrast text (WCAG AA compliant)
- Form labels always visible
- Keyboard navigation support for all interactive elements
- Focus indicators on all clickable items
- Screen reader-friendly status updates

## Key Differentiators
- **Pitch-First Identity**: Green accents throughout reinforce the futsal venue brand
- **Instant Access**: QR code eliminates login friction for casual bookings
- **Visual Scheduling**: Grid-based time selection (like OpenTable) makes availability instantly clear
- **Trust Through Clarity**: Every step shows exactly what's happening next, no surprises