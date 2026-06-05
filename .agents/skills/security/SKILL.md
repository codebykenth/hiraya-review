---
name: security
description: >
  Enforces strict security best practices across the Laravel backend and React/Inertia frontend.
  Activate when implementing forms, controllers, models, authentication, or rendering user-generated content.
---

# Hiraya Review — Comprehensive Security Guidelines

This document outlines the strict security standards that MUST be adhered to when developing both the backend (Laravel) and frontend (React/Inertia) of the application. Security is a top priority to protect user data and maintain platform integrity.

## Priority-Based Security Refactoring Manifest

When auditing or refactoring the application for security, follow these priorities:

### Priority 1: Authorization & IDOR Prevention
1. **Route Protection:** Ensure absolutely no user-specific or admin routes are exposed without the `auth` and relevant role middlewares.
2. **Policy/Gate Enforcement:** Every controller method that accesses, modifies, or deletes a specific resource MUST verify ownership. Use `$this->authorize('update', $model)` or Gates. Never trust the ID passed in the request blindly (Insecure Direct Object Reference).

### Priority 2: Data Validation & Mass Assignment
1. **Form Requests:** Move all inline `$request->validate(...)` logic into dedicated Form Request classes (`php artisan make:request`).
2. **Strict Rules:** Apply exact type validations (`string`, `integer`), bounds (`max:255`), and strict formats.
3. **Model $fillable:** Verify that every Eloquent model explicitly defines a `$fillable` array. Do not use `$guarded = []`. Only expose attributes that are safe to be bulk-assigned.

### Priority 3: Eloquent Strictness & Query Safety
1. **N+1 Eradication:** Ensure all required relationships are eager-loaded using `with()` or `load()` before being returned to the frontend.
2. **Strict Mode Compliance:** Fix any code that triggers "Silently Discarded Attributes" (submitting unfillable data) or "Missing Attributes" (accessing non-existent model properties).
3. **Query Builder:** Ensure no raw SQL (`DB::raw()`) is used where user input is involved. Rely on Eloquent's built-in query methods to automatically parameterize bindings.

### Priority 4: Frontend XSS & Payload Security
1. **Inertia Payload Sanitization:** Audit all controllers returning `Inertia::render`. Ensure you are not leaking entire models (with hidden fields, passwords, or internal IDs) into `page.props`. Return only the fields the UI actually needs.
2. **No Raw HTML:** Search for and eliminate `dangerouslySetInnerHTML` in React. If rendering markdown or rich text, ensure it passes through a trusted sanitizer (like DOMPurify).
3. **Token Security:** Ensure no raw API keys, Sanctum tokens, or sensitive environment variables are hardcoded or leaked into the React client state.

### Priority 5: Destructive Actions & User Feedback
1. **Action Confirmations:** Ensure that any destructive action (e.g., Delete Account, Delete Module, Reset Progress) is protected by a Shadcn `Dialog` requiring explicit user confirmation.
2. **Rate Limiting:** Ensure sensitive routes (like logins, password resets, or OTP requests) are protected by Laravel's rate limiters to prevent brute force.

## Verification Checklist

Before finalizing any feature that handles user input or data access, verify the following:

1. [ ] **Validation:** All incoming data is validated through a dedicated Form Request.
2. [ ] **Mass Assignment:** The model's `$fillable` array is explicitly defined and accurate.
3. [ ] **Eager Loading:** No N+1 query warnings are triggered; relationships are explicitly loaded.
4. [ ] **Authorization:** The action is protected by a Policy or Gate, preventing unauthorized access (IDOR).
5. [ ] **XSS Safe:** No raw HTML is being blindly rendered on the frontend.
6. [ ] **Prop Cleanliness:** The Inertia response payload does not contain hidden sensitive data.

User should not be able to manipulate other users' data and should not be able to access admin routes.