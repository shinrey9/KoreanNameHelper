# Korean Name Pronunciation Tool

## Overview

A web application that converts names from various languages to Korean Hangul with accurate pronunciation guides and audio playback. The app supports multiple source languages including English, Spanish, French, German, and many others, providing users with Korean transliterations along with romanized pronunciations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom Korean-specific color variables
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom aliases and optimizations

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: REST API with structured error handling
- **Request Processing**: Custom middleware for logging and JSON parsing
- **Development**: Hot module replacement via Vite middleware

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations in `./migrations` directory
- **Development Storage**: In-memory storage implementation for development
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple

## Key Components

### Core Services
1. **Transliteration Service** (`server/services/transliteration.ts`)
   - Language detection for auto-detection mode
   - Name conversion to Korean Hangul
   - Character breakdown generation
   - Support for multiple source languages

2. **Text-to-Speech Service** (`server/services/textToSpeech.ts`)
   - Korean pronunciation audio generation
   - Fallback to browser Web Speech API
   - Mock implementation with data URLs for development

3. **Storage Layer** (`server/storage.ts`)
   - Abstracted storage interface
   - In-memory implementation for development
   - PostgreSQL implementation for production

### Frontend Components
1. **LanguageConverter** - Input form with language selection
2. **ConversionResults** - Display Korean name with pronunciation
3. **AudioPlayer** - Korean pronunciation playback with Web Speech API fallback

### Database Schema
- **Users Table**: Basic user authentication (username, password)
- **Conversions Table**: Stores conversion history with breakdown data
- All tables use serial primary keys with timestamp tracking

## Data Flow

1. **Name Conversion Process**:
   - User inputs name and selects source language
   - Frontend validates input and sends to `/api/convert`
   - Backend detects language (if auto-detect) and converts to Korean
   - Results stored in database and returned with breakdown
   - Frontend displays Korean name with pronunciation guide

2. **Audio Generation**:
   - Frontend requests audio for Korean text via `/api/tts`
   - Backend generates mock TTS URL for development
   - Frontend falls back to Web Speech API for actual pronunciation
   - Audio controls allow playback of Korean pronunciation

## External Dependencies

### Production Dependencies
- **Database**: Neon serverless PostgreSQL
- **UI Components**: Radix UI primitives for accessible components
- **Fonts**: Google Fonts (Inter + Noto Sans KR for Korean support)
- **Icons**: Lucide React for consistent iconography

### Development Dependencies
- **Development Server**: Vite with HMR and error overlay
- **Code Quality**: TypeScript strict mode
- **Deployment**: ESBuild for production bundling

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses Vite dev server with Express API
- **Production**: Serves static files from Express with API routes
- **Database**: Requires `DATABASE_URL` environment variable

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Apply database schema changes

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **January 1, 2025**: Simplified Chinese pronunciation handling to use only original country pronunciation
- **January 1, 2025**: Added SEO admin panel at `/admin` route for managing page metadata
- **January 1, 2025**: Implemented AI-powered Korean transliteration using OpenAI GPT-4o
- **June 29, 2025**: Initial project setup

## Admin Features

### SEO Management
- **Admin Panel**: Accessible at `/admin` route
- **API Endpoints**: 
  - `GET /api/admin/seo` - Get current SEO settings
  - `PUT /api/admin/seo` - Update SEO settings
- **Editable Fields**: Page title, meta description, Open Graph title/description, keywords
- **Storage**: In-memory storage with default SEO-optimized content

## Changelog

Changelog:
- June 29, 2025. Initial setup