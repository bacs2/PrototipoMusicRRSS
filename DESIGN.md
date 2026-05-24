# Design System Strategy: The Sonic Curator

This design system is a comprehensive framework for a high-end, editorial-inspired music social platform. It moves beyond standard UI patterns to create a "social cataloging" experience that feels like a premium digital gallery for sound.

---

## 1. Overview & Creative North Star
**Creative North Star: The Digital Vinyl Gallery**
Our objective is to treat every album, playlist, and profile as a curated exhibition piece. Instead of a rigid, data-heavy grid, this design system utilizes **intentional asymmetry and tonal depth** to create an environment that feels both high-tech and human. 

By breaking the "template" look with overlapping elements (e.g., a high-resolution album cover bleeding into the header space) and shifting away from traditional borders, we create a fluid, immersive experience. We don't just list music; we frame it.

---

## 2. Colors & Surface Philosophy

The palette is anchored in a profound `#0e0e0e` depth, allowing our vibrant accent colors to "glow" as if they are light sources in a dark room.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Structural definition must be achieved through background shifts or white space.
- Use `surface-container-low` (#131313) for the main content area over the `background` (#0e0e0e).
- Use `surface-container-high` (#20201f) to define interactive zones without drawing lines.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of "frosted obsidian." 
- **Base Layer:** `surface` (#0e0e0e).
- **Secondary Sectioning:** `surface-container-low` (#131313).
- **Interactive Components:** `surface-container-highest` (#262626) for cards or hovered states.
- **The "Glass & Gradient" Rule:** For floating navigation or playback bars, use `surface-container` at 70% opacity with a `24px` backdrop-blur.

### Signature Textures
Main CTAs (Call to Actions) should never be flat. Use a linear gradient from `primary` (#cc97ff) to `primary-dim` (#9c48ea) at a 135-degree angle to give buttons a "neon tube" luminosity.

---

## 3. Typography

The typography strategy pairs **Epilogue** (for authoritative, bold headlines) with **Manrope** (for technical, clean metadata).

- **Display & Headlines (Epilogue):** Used for album titles and artist names. The high x-height and bold weights convey a "poster-like" editorial feel. 
    - *Example:* `display-lg` (3.5rem) should be used for featured artist profiles, overlapping with the hero imagery.
- **Titles & Labels (Manrope):** These are used for social stats and cataloging details. 
    - *Hierarchy Note:* Use `label-md` for technical data (e.g., "BPM," "YEAR," "GENRE") in `on_surface_variant` (#adaaaa) to keep the focus on the music.

---

## 4. Elevation & Depth

We avoid the "flat" look of basic dark modes by using **Tonal Layering**.

- **The Layering Principle:** To lift a card from the background, do not use a stroke. Place a `surface-container-highest` card (#262626) on top of a `surface-container-low` (#131313) section. The contrast is subtle, premium, and easy on the eyes.
- **Ambient Shadows:** For album artwork, use an extra-diffused shadow.
    - *Spec:* `0px 20px 40px rgba(0, 0, 0, 0.4)`. 
    - *Advanced:* For featured items, use a "Glow Shadow" by using the `primary` color (#cc97ff) at 10% opacity with a 60px blur.
- **The Ghost Border Fallback:** If high-contrast accessibility is required, use `outline-variant` (#484847) at 20% opacity. Never 100%.

---

## 5. Components

### Album Artwork (The Hero Component)
- **Styling:** Use `xl` (1.5rem) corner radius. 
- **Interaction:** On hover, the artwork should scale (1.05x) and increase shadow depth to mimic the physical act of picking up a record.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-dim`). White text. `full` roundedness.
- **Secondary:** Transparent background with a `Ghost Border`. Use `secondary` (#34b5fa) for text.
- **Tertiary:** Text only using `primary` (#cc97ff), used for low-priority actions like "Show More."

### Cataloging Chips
- **Style:** Use `surface-container-highest` with `md` (0.75rem) roundedness. 
- **Logic:** These should feel like "labels" on a record sleeve. Use `label-md` typography.

### Input Fields
- **Design:** Use `surface-container-low` with a bottom-only 2px "Ghost Border" that transforms into a `primary` neon line upon focus. No boxes; keep it editorial.

### Layout Cards & Lists
- **Rule:** **No Dividers.** Separate list items using `1.5rem` of vertical spacing.
- **Catalog View:** Emphasize the "Letterboxd" feel by using a 5-column grid for albums with `sm` (0.25rem) spacing between metadata and the image.

---

## 6. Do's and Don'ts

### Do
- **Do** overlap typography over images to create depth (e.g., Artist name overlapping the edge of an album cover).
- **Do** use `secondary` (#34b5fa) sparingly as a "vibration" color for active states (like a playing track).
- **Do** maximize white space. If a layout feels crowded, remove a container before you shrink the text.

### Don't
- **Don't** use pure `#000000` for anything other than the deepest background layer. 
- **Don't** use standard 1px borders to separate the sidebar from the main feed; use a background shift from `surface` to `surface-container-low`.
- **Don't** use standard "drop shadows." If it doesn't look like ambient light, it's too heavy.
- **Don't** use sharp corners. Everything in this system should feel organic and approachable, utilizing the `md` to `xl` roundedness scale.