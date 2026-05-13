# UI Patterns

Use this reference when changing layout, styling, or interactive frontend UI.

## Design system

- Use shadcn/ui primitives from `src/components/ui` before building new primitives.
- Follow the configured shadcn style in `components.json`: New York style, neutral base color, CSS variables, and lucide icons.
- Use `cn` from `@/lib/utils` for conditional classes.
- Use lucide-react icons for actions when an appropriate icon exists.
- Keep reusable product UI in domain folders such as `src/components/chat`, `src/components/posts`, `src/components/user`, or route-local component folders.

## Tailwind and tokens

- Tailwind v4 tokens are declared in `src/app/globals.css`.
- Prefer semantic tokens and classes based on `primary`, `primary-foreground`, `background`, `foreground`, `card`, `border`, `muted`, `muted-foreground`, `input`, `ring`, and `destructive`.
- Preserve dark mode by using token-based colors instead of hard-coded light-only colors.
- Keep custom global CSS limited to cross-app behavior such as scrollbars, editor placeholders, or third-party component overrides.

## Layout behavior

- Preserve responsive behavior for mobile and desktop app shells.
- Use stable dimensions for toolbars, icon buttons, chat panes, media areas, and repeated list items so dynamic content does not shift layout.
- Keep text within its container. Adjust wrapping, width constraints, or component layout when labels can grow.
- Avoid nested cards unless the inner card is a repeated item, dialog, or genuinely framed control.

## Forms and interaction

- Use existing form patterns and react-hook-form/zod when editing validated forms.
- Use existing modal, dialog, dropdown, popover, sheet, scroll-area, tooltip, input, textarea, select, switch, skeleton, and button primitives.
- Keep loading, empty, disabled, optimistic, and error states consistent with nearby components.
- For icon-only controls, provide accessible labels or existing tooltip patterns.
