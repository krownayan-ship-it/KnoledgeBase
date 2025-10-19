# KnowledgeHub - Internal Knowledge Base Platform

## Overview

KnowledgeHub is a professional knowledge base platform designed for managing organizational knowledge through articles, categories, tags, and employee management. The application features a clean, modern interface inspired by Fluent Design with influences from Notion and Linear, prioritizing clarity, information density, and productivity. It provides comprehensive CRUD operations for articles, user authentication, role-based access control, and powerful search and filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Shadcn UI component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system implements Fluent Design principles with Notion/Linear influences
- Comprehensive theming system supporting light and dark modes via ThemeProvider context
- Custom CSS variables for colors, borders, and elevation effects

**State Management Pattern**
- Server state managed through TanStack Query with centralized queryClient
- Authentication state managed via AuthContext with session-based verification
- Theme state managed through ThemeProvider with localStorage persistence
- Form state handled by React Hook Form with Zod schema validation

**Component Organization**
- Route-based code splitting with page components in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/`
- Shared business logic components in `client/src/components/`
- Custom hooks in `client/src/hooks/` for mobile detection and toast notifications

### Backend Architecture

**Runtime & Server Framework**
- Node.js with Express.js for REST API endpoints
- TypeScript with ESM module system for type safety
- Session-based authentication using express-session with in-memory storage (MemoryStore)
- bcryptjs for password hashing and verification

**API Design Pattern**
- RESTful endpoints organized by resource type (auth, articles, categories, tags, employees)
- Middleware-based authentication using requireAuth for protected routes
- Centralized error handling middleware
- Request/response logging for API routes with duration tracking

**Data Access Layer**
- Storage abstraction pattern through IStorage interface in `server/storage.ts`
- Drizzle ORM for type-safe database queries and migrations
- Neon serverless PostgreSQL as the database provider
- WebSocket support for Neon serverless connections

### Database Architecture

**Schema Design**
- Users table with role-based access (admin/employee), username/email authentication
- Articles table with draft/published status, view tracking, and soft timestamps
- Categories table for article organization with color-coding
- Tags table for flexible article classification
- ArticleTags junction table implementing many-to-many relationship between articles and tags

**Data Relationships**
- One-to-many: Users → Articles (author relationship)
- One-to-many: Categories → Articles (categorization)
- Many-to-many: Articles ↔ Tags (via ArticleTags junction table)
- Drizzle relations API for type-safe joins and nested queries

**Database Technology Stack**
- PostgreSQL (via Neon serverless) as the primary database
- Drizzle Kit for schema migrations and database management
- UUID primary keys generated via `gen_random_uuid()` for all tables
- Timestamp fields with automatic `now()` defaults for audit tracking

### Authentication & Authorization

**Session Management**
- Express-session with MemoryStore for session persistence
- HTTP-only cookies for session tokens with 7-day expiration
- Secure flag enabled in production environments
- Session secret configurable via environment variables

**Authorization Pattern**
- Role-based access control (RBAC) with admin and employee roles
- Middleware-based route protection via requireAuth function
- User context provided through AuthContext for client-side authorization
- Protected routes enforced at both API and frontend routing levels

### Validation & Type Safety

**Schema Validation**
- Zod schemas for runtime validation of API inputs
- Drizzle-zod integration for generating insert schemas from database schema
- React Hook Form integration with Zod resolver for client-side form validation
- Shared type definitions between client and server via `@shared/schema`

**TypeScript Configuration**
- Strict mode enabled for maximum type safety
- Path aliases for cleaner imports (@/, @shared/, @assets/)
- Incremental compilation for faster builds
- Shared types ensure API contract consistency

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database provider with WebSocket support
- **Drizzle ORM**: Type-safe ORM for database queries and schema management
- **Express Session**: Session middleware with MemoryStore for development (consider PostgreSQL-backed store for production)

### UI & Component Libraries
- **Shadcn UI**: Component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Frontend build tool with development server
- **TypeScript**: Type system for JavaScript
- **React**: UI library for component-based development
- **Wouter**: Lightweight routing library

### Utilities & Helpers
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference
- **bcryptjs**: Password hashing utility
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Utility for conditional className merging
- **class-variance-authority**: Type-safe variant styling

### Font Resources
- **Google Fonts**: Inter (primary UI font), JetBrains Mono (code blocks), DM Sans, Geist Mono, Architects Daughter, Fira Code