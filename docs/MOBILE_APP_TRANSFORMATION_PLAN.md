# Mobile App Transformation Plan (PWA)

## 1. Overview
This document outlines the strategy to transform the "What to Eat" (一饭封神) web application into a mobile-first Progressive Web App (PWA). The goal is to provide a native app-like experience on mobile devices.

## 2. Core Architecture Changes

### 2.1 PWA Implementation
- **Install `vite-plugin-pwa`**: This plugin will handle the generation of the `manifest.json` and service worker.
- **Manifest Configuration**:
  - `display`: `standalone` (Removes browser address bar).
  - `start_url`: `/` (or a specific mobile entry point).
  - `theme_color` & `background_color`: Match the app's brand colors (#FBBF24 / yellow-400).
  - `icons`: Provide icons for Android (adaptive icons) and iOS (apple-touch-icon).
- **Service Worker**: Implement offline caching for core assets (shell architecture) so the app loads instantly.

### 2.2 Navigation Structure
- **Current State**: Top navigation bar with "hamburger" menu or horizontal scroll on mobile.
- **Proposed Change**: **Bottom Tab Bar**.
  - **Tabs**:
    1. **Home (Cooking)**: The main ingredient input and recipe generation flow.
    2. **Blind Box**: "Today Eat" / "Fortune Cooking".
    3. **Banquet**: "Table Design".
    4. **Sauce**: "Sauce Design".
    5. **Profile/More**: Favorites, Settings, Gallery, About.
- **Top Bar**: Minimal header containing only the current page title and essential actions (e.g., Settings icon).

## 3. UI/UX Interaction Refinements

### 3.1 Mobile Layout Adaptations
- **Viewport Height**: Use `100dvh` (dynamic viewport height) for the main container to prevent scrolling issues with mobile browser toolbars.
- **Safe Area Insets**: Add padding for notches and home indicators (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
- **Card-Based UI**:
  - Break down long scrolling pages (like Home) into separate steps or a multi-stage flow.
  - **Step-by-Step Wizard**: Instead of a long scroll for "Input -> Cuisine -> Generate -> Result", consider a wizard interface where each step takes the full screen.
    - Screen 1: Ingredient Input (Large input, camera button).
    - Screen 2: Cuisine Selection (Grid of options).
    - Screen 3: "Cooking" Animation.
    - Screen 4: Recipe Card (Full screen or swipable cards).

### 3.2 Touch Interactions
- **Touch Targets**: Ensure all buttons and interactive elements are at least 44x44px.
- **Gestures**:
  - **Swipe to Delete**: For ingredients in the list.
  - **Swipe Between Recipes**: If multiple recipes are generated, use a horizontal swipe carousel.
  - **Pull to Refresh**: Reset the current flow.
- **Haptic Feedback**: Trigger `navigator.vibrate(50)` on key actions (adding ingredient, starting generation).

### 3.3 Visual Polish
- **Remove Hover States**: Mobile devices don't have hover. Convert hover tooltips to tap-to-reveal or persistent helper text.
- **Transitions**:
  - Use **Slide Transitions** (left/right) for navigating between tabs or steps, mimicking native OS navigation.
  - **Modal Sheets**: Use bottom-sheet modals for "Quick Select Ingredients" or "Settings" instead of center-screen popups.

## 4. Specific Component Suggestions

### 4.1 Ingredient Input (`Home.vue`)
- **Current**: Inline tags + input box + expanding section for quick select.
- **Mobile Proposal**:
  - Input box at the bottom (above keyboard) or top.
  - "Quick Select" opens a **Bottom Sheet** (occupying 50-80% of screen height) containing the ingredient categories. This keeps the context but gives more space for selection.

### 4.2 Recipe Result
- **Current**: Appends to bottom of page.
- **Mobile Proposal**:
  - When generation finishes, automatically **push** a new "Recipe Detail" view or show a full-screen modal.
  - Enable "Immersive Mode" for reading the recipe (hide nav bars) to prevent screen dimming (Wake Lock API).

### 4.3 Navigation Bar (`GlobalNavigation.vue`)
- Replace the current mobile top bar with a fixed bottom bar:
```html
<nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe">
  <div class="flex justify-around items-center h-16">
    <!-- Icons + Labels -->
  </div>
</nav>
```

## 5. Implementation Roadmap
1.  **Phase 1**: Install PWA plugin and configure Manifest (Icon, Name, Color).
2.  **Phase 2**: Create `MobileLayout` component (or modify `App.vue`) to support Bottom Navigation.
3.  **Phase 3**: Refactor `Home.vue` to be more step-based or optimize the vertical scroll for mobile.
4.  **Phase 4**: Add touch gestures and haptic feedback.

