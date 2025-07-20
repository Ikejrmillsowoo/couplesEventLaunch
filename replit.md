# Overview

This is a full-stack web application built with React frontend and Express backend for managing seminar registrations. The application appears to be specifically designed for relationship/couple seminar events, featuring a registration form with both personal and partner information collection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API endpoints

### Development Setup
- **Development Server**: Concurrent frontend (Vite) and backend (Express) servers
- **Hot Module Replacement**: Vite HMR for frontend development
- **Build Process**: Separate builds for client and server with esbuild
- **Type Safety**: Shared TypeScript schemas between frontend and backend

## Key Components

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Registrations Table**: Comprehensive registration data including:
  - Personal information (name, email, phone)
  - Partner information (optional)
  - Relationship details
  - Expectations and newsletter preferences
  - Timestamp tracking

### API Endpoints
- `POST /api/registrations` - Create new registration with validation
- `GET /api/registrations` - Retrieve all registrations (admin access)

### Frontend Pages
- **Home Page**: Primary registration form with comprehensive validation
- **404 Page**: Error handling for undefined routes

### UI Components
- Complete shadcn/ui component library
- Form components with proper validation feedback
- Toast notifications for user feedback
- Responsive design with mobile considerations

## Data Flow

1. **Registration Process**:
   - User fills out registration form on home page
   - Form data validated using Zod schemas (shared between client/server)
   - Client sends POST request to `/api/registrations`
   - Server validates data and checks for existing email
   - Success: Registration stored, confirmation message shown
   - Error: Appropriate error message displayed to user

2. **Form Validation**:
   - Client-side validation using React Hook Form + Zod
   - Server-side validation using same Zod schemas
   - Real-time feedback on form fields
   - Email uniqueness validation

3. **State Management**:
   - Server state managed by TanStack Query
   - Local form state managed by React Hook Form
   - Toast notifications for user feedback

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Database URL**: Environment variable configuration required

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **Replit Integration**: Built-in development environment support
- **Runtime Error Overlay**: Development error handling
- **Cartographer**: Replit-specific development plugin

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Static Serving**: Express serves built frontend in production

### Environment Requirements
- `NODE_ENV`: Environment specification (development/production)
- `DATABASE_URL`: PostgreSQL connection string (required)
- Server serves frontend build in production mode

### Database Migration
- Drizzle migrations stored in `./migrations`
- Push schema changes with `npm run db:push`
- Schema defined in `shared/schema.ts` for type safety

### Production Considerations
- Express serves static files in production
- Vite development server only used in development
- Database connection pooling handled by Neon
- Session storage persisted to PostgreSQL