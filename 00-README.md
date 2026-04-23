# ABS Prototype — Project Overview

## What This Is
A research prototype testing five different UX executions of attribute-based shopping (ABS) for a mid-scale hotel. Built to run moderated concept-testing sessions where participants explore each flow one at a time.

## Repository Structure
```
/abs-prototype
  /public
    /assets             ← room images (classic-room.jpg, superior-room.jpg, etc.)
  /src
    /data
      bookingContext.js ← fixed stay context (property, dates, nights, guests)
      rooms.js          ← 5 room types, attributes, base pricing
      attributes.js     ← 15 room attribute definitions + price deltas + conflict rules
      services.js       ← 8 service categories + ~24 items (3 are standard inclusions)
      roomMatching.js   ← weighted scoring for Flow B room matching
    /components
      /shared           ← reused across 2+ flows
        AttributePill   ← selectable pill with label + optional price delta
        RoomCard        ← room card used in Flow A + C
        ServiceItem     ← add-on row with quantity stepper
        StepHeader      ← "Step N of M / Title / Subtitle" header
        BookingSummary  ← reusable price breakdown block
        ContextStrip    ← booking context bar (dates, guests)
        Tag             ← small label chip
    /flows
      /flow-a           ← Filter & Narrow
      /flow-b           ← Build Your Room (unpriced + priced variants)
      /flow-c           ← Room First / Accordion
      /flow-d           ← AI Chat Canvas (shown as "Flow E" in the menu)
      /flow-e           ← Tier Comparison + Itinerary (shown as "Flow D" in the menu)
    HotelSelection.jsx  ← participant entry point (/)
    Home.jsx            ← researcher flow menu (/home)
    Complete.jsx        ← post-flow completion screen (/complete)
    App.jsx             ← routing shell
    index.css           ← design tokens + global styles
```

## Flows Summary

> **Note on menu labels vs. routes:** The researcher menu intentionally swaps the D/E labels for research ordering. `/flow-d` is shown as "Flow E" and `/flow-e` is shown as "Flow D".

| Route | Menu label | Flow | Room selection | Add-ons |
|---|---|---|---|---|
| `/flow-a` | Flow A | Filter & Narrow | Dropdown filters → ranked room list | Flat checklist by category |
| `/flow-b` | Flow B | Build Your Room (unpriced) | Attribute checklist → live matched room | Category navigator |
| `/flow-b-priced` | Flow B (priced) | Build Your Room (priced) | Same with live SGD price deltas | Category navigator |
| `/flow-c` | Flow C | Room First | Accordion room cards | Bundle selector |
| `/flow-e` | Flow D | Tier Comparison + Itinerary | 4-column airline-style comparison table | Chronological itinerary with time picker |
| `/flow-d` | Flow E | AI Chat Canvas | Scripted freetext chat with inline attribute highlights + live booking panel | Inline via chat |

## Shared Booking Context
All flows use the same pre-set booking context:
- **Property**: The Straits, Singapore (fictional)
- **Dates**: Sat 14 Jun — Tue 17 Jun (3 nights)
- **Guests**: 2 adults
- **Base room rate**: SGD 180/night (Classic Room)

## Standard Inclusions
Three services are always included and shown as locked/read-only (never added to totals):
- Daily breakfast (🥐)
- Daily housekeeping (🛎️)
- Gym access (💪)

## Tech Stack
- React + Vite
- React Router (one route per flow)
- Tailwind CSS (utility classes only)
- Framer Motion (accordion, bottom sheet, chat animations)
- No backend — all state is local React state

## Entry Points
- `/` → HotelSelection (participant start)
- `/home` → Home (researcher menu — not shown to participants)
- `/complete` → Completion screen (all flows end here)

## Reference Documents
- `01-data.md` — rooms, attributes, services data spec
- `02-design-language.md` — visual design system, tokens, component patterns
- `03-flow-a.md` — Filter & Narrow spec
- `04-flow-b.md` — Build Your Room spec
- `05-flow-c.md` — Room First spec
- `06-flow-d.md` — AI Chat Canvas spec (current `/flow-d` implementation)
- `07-setup-and-routing.md` — repo setup, routing shell, shared state pattern
- `ADDING_A_FLOW.md` — fast-start guide for adding a new flow in a fresh session
