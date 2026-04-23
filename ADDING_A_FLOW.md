# Adding a New Flow — Fast-Start Guide

This guide is for a fresh Claude session picking up the ABS Prototype project to add a new booking flow.

---

## What this project is

A Vite + React + Tailwind research prototype for moderated concept-testing. It explores different UX approaches to attribute-based hotel room booking at "The Straits, Singapore". There is no backend — all data is static JS modules. The booking context is always fixed: 14–17 Jun, 3 nights, 2 guests.

Deployed to Vercel from GitHub (`nathamos/abs-prototype`, branch `master`).

---

## Before you write a line of code, read these files

In this order:

1. **`src/data/bookingContext.js`** — fixed stay context (property, dates, nights, guests)
2. **`src/data/rooms.js`** — 5 room types with full attribute objects
3. **`src/data/attributes.js`** — 15 attributes with options, emojis, price deltas, and conflict rules
4. **`src/data/services.js`** — 8 service categories, ~24 items; note `quantifiable`, `defaultIncluded`, and `tag` fields
5. **`src/App.jsx`** — routing; see the pattern for how each flow is registered
6. **`src/Home.jsx`** — the researcher nav page; you'll add an entry here
7. **`src/index.css`** — all CSS custom properties (`--color-*`, `--font-*`, `--radius-*`)

Then skim at least one complete existing flow to understand the patterns:

- **Flow C** (`src/flows/flow-c/`) — good all-rounder; rooms, services, confirmation
- **Flow E** (`src/flows/flow-e/`) — most recent linear flow; shows the comparison table and day×time itinerary structure

---

## Key shared components

| Component | Path | What it does |
|---|---|---|
| `AttributePill` | `src/components/shared/AttributePill.jsx` | Selectable pill with emoji + label + optional price delta |
| `StepHeader` | `src/components/shared/StepHeader.jsx` | "Step N of M" header with title + subtitle |
| `BookingSummary` | `src/components/shared/BookingSummary.jsx` | Reusable price breakdown block |
| `RoomCard` | `src/components/shared/RoomCard.jsx` | Room card with altPrice + bestMatch CTA props |
| `ServiceItem` | `src/components/shared/ServiceItem.jsx` | Service row with quantity stepper for quantifiable items |

---

## How a flow is structured

Every flow follows the same pattern:

```
src/flows/flow-x/
  FlowXIndex.jsx    ← State container. Holds all useState. Renders <Outlet context={state} />.
  [Screen].jsx      ← One file per screen. Reads state via useOutletContext().
  ...
```

**FlowXIndex** is the React Router parent route. It owns all state and passes it down via outlet context. Screens never own state they need to share — everything lives in the Index.

**State shape example** (adapt as needed):
```js
const [selectedRoom, setSelectedRoom] = useState(null)
const [myServices, setMyServices] = useState([])
```

The context object always includes a `setters` sub-object and `bookingContext`.

**Note:** Not all flows follow this pattern. Flow D (`/flow-d`) is entirely self-contained in a single component and doesn't use FlowDIndex/Outlet context at all. Use that approach for flows that are one continuous screen rather than discrete steps.

---

## How routing works

In `App.jsx`:
```jsx
<Route path="/flow-x" element={<FlowXIndex />}>
  <Route index element={<Navigate to="first-screen" replace />} />
  <Route path="first-screen" element={<FlowXFirstScreen />} />
  <Route path="second-screen" element={<FlowXSecondScreen />} />
  <Route path="confirmation" element={<FlowXConfirmation />} />
</Route>
```

Add a matching entry to the `flows` array in `src/Home.jsx`.

---

## Design tokens (use these, don't hardcode colours)

```css
--color-bg             warm off-white page background
--color-surface        white cards
--color-surface-alt    light warm grey (used for row alternates, icon bg)
--color-text-primary   near-black
--color-text-secondary medium grey
--color-text-tertiary  light grey (labels, metadata)
--color-teal           #2D7D6F  (CTAs, selected state, teal-light background)
--color-teal-light     teal tint background
--color-border         warm light border
--font-display         'DM Serif Display' (headings, room names)
--font-body            'DM Sans' (everything else)
--radius-sm/md/lg/xl/full
```

---

## Animation

The project uses **Framer Motion**. Patterns used across existing flows:

- `<AnimatePresence>` + `motion.div` with `height: 0 → 'auto'` for accordion expand/collapse
- `motion.div` with `initial={{ y: '100%' }} animate={{ y: 0 }}` for bottom sheet slide-up
- `motion.span` with `animate={{ rotate: 90 }}` for chevron rotation on expand

---

## Existing flows (for reference / contrast)

| Flow | Route | Concept |
|---|---|---|
| A | `/flow-a` | Filter & Narrow — dropdown filters, ranked room list, sort pills, SGD↔Points toggle |
| B | `/flow-b` (unpriced), `/flow-b-priced` | Build Your Room — attribute-first, split-screen live preview, weighted room matching |
| C | `/flow-c` | Room First — pick a room, in-card personalisation, bundle selector |
| D (menu) | `/flow-e` | Tier Comparison + Itinerary — 4-column airline-style room comparison table → day×time itinerary builder |
| E (menu) | `/flow-d` | AI Chat Canvas — split-screen scripted freetext chat with inline attribute highlights + live booking panel |

---

## Build & deploy

```bash
export PATH="/opt/homebrew/bin:$PATH"
npm run build          # verify before committing
git add src/flows/flow-x/ src/App.jsx src/Home.jsx
git commit -m "Flow X: ..."
git push               # Vercel auto-deploys from master
```

Node is at `/opt/homebrew/bin/node` (installed via Homebrew). Always prefix npm/node commands with the PATH export above.

---

## Common pitfalls

- **Don't import Google Fonts via `@import` inside component files.** The font is already loaded globally in `src/index.css`. Just use `font-family: var(--font-display)`.
- **Don't add `@tailwind` directives to component CSS.** Global styles are in `src/index.css` only.
- **State lives in FlowXIndex, not in screens.** If two screens share data, it goes in the Index.
- **CSS `@import` must be the first line in index.css**, before `@tailwind` directives. Don't touch the import order there.
- **The rooms array has 5 items** (Classic, Superior, Deluxe Balcony, Family, Accessible). Each has a full `attributes` object — check room data before assuming attribute values.
- **Services with `defaultIncluded: true`** (daily-breakfast, daily-housekeeping, gym-access) are typically pre-populated in state. In Flow E these repeat across all stay days.
