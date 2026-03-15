# Changelog

All notable changes to Farmaturno will be documented in this file.

---

## [1.0.5] - 2026-03-15

### Fixed

- **Google Places search accuracy** improved: the query now includes the "farmacia" prefix to reduce ambiguous results and retrieve more precise phone numbers and coordinates.

---

## [1.0.4] - 2026-03-15

### New Features

- **Estimated closing time** for the active pharmacy shift is now displayed in the sidebar and bottom sheet, calculated from the opening time of the next shift.

---

## [1.0.3] - 2026-03-08

### Improvements

- **Mobile bottom sheet** now supports a collapsible list via the grid trick: the list expands and collapses smoothly without affecting the map layout.

---

## [1.0.1] - 2026-03-07

### Improvements

- **Server-side rendering (SSR)** enabled via the `@astrojs/vercel` adapter, improving initial load time and enabling server-side caching of pharmacy data.

---

## [1.0.0] - 2026-03-07

First public release. Farmaturno replaces the old duty pharmacy lookup with a modern, mobile-first experience: interactive map, real-time directions, and phone numbers — all in one place.

### New Features

- **Interactive map** with pins for every pharmacy on duty. Select a pharmacy to center the map and see its details.
- **Real-time user location** shown as a pulsing blue dot on the map, with automatic rerouting when you move more than 50 meters.
- **Directions** from your current location to any pharmacy, powered by Google Routes API. Switch between walking and driving modes with a single tap. Walking routes are shown with a dotted line on the map.
- **Distance estimate** shown in the pharmacy list and detail card (straight-line approximation, indicated with ~).
- **Phone numbers** displayed for each pharmacy, with one-tap dialing.
- **Date navigation** to browse duty pharmacies up to 7 days in the past, up to whatever future dates the data source provides (typically 2 days ahead).
- **Time-aware filtering**: on the current day, before 9 AM the overnight pharmacies from the previous day are shown; after 11 PM only the two overnight pharmacies for the current day are shown; during the rest of the day all active pharmacies are listed.
- **Dark mode** support with a toggle in the sidebar. Preference is persisted across sessions.
- **Mobile-optimized bottom sheet** with two states in list mode (collapsed and expanded) and a compact card mode when a pharmacy is selected.

### Design

- Custom typography using Syne (headings) and DM Sans (body) for a clean, modern look.
- App icon used as favicon and sidebar logo.

### Performance

- Pharmacy data fetched once per day on the server and cached — no repeated external calls regardless of how many users access the app.
- Google Places results cached in `localStorage` to avoid redundant API calls across sessions.
- Preconnect hints for Google Maps domains to reduce initial load latency.
- Memoized computed values and stable references to prevent unnecessary React re-renders.

### Accessibility

- Focus rings on all interactive elements.
- Respects `prefers-reduced-motion` for users who prefer less animation.

### Analytics

- Vercel Analytics integrated for anonymous usage insights.
