# LingTour Frontend Refactoring Plan

## 1. Context
The goal is to refactor the LingTour frontend to match a high-end Shopify independent store aesthetic. This involves adopting a minimalist design, ample white space, immersive visual backgrounds, smooth scrolling interactions, and clear Calls to Action (CTAs). The refactoring covers four main areas: Home Event Hub, Routes Map & Details, Interpreting Services Configurator, and a new Community/Moments section.

## 2. Technical Stack & Dependencies
- **Styling**: Tailwind CSS (existing) with custom utility classes for minimalist shadows, blurs, and typography.
- **Animations**: `framer-motion` for smooth fade-ins, page transitions, and scroll-linked animations.
- **Map Integration**: `mapbox-gl` and `react-map-gl` for the macro-to-micro map experience, polylines, and camera flyTo animations.
- **Masonry Layout**: `react-masonry-css` or standard CSS columns for the Moments grid.

## 3. Implementation Steps

### Module 1: Home Event Hub (Hero Section & Cultural Calendar)
- **Hero Section**: Refactor `site/src/app/page.tsx` and `site/src/components/home/FeaturedRoutesCarousel.tsx` to feature full-screen background images/videos. Add an elegant carousel with "Countdown Capsules" (e.g., ⏳ 14 days to Chaoshan Dance Festival) over the hero images.
- **Cultural Calendar**: Replace grid-based calendars with a horizontal scroll timeline (Timeline/Horizontal Scroll). Create a new component `site/src/components/home/CulturalTimeline.tsx` to display upcoming festivals linked directly to routes.

### Module 2: Routes Map & Details (Macro to Micro & Split-Screen)
- **Route Listing (`site/src/app/routes/page.tsx`)**: 
  - Integrate Mapbox to show a base map of Guangdong.
  - Implement zoom interactions: clicking a region zooms the camera (flyTo) to reveal route polylines.
  - Hover effects on polylines to highlight routes and dim others, showing a minimalist tooltip.
- **Route Details (`site/src/app/routes/[slug]/RouteDetailClient.tsx`)**:
  - Implement a 50/50 Split-Screen layout.
  - **Left**: Sticky Mapbox instance. As the user scrolls on the right, use `IntersectionObserver` to trigger Mapbox camera moves to specific coordinate nodes.
  - **Right**: Scrollable story flow. Display nodes (attractions, dining, hotels) with elegant typography and external links. 
  - Add a **Traveler's Journal** (Posts) component at the bottom of the right scroll area.

### Module 3: Interpreting Service (Step-by-Step Configurator)
- **Refactor `site/src/app/interpreting/page.tsx` and `MultiStepForm.tsx`**:
  - Remove long text walls. Use a wizard/configurator pattern.
  - **Step 1**: Select Scenario (Business, Tourism, Exhibition) via large visual cards.
  - **Step 2**: Select Level (Junior, Mid, Senior) displaying core stats (e.g., vocabulary size, years of experience).
  - **Sticky Checkout Bar**: A bottom/side sticky bar that dynamically calculates the price based on selections (e.g., "Business + Senior = ¥XXXX/day") with a clear `Book Now` CTA.

### Module 4: Community / Moments
- **New Page (`site/src/app/moments/page.tsx`)**: Create a global entry point for UGC.
- Implement a Masonry Grid showcasing user photos, minimal titles, and likes.
- Add horizontal scrollable pill tags (Filters) at the top.
- **Linkage**: Add a card at the bottom of a moment post reading "Related Route: Zhanjiang 3 Days Tour" linking back to the route details.
- **Post Creation**: Add a "Write Post" feature restricted to the user's order history (`site/src/app/account/orders/page.tsx`), ensuring only verified travelers can post comments associated with a specific route.

### Module 5: End-to-End Browser Testing
- **User-Centric Journey**: Use a real browser-based agent (browser-use) to simulate a complete, realistic user flow rather than isolated functional tests.
- **Aesthetic & UX Evaluation**: Ensure the frontend pages genuinely reflect a high-end Shopify independent store aesthetic from a user's perspective (minimalist design, ample white space, immersive backgrounds).
- **Interaction Flow**: Verify the smoothness of transitions, correct map zoom behaviors, responsive form wizard steps, and infinite masonry loading across the entire user journey.

## 4. Key Files to Modify / Create
- **Modify**:
  - `site/src/app/page.tsx`
  - `site/src/components/home/FeaturedRoutesCarousel.tsx`
  - `site/src/app/routes/page.tsx`
  - `site/src/app/routes/[slug]/RouteDetailClient.tsx`
  - `site/src/app/interpreting/page.tsx`
  - `site/src/components/interpreting/MultiStepForm.tsx`
  - `site/src/components/layout/SiteHeader.tsx` (Add Moments to Navbar)
- **Create**:
  - `site/src/components/home/CulturalTimeline.tsx`
  - `site/src/components/routes/MapboxRouteMap.tsx` (For listing and detail split-screen)
  - `site/src/app/moments/page.tsx` (New Community Hub)
  - `site/src/components/moments/MasonryGrid.tsx`
  - `site/src/components/moments/PostDetailModal.tsx` (Or separate page for post detail)