# FitQuest - Gamified Fitness Application

## Overview

FitQuest is a gamified fitness application that transforms workout routines into an RPG-style adventure. Users create characters that level up through real fitness activities, battle virtual enemies, and compete on global leaderboards. The application integrates fitness tracking with engaging game mechanics to motivate users to maintain active lifestyles.

## Recent Changes (January 26, 2025)

✓ Added comprehensive action bar with four key features:
  - **Start Workout**: Track active workout sessions with targets and progress
  - **View Quests**: Display daily fitness challenges and rewards  
  - **Upgrade System**: Character stat improvements using earned coins
  - **Item Shop**: Purchase equipment and consumables for stat boosts
✓ Fixed database constraint errors in leaderboard system
✓ Resolved navigation nesting issues and TypeScript compilation errors
✓ Enhanced UI with modal dialogs for feature access

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens for gaming theme
- **Animation**: Framer Motion for smooth transitions and gaming effects
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions stored in PostgreSQL
- **API Design**: RESTful endpoints with comprehensive error handling

### Key Design Decisions
- **Monorepo Structure**: Single repository with shared types between client and server
- **Type Safety**: End-to-end TypeScript for better developer experience
- **Component Architecture**: Modular React components with clear separation of concerns
- **Real-time Updates**: Query invalidation for immediate UI updates after mutations

## Key Components

### Character System
- **Character Creation**: Automatic character generation for new users
- **Leveling System**: XP-based progression tied to fitness achievements
- **Stat System**: Four primary attributes (Strength, Endurance, Agility, Health)
- **Visual Representation**: Animated character avatars with progression indicators

### Battle System
- **2D Battle Arena**: Turn-based combat mechanics
- **Enemy Types**: Various fitness-themed villains (Sloth Dragon, etc.)
- **Battle Actions**: Fitness activities translate to combat moves
- **Real-time Combat**: Immediate feedback and visual effects

### Fitness Integration
- **Activity Tracking**: Calories burned, steps taken, exercise duration
- **Smart Watch Sync**: Mock integration for fitness device data
- **Daily Quests**: Personalized fitness challenges
- **Progress Analytics**: Historical data visualization

### Gamification Features
- **Achievement System**: Unlock badges and rewards for milestones
- **Leaderboards**: Global and period-based rankings
- **Story Mode**: Chapter-based narrative progression
- **XP Rewards**: Experience points for completing fitness activities

## Data Flow

### Authentication Flow
1. User accesses application
2. Replit Auth redirects to OIDC provider
3. Successful authentication creates/updates user record
4. Session stored in PostgreSQL with secure cookies
5. Subsequent requests use session validation

### Fitness Data Flow
1. User completes physical activity
2. Data synced from mock smart watch integration
3. Fitness data stored with daily aggregation
4. Character stats updated based on activity type
5. XP calculated and applied to character progression
6. Quest progress evaluated and updated
7. UI refreshed with new data via query invalidation

### Battle System Flow
1. User initiates battle from current story chapter
2. Battle state created with enemy and player data
3. User selects attack actions (tied to fitness activities)
4. Battle calculations performed server-side
5. Results applied to character progression
6. Story progress updated on victory

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **passport & openid-client**: Authentication with Replit Auth
- **express-session & connect-pg-simple**: Session management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library for gaming effects
- **lucide-react**: Consistent icon set
- **react-hook-form**: Form handling with validation

### Development Dependencies
- **vite**: Fast build tool with HMR support
- **typescript**: Type safety across the stack
- **drizzle-kit**: Database migration and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API proxy
- **Hot Module Replacement**: Instant feedback during development
- **Database Migrations**: Drizzle-kit for schema changes
- **Environment Variables**: Secure configuration management

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: ESBuild bundles Express server
- **Static Assets**: Served from Express in production
- **Database**: Neon serverless PostgreSQL for scalability

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OIDC authentication endpoint

### Scalability Considerations
- **Serverless Database**: Neon provides automatic scaling
- **Stateless Sessions**: PostgreSQL session storage enables horizontal scaling
- **CDN Ready**: Static assets can be served from CDN
- **Query Optimization**: Drizzle ORM with prepared statements