export const attributes = [
  // ── Room category ───────────────────────────────────────────────
  {
    id: 'roomCategory',
    label: 'Room type',
    emoji: '🏷️',
    type: 'select',
    options: [
      { value: 'standard', label: 'Standard',  emoji: '🏷️', priceDelta: 0 },
      { value: 'superior', label: 'Superior',  emoji: '⭐', priceDelta: 20 },
      { value: 'deluxe',   label: 'Deluxe',    emoji: '✨', priceDelta: 45 },
    ],
  },

  // ── Occupancy ───────────────────────────────────────────────────
  {
    id: 'occupancy',
    label: 'Guests',
    emoji: '👥',
    type: 'select',
    options: [
      { value: 2, label: '2 guests', emoji: '👫', priceDelta: 0 },
      { value: 4, label: '4 guests', emoji: '👨‍👩‍👧‍👦', priceDelta: 30 },
    ],
  },

  // ── Beds ────────────────────────────────────────────────────────
  // bedding is multiselect — rooms and user selections store an array of values
  {
    id: 'bedding',
    label: 'Bed type',
    emoji: '🛏️',
    type: 'multiselect',
    options: [
      { value: 'king',   label: 'King bed',    emoji: '🛏️',  priceDelta: 0 },
      { value: 'queen',  label: 'Queen bed',   emoji: '🛏️',  priceDelta: 0 },
      { value: 'twin',   label: 'Twin beds',   emoji: '👫',  priceDelta: 0 },
      { value: 'double', label: 'Double bed',  emoji: '🛏️',  priceDelta: 0 },
      { value: 'sofa',   label: 'Sofa bed',    emoji: '🛋️',  priceDelta: 0 },
    ],
  },
  {
    id: 'pillows',
    label: 'Pillow menu',
    emoji: '🪶',
    type: 'select',
    options: [
      { value: 'standard',     label: 'Standard',       emoji: '🪶', priceDelta: null },
      { value: 'firm',         label: 'Firm',           emoji: '🪨', priceDelta: null },
      { value: 'feather',      label: 'Feather',        emoji: '🦢', priceDelta: null },
      { value: 'memory-foam',  label: 'Memory foam',    emoji: '💤', priceDelta: null },
    ],
  },

  // ── Room ────────────────────────────────────────────────────────
  {
    id: 'floor',
    label: 'Floor',
    emoji: '🏢',
    type: 'select',
    options: [
      { value: 'low',  label: 'Low floor',  sublabel: 'Floors 1–5',   emoji: '🌱', priceDelta: 0 },
      { value: 'mid',  label: 'Mid floor',  sublabel: 'Floors 6–12',  emoji: '🏙️', priceDelta: 15 },
      { value: 'high', label: 'High floor', sublabel: 'Floors 13–20', emoji: '☁️', priceDelta: 30 },
    ],
  },
  {
    id: 'view',
    label: 'View',
    emoji: '🌇',
    type: 'select',
    options: [
      { value: 'courtyard', label: 'Courtyard',   emoji: '🌿', priceDelta: 0 },
      { value: 'city',      label: 'City view',   emoji: '🏙️', priceDelta: 20 },
      { value: 'marina',    label: 'Marina view', emoji: '🌊', priceDelta: 40 },
    ],
  },
  {
    id: 'balcony',
    label: 'Balcony',
    emoji: '🌅',
    type: 'toggle',
    options: [
      { value: false, label: 'No balcony', emoji: '🚫', priceDelta: 0 },
      { value: true,  label: 'Balcony',    emoji: '🌅', priceDelta: 25 },
    ],
  },

  // ── Bathroom & Living ───────────────────────────────────────────
  {
    id: 'bathroom',
    label: 'Bathroom',
    emoji: '🚿',
    type: 'select',
    options: [
      { value: 'shower',          label: 'Shower',                        emoji: '🚿', priceDelta: 0 },
      { value: 'bathtub',         label: 'Bathtub + shower',              emoji: '🛁', priceDelta: 20 },
      { value: 'sep-bath-walkin', label: 'Separate bath + walk-in shower', emoji: '🛁', priceDelta: 35 },
    ],
  },
  {
    id: 'livingArea',
    label: 'Living area',
    emoji: '🛋️',
    type: 'toggle',
    options: [
      { value: false, label: 'No separate area', emoji: '🚫', priceDelta: 0 },
      { value: true,  label: 'Separate lounge',  emoji: '🛋️', priceDelta: 30 },
    ],
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    emoji: '🍳',
    type: 'toggle',
    options: [
      { value: false, label: 'No kitchenette', emoji: '🚫', priceDelta: 0 },
      { value: true,  label: 'Kitchenette',    emoji: '🍳', priceDelta: 30 },
    ],
  },
  {
    id: 'laundry',
    label: 'In-room laundry',
    emoji: '🧺',
    type: 'toggle',
    options: [
      { value: false, label: 'No laundry',            emoji: '🚫', priceDelta: 0 },
      { value: true,  label: 'In-room washer & dryer',  emoji: '🧺', priceDelta: 28 },
    ],
  },

  // ── Stay ────────────────────────────────────────────────────────
  {
    id: 'facilityAccess',
    label: 'Facilities',
    emoji: '🏊',
    type: 'select',
    options: [
      { value: 'room-only', label: 'Room only',          emoji: '🔑', priceDelta: 0 },
      { value: 'pool-gym',  label: 'Pool + Gym access',  emoji: '🏊', priceDelta: 22 },
    ],
  },

  // ── Requirements ────────────────────────────────────────────────
  {
    id: 'accessibility',
    label: 'Accessibility',
    emoji: '♿',
    type: 'toggle',
    options: [
      { value: false, label: 'Standard room',   emoji: '🚶', priceDelta: null },
      { value: true,  label: 'Accessible room', emoji: '♿', priceDelta: null },
    ],
  },
]

export const conflicts = [
  {
    attributes: ['accessibility:true', 'floor:high'],
    message: 'Accessible rooms are on low floors only.',
  },
  {
    attributes: ['connecting:true', 'balcony:true'],
    message: "Connecting rooms don't include a balcony.",
  },
  {
    // Fires when kitchen is true and bedding contains ONLY twin (no king or double)
    attributes: ['kitchen:true', 'bedding:twin-only'],
    message: 'Kitchenette is only available with a king or double bed.',
  },
  {
    attributes: ['livingArea:true', 'roomCategory:standard'],
    message: 'A separate lounge is only available in Superior or Deluxe rooms.',
  },
]
