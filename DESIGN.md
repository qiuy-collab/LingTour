---
name: LingTour Guangdong
description: A field-journal design system for Guangdong cultural tourism — archival, tactile, warm.
colors:
  river-deep: "#14343d"
  river: "#24535e"
  cinnabar: "#b64235"
  cinnabar-deep: "#842b23"
  gold: "#9a6d2e"
  jade: "#7c9b86"
  night: "#111923"
  ink: "#17202a"
  muted: "#66717d"
  line: "rgba(23, 32, 42, 0.13)"
  paper: "#f4f2ee"
  paper-deep: "#ece9e2"
  parchment: "#ede6d9"
  parchment-light: "#f3ede2"
  parchment-deep: "#e8e0d4"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  body:
    fontFamily: "'Trebuchet MS', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
    fontWeight: 700
    fontSize: "10px"
    letterSpacing: "0.2em"
    textTransform: "uppercase"
  handwritten:
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
    fontWeight: 400
    fontStyle: "italic"
    lineHeight: 1.75
rounded:
  sm: "9999px"
  none: "0px"
spacing:
  site-max: "82rem"
  section-y: "clamp(4rem, 10vw, 10rem)"
  container-px: "clamp(1rem, 5vw, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.river-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "1.25rem 2.5rem"
  button-primary-hover:
    backgroundColor: "{colors.cinnabar}"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "1.25rem 2.5rem"
  button-gold-hover:
    backgroundColor: "{colors.river-deep}"
  button-paper:
    backgroundColor: "{colors.white}"
    textColor: "{colors.river-deep}"
    rounded: "{rounded.none}"
    padding: "1.25rem 2.5rem"
  button-ghost-dark:
    backgroundColor: "rgba(17, 25, 35, 0.58)"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
---

# Design System: LingTour Guangdong

## 1. Overview

**Creative North Star: "The Field Journal"**

LingTour's visual system is an editorial archive in digital form — a field researcher's logbook where every page carries texture, evidence, and care. It is warm without sentimentality, authoritative without coldness, and richly textured without clutter. The system draws from printed matter: paper grain, ink washes, archival tape, scrapbook shadows, and the deliberate asymmetry of hand-assembled pages.

This is a **brand-first** system (the design IS the product for the public-facing site), with a secondary product register for the admin dashboard (Element Plus, serving the workflow). The system explicitly rejects cold corporate SaaS aesthetics, AI-generated landing-page templates (gradient text, glass cards, hero-metric grids), and the saturated 2026 default of cream/sand body backgrounds chosen by reflex rather than intent.

**Key Characteristics:**
- Stone-paper neutrals with restrained warmth (never cream-by-default)
- Deep teal-navy as the structural anchor; cinnabar and gold as ≤10% accent sparks
- Serif display + humanist sans body: editorial authority meets approachable utility
- Scrapbook materiality: white borders on images, rotated frames, ink-wash overlays, tape accents
- Tactile interaction: buttons lift, cards breathe, links shimmer
- Purposeful motion: choreographed reveals that enhance an already-visible default

## 2. Colors

The palette is drawn from a physical traveler's kit: river-deep ink, cinnabar wax seals, gold leaf, jade stone, and aged parchment. Four named color roles carry the system, each with a clear boundary; overlapping roles are prohibited.

### Primary

- **River Deep (#14343d):** The voice of authority. Used for primary buttons, section backgrounds, headings, and the darkest structural surfaces. It anchors every page — the ink in the pen.
- **Cinnabar (#b64235):** The warm accent spark. Used sparingly on eyebrow labels, hover states, link underlines, and the `.kinetic-link` shimmer. Never exceeds 10% of visible surface.

### Secondary

- **Gold (#9a6d2e):** The editorial highlight. Used for italic display text overlays, badge backgrounds, CTA buttons on dark surfaces, and price tags. Warmer and more decorative than cinnabar; the two share accent duty but never compete on the same element. This is a brass rather than a leaf gold: at 4.08:1 on paper it clears AA for large text, where the lighter #b98a46 it replaced sat at 2.77:1 and cleared nothing. Do not use it for body-size text on light surfaces, which still needs 4.5:1.
- **Jade (#7c9b86):** The quiet complement. Used for secondary data, map accents, and subtle differentiation where neither gold nor cinnabar fits. Gentle presence; never shouting.

### Neutral

- **Paper Deep (#ece9e2):** Page background. A stone-paper neutral with near-zero chroma — deliberately NOT warm-tinted. The warmth in the brand comes from typography + imagery + gold accent, not from body bg.
- **Paper (#f4f2ee):** Card and elevated surface background. One step lighter than the page, creating subtle depth through value alone.
- **Ink (#17202a):** Body text and structural dark. Near-black with a hint of teal, never pure #000.
- **Muted (#66717d):** Secondary text, supporting labels. Meets ≥4.5:1 contrast on paper-deep.
- **Line (rgba(23, 32, 42, 0.13)):** Divider lines and subtle borders. One value across the entire system; no per-section variation.
- **Night (#111923):** Dark surface background for CTAs and footer. Deep enough to make gold and white text sing.
- **Parchment (#ede6d9):** Archival accent surface for journal-style cards, drawer panels, and tab-like UI elements.

### Named Rules

**The Spark Rule.** Cinnabar and gold are accent sparks, not structural colors. Combined, they must never exceed 10% of any given screen's visible surface. Their rarity is the point.

**The No-Warm-Default Rule.** The body background (`paper-deep: #ece9e2`) is chroma-neutral, not warm-tinted. "Warmth in the brand" is carried by accent + typography + imagery, never by defaulting the body to cream/sand/parchment. If warmth is needed, tint the neutral toward the brand's own hue (river teal), not toward yellow.

**The Ghost Border Rule.** Line borders at 1px and 13% opacity. Never use `border-left` > 1px as a colored accent stripe on cards or list items.

## 3. Typography

**Display Font:** Georgia, "Times New Roman", serif
**Body Font:** "Trebuchet MS", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif
**Label Font:** "Trebuchet MS", "Segoe UI", sans-serif (bold, uppercase)

**Character:** A serif display that reads like a book cover — weighty, literate, slightly old-world — paired with a humanist sans body that's approachable and legible at small sizes. The pairing creates editorial authority without coldness; this is a magazine, not a manual.

### Hierarchy

- **Display** (400, clamp(2.55rem, 10vw, 10rem), line-height 0.88–0.98, tracking -0.04em to -0.05em): Hero headlines only. Always in Georgia. Tight leading and negative tracking create a composed, monumental presence. Cap at 10rem; above that is shouting.
- **Headline** (400, 2.5rem–4rem, line-height 0.92–0.98): Section titles. Georgia. Leading tightens as size increases; always `text-wrap: balance`.
- **Title** (400, 1.5rem–2rem, line-height 1.1): Card titles, feature headings. Georgia. Hover transitions to cinnabar on linked titles.
- **Body** (400, 1rem, line-height 1.6, max 65ch): Running text. Trebuchet MS stack. Use `text-wrap: pretty` for long prose.
- **Handwritten** (400 italic, 1rem–1.25rem, line-height 1.75): Supporting descriptions, testimonial quotes, editorial asides. Trebuchet MS italic — deliberately not a script font; avoids the "cursive AI default."
- **Label** (700, 10px, tracking 0.18em–0.4em, uppercase): Eyebrow labels above headings. Either cinnabar or gold. Used once per section — never as a reflex on every heading.

### Named Rules

**The Single Eyebrow Rule.** One section-kicker (small uppercase label above a heading) is a deliberate brand voice; an eyebrow on every section is AI grammar. Use sparingly, and only where the label adds context the heading alone doesn't carry.

**The No-Similar-Pair Rule.** Georgia + Trebuchet works because serif display + humanist sans is a contrast axis. Never pair two serifs or two geometric sans-serifs; the pairing must cross a contrast axis.

## 4. Elevation

This is a **layered, tactile** system. Surfaces lift on hover with shadow and displacement — the digital equivalent of lifting a photograph off a scrapbook page. Shadows are ambient and structural, never decorative; they convey material hierarchy, not "coolness."

### Shadow Vocabulary

- **scrapbook-shadow:** The signature shadow — used on images, product cards, CTA panels. A broad, diffuse drop that reads as physical depth. Applied to rotated frames (2–3°) for the hand-placed feel.
- **shadow-soft** (0 22px 70px rgba(17, 25, 35, 0.12)): Elevated panels, dialogs, dropdowns. Broad and ambient.
- **Button shadows:** Primary and gold buttons carry their own subtle shadow (4px–12px blur at 15% opacity) that deepens and lifts on hover.

### Named Rules

**The Lift-By-Default Rule.** Interactive surfaces (buttons, cards, links) lift on hover with `translateY(-2px)` + shadow expansion. This is the system's tactile signature. No element lifts without purpose; decorative floating is prohibited.

**The Flat-At-Rest Rule.** Non-interactive surfaces sit flat. Shadows appear only as a response to state (hover, focus, elevated containers). A static card with no interaction target carries no shadow.

## 5. Components

### Buttons

**Character:** Tactile and confident. Every button lifts on hover; transitions are `cubic-bezier(0.22, 1, 0.36, 1)` with 300–400ms duration. Uppercase labels at 0.2em tracking. No rounded corners — straight edges reinforce the editorial, print-derived aesthetic.

- **Shape:** Straight corners (0px radius).
- **Primary (btn-primary):** bg river-deep, white text, padding 1.25rem 2.5rem. Hover: bg shifts to cinnabar, lift -2px, shadow expands. Active: bg cinnabar-deep.
- **Gold (btn-gold):** bg gold, white text. Hover: bg shifts to river-deep. Used on dark-section CTAs.
- **Outline (btn-outline):** 1px river-deep border, transparent bg, river-deep text. Hover: bg fills river-deep, text → white.
- **Paper (btn-paper):** 1px line border, white bg at 94% opacity, river-deep text. Hover: border darkens to river-deep, lift -2px.
- **Ghost Dark (btn-ghost-dark):** rgba(17,25,35,0.58) bg with backdrop-blur, white text. Hover: bg → near-white, text → night. Used on river-deep/night backgrounds.
- **Focus-visible:** All buttons: 2px gold outline, 3px offset.

**The Kinetic Link.** A shimmer effect on primary CTAs — a diagonal light sweep on hover via `::before` pseudo-element with `translateX(-120%)` → `translateX(120%)` transition. Reserved for the highest-priority action on each page; never used on secondary links.

### Cards

**Character:** Archival, not generic. Cards use white/paper bg, 1px line border, and scrapbook-shadow. Hover lifts the card (-2px in Y, slight scale-up) and shifts border toward gold. Image-first cards use white border frames (0.5–1rem) with slight rotation (±2°), mimicking a physical photo album.

- **Corner Style:** 0px (straight).
- **Background:** paper / white at 70–94% opacity.
- **Shadow:** scrapbook-shadow at rest; deepens on hover.
- **Hover:** `translateY(-2px) scale(1.01)`, shadow expands, border shifts to gold/50.
- **Image frames:** White border (0.5–1rem) with scrapbook-shadow. Rotated ±2–3° for analog feel.

### Tags / Chips

- **Style:** White/70 bg, 1px line border, pill shape (9999px). Label: 10px bold uppercase, 0.18em tracking, river-deep text.
- **No interaction state** — tags are informational only.

### Navigation

- **SiteHeader:** Fixed, transparent → solid on scroll. River-deep text on paper-deep bg. Active link: cinnabar underline or gold accent.
- **Mobile:** GlobalDrawer slides in from right; parchment-deep bg, river-deep text.

### Divider

- **Style:** 1px line color, full-width within site-container. Used between major content sections — consistent, never varying in color or weight.

### Signature: Scrapbook Image Frame

The system's most distinctive pattern. Images are wrapped in a white-bordered frame (0.5–1rem border) with scrapbook-shadow, often rotated 2–3°. On hover, the image scales up 5–10% while the frame holds. Ink-wash overlay (rgba(0,0,0,0.10)) adds depth. This pattern appears on hero images, product cards, and interpreting CTAs — it is the visual anchor of the Field Journal metaphor.

### Signature: Spotlight Panel

A follow-mouse radial gradient effect on `.spotlight-panel`. A cinnabar-tinted radial glow follows the cursor (via CSS custom properties `--spot-x`, `--spot-y`), creating a warm spotlight that reveals on hover. Used on editorial cards and featured sections.

## 6. Do's and Don'ts

### Do:

- **Do** use river-deep as the structural anchor — it carries headings, primary buttons, and dark-section backgrounds.
- **Do** keep cinnabar + gold combined ≤10% of any screen. They are accents, not a palette.
- **Do** use Georgia for all headings h1–h3. Never a sans-serif heading.
- **Do** use `text-wrap: balance` on h1–h3, `text-wrap: pretty` on body prose.
- **Do** use the scrapbook image frame pattern (white border, rotation, shadow) for hero and feature images.
- **Do** let interactive elements lift on hover — `translateY(-2px)` + shadow expansion is the system's tactile signature.
- **Do** respect `prefers-reduced-motion` — all animations must collapse to instant transitions.
- **Do** use paper-deep (#ece9e2) as the page background, not parchment or cream.

### Don't:

- **Don't** use cream/sand/beige body backgrounds — paper-deep is chroma-neutral. "Warmth" comes from accent + type + imagery.
- **Don't** use gradient text (`background-clip: text`) — prohibited. Use a single solid color; emphasis via weight or size.
- **Don't** use glassmorphism as a default surface treatment. Glass effects (backdrop-blur) are reserved for ghost-dark buttons on dark backgrounds only.
- **Don't** use the hero-metric template (big number, small label, gradient accent). This is a SaaS cliché, not a field journal.
- **Don't** use identical-card grids. Vary card shapes, rotations, and layouts — the scrapbook is hand-assembled, not factory-stamped.
- **Don't** put an eyebrow label above every section heading. One deliberate kicker is voice; every section is AI grammar.
- **Don't** use `border-left` or `border-right` > 1px as a colored accent stripe — rewrite with full borders, background tints, or nothing.
- **Don't** use cold corporate SaaS patterns (blank white bg, gray text, sterile data tables). The admin dashboard uses Element Plus — that's acceptable for the tool surface, but the brand site must feel like a field journal, not a dashboard.
- **Don't** animate CSS layout properties (width, height, top, left). Use `transform` and `opacity` only.
- **Don't** use arbitrary z-index values like 999 or 9999. The scale is: dropdown → sticky → modal-backdrop → modal → toast → tooltip.
