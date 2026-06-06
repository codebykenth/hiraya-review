---
name: codebase-architecture
description: >
  Enforces the Hiraya Review project's file structure, import conventions, and component placement rules.
  Activate when creating new files, moving existing files, refactoring imports, or reviewing architecture.
  This skill contains a concrete file-by-file migration manifest — follow it exactly.
---

# Hiraya Review — Codebase Architecture

## Golden Rule

> **Every file must live in exactly one of these four locations. There are no exceptions.**

| Location | What goes here | Example |
|---|---|---|
| `components/ui/` | Shadcn primitives only. Never edit manually — CLI-managed. | `button.tsx`, `card.tsx`, `chart.tsx` |
| `components/layout/` | App shell, navigation, page wrappers. Used on every page. | `app-sidebar.tsx`, `page-header.tsx` |
| `components/domain/` | Business components shared across **2+ modules or roles**. | `admin-table.tsx`, `lesson-markdown.tsx` |
| `pages/{role}/{module}/components/` | Components used by **only one module**. | `pages/user/exams/components/live-exam-view.tsx` |

## Directory Structure (Canonical)

```
resources/js/
├── components/
│   ├── ui/                              # Shadcn CLI-managed (DO NOT manually create files here)
│   │
│   ├── layout/                          # App chrome — shell, sidebar, headers, containers
│   │   ├── app-content.tsx
│   │   ├── app-header.tsx
│   │   ├── app-logo.tsx
│   │   ├── app-logo-icon.tsx
│   │   ├── app-shell.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── app-sidebar-header.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── nav-footer.tsx
│   │   ├── nav-main.tsx
│   │   ├── nav-user.tsx
│   │   ├── page-container.tsx
│   │   ├── page-header.tsx
│   │   ├── section.tsx
│   │   ├── section-header.tsx
│   │   └── user-info.tsx
│   │
│   ├── domain/                          # Business components shared across 2+ modules
│   │   ├── admin-table.tsx              # Used by: admin/questions, admin/learn, admin/users
│   │   ├── curation-index-shell.tsx     # Used by: admin/questions, admin/learn, user/learn
│   │   ├── curation-create-shell.tsx    # Used by: admin/questions/create, admin/learn/create
│   │   ├── curation-edit-shell.tsx      # Used by: admin/questions/edit, admin/learn/edit
│   │   ├── drafts-review-shell.tsx      # Used by: admin/questions/drafts, admin/learn/drafts
│   │   ├── lesson-markdown.tsx          # Used by: user/learn, admin/learn
│   │   ├── reviewer-guide-tabs.tsx      # Used by: public/welcome, guide
│   │   ├── explanation-preview.tsx      # Used by: admin/questions, user/exams (review)
│   │   └── scope-settings-modal.tsx     # Used by: user/exams, user/drills
│   │
│   ├── auth/                            # Auth-specific shared components
│   │   ├── consent-checkbox.tsx         # Used by: auth/register, social-consent-modal
│   │   ├── social-consent-modal.tsx     # Used by: auth/login
│   │   ├── password-input.tsx
│   │   ├── turnstile-widget.tsx
│   │   ├── google-icon.tsx
│   │   └── facebook-icon.tsx
│   │
│   └── shared/                          # Truly generic, role-agnostic utilities
│       ├── brand-name.tsx
│       ├── confirm-modal.tsx
│       ├── how-it-works-modal.tsx
│       ├── support-widget.tsx
│       ├── theme-toggle.tsx
│       ├── appearance-tabs.tsx
│       ├── text-link.tsx
│       ├── heading.tsx
│       ├── input-error.tsx
│       ├── alert-error.tsx
│       ├── accept-terms-modal.tsx
│       ├── terms-acceptance-guard.tsx
│       └── traffic-overload-guard.tsx
│
├── pages/
│   ├── user/
│   │   ├── analytics/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-analytics-state.ts
│   │   │   └── components/
│   │   │       ├── analytics-filters.tsx
│   │   │       ├── metrics-grid.tsx
│   │   │       ├── score-history-chart.tsx
│   │   │       ├── subject-mastery-chart.tsx
│   │   │       ├── question-volume-chart.tsx
│   │   │       ├── subcategory-radar-chart.tsx
│   │   │       ├── pacing-trend-chart.tsx
│   │   │       └── attempt-breakdown-chart.tsx
│   │   │
│   │   ├── exams/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-exam-state.ts
│   │   │   └── components/
│   │   │       ├── setup-exam-view.tsx
│   │   │       ├── live-exam-view.tsx
│   │   │       ├── review-exam-view.tsx
│   │   │       ├── scorecard-view.tsx
│   │   │       └── question-palette-panel.tsx  ← MOVE from components/ root
│   │   │
│   │   ├── drills/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       ├── config-view.tsx
│   │   │       └── hub-view.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── index.tsx
│   │   │   ├── ai-analysis.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       ├── user-dashboard-page.tsx
│   │   │       ├── ai-readiness-card.tsx
│   │   │       └── exam-countdown.tsx
│   │   │
│   │   ├── learn/
│   │   │   ├── index.tsx
│   │   │   ├── show.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       ├── modules-grid.tsx
│   │   │       └── search-filter-row.tsx
│   │   │
│   │   ├── history/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       ├── attempts-table.tsx
│   │   │       ├── filters-card.tsx
│   │   │       └── attempt-components.tsx  ← MOVE from components/ root
│   │   │
│   │   └── calendar/
│   │       ├── index.tsx
│   │       ├── types.ts
│   │       ├── hooks/
│   │       └── components/
│   │           ├── calendar-grid.tsx
│   │           ├── schedule-modal.tsx
│   │           ├── bulk-update-modal.tsx
│   │           ├── exam-countdown.tsx
│   │           ├── past-pending-reminder.tsx
│   │           └── time-picker.tsx  ← MOVE from components/ root (only used here)
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── questions/
│   │   │   ├── index.tsx, create.tsx, edit.tsx, show.tsx, drafts.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       ├── ai-generator-panel.tsx
│   │   │       └── manual-entry-form.tsx
│   │   ├── learn/
│   │   │   ├── index.tsx, create.tsx, edit.tsx, drafts.tsx
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │       ├── learn-ai-generator-panel.tsx
│   │   │       ├── learn-manual-entry-form.tsx
│   │   │       └── learn-module-fields.tsx
│   │   ├── legal-content/
│   │   │   └── edit.tsx
│   │   ├── users/
│   │   ├── exam-dates/
│   │   ├── feedbacks/
│   │   ├── announcements/
│   │   ├── system/
│   │   ├── view-management/
│   │   └── syllabus/
│   │
│   ├── auth/          # Flat — no module subfolders needed
│   ├── public/        # Flat
│   └── settings/      # Flat
│
├── hooks/             # Global hooks only (already correct)
├── types/             # Global TS types
└── lib/               # Utilities (utils.ts, etc.)
```

---

## Migration Manifest

This is the exact list of files to move. Each entry shows the current path and the destination.

### Priority 1: Module-specific components trapped at root

These files are imported by only 1-2 pages within a single module. They do NOT belong at the global level.

| Current Path | Move To | Reason |
|---|---|---|
| `components/question-palette-panel.tsx` | `pages/user/exams/components/question-palette-panel.tsx` | Only imported by `live-exam-view.tsx` and `review-exam-view.tsx` (both in exams) |
| `components/attempt-components.tsx` | `pages/user/history/components/attempt-components.tsx` | Only imported by `history/components/attempts-table.tsx` |
| `components/time-picker.tsx` | `pages/user/calendar/components/time-picker.tsx` | Only imported by `calendar/components/schedule-modal.tsx` and `bulk-update-modal.tsx` |
| `components/feature-grid.tsx` | `pages/public/components/feature-grid.tsx` | Only imported by `public/welcome.tsx` |

### Priority 2: Layout components

These are app chrome. Move to `components/layout/`.

| Current Path | Move To |
|---|---|
| `components/app-content.tsx` | `components/layout/app-content.tsx` |
| `components/app-header.tsx` | `components/layout/app-header.tsx` |
| `components/app-logo.tsx` | `components/layout/app-logo.tsx` |
| `components/app-logo-icon.tsx` | `components/layout/app-logo-icon.tsx` |
| `components/app-shell.tsx` | `components/layout/app-shell.tsx` |
| `components/app-sidebar.tsx` | `components/layout/app-sidebar.tsx` |
| `components/app-sidebar-header.tsx` | `components/layout/app-sidebar-header.tsx` |
| `components/breadcrumbs.tsx` | `components/layout/breadcrumbs.tsx` |
| `components/nav-footer.tsx` | `components/layout/nav-footer.tsx` |
| `components/nav-main.tsx` | `components/layout/nav-main.tsx` |
| `components/nav-user.tsx` | `components/layout/nav-user.tsx` |
| `components/page-container.tsx` | `components/layout/page-container.tsx` |
| `components/page-header.tsx` | `components/layout/page-header.tsx` |
| `components/section.tsx` | `components/layout/section.tsx` |
| `components/section-header.tsx` | `components/layout/section-header.tsx` |
| `components/user-info.tsx` | `components/layout/user-info.tsx` |
| `components/site-header.tsx` | `components/layout/site-header.tsx` |
| `components/site-footer.tsx` | `components/layout/site-footer.tsx` |

### Priority 3: Domain components (shared across modules)

These are imported by 2+ modules across different roles. Move to `components/domain/`.

| Current Path | Move To | Used By |
|---|---|---|
| `components/admin-table.tsx` | `components/domain/admin-table.tsx` | admin/questions, admin/learn, admin/users, curation-index-shell |
| `components/curation-index-shell.tsx` | `components/domain/curation-index-shell.tsx` | admin/questions, admin/learn, user/learn |
| `components/curation-create-shell.tsx` | `components/domain/curation-create-shell.tsx` | admin/questions/create, admin/learn/create |
| `components/curation-edit-shell.tsx` | `components/domain/curation-edit-shell.tsx` | admin/questions/edit, admin/learn/edit |
| `components/drafts-review-shell.tsx` | `components/domain/drafts-review-shell.tsx` | admin/questions/drafts, admin/learn/drafts |
| `components/lesson-markdown.tsx` | `components/domain/lesson-markdown.tsx` | user/learn, admin/learn |
| `components/reviewer-guide-tabs.tsx` | `components/domain/reviewer-guide-tabs.tsx` | public/welcome, guide |
| `components/explanation-preview.tsx` | `components/domain/explanation-preview.tsx` | admin/questions (show), user/exams (review) |
| `components/scope-settings-modal.tsx` | `components/domain/scope-settings-modal.tsx` | user/exams, user/drills |

### Priority 4: Auth components

| Current Path | Move To |
|---|---|
| `components/consent-checkbox.tsx` | `components/auth/consent-checkbox.tsx` |
| `components/social-consent-modal.tsx` | `components/auth/social-consent-modal.tsx` |
| `components/password-input.tsx` | `components/auth/password-input.tsx` |
| `components/turnstile-widget.tsx` | `components/auth/turnstile-widget.tsx` |
| `components/google-icon.tsx` | `components/auth/google-icon.tsx` |
| `components/facebook-icon.tsx` | `components/auth/facebook-icon.tsx` |
| `components/manage-passkeys.tsx` | `components/auth/manage-passkeys.tsx` |
| `components/passkey-item.tsx` | `components/auth/passkey-item.tsx` |
| `components/passkey-register.tsx` | `components/auth/passkey-register.tsx` |
| `components/passkey-verify.tsx` | `components/auth/passkey-verify.tsx` |
| `components/manage-two-factor.tsx` | `components/auth/manage-two-factor.tsx` |
| `components/two-factor-setup-modal.tsx` | `components/auth/two-factor-setup-modal.tsx` |
| `components/two-factor-recovery-codes.tsx` | `components/auth/two-factor-recovery-codes.tsx` |
| `components/delete-user.tsx` | `components/auth/delete-user.tsx` |

### Priority 5: Shared generic components

Everything remaining moves to `components/shared/`.

| Current Path | Move To |
|---|---|
| `components/brand-name.tsx` | `components/shared/brand-name.tsx` |
| `components/confirm-modal.tsx` | `components/shared/confirm-modal.tsx` |
| `components/how-it-works-modal.tsx` | `components/shared/how-it-works-modal.tsx` |
| `components/support-widget.tsx` | `components/shared/support-widget.tsx` |
| `components/theme-toggle.tsx` | `components/shared/theme-toggle.tsx` |
| `components/appearance-tabs.tsx` | `components/shared/appearance-tabs.tsx` |
| `components/text-link.tsx` | `components/shared/text-link.tsx` |
| `components/heading.tsx` | `components/shared/heading.tsx` |
| `components/input-error.tsx` | `components/shared/input-error.tsx` |
| `components/alert-error.tsx` | `components/shared/alert-error.tsx` |
| `components/accept-terms-modal.tsx` | `components/shared/accept-terms-modal.tsx` |
| `components/terms-acceptance-guard.tsx` | `components/shared/terms-acceptance-guard.tsx` |
| `components/traffic-overload-guard.tsx` | `components/shared/traffic-overload-guard.tsx` |

---

## Cleanup Manifest

Files to DELETE after migration is complete:

| File | Reason |
|---|---|
| `design-tokens.json` | Unused. Shadcn uses CSS variables from `resources/css/app.css`. This file misleads AI into generating wrong token references. |
| `pages/user/analytics/components/analytics-charts.tsx` | Replaced by individual chart components (subject-mastery, question-volume, etc.) |
| `pages/user/analytics/components/score-trends.tsx` | Replaced by `score-history-chart.tsx` |

---

## Refactoring Procedure

When moving a file, follow these exact steps:

### Step 1: Create destination directory (if needed)
```bash
# Example
mkdir -p resources/js/components/layout
```

### Step 2: Move the file
```bash
git mv resources/js/components/app-sidebar.tsx resources/js/components/layout/app-sidebar.tsx
```

### Step 3: Update ALL imports project-wide
Search and replace the old import path with the new one:
```
# Old
from '@/components/app-sidebar'
# New
from '@/components/layout/app-sidebar'
```

### Step 4: Verify no broken imports
```bash
npx tsc --noEmit
# or
npm run build
```

### Step 5: Commit per-priority-group
Commit after completing each Priority group (1-5) to keep changes reviewable.

---

## Rules for New Files

### Decision Tree: Where Does My New Component Go?

```
Is it a shadcn primitive (Button, Card, Dialog, etc.)?
  → components/ui/  (use `npx shadcn@latest add`)

Is it part of the app shell (sidebar, header, breadcrumb)?
  → components/layout/

Is it used by 2+ modules across different roles?
  → components/domain/

Is it auth-specific (login, register, passkey)?
  → components/auth/

Is it a generic utility (modal wrapper, text link, error display)?
  → components/shared/

Is it used by only ONE module?
  → pages/{role}/{module}/components/
```

### Naming Conventions

| Layer | Convention | Example |
|---|---|---|
| Pages | `index.tsx`, `show.tsx`, `create.tsx`, `edit.tsx` | `pages/user/exams/index.tsx` |
| Components | `kebab-case.tsx` | `live-exam-view.tsx` |
| Hooks | `use-{name}.ts` | `use-exam-state.ts` |
| Types | `types.ts` per module | `pages/user/exams/types.ts` |
| Backend controllers | `PascalCase` mirroring frontend | `App\Http\Controllers\User\ExamController` |

### Module Template

When creating a new module, use this structure:

```
pages/{role}/{module}/
├── index.tsx          # Main page (required)
├── types.ts           # TypeScript interfaces (required if >2 types)
├── hooks/
│   └── use-{module}-state.ts  # State management hook
└── components/
    └── {feature}.tsx  # Module-specific components
```

---

## Backend Architecture (Already Correct — Maintain This)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/           # Admin role controllers
│   │   │   ├── DashboardController.php
│   │   │   ├── QuestionController.php
│   │   │   ├── LearnController.php
│   │   │   ├── UserController.php
│   │   │   ├── ExamDateController.php
│   │   │   ├── SyllabusController.php
│   │   │   ├── AnnouncementController.php
│   │   │   ├── FeedbackController.php
│   │   │   ├── SystemController.php
│   │   │   ├── ViewManagementController.php
│   │   │   └── LegalContentController.php
│   │   ├── User/            # User role controllers
│   │   │   ├── AnalyticsController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── DrillController.php
│   │   │   ├── ExamController.php
│   │   │   ├── ExamHistoryController.php
│   │   │   ├── LearnController.php
│   │   │   ├── StudyScheduleController.php
│   │   │   └── StudySuggestionController.php
│   │   ├── PublicController.php
│   │   ├── AuthController.php
│   │   ├── SitemapController.php
│   │   ├── SupportController.php
│   │   └── Settings/
│   └── Requests/            # Mirror controller structure
│       ├── Admin/
│       │   └── LegalContentRequest.php
│       └── User/
├── Models/                  # Models
│   ├── User.php
│   ├── Question.php
│   ├── Category.php
│   ├── Subcategory.php
│   ├── LearnModule.php
│   ├── ExamAttempt.php
│   ├── ExamDate.php
│   ├── Feedback.php
│   ├── Announcement.php
│   └── LegalContent.php
├── Policies/                # Authorization policies
│   ├── QuestionPolicy.php
│   ├── LearnModulePolicy.php
│   ├── ExamDatePolicy.php
│   ├── FeedbackPolicy.php
│   ├── AnnouncementPolicy.php
│   └── LegalContentPolicy.php
└── ...
```

The backend already follows proper PSR-4 role-based structure. **Do not change it.**

---

## Import Alias Reference

| Alias | Resolves To | Use For |
|---|---|---|
| `@/components/ui/*` | Shadcn primitives | `import { Button } from '@/components/ui/button'` |
| `@/components/layout/*` | App shell components | `import { PageHeader } from '@/components/layout/page-header'` |
| `@/components/domain/*` | Shared business components | `import { AdminTable } from '@/components/domain/admin-table'` |
| `@/components/auth/*` | Auth components | `import { PasswordInput } from '@/components/auth/password-input'` |
| `@/components/shared/*` | Generic shared components | `import { ConfirmModal } from '@/components/shared/confirm-modal'` |
| `@/hooks/*` | Global hooks | `import { useAppearance } from '@/hooks/use-appearance'` |
| Relative `./components/*` | Module components | `import { MetricsGrid } from './components/metrics-grid'` |
| Relative `./hooks/*` | Module hooks | `import { useAnalyticsState } from './hooks/use-analytics-state'` |
