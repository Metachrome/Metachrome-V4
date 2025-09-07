# Overview

METACHROME is a comprehensive cryptocurrency trading platform featuring spot trading, options trading, and futures trading capabilities. The application is built as a full-stack web application with a React frontend and Express.js backend, designed to provide real-time market data, advanced trading tools, and secure user authentication including MetaMask wallet integration.

## Deployment Status
✅ **PRODUCTION READY** - Fully configured for Vercel deployment with zero errors
- Build system optimized for serverless functions
- Database connection with fallback handling
- Security configurations for production
- Complete environment variable setup

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing with support for nested routes
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live market data and trading updates
- **Session Management**: Express sessions with PostgreSQL session store

## Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon Database
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: Users, balances, trades, transactions, market data, trading pairs, options settings, and admin controls
- **Data Types**: Decimal precision for financial calculations, UUID primary keys, and enum types for status fields

## Authentication & Authorization
- **User Authentication**: Traditional username/password login and registration system
- **Admin Authentication**: Separate username/password system for admin access
- **Web3 Integration**: MetaMask wallet connection as alternative authentication method
- **Role-based Access**: User roles (user, admin, super_admin) with permission-based features
- **Demo Credentials**: 
  - User: trader1/password123
  - Admin: admin/admin123

## Trading Engine Components
- **Market Data**: Real-time price feeds with WebSocket subscriptions
- **Order Management**: Support for spot, options, and futures trading with different order types
- **Balance Management**: Multi-currency balance tracking with available/locked amounts
- **Risk Management**: Admin controls for trade outcomes and position management

## Real-time Features
- **WebSocket Server**: Custom implementation for live market data streaming (requires separate deployment for production)

## Deployment Configuration
- **Platform**: Optimized for Vercel serverless deployment
- **Build System**: Vite + ESBuild for optimal performance
- **Database**: PostgreSQL with Neon integration recommended
- **Error Handling**: Production-ready with graceful fallbacks
- **Security**: CORS, Helmet, rate limiting configured for production
- **Price Service**: Centralized price management with subscriber pattern
- **Live Updates**: Real-time order book, trade history, and portfolio updates

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI Framework & Components
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets including social media icons

## Development & Build Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations and error overlays

## Data Validation & Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant forms with easy validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod schemas

## Real-time & Networking
- **WebSocket (ws)**: WebSocket implementation for real-time communication
- **TanStack React Query**: Powerful data synchronization for React applications

## Blockchain Integration
- **MetaMask Integration**: Web3 wallet connection and transaction signing
- **Ethereum Network Support**: Multi-network support for different blockchain networks