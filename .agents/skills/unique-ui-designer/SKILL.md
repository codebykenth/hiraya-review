---
name: unique-ui-designer
description: >
  Enforces the Hiraya Review brand identity and prevents generic AI-generated UI patterns.
  Activate when building, refactoring, or reviewing any frontend component to ensure premium design.
---

# Hiraya Review — Premium UI Design System & Refactoring Guide

## Golden Rule

> **Never settle for "AI Slop". The UI must feel premium, intentional, human-crafted, and highly engaging.**

## Brand Identity & Aesthetics

- **App Name:** Hiraya Review
- **Theme:** Deep navy/slate dark mode with luminous accent colors. Vibrant, high-contrast, and clean in light mode.
- **Personality:** Professional, modern, engaging study platform.
- **Aesthetics:** Glassmorphism, subtle micro-animations, rich typography, depth through borders and strategic glows (not just basic drop shadows).

## The "AI Slop" vs. Premium Design

| Element | Generic AI Pattern (Avoid) | Premium Hiraya Pattern (Use) |
|---|---|---|
| **Colors** | Standard Tailwind (`bg-blue-500`, `text-gray-500`) | Theme variables, vibrant accents, glassmorphism (`bg-primary/90 backdrop-blur-md`) |
| **Borders** | Everything is `rounded-md`, harsh 1px solid borders | Variable radiuses (`rounded-xl`, `rounded-2xl`), subtle borders (`border-white/10`, `border-slate-800/50`) |
| **Depth** | Default `shadow-sm` or `shadow-md` everywhere | Layered backgrounds, glowing accents, soft inset shadows, or pure flat with crisp borders |
| **Spacing** | Inconsistent `mt-4`, `mb-2`, `p-4` | Consistent `gap-6` in flex/grid, generous padding (`p-6`, `p-8`) |
| **Typography**| Default font weights, low contrast | `font-black` tracking-tight for titles, `font-medium` for body, high contrast. |
| **Interactions**| Instant state changes, no hover states | Smooth transitions (`transition-all duration-300`), subtle scale/translate on hover (`hover:-translate-y-1`) |

## Priority-Based UI Refactoring Manifest

When revamping a page or component, follow these priorities to upgrade the UI from basic to premium:

### Priority 1: Typography & Hierarchy Revamp
1. **Headings:** Upgrade from basic `text-xl font-bold` to `text-2xl sm:text-3xl font-black tracking-tight`. Use gradients for emphasis where appropriate (e.g., `bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400`).
2. **Subtitles:** Make them subtle but legible. Use `text-sm font-medium text-slate-500 dark:text-slate-400`.
3. **Data/Stats:** Use large, bold numbers (`text-4xl font-black`) paired with small, uppercase, widely tracked labels (`text-xs font-bold uppercase tracking-wider`).
4. **Body Text & Readability:** Avoid excessively small fonts for multi-line content. Upgrade tiny `text-xs` paragraphs to `text-sm leading-relaxed`, and upgrade basic `text-sm` body copy to `text-base leading-relaxed` to ensure effortless reading.

### Priority 2: Card & Container Modernization
1. **Move away from generic Shadcn defaults:** The default Shadcn `Card` is just a starting point. Enhance it.
2. **Glassmorphism:** For overlays or prominent cards, use translucent backgrounds with blur: `bg-white/70 backdrop-blur-xl border border-slate-200/50 dark:bg-slate-950/50 dark:border-slate-800/50`.
3. **Interactive Cards:** Make clickable cards feel alive: `transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1`.
4. **Inner Glows & Borders:** Use borders for visual depth instead of heavy drop shadows.

### Priority 3: Color & Theming Upgrades
1. **Semantic Colors:** Strictly use CSS variables for theme consistency (`bg-background`, `text-foreground`, `border-border`).
2. **Never use `hsl(var(--css-variable))`**: Our theme uses hex values. Using `hsl()` will break rendering. Use `var(--css-variable)` directly in inline styles, or semantic classes in Tailwind.
3. **Vibrant Accents (Light & Dark Pairs):** When using standard Tailwind colors for status indicators or accents (e.g., blue, emerald, amber), **you must always provide a dark mode equivalent**. 
   - *Example Background:* `bg-blue-50 dark:bg-blue-950/30`
   - *Example Text:* `text-blue-600 dark:text-blue-400`
   - *Example Border:* `border-blue-200 dark:border-blue-900/50`
4. **Dark Mode Specifics:** Ensure dark mode isn't just "gray". Use deep slates (`bg-slate-950`), and allow glowing accents to pop. Never leave hardcoded light-mode colors (like `bg-white`) without a `dark:bg-slate-950` equivalent.

### Priority 4: Layout & Spacing Overhaul
1. **Ditch `space-y-*`:** Always use `flex flex-col gap-*` or `grid gap-*` for predictable spacing. The `space-y` utility often breaks with hidden elements.
2. **Breathing Room:** Increase padding. Upgrade `p-4` to `p-6` or `p-8` for major containers. Give elements room to breathe.
3. **Responsive Grids:** Ensure complex layouts use CSS Grid to gracefully reflow on mobile (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).

### Priority 5: Micro-Animations & Interactivity
1. **Buttons:** Ensure all buttons have hover states, focus rings (`focus-visible:ring-2`), and active scaling (`active:scale-95`).
2. **Icons:** Add subtle animations to icons on hover (e.g., `group-hover:rotate-12`, `group-hover:scale-110 transition-transform`).
3. **Loading States:** Use animated skeletons (`<Skeleton />`) instead of plain boxes or raw `animate-pulse` divs.

## Component Specific Rules

### Shadcn UI Foundation (Crucial)
- Always use Shadcn components as the foundation for interactive UI elements (buttons, dialogs, dropdowns, forms, etc.).
- **You must consult the `shadcn` skill** (`.agents/skills/shadcn/SKILL.md`) for guidance on installing, importing, and correctly composing these components before attempting to build custom UI elements from scratch.

### Charts
- Always use `ChartContainer` + `ChartTooltipContent` from `@/components/ui/chart`.
- Never build custom SVG math for data visualization.
- Use smooth curves (`type="monotone"`) for line charts, and add subtle gradients (`<linearGradient>`) for fill areas.

### Icons
- Exclusively use `lucide-react`.
- Control size with `size-4`, `size-5`, `size-6` instead of `w-4 h-4`.
- Pair icons with text using `flex items-center gap-2`.

### Modals & Dialogs
- Never build custom modal divs.
- Always use Shadcn `Dialog` or `Sheet`.
- Enhance the overlay with a subtle blur: `className="backdrop-blur-sm"`.

## Verification Checklist

Before finishing any UI revamp, verify:

1. [ ] **No AI Slop:** The design does not look like a generic Bootstrap or early-Tailwind template.
2. [ ] **Glass & Depth:** Appropriate use of backdrop blurs and subtle borders instead of harsh drop shadows.
3. [ ] **Typography:** Headings are tight and bold, labels are distinct, contrast is high.
4. [ ] **Spacing:** `gap-*` is used exclusively for spacing siblings. Generous padding.
5. [ ] **Interactivity:** Buttons and cards have smooth hover and active states.
6. [ ] **Theme Integrity:** No raw `hsl()` wrappers. Dark mode works flawlessly.
7. [ ] **Animations:** Strategic micro-animations on interactive elements.
