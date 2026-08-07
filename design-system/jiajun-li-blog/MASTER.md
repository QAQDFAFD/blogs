# JiaJun Li Blog Design System

## Direction

Adapt the LearnHub educational-platform demo into a real personal developer blog. Preserve its playful adult-learning character: floating outlined navigation, rounded typography, thick navy borders, colorful support blocks, and hard offset shadows. Never invent course counts, progress, student numbers, ratings, or testimonials.

## Tokens

| Role | Value |
| --- | --- |
| Background | `#FBF7F3` |
| Surface | `#FFFFFF` |
| Text / border / shadow | `#2D3748` |
| Muted text | `#64748B` |
| Primary green | `#55BD64` |
| Primary green dark | `#319B45` |
| Soft blue | `#B9DCEB` |
| Soft coral | `#F2AAA2` |
| Soft lavender | `#D9D2F3` |
| Soft yellow | `#F5D77A` |

## Typography

- English display: Fredoka Variable, 600-700.
- Body and UI: Nunito Variable, 500-700.
- Chinese fallback: `PingFang SC`, `Microsoft YaHei`, system sans-serif.
- Body size: 16px minimum on mobile, line height 1.65.
- Article line length: 65-75 characters.

## Shape and Depth

- Main cards and nav: 18px radius, 3px navy border, 8px navy offset shadow.
- Buttons and compact controls: 14-16px radius, 3px navy border, 5px navy offset shadow.
- Decorative blocks: 14-18px radius, never more than three colors in one viewport.
- Pressed state moves by `translate(3px, 3px)` and reduces shadow by the same amount. It never scales.

## Interaction

- Minimum touch target: 44x44px.
- Hover and focus transitions: 180-220ms ease-out.
- Keyboard focus: 3px green outline with 3px offset.
- All motion uses transform or opacity and stops under `prefers-reduced-motion`.
- No dark mode, gradient glow, glassmorphism, emoji icons, fake stats, or low-contrast pastel text.

## Responsive

- Container: 1160px maximum.
- Breakpoints: 768px and 1024px.
- Hero changes from two columns to one below 768px.
- Navigation becomes a labeled menu disclosure below 768px.
- Cards never cause horizontal scrolling at 375px.
