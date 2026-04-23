import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { rooms } from '../../data/rooms'
import StepHeader from '../../components/shared/StepHeader'
import AttributePill from '../../components/shared/AttributePill'

// ── Label maps for read-only room fact display ───────────────────────────────

const BED_LABELS = {
  king: 'King bed', queen: 'Queen bed', twin: 'Twin beds',
  double: 'Double bed', sofa: 'Sofa bed',
}
const VIEW_LABELS = {
  city: 'City view', marina: 'Marina view', courtyard: 'Courtyard view',
}
const BATH_LABELS = {
  shower: 'Shower',
  bathtub: 'Bathtub + shower',
  'sep-bath-walkin': 'Separate bath + walk-in shower',
}

// ── Preference options (hotel can honour these for any room) ─────────────────

const FLOOR_OPTIONS = [
  { value: 'low',  label: 'Low floor' },
  { value: 'mid',  label: 'Mid floor' },
  { value: 'high', label: 'High floor' },
]

const PILLOW_OPTIONS = [
  { value: 'standard',    label: 'Standard' },
  { value: 'firm',        label: 'Firm' },
  { value: 'feather',     label: 'Feather' },
  { value: 'memory-foam', label: 'Memory foam' },
]

// Chip style for read-only structural attributes
const infoChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 12px',
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-surface-alt)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-secondary)',
  fontSize: 13,
  fontWeight: 500,
}

function initLocalAttrs(room) {
  return {
    floor: room.attributes.floor || 'mid',
    pillows: room.attributes.pillows || 'standard',
  }
}

export default function Rooms() {
  const { bookingContext, setters } = useOutletContext()
  const navigate = useNavigate()

  const [expandedId, setExpandedId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const [localAttrs, setLocalAttrs] = useState(() => {
    const init = {}
    rooms.forEach((r) => {
      init[r.id] = initLocalAttrs(r)
    })
    return init
  })

  function toggleExpand(roomId) {
    setExpandedId((prev) => (prev === roomId ? null : roomId))
  }

  function setAttr(roomId, key, value) {
    setLocalAttrs((prev) => ({
      ...prev,
      [roomId]: { ...prev[roomId], [key]: value },
    }))
  }

  function handleSelect(room) {
    setters.setSelectedRoom(room)
    setters.setSelectedRoomAttributes(localAttrs[room.id])
    setSelectedId(room.id)
    setExpandedId(null)
    setTimeout(() => {
      navigate('/flow-c/services')
    }, 400)
  }

  const checkIn = new Date(bookingContext.checkIn)
  const checkOut = new Date(bookingContext.checkOut)
  const checkInLabel = checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const checkOutLabel = checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div style={{ paddingBottom: 120 }}>
      <StepHeader
        step={1}
        totalSteps={3}
        title="Choose your room"
        subtitle="Select a room, then personalise it to your stay."
      />

      {/* Booking context bar */}
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'CHECK-IN', value: checkInLabel },
          { label: 'CHECK-OUT', value: checkOutLabel },
          { label: 'GUESTS', value: `${bookingContext.guests} adults` },
        ].map((pill) => (
          <div
            key={pill.label}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              background: 'var(--color-surface)',
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 2 }}>
              {pill.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {pill.value}
            </div>
          </div>
        ))}
      </div>

      {/* Room cards */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {rooms.map((room) => {
          const isExpanded = expandedId === room.id
          const isSelected = selectedId === room.id
          const isDimmed = selectedId && selectedId !== room.id
          const attrs = room.attributes

          // Build structural fact chips for this room
          const factChips = [
            ...(Array.isArray(attrs.bedding) ? attrs.bedding : [attrs.bedding]).map((b) => BED_LABELS[b] ?? b),
            VIEW_LABELS[attrs.view] ?? attrs.view,
            BATH_LABELS[attrs.bathroom] ?? attrs.bathroom,
            ...(attrs.balcony    ? ['Private balcony']    : []),
            ...(attrs.livingArea ? ['Separate lounge']    : []),
            ...(attrs.kitchen    ? ['Kitchenette']        : []),
            ...(attrs.laundry    ? ['In-room washer & dryer'] : []),
          ]

          return (
            <div
              key={room.id}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: isSelected ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                overflow: 'hidden',
                opacity: isDimmed ? 0.6 : 1,
                transition: 'opacity 0.3s ease, border 0.2s ease',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative' }}>
                <img
                  src={room.image}
                  alt={room.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
                {room.badge && (
                  <span
                    style={{
                      position: 'absolute', top: 10, left: 10,
                      background: 'var(--color-surface)', color: 'var(--color-text-secondary)',
                      fontSize: 11, fontWeight: 600, padding: '4px 10px',
                      borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)',
                    }}
                  >
                    {room.badge}
                  </span>
                )}
              </div>

              {/* Header row — clickable to expand */}
              <button
                onClick={() => toggleExpand(room.id)}
                className="w-full text-left"
                style={{ padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {room.tagline}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {isSelected && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-teal)', background: 'var(--color-teal-light)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                        Selected ✓
                      </span>
                    )}
                    <motion.span
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'inline-block', color: 'var(--color-text-tertiary)', fontSize: 18 }}
                    >
                      ›
                    </motion.span>
                  </div>
                </div>
              </button>

              {/* Expand panel */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="expand"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-border)' }}>

                      {/* ── Room includes (structural facts — read-only) ── */}
                      <div style={{ marginTop: 16, marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                          Room includes
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {factChips.map((chip) => (
                            <span key={chip} style={infoChipStyle}>{chip}</span>
                          ))}
                        </div>
                      </div>

                      {/* ── Your preferences (hotel can honour) ── */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                          Your preferences
                        </div>

                        {/* Floor */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                            Floor
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {FLOOR_OPTIONS.map((opt) => (
                              <AttributePill
                                key={opt.value}
                                label={opt.label}
                                selected={localAttrs[room.id].floor === opt.value}
                                onClick={() => setAttr(room.id, 'floor', opt.value)}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Pillows */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                            Pillow menu
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {PILLOW_OPTIONS.map((opt) => (
                              <AttributePill
                                key={opt.value}
                                label={opt.label}
                                selected={localAttrs[room.id].pillows === opt.value}
                                onClick={() => setAttr(room.id, 'pillows', opt.value)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Select CTA */}
                      <button
                        onClick={() => handleSelect(room)}
                        className="w-full text-base font-semibold text-white transition-opacity hover:opacity-90"
                        style={{
                          background: 'var(--color-text-primary)',
                          borderRadius: 'var(--radius-md)',
                          padding: '15px 20px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Select {room.name} →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
