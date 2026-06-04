---
name: unique-ui-designer
description: >
  Enforces the Hiraya Review brand identity and prevents generic AI-generated UI patterns.
  Activate when building, refactoring, or reviewing any frontend component.
---

# Hiraya Review — UI Design System

## Brand Identity

- **App Name:** Hiraya Review
- **Theme:** Deep navy/slate dark mode with luminous accent colors
- **Personality:** Professional study platform — clean, focused, data-rich
- **Color system:** Exclusively use Shadcn CSS variables defined in `resources/css/app.css`

## Color Rules

### Correct Usage

```tsx
// ✅ Chart colors — raw CSS variables, NO hsl() wrapper
color: 'var(--chart-1)'
fill: 'var(--chart-3)'
stroke: 'var(--color-score)'

// ✅ Semantic tokens for UI elements
className="text-muted-foreground"
className="bg-background"
className="border-border"

// ✅ Inline styles referencing CSS vars
tick={{ fill: 'var(--muted-foreground)' }}
stroke="var(--border)"
```

### Incorrect Usage

```tsx
// ❌ hsl() wrapper — our vars are already hex, NOT HSL channels
color: 'hsl(var(--chart-1))'           // BROKEN — renders black
tick={{ fill: 'hsl(var(--muted-foreground))' }}  // BROKEN

// ❌ Raw hex/color values — not theme-aware
className="text-blue-500"
fill="#3b82f6"
stroke="rgb(59, 130, 246)"

// ❌ Hardcoded dark mode colors
className="text-slate-400"             // Use text-muted-foreground instead
className="bg-slate-900"              // Use bg-background instead
```

## Component Rules

### Cards & Containers
- Use Shadcn `Card` for containers but vary internals. Not every card needs full `CardHeader + CardTitle + CardContent` composition.
- For lightweight data cards, use: `<Card className="p-5 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">`
- Use borders for visual depth, NOT `shadow-sm` or `shadow-md`.

### Charts
- Always use `ChartContainer` + `ChartTooltipContent` from `@/components/ui/chart`
- Never build custom SVG math for data visualization
- Never use raw `<svg>` for charts — use Recharts via Shadcn wrappers

### Typography
- Card titles: `text-lg font-black tracking-tight`
- Card subtitles: `text-xs font-semibold text-slate-500 dark:text-slate-400`
- Small labels: `text-sm font-semibold`
- Never jump more than 2 Tailwind size steps between adjacent text elements

### Spacing
- Use `gap-*` with flex/grid, never `space-y-*` or `space-x-*`
- Standard section gap: `gap-6`
- Standard card padding: `p-5`

### Icons
- Use Lucide icons from `lucide-react`
- Size with `className="size-4"` or `size-5`, never `w-4 h-4`

### Loading States
- Use `<Skeleton />` from shadcn
- Never build custom `animate-pulse` divs

## Anti-Patterns ("AI Slop" Filters)

| Pattern | Why It's Wrong | Do This Instead |
|---|---|---|
| `hsl(var(--css-variable))` | Our theme uses hex values, not HSL channels | `var(--css-variable)` |
| `shadow-sm`, `shadow-md` everywhere | Generic depth look | `border border-slate-200/80 dark:border-slate-800` |
| `rounded-full` on everything | Over-radiused look | Use theme border-radius |
| Raw `<svg>` chart code | Unmaintainable, inconsistent | Recharts via `ChartContainer` |
| Custom modal/dialog divs | Accessibility gaps | Shadcn `Dialog` or `Sheet` |
| `text-blue-500`, `bg-red-100` | Not theme-aware | Semantic tokens like `text-primary`, `bg-destructive` |
| `space-y-4` | Inconsistent spacing model | `flex flex-col gap-4` |
| `w-4 h-4` on icons | Redundant | `size-4` |
| Duplicated UI patterns | Maintenance burden | Extract to component, reuse |

## Verification Checklist

Before finishing any UI work, verify:

1. [ ] No `hsl()` wrappers around CSS variables
2. [ ] No raw hex/rgb colors — all through CSS vars or Tailwind semantic classes
3. [ ] Charts use `ChartContainer` from `@/components/ui/chart`
4. [ ] Spacing uses `gap-*`, not `space-*`
5. [ ] Icons use `size-*`, not `w-* h-*`
6. [ ] Dark mode renders correctly (app defaults to dark)
7. [ ] No custom modals — uses shadcn `Dialog` or `Sheet`
8. [ ] No duplicate components — checked for existing ones first
