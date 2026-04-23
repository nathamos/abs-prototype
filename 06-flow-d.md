# 06 — Flow D: AI Chat Canvas

**Route**: `/flow-d`
**Menu label**: "Flow E" (intentional swap — see 00-README.md)
**Mental model**: A hotel AI assistant helps the user build their room through freetext conversation. As attributes and services are mentioned, they are visually highlighted inline and added to a live booking panel on the right.
**Structure**: Single screen, self-contained. No sub-routes. Navigates directly to `/complete` on confirm.

---

## Layout

Full-height split-screen (100vh, no outer scroll):

```
┌─────────────────────────────┬──────────────────────────┐
│  ● Room builder             │  ● Your booking          │
│                             │                          │
│  [chat thread]              │  Classic Room · 3 nights │
│                             │  SGD 540                 │
│                             │                          │
│                             │  ROOM ATTRIBUTES         │
│                             │  [green rows + prices]   │
│                             │                          │
│                             │  SERVICES                │
│                             │  [indigo rows + prices]  │
│                             │                          │
│  [input + send button]      │  ▓ Total · 3 nights      │
│                             │    SGD XXX               │
└─────────────────────────────┴──────────────────────────┘
```

Left panel: 56% width. Right panel: 44% width.

---

## Chat Panel

- Green status dot + "Room builder" header
- Messages scroll; new messages auto-scroll to bottom via `useRef`
- **Assistant messages**: left-aligned, white bubble, `border-radius: 16px 16px 16px 4px`
- **User messages**: right-aligned, surface-alt bubble, `border-radius: 16px 16px 4px 16px`
- Label "ASSISTANT" above assistant messages, "YOU" below-right of user messages (10px, uppercase, tertiary colour)
- **Typing indicator**: 3 animated dots (Framer Motion opacity pulse) shown between user send and assistant reply
- Delay before assistant response: 1100ms

### Inline segment highlights

Messages are stored as arrays of segments: `{ text: string, type: 'room' | 'service' | null }`.

- `type: 'room'` → green tint background (`rgba(22,163,74,0.13)`), green text (`#16a34a`)
- `type: 'service'` → indigo tint background (`rgba(99,102,241,0.13)`), indigo text (`#6366f1`)
- `type: null` → plain text

### Input

Textarea (rows=2) + send button. Pre-filled with the next scripted message. Pressing Enter or clicking the send button advances the conversation. After the final turn, the send button is replaced with a teal "Confirm →" button that navigates to `/complete`.

---

## Scripted Conversation

Three turns. All content is hardcoded in `SCRIPT` array in `Chat.jsx`. No AI API required.

**Turn 1**
- User: mentions skyline view, late checkout, balcony
- Assistant: confirms additions, asks about bed type and wing preference
- Booking adds: Skyline view (+SGD 45), Balcony (+SGD 30), Late checkout 2pm (+SGD 40)

**Turn 2**
- User: requests King bed, quiet wing, daily breakfast
- Assistant: confirms all three
- Booking adds: King bed (+SGD 0), Quiet wing (+SGD 0), Daily breakfast × 3 (+SGD 90)

**Turn 3**
- User: asks to switch to queen bed with living area and kitchenette
- Assistant: acknowledges ("your booking on the right will update as we refine your stay")
- No booking change (scripted demo — the right panel doesn't actually update here)
- isDone = true → Confirm CTA appears

**Running total after all turns:** SGD 540 (base) + 45 + 30 + 40 + 0 + 0 + 90 = **SGD 745**

---

## Booking Panel

- Amber status dot + "Your booking" header
- Base room line: "Classic Room · 3 nights — SGD 540" (static)
- **ROOM ATTRIBUTES** section (green square label): rows animate in with `motion.div` as conversation adds them
- **SERVICES** section (indigo square label): same animated entry
- Legend: green square = Room attribute, indigo square = Service
- **Total bar** (dark background, full width): SGD amount animates scale on change via `motion.span key={grandTotal}`

---

## State

All state lives in `Chat.jsx` (not in FlowDIndex — this flow doesn't use outlet context):

```js
const [messages, setMessages]   // rendered conversation
const [step, setStep]           // which script step is next (0–2)
const [inputValue, setInputValue] // pre-filled textarea content
const [isTyping, setIsTyping]   // shows typing indicator
const [isDone, setIsDone]       // switches send → confirm CTA
const [attrs, setAttrs]         // accumulated room attributes [{label, price}]
const [services, setServices]   // accumulated services [{label, price}]
```

`grandTotal = BASE_PRICE * NIGHTS + sum(attrs) + sum(services)`

---

## File Structure

```
src/flows/flow-d/
  FlowDIndex.jsx   ← thin wrapper: just renders <Chat />
  Chat.jsx         ← entire flow; ~280 lines
  Recommendation.jsx  ← orphaned (old Q&A flow — not routed)
  Confirmation.jsx    ← orphaned (old Q&A flow — not routed)
```
