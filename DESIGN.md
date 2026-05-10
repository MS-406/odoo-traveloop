---
name: Traveloop
colors:
  primary: "#1E3A8A"
  on-primary: "#FFFFFF"
  primary-container: "#3B82F6"
  on-primary-container: "#FFFFFF"
  secondary: "#FF6B6B"
  on-secondary: "#FFFFFF"
  accent: "#10B981"
  on-accent: "#FFFFFF"
  surface: "#F8FAFC"
  surface-card: "#FFFFFF"
  surface-border: "#E2E8F0"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#94A3B8"
  danger: "#EF4444"
  on-danger: "#FFFFFF"
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  title-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 16px
  section-margin: 40px
components:
  glass-card:
    backgroundColor: rgba(255, 255, 255, 0.9)
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    border: 1px solid {colors.surface-border}
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.container-padding}"
---

## Brand & Style
Traveloop's design system represents a **Modern Corporate** aesthetic blended with high-end, premium travel visual cues. The brand personality is authoritative yet inspiring, aiming to build trust while evoking a sense of wanderlust.

The UI leverages a refined **Glassmorphism** approach. Instead of completely transparent elements, it utilizes high-opacity frosted glass layers (e.g., white fills with 90% opacity and strong background blurs) to provide a sense of structure and elegance. This creates a clean, bright, and breathable interface that feels sophisticated and modern.

## Colors
The palette balances trust with actionable energy and natural accents.

- **Deep Ocean Blue (`#1E3A8A`):** The primary color, anchoring the design with a sense of authority, stability, and corporate professionalism. Used for primary actions, navigation, and key headings.
- **Sunset Coral (`#FF6B6B`):** A vibrant secondary color used for destructive actions, warnings, or attention-grabbing highlights.
- **Emerald Green (`#10B981`):** Used as an accent color for successful states, actionable timelines, and financial/budget representations.
- **Surfaces & Neutrals:** Uses a very light slate (`#F8FAFC`) for backgrounds, and pure white (`#FFFFFF`) for cards, keeping the environment airy and uncluttered. Text relies on deep slate (`#0F172A` and `#475569`) for crisp legibility and clear visual hierarchy.

## Typography
The system employs a dual-font strategy to balance character with readability.

- **Headlines (Outfit):** A geometric sans-serif that brings a modern, slightly rounded, and friendly corporate feel to large text elements like page titles, section headers, and data metrics.
- **Body (Inter):** A highly legible, neutral sans-serif used for all functional text, descriptions, and UI controls to ensure maximum clarity and reduced cognitive load.

## Layout & Spacing
A fluid, breathable grid system governs the layout, prioritizing an editorial, high-end travel app experience.

- **Whitespace:** Employs generous margins and padding. Content is never cramped, giving the impression of a premium service.
- **Rhythm:** Built on an 8px baseline grid to ensure consistent vertical and horizontal rhythm.
- **Containers:** Max-width constraints on main content areas ensure the user's focus remains centered on their itinerary and tasks, regardless of screen size.

## Elevation & Depth
Depth is created through ambient, tinted shadows and frosted glass layers rather than harsh borders or dark drop-shadows.

- **Ambient Shadows:** Standard cards have a subtle, blue-tinted ambient shadow (`box-shadow: 0 4px 20px 0 rgba(30, 58, 138, 0.08)`) that lifts them off the surface smoothly. Hover states slightly increase this shadow to provide tactile feedback without feeling heavy.
- **Glass Stacking:** Overlay elements (like navigation bars or summary boxes placed over destination images) use a translucent white fill (`bg-surface-card/60` to `90`) paired with a heavy backdrop blur (`blur-xl`), creating depth through refraction and light rather than pure opacity.

## Shapes
The structural language is defined by approachable, rounded corners that soften the corporate aesthetic.

- **Cards and Containers:** Use a 16px radius (`rounded-xl`) to feel friendly and modern, moving away from rigid sharp corners.
- **Buttons and Inputs:** Use a 12px radius (`rounded-lg`) to remain cohesive with larger containers while feeling highly clickable and distinct as interactive elements.
