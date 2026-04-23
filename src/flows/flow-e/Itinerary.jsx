import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StepHeader from '../../components/shared/StepHeader'

// Curated timed-event services for the itinerary flow.
// Every item here represents a bookable event with a clear start time.
const FLOW_E_CATEGORIES = [
  {
    id: 'food-drink',
    label: 'Food & drink',
    emoji: '🍽️',
    items: [
      { id: 'breakfast-in-bed', name: 'Breakfast in bed', description: 'Delivered to your room at a time of your choice.', emoji: '☕', price: 22 },
      { id: 'in-room-chef', name: 'In-room chef dinner', description: 'A private chef cooks a three-course dinner for two in your room.', emoji: '👨‍🍳', price: 220 },
    ],
  },
  {
    id: 'housekeeping',
    label: 'Housekeeping',
    emoji: '🛎️',
    items: [
      { id: 'turndown', name: 'Turndown service', description: 'Evening room preparation at your chosen time.', emoji: '🌙', price: 18 },
      { id: 'express-laundry', name: 'Express laundry pickup', description: 'Laundry collected and returned same day.', emoji: '👜', price: 28 },
    ],
  },
  {
    id: 'wellness',
    label: 'Wellness & leisure',
    emoji: '🧘',
    items: [
      { id: 'personal-training', name: 'Personal training — 1 hr', description: '60-minute session with a certified trainer at the gym.', emoji: '🏋️', price: 75 },
      { id: 'spa-treatment', name: 'Spa treatment — 60 min', description: 'Massage, facial, or body wrap — booked to a specific time.', emoji: '🐯', price: 95 },
    ],
  },
  {
    id: 'welcome-arrival',
    label: 'Welcome & arrival',
    emoji: '💐',
    items: [
      { id: 'welcome-amenity', name: 'Welcome amenity', description: 'Seasonal fruit and cold drinks ready in your room on arrival.', emoji: '🍓', price: 18 },
      { id: 'bottle-wine', name: 'Bottle of wine', description: 'A selected bottle delivered to your room.', emoji: '🍷', price: 45 },
      { id: 'occasion-setup', name: 'Occasion setup', description: 'Flowers, balloons, and personalised message — set up before you arrive.', emoji: '🎉', price: 68 },
    ],
  },
  {
    id: 'experiences',
    label: 'Experiences & local',
    emoji: '🚲',
    items: [
      { id: 'bike-hire', name: 'Bike hire — 1 day', description: 'Two bikes, ready at your chosen start time.', emoji: '🚴', price: 30 },
      { id: 'cultural-tour', name: 'Cultural walking tour — 2 hrs', description: 'Guided tour of Chinatown and the civic district.', emoji: '🗺️', price: 55 },
      { id: 'cooking-class', name: 'Hawker cooking class — 3 hrs', description: 'Cook two Singaporean dishes with a local chef.', emoji: '🍜', price: 85 },
    ],
  },
  {
    id: 'connectivity',
    label: 'Connectivity & workspace',
    emoji: '💼',
    items: [
      { id: 'desk-setup', name: 'Ergonomic desk setup', description: 'External monitor, keyboard, and mouse — delivered to your room.', emoji: '🖥️', price: 35 },
      { id: 'meeting-room', name: 'Meeting room — half day', description: 'Private meeting room for up to 4 with AV and refreshments.', emoji: '📋', price: 120 },
    ],
  },
  {
    id: 'family',
    label: 'Family & accessibility',
    emoji: '👶',
    items: [
      { id: 'cot', name: 'Travel cot setup', description: 'Cot with fresh linen, set up in your room at a specific time.', emoji: '🍼', price: 20 },
      { id: 'extra-bed', name: 'Extra rollaway bed', description: 'Delivered and set up at your preferred time.', emoji: '🛏️', price: 35 },
      { id: 'baby-kit', name: 'Baby amenity kit delivery', description: 'Bottle warmer, bath products, and changing mat.', emoji: '🧸', price: 15 },
    ],
  },
  {
    id: 'personalised',
    label: 'Personalised service',
    emoji: '🤵',
    items: [
      { id: 'airport-transfer', name: 'Airport transfer', description: 'Private car to or from Changi Airport — set a specific pickup time.', emoji: '🚗', price: 55 },
    ],
  },
]

function buildServiceMap() {
  const map = {}
  FLOW_E_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => { map[item.id] = item })
  })
  return map
}
const SERVICE_MAP = buildServiceMap()

const STANDARD_IDS = new Set(['daily-breakfast', 'daily-housekeeping', 'gym-access'])

const TIME_OPTIONS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
]

const CHECK_IN_TIME  = '3:00 PM'
const CHECK_OUT_TIME = '12:00 PM'

// ─── Service Sheet ────────────────────────────────────────────────────────────
// 2-step sheet: pick a service → pick a time

function ServiceSheet({ dayLabel, onAdd, onClose }) {
  const [step, setStep]               = useState('pick-service')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedTime, setSelectedTime] = useState('9:00 AM')
  const [openCat, setOpenCat]         = useState(null)

  function handleSelectItem(item) {
    setSelectedItem(item)
    setSelectedTime('9:00 AM')
    setStep('pick-time')
  }

  function handleConfirm() {
    onAdd(selectedItem, selectedTime)
    // Return to service list so the user can keep adding
    setStep('pick-service')
    setSelectedItem(null)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-surface)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: 'var(--color-border)', borderRadius: 2, margin: '16px auto 0', flexShrink: 0 }} />

        <AnimatePresence mode="wait" initial={false}>
          {step === 'pick-service' ? (
            // ── Step 1: pick a service ──────────────────────────────────────
            <motion.div
              key="pick-service"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              <div className="flex items-center justify-between" style={{ padding: '14px 20px 12px', flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                    Add to {dayLabel}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    Select an activity or service
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: 'var(--color-surface-alt)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                {FLOW_E_CATEGORIES.map((cat) => {
                  const isOpen = openCat === cat.id
                  // Filter standard inclusions from the add sheet
                  const items = cat.items
                  if (items.length === 0) return null
                  return (
                    <div key={cat.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <button
                        onClick={() => setOpenCat(isOpen ? null : cat.id)}
                        className="w-full text-left flex items-center justify-between"
                        style={{ padding: '13px 20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{cat.label}</span>
                        </div>
                        <motion.span
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ display: 'inline-block', color: 'var(--color-text-tertiary)', fontSize: 18 }}
                        >
                          ›
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            {items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                className="w-full text-left flex items-start justify-between"
                                style={{
                                  padding: '11px 20px 11px 44px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderTop: '1px solid var(--color-border)',
                                  cursor: 'pointer',
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: 'var(--radius-md)',
                                      background: 'var(--color-surface-alt)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 16,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {item.emoji}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                                      {item.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                      {item.description}
                                    </div>
                                  </div>
                                </div>
                                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', marginLeft: 12, marginTop: 4, flexShrink: 0 }}>
                                  {item.price === 0 ? 'Incl.' : `+SGD ${item.price}`}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
                <div style={{ height: 32 }} />
              </div>
            </motion.div>
          ) : (
            // ── Step 2: pick a time ─────────────────────────────────────────
            <motion.div
              key="pick-time"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              <div style={{ padding: '14px 20px 12px', flexShrink: 0 }}>
                <button
                  onClick={() => { setStep('pick-service'); setSelectedItem(null) }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-tertiary)', padding: 0, marginBottom: 10, display: 'block' }}
                >
                  ← Back
                </button>
                <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                  What time?
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {selectedItem?.name} · {dayLabel}
                </div>
              </div>

              {/* Selected service preview */}
              <div style={{ margin: '0 20px 16px', padding: '12px 14px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{selectedItem?.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedItem?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {selectedItem?.price === 0 ? 'Included' : `+SGD ${selectedItem?.price}`}
                  </div>
                </div>
              </div>

              {/* Time grid */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 16 }}>
                  {TIME_OPTIONS.map((t) => {
                    const isSelected = selectedTime === t
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-full)',
                          border: isSelected ? '1.5px solid var(--color-teal)' : '1.5px solid var(--color-border)',
                          background: isSelected ? 'var(--color-teal-light)' : 'transparent',
                          color: isSelected ? 'var(--color-teal)' : 'var(--color-text-secondary)',
                          fontSize: 13,
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                <button
                  onClick={handleConfirm}
                  style={{
                    width: '100%',
                    background: 'var(--color-teal)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add at {selectedTime}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ─── Timeline row ─────────────────────────────────────────────────────────────

function TimelineRow({ time, label, emoji, price, isHighlighted, showLine, onRemove }) {
  const dotSize = isHighlighted ? 11 : 9

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Left: dot + connecting line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: isHighlighted ? 'var(--color-teal)' : 'var(--color-border)',
            marginTop: isHighlighted ? 14 : 15,
            flexShrink: 0,
          }}
        />
        {showLine && (
          <div style={{ flex: 1, width: 1.5, background: 'var(--color-border)', minHeight: 10 }} />
        )}
      </div>

      {/* Right: content */}
      <div style={{ flex: 1, paddingBottom: showLine ? 20 : 4, paddingTop: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: isHighlighted ? 12 : 13, marginBottom: 2 }}>
          {time}
        </div>
        {isHighlighted ? (
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</div>
        ) : (
          <div className="flex items-start justify-between" style={{ gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                {emoji && <span style={{ marginRight: 5 }}>{emoji}</span>}{label}
              </div>
              {price !== undefined && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {price === 0 ? 'Included' : `+SGD ${price}`}
                </div>
              )}
            </div>
            {onRemove && (
              <button
                onClick={onRemove}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-alt)',
                  color: 'var(--color-text-tertiary)',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Itinerary() {
  const { myServices, setters, bookingContext } = useOutletContext()
  const navigate = useNavigate()

  const [pickerDay, setPickerDay] = useState(null) // { day, dayLabel } | null

  function handleServiceAdd(item, time) {
    setters.setMyServices((prev) => [
      ...prev,
      { id: item.id, day: pickerDay.day, time },
    ])
  }

  function removeService(id, day, time) {
    setters.setMyServices((prev) =>
      prev.filter((s) => !(s.id === id && s.day === day && s.time === time))
    )
  }

  const checkIn = new Date(bookingContext.checkIn)
  const nights  = bookingContext.nights

  const allDays = Array.from({ length: nights + 1 }, (_, i) => {
    const d = new Date(checkIn)
    d.setDate(d.getDate() + i)
    const isCheckout = i === nights
    return {
      dayIndex: i,
      isCheckout,
      fullLabel:  d.toLocaleDateString('en-GB', { weekday: 'long',  day: 'numeric', month: 'long'  }),
      shortLabel: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    }
  })

  const standardInclusions = [
    { id: 'daily-breakfast',    emoji: '🥐', name: 'Daily breakfast' },
    { id: 'daily-housekeeping', emoji: '🛎️', name: 'Daily room service' },
    { id: 'gym-access',         emoji: '💪', name: 'Gym access' },
  ]

  return (
    <div style={{ paddingBottom: 100 }}>
      <StepHeader
        step={2}
        totalSteps={3}
        title="Build your itinerary"
        subtitle="Add activities and services to your stay, with specific times."
      />

      {/* Standard Inclusions band */}
      <div
        style={{
          background: 'var(--color-teal-light)',
          border: '1px solid var(--color-teal)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: 10 }}>
          Included with every night
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {standardInclusions.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{item.emoji}</span>
              <span style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 500 }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day sections */}
      {allDays.map(({ dayIndex, isCheckout, fullLabel, shortLabel }) => {
        // User-added services for this day, sorted chronologically
        const userServices = myServices
          .filter((s) => s.day === dayIndex && !STANDARD_IDS.has(s.id))
          .sort((a, b) => TIME_OPTIONS.indexOf(a.time) - TIME_OPTIONS.indexOf(b.time))

        // Build the ordered timeline rows for this day
        const rows = []

        if (dayIndex === 0) {
          rows.push({ key: 'checkin', type: 'event', time: CHECK_IN_TIME, label: 'Check-in' })
        }

        if (isCheckout) {
          rows.push({ key: 'checkout', type: 'event', time: CHECK_OUT_TIME, label: 'Check-out' })
        } else {
          userServices.forEach((s) => {
            const svc = SERVICE_MAP[s.id]
            if (svc) {
              rows.push({
                key:   `${s.id}-${s.day}-${s.time}`,
                type:  'service',
                time:  s.time,
                label: svc.name,
                emoji: svc.emoji,
                price: svc.price,
                id:    s.id,
                day:   s.day,
              })
            }
          })
        }

        return (
          <div key={dayIndex} style={{ marginBottom: 32 }}>
            {/* Day header */}
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
                {isCheckout ? `Check-out · ${shortLabel}` : fullLabel}
              </span>
            </div>

            {/* Timeline rows */}
            {rows.map((row, idx) => (
              <TimelineRow
                key={row.key}
                time={row.time}
                label={row.label}
                emoji={row.emoji}
                price={row.price}
                isHighlighted={row.type === 'event'}
                showLine={idx < rows.length - 1 || !isCheckout}
                onRemove={row.type === 'service' ? () => removeService(row.id, row.day, row.time) : undefined}
              />
            ))}

            {/* Add CTA (not on checkout day) */}
            {!isCheckout && (
              <button
                onClick={() => setPickerDay({ day: dayIndex, dayLabel: shortLabel })}
                className="flex items-center"
                style={{
                  gap: 10,
                  marginTop: userServices.length > 0 ? 8 : 12,
                  background: 'transparent',
                  border: '1px dashed var(--color-teal)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span style={{ color: 'var(--color-teal)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>+</span>
                <span style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
                  {userServices.length > 0 ? 'Add another activity' : 'Add an activity or service'}
                </span>
              </button>
            )}
          </div>
        )
      })}

      {/* Done */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => navigate('/flow-e/confirmation')}
          style={{
            width: '100%',
            background: 'var(--color-text-primary)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            padding: '15px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
          }}
          className="transition-opacity hover:opacity-90"
        >
          Review your trip →
        </button>
      </div>

      {/* Service picker sheet */}
      <AnimatePresence>
        {pickerDay && (
          <ServiceSheet
            dayLabel={pickerDay.dayLabel}
            onAdd={handleServiceAdd}
            onClose={() => setPickerDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
