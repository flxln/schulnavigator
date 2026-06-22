---
name: Studio Precision
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#40493a'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#717a68'
  outline-variant: '#c0cab5'
  surface-tint: '#286c00'
  primary: '#276a00'
  on-primary: '#ffffff'
  primary-container: '#37850a'
  on-primary-container: '#f8ffee'
  inverse-primary: '#87db5d'
  secondary: '#045faf'
  on-secondary: '#ffffff'
  secondary-container: '#6daaff'
  on-secondary-container: '#003e76'
  tertiary: '#425d86'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b76a0'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a2f876'
  primary-fixed-dim: '#87db5d'
  on-primary-fixed: '#072100'
  on-primary-fixed-variant: '#1d5200'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a6c8ff'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#004786'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#acc8f6'
  on-tertiary-fixed: '#001c3b'
  on-tertiary-fixed-variant: '#2c476f'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  h1:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h2:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  sidebar-header:
    fontFamily: Nunito Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 240px
  topbar-height: 56px
  container-padding: 24px
  card-padding: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system for MPZ Studio is built on a foundation of **Modern Corporate** efficiency blended with **Tactile Utility**. The brand personality is authoritative yet accessible, focusing on clarity and trust within a professional studio environment. 

The aesthetic prioritizes high legibility and a "systemic" feel, utilizing a clean, paper-like background to reduce eye strain during long working sessions. The emotional response is one of reliability and organized precision. The design leans into subtle depth cues and a structured layout to organize complex information into digestible modules.

## Colors
The palette is dominated by a rich **Brand Navy** for structure and text, balanced by a warm **Paper** background that distinguishes the workspace from generic white-label software. 

- **Primary Action:** The **Brand Green** is reserved for success states and primary "Call to Action" elements, symbolizing progress and validation.
- **Secondary Action:** **Brand Blue** is used for navigational links and secondary utilities.
- **Sidebar:** Uses a high-contrast dark theme (Brand Navy) to visually anchor the navigation and separate it from the content canvas.
- **Semantic States:** Red and Sun (Yellow) provide clear, immediate feedback for errors and warnings.

## Typography
The system uses **Nunito Sans** for its balanced, humanist qualities that maintain professionalism without feeling overly rigid. 

- **Hierarchy:** Strong weight differentiation (Semibold for headers) ensures clear document structure.
- **Functional Labels:** Sidebar headers are treated with a specialized uppercase style and reduced opacity (55%) to create clear sectioning without competing with primary navigation items.
- **Monospace:** A system-native monospace font is employed for technical paths or code snippets, ensuring maximum clarity for developer-centric or administrative tasks.

## Layout & Spacing
The layout follows a **Fixed-Sidebar** model with a fluid content area. 

- **Sidebar:** Fixed at 240px, providing a persistent anchor for navigation.
- **Top-Bar:** A 56px utility bar houses global actions and breadcrumbs.
- **Grid:** Content is organized into a modular grid using 24px margins. Elements within the grid stack vertically with consistent 16px or 24px gaps.
- **Adaptation:** On mobile devices, the sidebar collapses into a hidden drawer, and container padding reduces to 16px to maximize horizontal real estate.

## Elevation & Depth
This design system uses a **Tonal Layering** approach rather than heavy drop shadows.

- **Level 0 (Floor):** The `--paper` background (#fcfbf7).
- **Level 1 (Cards):** Pure white surfaces (#ffffff) with a 1px border (`rgba(8,42,80,0.1)`). This provides a crisp, flat elevation that feels integrated rather than floating.
- **Level -1 (Inset):** The `--paper-50` color (#f5f2ea) is used for pressed states, empty wells, or inset input fields to simulate physical indentation.
- **Sidebar:** Treated as the "Deepest" layer or a separate vertical plane using the dark Navy color to create a distinct functional zone.

## Shapes
The shape language is a mix of geometric and organic:

- **Surface Radius:** Cards and containers use a standard **8px radius** to maintain a clean, professional look.
- **Interactive Radius:** Primary buttons and chips utilize a **Pill-shape (9999px)**, which provides a friendly, high-contrast touch target that stands out against the rectangular grid of the UI.
- **Indicators:** Active states in the sidebar use a hard-edged vertical stripe (2-4px wide) on the left side to provide a sharp, unmistakable focal point.

## Components

### Buttons
- **Primary:** Brand Green background, white text, pill-shaped. On hover, darken to `#3d7e1b`.
- **Secondary:** Transparent background with Brand Blue text or border.

### Cards
- **Standard:** White background, 8px radius, 1px subtle border, 20px internal padding.
- **Validation Card:** Used for "Success" states (e.g., 'Alle Checks bestanden'). Features a green left-accent or light green tint to signify a positive system status.

### Sidebar Items
- **Inactive:** White text at 80% opacity.
- **Active:** White text (100%), Brand Green left-border stripe (4px), and a subtle background highlight.
- **Group Headers:** 11px, Uppercase, 55% opacity white.

### Inputs & Form Fields
- Fields should use the white background with the standard 1px border.
- Focused states should utilize a 2px Brand Blue border.
- Captions and labels use the defined `text-caption` style for secondary information.

### Top-Bar
- 56px height, white background, solid 1px border-bottom (`rgba(8,42,80,0.1)`). Houses the "MPZ Studio" branding on the far left.