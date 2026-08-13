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

When bumping `script.js`, the `<script>` tag in `index.html` uses a cache-busting query string (`script.js?v=N`) — increment `N` when changing script.js so browsers/CDN don't serve a stale cached copy.

## Architecture

**Single-page flow, driven by scroll and a few stateful UI widgets in `script.js`:**

1. **Envelope splash screen** (`#splash-screen`) — locks body scroll (`body.locked`) until the user taps the envelope. Tapping plays the open SFX + background music, breaks the wax seal, flips the flap, zooms into the scene, then fades out the splash and unlocks scroll — all via chained `setTimeout`s matched to CSS transition durations in `style.css`. Any timing change must be kept in sync between the JS timeouts and the corresponding CSS `transition`/`animation` durations.

2. **Scroll-story hero** — a sticky composite image (horse, rueda, flowers, person) that fades/scales/translates based on `window.scrollY`, computed on every `scroll` event in the "Story Scroll Animation" block of `script.js` (no rAF throttling, so keep this logic cheap).

3. **Image carousel** — plain vanilla slideshow (`showSlides`/`changeSlide`/`currentSlide`), auto-advances via `setInterval`, dots wired with inline `onclick` in `index.html`.

4. **Countdown timer** — `eventDate` is hardcoded at the top of `script.js` (`new Date('September 19, 2026 16:00:00')`); update it there when the event date changes. This is independent of the RSVP deadline stated in the confirmation-section copy (see point 6) — update both if the dates change.

5. **Interactive "event book"** (`#event-book`) — a 2-state click toggle (`bookState` in `script.js`): click 1 flips `#layer-cover` open (`.flipped` class) to reveal `#layer-reception` underneath; click 2 flips it closed. Only `#layer-cover` and `#layer-reception` exist in the HTML/CSS — don't reintroduce a third "ceremony" layer/state without adding it everywhere (id, click handler, CSS).

6. **RSVP / attendance system** — talks to an external backend at `https://backinvitacionc.vercel.app/guests` (hardcoded `API_URL` in `script.js`):
   - `GET /guests` populates the family `<select>` (sorted alphabetically).
   - `GET /guests/:id` fetches a family's pass count on selection.
   - `PATCH /guests/:id` with `{ status: 'confirmed'|'declined', attendingCount }` records the RSVP; the confirmed/declined option is then removed from the live select.
   - This is a 3-step UI (`search-step` → `details-step` → `success-step`) toggled via `.hidden` class swaps, all driven by plain DOM lookups (no framework, no build step) — there is no client-side test coverage, so verify RSVP changes manually against the live API.
   - Confirming (not declining) triggers the gift-note modal (`#gift-modal-overlay`) via `showSuccess(..., showGiftModal=true)`, opened 900ms after the success step is shown.
   - The RSVP deadline is stated inline in `#confirmation-instructions` in `index.html` ("31 de agosto de 2026") and is independent of `eventDate` in `script.js` — update both if the date changes.

7. **Friend RSVP (no assigned family)** — a separate, simpler flow for guests without a family entry, toggled from `#btn-friend-toggle` inside the search step: options step (`#friend-options-step`) → name step (`#friend-name-step`) → success step (`#friend-success-step`). Posts `{ name }` to a *different* endpoint, `FRIEND_API_URL` (`https://backinvitacionc.vercel.app/amigos/confirmar`), expecting HTTP 201 on success.

**Styling**: single `style.css` (~1380 lines) organized with `/* --- Section --- */` comment headers matching the HTML sections (decoración fija, scroll story, padres/padrinos, sombrero, carousel, event book, ceremony details, splash/envelope, música, confirmación, amigos, gift modal). Fonts are loaded from Google Fonts (`Great Vibes`, `Cinzel`, `Playfair Display`) via `<link>` in `index.html`'s `<head>`.

**Assets**: `assets/img/` (decorative PNGs used across hero, carousel, and event book) and `assets/music/` (background music + envelope-open SFX).

**Dead code note**: `script.js` has a "Simple reveal animation on scroll" `IntersectionObserver` block that watches `.section, .card` elements and adds a `.reveal` class to fade them in — but no element in `index.html` carries those classes (sections use their own classes like `confirmation-section reveal`, with `reveal` already hardcoded), so the observer never fires. Visibility of those sections is not scroll-driven; don't assume this block is wiring up an active effect when touching scroll behavior.
