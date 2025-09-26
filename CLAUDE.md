# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the BibiGin Admin project.

## Project Overview

BibiGin Admin is the administrative dashboard for managing the BibiGin premium gin e-commerce platform. It provides comprehensive tools for managing products, orders, customers, and analytics while maintaining the sophisticated BibiGin brand identity.

## Essential Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Production build with Turbopack  
npm run start        # Start production server
npm run lint         # Run ESLint

# Development server runs on http://localhost:3002 (or next available port)
```

## Architecture & Technology Stack

**Framework**: Next.js 15 with App Router and Turbopack
**Styling**: Tailwind CSS v4 (inline theme configuration in globals.css)
**UI Components**: shadcn/ui with "new-york" style variant
**Animations**: Framer Motion for premium interactions
**Typography**: Playfair Display (luxury font) + Geist Sans + Geist Mono
**Icons**: Lucide React
**Database**: Firebase Firestore (to be configured)
**Payments**: Stripe API integration (to be configured)
**Charts**: Recharts for analytics dashboards
**Tables**: TanStack Table for data management

## Design System - BibiGin Brand Identity

### Color Palette
- **Navy Blue**: `oklch(0.18 0.02 265)` (#1B2951) - Primary brand color
- **Gold**: `oklch(0.73 0.15 85)` (#D4AF37) - Accent color for highlights
- **Cream**: `oklch(0.98 0.005 75)` - Background and light text
- **White**: `oklch(1 0 0)` - Card backgrounds for contrast

### Theme Configuration
- **Single Theme**: NO dark/light mode toggle - unified BibiGin experience
- **Background**: Cream (#FBF9F4) for warmth and luxury feel
- **Cards**: Pure white for content clarity and hierarchy
- **Primary Actions**: Navy blue buttons with cream text
- **Accent Elements**: Gold for highlights, focus states, and important elements

### Typography Hierarchy
- **Headings**: Playfair Display (luxury serif)
- **Body Text**: Geist Sans (clean, readable)
- **Code/Data**: Geist Mono (technical content)

## Code Architecture

### Component Structure
- **`/components/admin/`** - Admin-specific components
- **`/components/ui/`** - shadcn/ui base components (Button, Card, Table, etc.)
- **`/app/`** - Next.js App Router pages

### Key Admin Components
- **AdminLayout**: Main layout wrapper with sidebar and header
- **AdminSidebar**: Navigation sidebar with BibiGin branding
- **AdminHeader**: Top header with search, notifications, user menu

### Page Structure
- **`/`** (Dashboard): Main admin overview with KPIs and quick actions
- **`/login`** - Admin authentication with BibiGin styling
- **`/products`** - Product catalog management with CRUD operations
- **`/orders`** - Order management and fulfillment (to be implemented)
- **`/customers`** - Customer database and profiles (to be implemented)
- **`/analytics`** - Sales reports and performance metrics (to be implemented)

### State Management
Currently using React state and props. Ready for integration with:
- Firebase Authentication for admin login
- Firestore for real-time data management  
- Stripe webhooks for order synchronization

## UI/UX Patterns

### Layout Principles
- **Sidebar Navigation**: Fixed left sidebar with collapsible mobile menu
- **Header Actions**: Search, notifications, and user profile access
- **Card-Based Content**: White cards on cream background for content organization
- **Consistent Spacing**: 6-unit spacing scale for visual rhythm

### Interactive Elements
- **Buttons**: Navy primary, gold accent, ghost variants
- **Forms**: Clean inputs with gold focus states
- **Tables**: Alternating rows, hover states, action buttons
- **Status Indicators**: Color-coded badges for product/order states

### Brand Consistency
- **Logo Treatment**: Navy circle with "B" initial + "BibiGin" wordmark
- **Icons**: Lucide React icons in navy/gold color scheme
- **Imagery**: Product placeholder with bottle emoji (🍾)

## Development Guidelines

### Component Development
1. Use TypeScript for all components and pages
2. Follow shadcn/ui component patterns and props
3. Maintain BibiGin color scheme with CSS custom properties
4. Include proper accessibility attributes (ARIA labels, semantic HTML)
5. Implement responsive design (mobile-first approach)

### Styling Standards
- Use Tailwind utility classes with BibiGin theme variables
- Custom utilities available: `.text-navy`, `.bg-gold`, `.font-playfair`
- Gradient utilities: `.bg-navy-gradient`, `.bg-cosmic-gradient`
- Button utilities: `.btn-primary`, `.btn-gold`

### Data Integration (Future)
- **Firebase Config**: `/lib/firebase.ts` for Firestore and Auth setup
- **Stripe Config**: `/lib/stripe.ts` for payment processing
- **Type Definitions**: Define interfaces for Product, Order, Customer entities

## Feature Roadmap

### Phase 1 - Core Admin (Current)
- ✅ Admin layout with sidebar navigation
- ✅ Dashboard with KPI cards and quick actions
- ✅ Login page with form validation
- ✅ Products page with table and filters
- ✅ BibiGin brand theme implementation

### Phase 2 - Data Integration
- Firebase Authentication setup
- Firestore database configuration
- Product CRUD operations
- Real-time data synchronization

### Phase 3 - E-commerce Features
- Order management system
- Customer profiles and history
- Inventory tracking and alerts
- Stripe integration and webhooks

### Phase 4 - Analytics & Reports
- Sales dashboards with Recharts
- Performance metrics and KPIs  
- Export functionality (PDF/Excel)
- Advanced filtering and search

## Security Considerations

- Admin-only access with Firebase Authentication
- Secure API routes with proper validation
- Environment variables for sensitive configuration
- Row-level security with Firestore rules
- HTTPS enforcement in production

When working on this project, maintain the luxury BibiGin brand identity while ensuring admin functionality is intuitive and efficient for daily e-commerce management tasks.