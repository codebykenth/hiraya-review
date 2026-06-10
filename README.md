# Hiraya Review — Civil Service Exam Reviewer

A full-stack, AI-powered study platform for the Philippine Civil Service Examination (CSE). Built with **Laravel 13**, **Inertia.js v3**, **React 19**, and **Tailwind CSS v4**. Features AI-generated questions, learning modules, diagnostic analytics, and personalized study planning.

> **Hiraya** — a Filipino word meaning "the fruit of one's hopes, dreams, and aspirations."

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Security](#security)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)

---

## System Overview

Hiraya Review is a single-page application (SPA) that serves as a comprehensive reviewer for the Philippine Civil Service Exam. It supports two user roles — **Admin** and **User** — with distinct dashboards and capabilities.

### How It Works

```
┌─────────────┐     Inertia.js      ┌──────────────┐     Eloquent     ┌────────────┐
│  React SPA  │ ◄──── SSR/CSR ────► │  Laravel 13  │ ◄─────────────►  │ PostgreSQL │
│  (Frontend) │                     │  (Backend)   │                  │ (Database) │
└─────────────┘                     └──────┬───────┘                  └────────────┘
                                           │
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                        ┌──────────┐ ┌──────────┐ ┌──────────┐
                        │  Gemini  │ │   Groq   │ │  Pusher  │
                        │   API    │ │   API    │ │ WebSocket│
                        └──────────┘ └──────────┘ └──────────┘
```

1. **Users** sign up via email/password or OAuth (Google), then take mock exams or category drills.
2. **Exam attempts** are stored with per-question answers and category score breakdowns.
3. **AI Jobs** run asynchronously via Laravel Queues to generate questions, learning modules, and diagnostic reports.
4. **Real-time events** notify users via Pusher when AI generation completes or fails.
5. **Admins** manage questions, learning modules, users, announcements, and system settings from a dedicated panel.

---

## Architecture

### Monolithic SPA (Inertia.js Pattern)

The application follows the **Inertia.js monolith** pattern — Laravel handles routing, controllers, and validation on the server; React renders the UI on the client. There is no separate API layer; Inertia bridges server and client seamlessly.

### Design Patterns

| Pattern | Implementation |
|---|---|
| **MVC + Inertia** | Controllers return `Inertia::render()` with typed props instead of Blade views |
| **Form Requests** | All input validation uses dedicated `FormRequest` classes (22 total) |
| **Service Layer** | `StudyPlanAnalyzer`, `ExamAttemptFormatter`, `TurnstileService` encapsulate business logic |
| **Job Queue** | AI-heavy operations dispatched as async jobs (`GenerateQuestionsJob`, `GenerateLearnModuleJob`, `GenerateUserAnalysisJob`) |
| **Event Broadcasting** | `AiGenerationCompleted` / `AiGenerationFailed` events broadcast via Pusher for real-time UI updates |
| **Observer Pattern** | Model observers on `Category`, `Subcategory`, `Question`, `LearnModule`, `ExamDate` for cache invalidation |
| **Role-Based Access** | `EnsureUserIsAdmin` middleware + `RolePermission` model for granular view-level access control |
| **Repository Caching** | Aggressive `Cache::remember()` on shared data (permissions, announcements, feedback counts) |

### Request Lifecycle

```
HTTP Request
  → Global Middleware (Appearance, Active Check, Maintenance, CSRF, Cache Headers, Compression)
    → Route Middleware (auth, admin, throttle, turnstile, free.attempt)
      → Form Request Validation
        → Controller Logic
          → Inertia::render() / redirect / JSON
            → React Component (client-side hydration)
```

### Middleware Stack

| Middleware | Purpose |
|---|---|
| `HandleAppearance` | Persists light/dark mode preference |
| `CheckUserActive` | Blocks deactivated accounts |
| `CheckMaintenanceMode` | Custom maintenance mode with admin bypass |
| `HandleInertiaRequests` | Shares global props (auth, permissions, announcements, Pusher config) |
| `SetCacheHeaders` | Content-hashed ETags and Cache-Control for static pages |
| `CompressResponse` | Gzip response compression |
| `TransactionMiddleware` | Wraps mutations in DB transactions |
| `CheckViewAccess` | Role-based page visibility via `RolePermission` table |
| `EnsureUserIsAdmin` | Admin-only route guard |
| `AllowFreeAttempt` | Enables guest users to access a free exam attempt |
| `VerifyTurnstile` | Cloudflare Turnstile bot protection |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| PHP | 8.4 | Runtime |
| Laravel | 13 | Framework |
| Inertia.js (Server) | 3.0 | SPA bridge |
| Laravel Fortify | 1.x | Authentication (email/password, 2FA, passkeys) |
| Laravel Socialite | 5.x | OAuth (Google, Facebook) |
| Laravel Wayfinder | 0.1 | TypeScript route generation |
| Pusher | 7.x | WebSocket broadcasting |
| Pest | 4.x | Testing framework |
| Laravel Pint | 1.x | PHP code formatter |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.7 | Type safety |
| Inertia.js (Client) | 3.0 | SPA bridge |
| Tailwind CSS | 4.0 | Utility-first styling |
| shadcn/ui + Radix UI | Latest | Component library (30 UI primitives) |
| Recharts | 3.8 | Data visualization charts |
| Lucide React | 0.475 | Icon library |
| Sonner | 2.0 | Toast notifications |
| DOMPurify | 3.x | XSS sanitization for AI-generated HTML/SVG |
| React Compiler | 1.0 | Automatic memoization via Babel plugin |

### Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary database |
| Docker (ServerSideUp PHP 8.4 + Nginx) | Container deployment |
| GitHub Actions | CI/CD (lint + test workflows) |
| Cloudflare Turnstile | Bot protection |
| Pusher / Laravel Echo | Real-time event broadcasting |
| Vite 8 | Frontend bundler with SSR support |

### AI Services

| Provider | Models | Use Case |
|---|---|---|
| Google Gemini | `gemini-3.5-flash`, thinking models | Question generation, learn module generation, user analysis |
| Groq | `llama-3.3-70b-versatile` | Fallback AI provider for analysis |

---

## Features

### Public

- **Landing Page** — Marketing page with exam info and platform overview
- **Learn Modules** — Publicly browsable study tutorials (no login required)
- **Free Exam Attempt** — One free mock exam for unauthenticated visitors
- **About / Privacy / Terms / Support** — Static informational pages
- **SEO Sitemap** — Auto-generated `sitemap.xml` from published learn modules
- **User Guide** — Interactive onboarding guide with tabbed content

### User (Authenticated)

- **Dashboard** — At-a-glance stats: total attempts, average score, passing rate, recent activity
- **Mock Exams** — Full-length timed exams (Professional / Subprofessional tracks) with configurable scope
- **Category Drills** — Focused practice sessions filtered by category/subcategory
- **Live Exam Interface** — Question navigation palette, timer, auto-submit, answer review
- **Scorecard** — Immediate results with per-category breakdown and score visualization
- **Exam Review** — Post-exam answer review with explanations and SVG visual rendering
- **Exam History** — Historical attempts list with bulk delete capability
- **Analytics Dashboard** — Performance charts (accuracy trends, category breakdowns) via Recharts
- **AI Diagnostic Report** — Comprehensive AI-generated analysis including:
  - Pass probability prediction
  - Subject mastery ratings (Mastered / Needs Practice / Critical Concern)
  - Predictive metrics (estimated score, days to readiness)
  - Remediation matrix with coaching tips
  - Personalized 7-day study plan with linked learn modules
- **Learn Modules** — Rich markdown tutorials with "Check Your Understanding" quizzes, completion tracking
- **Study Calendar** — Visual study schedule with drag-and-drop, CRUD operations, subcategory linking
- **AI Study Suggestions** — Algorithm-driven study recommendations based on weak areas, auto-applied to calendar
- **Report Issue** — Flag questions or modules for admin review (polymorphic feedback system)
- **Support Widget** — Contextual support prompt with daily-dismiss logic
- **Theme Toggle** — Light/dark mode with system preference detection

### Admin

- **Admin Dashboard** — Platform-wide stats: user count, question count, active modules, recent activity
- **Question Management** — Full CRUD for questions with category/subcategory taxonomy
- **AI Question Generator** — Generate questions via Gemini/Groq with subcategory-specific prompt engineering (supports abstract reasoning with SVG visuals, data interpretation with charts, bilingual Filipino/English)
- **Question Drafts** — Review and publish AI-generated questions with inline editing
- **Learn Module Management** — Full CRUD + AI generation for study tutorials
- **Module Drafts** — Review, edit, and publish AI-generated learning modules
- **User Management** — View, update roles, activate/deactivate, delete users
- **Exam Date Management** — Configure upcoming CSE exam dates
- **Syllabus Viewer** — Reference view of the official CSE category/subcategory schema
- **Announcement System** — Global banner announcements with expiration dates
- **Feedback Management** — Triage user-reported issues with bulk actions and status workflow
- **Legal Content Editor** — Edit Privacy Policy and Terms of Service content
- **View Management** — Toggle page visibility per role via `RolePermission` table
- **System Tools** — Cache clearing, route/view optimization, migration runner, maintenance mode toggle

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ exam_attempts : takes
    users ||--o{ study_schedules : plans
    users ||--o{ feedbacks : submits
    users ||--o{ user_ai_analyses : has
    
    categories ||--o{ subcategories : contains
    categories ||--o{ exam_attempts : scopes
    
    subcategories ||--o{ questions : contains
    subcategories ||--o{ learn_modules : teaches
    subcategories ||--o{ study_schedules : targets
    
    categories ||--o{ learn_modules : groups
    categories ||--o{ track_configs : configures

    users {
        bigint id PK
        string name
        string email UK
        string password
        string role "user | admin"
        string provider "google | facebook | null"
        string provider_id
        boolean is_active
        timestamp terms_accepted_at
        timestamp last_login_at
        timestamp email_verified_at
    }

    categories {
        bigint id PK
        string name
        string slug UK
        boolean is_demographic
        integer sort_order
    }

    subcategories {
        bigint id PK
        bigint category_id FK
        string name
        string slug
        string language "English | Filipino/Tagalog"
    }

    questions {
        bigint id PK
        bigint subcategory_id FK
        string language
        text stem
        json options "array of 5 strings"
        integer correct_option "0-4"
        text explanation
        bigint created_by FK
        string status "draft | active"
    }

    exam_attempts {
        bigint id PK
        bigint user_id FK
        bigint category_id FK "null for mock exams"
        json question_ids
        json answers "map of question_id to selected_option"
        json cat_scores "category breakdown + metadata"
    }

    learn_modules {
        bigint id PK
        bigint category_id FK
        bigint subcategory_id FK
        string title
        string slug UK
        string topic
        text summary
        longtext content "markdown with embedded SVG"
        integer estimated_minutes
        boolean is_published
        bigint created_by FK
        json completed_by_user_ids
    }

    study_schedules {
        bigint id PK
        bigint user_id FK
        date study_date
        time study_time
        string title
        text description
        bigint subcategory_id FK
        boolean is_done
    }

    track_configs {
        bigint id PK
        string track "Professional | Subprofessional"
        bigint category_id FK
        integer item_count
        integer time_limit_secs
    }

    user_ai_analyses {
        bigint id PK
        bigint user_id FK
        bigint last_exam_attempt_id FK
        json analysis_json "full AI diagnostic report"
    }

    announcements {
        bigint id PK
        string title
        text message
        string type
        boolean is_active
        timestamp expires_at
    }

    feedbacks {
        bigint id PK
        bigint user_id FK
        bigint flaggable_id
        string flaggable_type "Question | LearnModule"
        string reason
        text details
        string status "pending | reviewed | resolved"
    }

    role_permissions {
        bigint id PK
        string role
        string view_name
        boolean is_visible
    }

    legal_contents {
        bigint id PK
        string key UK
        longtext content
    }

    exam_dates {
        bigint id PK
        date date
        boolean is_active
    }
```

---

## AI Integration

The platform uses three asynchronous queue jobs for AI-powered content generation, all dispatched via Laravel's queue system and broadcasting results in real-time via Pusher.

### 1. Question Generation (`GenerateQuestionsJob`)

- **Trigger**: Admin clicks "Generate" on the question management page
- **AI Provider**: Gemini (primary) or Groq (configurable per request)
- **Features**:
  - Subcategory-specific prompt engineering (13 distinct subcategory rule sets)
  - Bilingual support (English + Filipino/Tagalog) with language-specific rules
  - SVG visual generation for abstract reasoning (8 puzzle formats: grid matrix, sequence, analogy, rotation, odd-one-out, cube folding, dot placement, mirror reflection)
  - SVG chart generation for data interpretation (bar, line, pie, table, combined)
  - Structured JSON output with Gemini's `responseSchema` for type safety
  - Concurrency lock per subcategory to prevent duplicate generation
  - Questions created in `draft` status for admin review before publishing

### 2. Learn Module Generation (`GenerateLearnModuleJob`)

- **Trigger**: Admin clicks "Generate" on the learn module management page
- **Output Structure**: Title, Summary, Markdown Content (with 5 sections), Estimated Reading Time
- **Content Sections**: Core Concept → Key Rules → Mental Shortcuts → Example Scenario → Check Your Understanding (3 MCQs)
- **Visual Content**: Same SVG generation capabilities as question generation for abstract reasoning and data interpretation topics

### 3. User Analysis Generation (`GenerateUserAnalysisJob`)

- **Trigger**: Automatically dispatched after a user completes an exam attempt
- **Input Data**: All historical attempts, per-category accuracy, per-subtopic breakdown, days until exam
- **Output**: Comprehensive diagnostic JSON including pass probability, subject mastery ratings, predictive metrics, remediation matrix, and a personalized 7-day study plan with subcategory IDs linked to learn modules

### AI Fallback Strategy

```
Primary Model (user-selected: Gemini or Groq)
  → If fails → Log error + broadcast AiGenerationFailed event
```

---

## Security

| Layer | Implementation |
|---|---|
| **Input Validation** | 22 dedicated `FormRequest` classes; no inline validation in controllers |
| **Mass Assignment** | Explicit `#[Fillable]` attributes on all 14 models |
| **Authentication** | Laravel Fortify (email/password + 2FA + passkeys) + Socialite (Google) |
| **Authorization** | Role-based (`admin` middleware) + view-level (`RolePermission` + `CheckViewAccess` middleware) |
| **CSRF** | `VerifyCsrfToken` middleware on all web routes |
| **Bot Protection** | Cloudflare Turnstile verification via `TurnstileService` + `VerifyTurnstile` middleware |
| **Rate Limiting** | Separate throttle groups: `global-views`, `global-mutations`, `ai-generation` |
| **XSS Prevention** | `DOMPurify` for AI-generated HTML/SVG rendering; custom validation rules (`NoHtml`, `NoUrls`, `NoProfanity`, `NoEmojis`) |
| **DB Transactions** | `TransactionMiddleware` wraps all mutation requests |
| **Model Strictness** | Laravel strict mode enabled (prevents lazy loading, silently discarded attributes) |
| **Session Security** | Database-backed sessions with configurable encryption |
| **Account Control** | `CheckUserActive` middleware blocks deactivated accounts; `AuthOrFail` for hard auth checks |

---

## Project Structure

```
cse_reviewer/
├── app/
│   ├── Actions/Fortify/          # Fortify authentication actions
│   ├── Console/Commands/         # Artisan commands
│   ├── Concerns/                 # Shared traits
│   ├── Events/                   # Broadcast events (AI generation, feedback, module published)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/            # 11 admin controllers
│   │   │   ├── User/             # 8 user controllers
│   │   │   ├── Settings/         # Settings controllers
│   │   │   ├── AuthController    # OAuth (Google/Facebook)
│   │   │   ├── PublicController  # Static pages
│   │   │   ├── SitemapController # XML sitemap
│   │   │   └── SupportController # Support form
│   │   ├── Middleware/           # 13 custom middleware classes
│   │   └── Requests/            # 22 form request validators
│   ├── Jobs/                     # 3 AI generation queue jobs
│   ├── Mail/                     # Support email mailable
│   ├── Models/                   # 14 Eloquent models
│   ├── Observers/                # 5 model observers (cache invalidation)
│   ├── Policies/                 # Authorization policies
│   ├── Providers/                # Service providers
│   ├── Rules/                    # 5 custom validation rules
│   └── Services/                 # Business logic (StudyPlanAnalyzer, ExamAttemptFormatter, TurnstileService)
├── resources/js/
│   ├── components/
│   │   ├── ui/                   # 30 shadcn/ui primitives
│   │   ├── domain/               # 11 business-specific components
│   │   ├── layout/               # 19 layout components (sidebar, header, nav, footer)
│   │   ├── shared/               # 13 cross-cutting components (modals, guards, widgets)
│   │   └── auth/                 # Authentication form components
│   ├── hooks/                    # 10 custom React hooks
│   ├── layouts/                  # App, Auth, Settings layout wrappers
│   ├── pages/
│   │   ├── admin/                # 11 admin page modules
│   │   ├── user/                 # 7 user page modules (each with components/, hooks/, types.ts)
│   │   ├── public/               # 5 public pages + components
│   │   ├── auth/                 # Authentication pages
│   │   └── settings/             # User settings pages
│   ├── types/                    # Global TypeScript type definitions
│   ├── services/                 # Frontend service utilities
│   ├── wayfinder/                # Auto-generated route helpers (via Wayfinder)
│   └── data/                     # Static data constants
├── database/
│   └── migrations/               # 24 migration files
├── tests/
│   ├── Feature/                  # 10+ feature tests (Dashboard, Exams, Auth, Study, Support)
│   └── Unit/                     # Unit tests
├── config/                       # 13 config files (app, auth, services, fortify, etc.)
├── routes/
│   ├── web.php                   # 80+ web routes (public, user, admin)
│   ├── settings.php              # Settings routes
│   ├── channels.php              # Broadcast channels
│   └── console.php               # Console routes
├── scripts/                      # Deployment entrypoint script
├── conf/nginx/                   # Nginx server configuration
├── .github/workflows/            # CI: lint.yml + tests.yml
├── Dockerfile                    # Production Docker image (PHP 8.4 FPM + Nginx)
└── vite.config.ts                # Vite 8 + React Compiler + Wayfinder + TailwindCSS
```

---

## Environment Setup

### Prerequisites

- PHP 8.4+
- Composer 2.x
- Node.js 20+ & npm
- PostgreSQL 15+
- A queue worker (database driver works out-of-box)

### Installation

```bash
# Clone the repository
git clone https://github.com/codebykenth/civil-service-exam-reviewer.git
cd civil-service-exam-reviewer

# Run the automated setup script
composer setup
```

The `composer setup` script handles:
1. `composer install` — PHP dependencies
2. `.env` file creation from `.env.example`
3. Application key generation
4. Database migrations
5. `npm install` — Node dependencies
6. `npm run build` — Frontend asset compilation

### Manual Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configure `.env` with your database and service credentials:

```env
# Database
DB_CONNECTION=pgsql
DB_URL=postgresql://user:pass@host:5432/dbname

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT=https://yourdomain.com/auth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT=https://yourdomain.com/auth/facebook/callback

# Real-time Broadcasting
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=ap1

# Bot Protection
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Queue
QUEUE_CONNECTION=database
```

Then run:

```bash
php artisan migrate
npm install
```

---

## Development

```bash
# Start all services concurrently (server + queue + vite)
composer run dev

# Or run individually:
php artisan serve          # Laravel dev server
php artisan queue:listen   # Queue worker
npm run dev                # Vite dev server with HMR
```

### Code Quality

```bash
# PHP formatting (Pint)
vendor/bin/pint --dirty --format agent

# Frontend linting
npm run lint          # ESLint auto-fix
npm run lint:check    # ESLint check only
npm run format        # Prettier format
npm run format:check  # Prettier check only
npm run types:check   # TypeScript type checking

# Full CI check
composer ci:check
```

### Vite Build Optimization

The `vite.config.ts` includes manual chunk splitting for optimal caching:

| Chunk | Contents |
|---|---|
| `vendor-react` | React, ReactDOM, Scheduler |
| `vendor-ui` | Radix UI, CVA, clsx |
| `vendor-inertia` | Inertia.js client |

---

## Deployment

### Docker

```bash
docker build -t hiraya-review .
docker run -p 8080:8080 --env-file .env hiraya-review
```

The `Dockerfile` uses `serversideup/php:8.4-fpm-nginx` and:
1. Installs PHP extensions (`pdo_mysql`, `gd`, `zip`, `bcmath`, `opcache`)
2. Runs `composer install --no-dev --optimize-autoloader`
3. Runs `npm ci && npm run build`
4. Cleans up Node.js to minimize image size
5. Executes the `scripts/00-laravel-deploy.sh` entrypoint (config cache, route cache, view cache, migrations)

### CI/CD

Two GitHub Actions workflows:
- **`lint.yml`** — Runs PHP Pint + ESLint + Prettier + TypeScript checks
- **`tests.yml`** — Runs Pest test suite

---

## Testing

```bash
# Run all tests
php artisan test --compact

# Run specific test
php artisan test --compact --filter=DashboardTest

# Create a new feature test
php artisan make:test --pest MyNewFeatureTest
```

### Test Coverage Areas

| Test File | Coverage |
|---|---|
| `DashboardTest` | Dashboard data loading, stats calculation |
| `ExamAttemptTest` | Exam submission, score calculation, attempt storage |
| `GenerateUserAnalysisJobTest` | AI analysis job dispatch, JSON parsing, model storage |
| `GuestFreeExamTest` | Unauthenticated free exam access |
| `InactiveAccountTest` | Deactivated account blocking |
| `SetCacheHeadersTest` | Cache-Control and ETag header verification |
| `StudyScheduleControllerTest` | CRUD operations for study calendar |
| `StudySuggestionTest` | AI-driven study suggestion algorithm |
| `SupportTest` | Support form submission and validation |
| `Auth/*` | Registration, login, password reset, email verification |
| `Admin/*` | Admin panel operations |
| `Settings/*` | User settings updates |

---

## License

This project is proprietary software. All rights reserved.
