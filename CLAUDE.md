# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page digital invitation (in Spanish) for a "XV años" (quinceañera) celebration, themed as a "carta ranchera". It's a static site with no build system, package manager, or test framework — just `index.html`, `style.css`, and `script.js` served directly.

## Running locally

There is no build/lint/test tooling. Serve the directory with any static file server and open it in a browser, e.g.:

```
python3 -m http.server 8080
```

The `.vscode/launch.json` "Launch Chrome against localhost" config expects the site at `http://localhost:8080`.

When bumping `script.js`, the `<script>` tag in `index.html` uses a cache-busting query string (`script.js?v=2`) — increment it when changing script.js so browsers/CDN don't serve a stale cached copy.

## Architecture

**Single-page flow, driven by scroll and a few stateful UI widgets in `script.js`:**

1. **Envelope splash screen** (`#splash-screen`) — locks body scroll (`body.locked`) until the user taps the envelope. Tapping plays the open SFX + background music, breaks the wax seal, flips the flap, zooms into the scene, then fades out the splash and unlocks scroll — all via chained `setTimeout`s matched to CSS transition durations in `style.css`. Any timing change must be kept in sync between the JS timeouts and the corresponding CSS `transition`/`animation` durations.

2. **Scroll-story hero** — a sticky composite image (horse, rueda, flowers, person) that fades/scales/translates based on `window.scrollY`, computed on every `scroll` event in the "Story Scroll Animation" block of `script.js` (no rAF throttling, so keep this logic cheap).

3. **Image carousel** — plain vanilla slideshow (`showSlides`/`changeSlide`/`currentSlide`), auto-advances via `setInterval`, dots wired with inline `onclick` in `index.html`.

4. **Countdown timer** — `eventDate` is hardcoded at the top of `script.js` (`new Date('September 19, 2026 16:00:00')`); update it there when the event date changes. Note the confirmation-section copy in `index.html` also states a separate RSVP deadline ("10 de septiembre de 2026") that must be updated independently if it changes.

5. **Interactive "event book"** (`#event-book`) — a 3-state click-through (cover → ceremony → reception → closed) implemented as CSS-flip layers (`.book-layer.flipped`) toggled by `bookState` in `script.js`.

6. **RSVP / attendance system** — talks to an external backend at `https://backinvitacionc.vercel.app/guests` (hardcoded `API_URL` in `script.js`):
   - `GET /guests` populates the family `<select>` (sorted alphabetically).
   - `GET /guests/:id` fetches a family's pass count on selection.
   - `PATCH /guests/:id` with `{ status: 'confirmed'|'declined', attendingCount }` records the RSVP; the confirmed/declined option is then removed from the live select.
   - This is a 3-step UI (`search-step` → `details-step` → `success-step`) toggled via `.hidden` class swaps, all driven by plain DOM lookups (no framework, no build step) — there is no client-side test coverage, so verify RSVP changes manually against the live API.

**Styling**: single `style.css` (~1200 lines) organized with `/* --- Section --- */` comment headers matching the HTML sections (decoración fija, scroll story, padres/padrinos, carousel, event book, splash/envelope, música, confirmación). Fonts are loaded from Google Fonts (`Great Vibes`, `Cinzel`, `Playfair Display`) via `<link>` in `index.html`'s `<head>`.

**Assets**: `assets/img/` (decorative PNGs used across hero, carousel, and event book) and `assets/music/` (background music + envelope-open SFX).

**Dead code note**: `script.js` has a "Simple reveal animation on scroll" `IntersectionObserver` block that watches `.section, .card` elements and adds a `.reveal` class to fade them in — but no element in `index.html` carries those classes (sections use their own classes like `confirmation-section reveal`, with `reveal` already hardcoded), so the observer never fires. Visibility of those sections is not scroll-driven; don't assume this block is wiring up an active effect when touching scroll behavior.
