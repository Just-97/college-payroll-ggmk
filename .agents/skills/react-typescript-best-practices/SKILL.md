---
name: react-typescript-best-practices
description: Best practices for React 18+, TypeScript (strict mode), Vite, and modern clean component design. Focuses on zero `any`, strong typing, performant renders, decoupled hooks, and clean Tailwind styling.
---

# React & TypeScript Best Practices

Guidelines for writing maintainable, type-safe, and performant React applications with Vite and Tailwind CSS.

---

## 1. TypeScript Strictness
* **No `any`**: Always use strict interfaces, discriminated unions, or `unknown` with type guards.
* **Explicit Props & State**: Declare typed interfaces for all component props and custom hook outputs.
* **Readonly Collections**: Prefer `readonly T[]` for arrays passed to components to prevent accidental in-place mutations (`.sort()`, `.splice()`).
* **Avoid non-null assertions (`!`)**: Use optional chaining (`?.`) or proper fallback defaults (`??`).

---

## 2. React Component Architecture
* **Single Responsibility**: Each component should render a single UI concept. If a component exceeds ~150 lines, look for sub-components or extract business logic into custom hooks.
* **Separation of Presentation and Logic**: Keep computational logic, API calls, and data transformations out of JSX templates.
* **Memoization Discipline**:
  * Use `useMemo` for heavy transformations, filtering, and aggregate financial calculations.
  * Use `useCallback` when passing functions to memoized child components (`React.memo`).
* **Controlled Forms**: Always provide both `value` and `onChange` for inputs, with typed form state.

---

## 3. Tailwind CSS & UI Polish
* **Color Tokens**: Use consistent semantic color schemes (e.g. emerald/green for College brand, slate for neutrals).
* **Print Styles**: Ensure printable documents (e.g., payslips) have `@media print` utilities (`print:hidden`, `print:p-0`, `print:shadow-none`).
* **Interactive Feedback**: All interactive elements (buttons, links) must have clear hover, active, and focus-visible states.

---

## 4. Vite & Build Health
* **Type Checking**: Regularly verify types with `npx tsc --noEmit`.
* **Zero Unused Locals**: Never leave unused imports or local variables (`noUnusedLocals: true`).
* **Bundle Cleanliness**: Use dynamic imports or code splitting where needed.
