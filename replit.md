# Alethien - Smart Assessment Scheduling Platform

## Overview

Alethien is an AI-driven assessment scheduling platform designed to help academic administrators and teachers plan assessment schedules to minimize student nervousness and optimize academic experiences. The application enables users to create, manage, and optimize assessment schedules through an intelligent system that analyzes various factors contributing to student anxiety.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, using Vite as the build tool. The UI is designed with a component-based architecture using Radix UI primitives along with the shadcn/ui component system. The application employs a clean, responsive design with robust theming support via Tailwind CSS.

Key frontend features:
- React for UI rendering
- TanStack Query for data fetching and state management
- Tailwind CSS for styling
- Radix UI primitives and shadcn/ui for UI components
- Wouter for lightweight routing

### Backend

The backend is a Node.js Express server that provides RESTful API endpoints. It handles data operations and serves the frontend static files in production. The server is structured to handle API requests, session management, and business logic.

Key backend features:
- Express.js for API routing
- Drizzle ORM for database operations
- Zod for validation
- TypeScript for type safety

### Database

The application uses Drizzle ORM with a relational database (intended for PostgreSQL). The schema design focuses on assessments and users, with proper relationships between entities.

## Key Components

### Frontend Components

1. **Pages**: 
   - Home (login/role selection)
   - Admin dashboard (calendar view, nervousness analytics)
   - Teacher dashboard (assessment management)

2. **UI Components**: 
   - Calendar view for visualizing assessment schedules
   - Nervousness gauges and analytics charts
   - Assessment forms and lists
   - Navigation components (header, sidebar)

3. **Core Logic**:
   - AI Scheduler for optimizing assessment schedules
   - Nervousness Predictor for estimating student anxiety levels

### Backend Components

1. **API Routes**:
   - Assessment CRUD operations
   - User authentication
   - Analytics and optimization endpoints

2. **Data Storage**:
   - Schema definitions with Drizzle ORM
   - Memory-based storage for development (will be replaced with PostgreSQL)

3. **Business Logic**:
   - Assessment scheduling algorithms
   - Nervousness prediction models

## Data Flow

1. **User Authentication**:
   - Users select a role (admin or teacher)
   - Authentication is handled through API endpoints
   - User info is stored in local state and persisted in localStorage

2. **Assessment Management**:
   - Teachers create assessments through forms
   - Data is validated with Zod schemas
   - Requests are sent to the server via API endpoints
   - Server processes and stores assessment data
   - UI is updated with TanStack Query

3. **Schedule Optimization**:
   - Admin initiates optimization process
   - Server applies AI algorithms to optimize schedules
   - Results are returned to the frontend
   - Admin can review and apply changes

4. **Analytics**:
   - Backend calculates nervousness scores based on assessment data
   - Frontend displays these scores in charts and gauges
   - Weekly and daily nervousness data is tracked and visualized

## External Dependencies

### Frontend
- React ecosystem (react, react-dom)
- TanStack Query for data fetching
- Radix UI for accessible UI primitives
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form for form handling
- Zod for schema validation
- Recharts (implied from usage) for data visualization

### Backend
- Express.js for server and API
- Drizzle ORM for database operations
- Zod for validation
- TypeScript for type safety

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**:
   - Vite builds the frontend
   - esbuild bundles the server code
   - Output is stored in the `dist` directory

2. **Runtime Configuration**:
   - Production mode uses bundled assets
   - Environment variables control database connections

3. **Database**:
   - During development, the application uses in-memory storage
   - For production, it's configured to connect to a PostgreSQL database
   - Database URL is provided via environment variables

## Development Workflow

1. **Setup**:
   - Install dependencies with `npm install`
   - Configure environment variables (especially DATABASE_URL)

2. **Development**:
   - Run the dev server with `npm run dev`
   - Frontend changes are hot-reloaded
   - Backend changes require server restart

3. **Database**:
   - Schema is defined in `shared/schema.ts`
   - Changes can be pushed with `npm run db:push`

4. **Build and Deploy**:
   - Build with `npm run build`
   - Start production server with `npm start`

## Future Improvements

1. Implementation of full user authentication with proper password hashing
2. Enhanced AI models for more accurate nervousness prediction
3. Additional assessment types and customization options
4. Integration with school management systems
5. Mobile app development

## Notes for Contributors

- Follow the established component structure when adding new features
- Use the shadcn/ui pattern for new UI components
- Ensure all forms have proper validation with Zod
- Write server endpoints following the established pattern in routes.ts
- Update the shared schema when adding new data structures