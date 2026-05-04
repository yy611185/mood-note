---
name: Glimmer
colors:
  surface: '#fff8f7'
  surface-dim: '#e3d7d6'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf1f0'
  surface-container: '#f7ebea'
  surface-container-high: '#f1e5e4'
  surface-container-highest: '#ece0df'
  on-surface: '#201a1a'
  on-surface-variant: '#524342'
  inverse-surface: '#352f2e'
  inverse-on-surface: '#faeeed'
  outline: '#847372'
  outline-variant: '#d7c2c0'
  surface-tint: '#874f4c'
  primary: '#874f4c'
  on-primary: '#ffffff'
  primary-container: '#ffb7b2'
  on-primary-container: '#7b4542'
  inverse-primary: '#fcb4b0'
  secondary: '#356572'
  on-secondary: '#ffffff'
  secondary-container: '#b7e7f7'
  on-secondary-container: '#3a6977'
  tertiary: '#774f87'
  on-tertiary: '#ffffff'
  tertiary-container: '#e8b8f8'
  on-tertiary-container: '#6c447c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#fcb4b0'
  on-primary-fixed: '#360e0d'
  on-primary-fixed-variant: '#6b3836'
  secondary-fixed: '#baeafa'
  secondary-fixed-dim: '#9ecede'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#1a4d5a'
  tertiary-fixed: '#f8d8ff'
  tertiary-fixed-dim: '#e6b6f6'
  on-tertiary-fixed: '#2e083f'
  on-tertiary-fixed-variant: '#5e376e'
  background: '#fff8f7'
  on-background: '#201a1a'
  surface-variant: '#ece0df'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.8'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.7'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-padding: 24px
  gutter: 16px
---

## Brand & Style

The design system is centered on the concept of "Emotional Sanctuary." It aims to evoke a sense of calm and safety, positioning the app as a digital breath of fresh air. The brand personality is quiet and observant, acting as a gentle companion rather than a demanding tool.

The visual style is **Healing Minimalism**. It moves away from the stark coldness of traditional minimalism by introducing organic shapes, a warm-tinted background, and a soft color palette. It prioritizes white space as a functional element to reduce cognitive load, allowing the user's thoughts and emotions to take center stage. The interface feels tactile and soft, using subtle shadows to create a sense of approachability and physical presence.

## Colors

The color strategy for this design system uses a "misted" approach. Instead of high-saturation accents, it utilizes desaturated pastels that feel light and airy. 

- **Primary (Soft Coral Pink):** Used for key actions and moments of emotional significance.
- **Secondary (Misted Teal):** Used for navigation elements and calm, steady states.
- **Tertiary (Pale Lavender):** Used for highlights, category tagging, or subtle decorative elements.
- **Neutral Base:** The background moves away from pure #FFFFFF to a warm **Creamy White**, preventing eye strain and adding a high-end, paper-like quality. 
- **Text Hierarchy:** Deep Charcoal provides high legibility for diary entries, while Soft Grey is reserved for metadata and placeholder text to maintain the "quiet" atmosphere.

## Typography

This design system utilizes **Plus Jakarta Sans** for its modern yet friendly character. The typography is optimized for long-form reading and reflection.

Key characteristics include:
- **Generous Line Height:** Body text uses a 1.7x to 1.8x line height to create a rhythmic, breathable reading experience.
- **Letter Spacing:** Subtle tracking is added to headlines and body text to prevent characters from feeling crowded, enhancing the "quiet" brand personality.
- **Simplified Chinese Optimization:** For Chinese characters, maintain the same line height and spacing principles. Ensure fallbacks to high-quality system sans-serifs (like PingFang SC) are implemented with optical weight matching.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid with Generous Margins**. To maintain the minimal and healing aesthetic, the design system employs significant whitespace around the edges of the screen.

- **Margin & Padding:** A standard 24px margin is applied to the main container to "push" the content inward, creating a focused, frame-like effect.
- **Rhythm:** An 8px-based spacing system is used to ensure mathematical harmony. 
- **Density:** Elements are intentionally spaced further apart than in standard productivity apps to encourage a slower, more deliberate user journey.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Ambient Shadows** and **Tonal Layers** rather than heavy borders or dark colors.

- **Soft Shadows:** Shadows should be extremely diffused. Use a large blur radius (30px-40px) with very low opacity (5%-8%). Shadows should be slightly tinted with the primary coral or teal color to keep them from looking "dirty" or grey.
- **Layering:** Cards sit on the Creamy White background, creating a subtle level 1 elevation. 
- **Glassmorphism:** Use background blurs (15px-20px) on navigation bars and floating buttons to maintain a sense of context and continuity as the user scrolls.

## Shapes

The shape language is dominated by **Pill-shapes** and **Ultra-rounded corners**. Sharp edges are strictly avoided to ensure the UI feels "soft" and "healing."

- **Cards:** Use a 20px to 24px radius to create a container that feels like a physical piece of stationery.
- **Interactive Elements:** All primary buttons and chips are capsule-shaped (pill-shaped) to provide a friendly, touch-ready appearance.
- **Borders:** When borders are necessary, they should be 1px wide and use a color only slightly darker than the background (e.g., Off-white).

## Components

### Buttons
- **Primary:** Capsule-shaped with a Soft Coral Pink fill and White text.
- **Secondary:** Capsule-shaped with a Misted Teal tint or a soft grey outline.
- **States:** Hover/Press states should involve a subtle shift in saturation or a slight scale-down (0.98x) to mimic a tactile press.

### Cards
- **Structure:** White background, 24px corner radius, and an ambient shadow. 
- **Usage:** Used for diary entry previews, mood summaries, and prompt containers.

### Input Fields
- **Diary Editor:** A borderless writing area to mimic a clean sheet of paper.
- **Standard Inputs:** 16px corner radius with a very light #F5F5F5 fill. Placeholder text in Soft Grey.

### Icons & Imagery
- **Emoji-centric:** Use expressive, high-quality emojis as the primary iconographic language to represent moods and activities.
- **System Icons:** Thin-stroke (1.5pt) rounded icons that match the secondary text color.

### Additional Components
- **Mood Slider:** A custom capsule-shaped slider that uses the primary palette to track emotional states.
- **Floating Action Button (FAB):** A large, pill-shaped button for "New Entry" that uses a background blur effect.