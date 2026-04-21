# Design System Specification: The Tactile Archive

## 1. Overview & Creative North Star: "The Digital Curator"
This design system rejects the clinical coldness of traditional SaaS interfaces in favor of a "Digital Curator" aesthetic. The goal is to evoke the feeling of a high-end physical archive or a premium architectural portfolio. 

We achieve a "High-End Editorial" experience by prioritizing **Tonal Layering** over structural lines. By utilizing a warm, organic palette and sophisticated typography, we create an environment that feels authoritative yet approachable. We break the "template" look through **intentional white space**—treating the interface as a canvas where the absence of elements is as important as the elements themselves.

**Creative North Star:** *Sophisticated Precision.* Every pixel must feel intentional, as if it were set by hand in a boutique printing house.

---

## 2. Colors & Surface Philosophy
The palette is rooted in earth tones, providing a sense of stability and "old-world" trust within a modern digital context.

### Surface Hierarchy & The "No-Line" Rule
To achieve a premium feel, **1px solid borders for sectioning are strictly prohibited.** Do not use lines to separate the header from the hero, or the sidebar from the main content. 

Instead, use **Background Color Shifts**:
*   **Base Layer:** `surface` (#fcf9f4) – The infinite canvas.
*   **Sectioning:** `surface-container-low` (#f6f3ee) – Use for secondary content areas.
*   **Prominence:** `surface-container-high` (#ebe8e3) – Use for active workspace areas.
*   **Nesting:** Depth is created by placing a `surface-container-lowest` (#ffffff) card atop a `surface-container-low` background. This "paper-on-linen" effect creates natural hierarchy without visual clutter.

### Signature Textures
While the system avoids "blobs" or "heavy gradients," use **Micro-Gradients** on Primary CTAs. A subtle transition from `primary` (#7b532d) to `primary_container` (#976b43) provides a "beveled" professional polish that feels tactile and high-end.

---

## 3. Typography: The Editorial Voice
We use a dual-typeface system to balance character with utility.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-meets-human" feel. Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) to create a bold, editorial impact.
*   **Body & Labels (Inter):** The workhorse. Inter provides maximum readability for complex SaaS data. Use `body-md` (0.875rem) as the standard for all dashboard data to maintain a compact, professional information density.

**Hierarchy Note:** Always lead with a significant contrast between `headline-lg` and `body-lg`. If everything is emphasized, nothing is important. Use `on_surface_variant` (#50453b) for secondary text to reduce visual noise.

---

## 4. Elevation & Depth
In this system, "Elevation" is a measure of light and texture, not just shadows.

*   **Tonal Stacking:** Forbid the use of shadows for standard cards. Use the **Layering Principle**: A `surface-container-lowest` card sitting on a `surface-container` background provides all the "lift" required.
*   **Ambient Shadows:** For floating elements (Modals, Popovers), use a shadow tinted with the brand’s soul:
    *   `box-shadow: 0px 12px 32px rgba(123, 83, 45, 0.08);`
    *   This uses a 8% opacity of the `primary` color rather than black, making the shadow feel like natural ambient light.
*   **The "Ghost Border":** When high-contrast separation is required for accessibility, use the `outline_variant` (#d4c3b7) at **20% opacity**. It should be felt, not seen.

---

## 5. Component Guidelines

### Buttons (The "Seal of Quality")
*   **Primary:** `primary` (#7b532d) background with `on_primary` (#ffffff) text. Use `md` (0.375rem) corner radius.
*   **Secondary:** `secondary_container` (#f5ddb4) background. No border.
*   **Tertiary:** Ghost style. `on_surface` text, no background. On hover, apply a `surface-container-high` background.

### Input Fields
*   **Background:** `surface_container_lowest` (#ffffff).
*   **Border:** A "Ghost Border" of `outline_variant` at 40% opacity. 
*   **Focus State:** Shift the border to `primary` (#7b532d) at 100% and add a 2px outer glow of `primary_fixed` at 30% opacity.

### Cards & Data Lists
*   **The "No-Divider" Rule:** Forbid horizontal lines between list items. Instead, use 16px of vertical white space (`spacing-4`) or a subtle hover state shift to `surface_container_low`.
*   **Selection Chips:** Use `secondary_fixed_dim` (#dbc39c) for unselected states and `primary` for selected. Roundedness should always be `full` (9999px) to contrast against the structured grid.

### Glassmorphism (Contextual Overlays)
For side-panels or navigation blurs, use:
*   `background: rgba(252, 249, 244, 0.8);` (80% of `surface`)
*   `backdrop-filter: blur(12px);`
This ensures the "warmth" of the background layers bleeds through, maintaining a cohesive atmosphere.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align a large `display-md` headline to the left, but leave the right 40% of the container empty to allow the layout to "breathe."
*   **Use Tonal Shifts:** Define boundaries using the difference between `#fcf9f4` and `#f6f3ee`.
*   **Prioritize Typography:** Let the scale of the fonts define the importance, not the size of the boxes.

### Don’t:
*   **Don't use pure black (#000000):** It breaks the warmth of the palette. Use `on_surface` (#1c1c19).
*   **Don't use 100% opaque borders:** They create "visual cages" that make the SaaS feel like a legacy spreadsheet.
*   **Don't use "Standard" Blue for Links:** Use `tertiary` (#326270) to maintain the sophisticated, earthy professional tone.
*   **Don't crowd the edges:** Maintain a minimum of `24px` padding on all containers to preserve the "Boutique" feel.