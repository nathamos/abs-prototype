import { Fragment } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { rooms } from '../../data/rooms'
import { attributes } from '../../data/attributes'
import StepHeader from '../../components/shared/StepHeader'

const NIGHTS = 3

const COMPARE_ROOMS = rooms.filter((r) => r.id !== 'accessible-standard')

const ROWS = [
  { id: 'bedding',        label: 'Bed type' },
  { id: 'occupancy',      label: 'Guests' },
  { id: 'size',           label: 'Room size' },
  { id: 'floor',          label: 'Floor' },
  { id: 'view',           label: 'View' },
  { id: 'balcony',        label: 'Balcony' },
  { id: 'bathroom',       label: 'Bathroom' },
  { id: 'livingArea',     label: 'Living area' },
  { id: 'kitchen',        label: 'Kitchen' },
  { id: 'laundry',        label: 'In-room laundry' },
  { id: 'facilityAccess', label: 'Facilities' },
]

function getCellValues(room, attrId) {
  if (attrId === 'size') return [{ label: `${room.size} m²` }]

  const roomVal = room.attributes[attrId]
  const attr = attributes.find((a) => a.id === attrId)
  if (!attr) return null

  if (attr.type === 'multiselect') {
    const vals = Array.isArray(roomVal) ? roomVal : [roomVal]
    return vals
      .map((v) => {
        const opt = attr.options.find((o) => o.value === v)
        return opt ? { label: opt.label } : null
      })
      .filter(Boolean)
  }

  if (attr.type === 'toggle') {
    if (!roomVal) return null
    const opt = attr.options.find((o) => o.value === true)
    return opt ? [{ label: opt.label }] : null
  }

  const opt = attr.options.find((o) => o.value === roomVal)
  return opt ? [{ label: opt.label }] : null
}

function Chip({ label }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        lineHeight: 1.5,
      }}
    >
      {label}
    </span>
  )
}

export default function Rooms() {
  const { setters } = useOutletContext()
  const navigate = useNavigate()

  function handleSelect(room) {
    setters.setSelectedRoom(room)
    navigate('/flow-e/itinerary')
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <StepHeader
        step={1}
        totalSteps={3}
        title="Compare rooms"
        subtitle="Select the room tier that's right for your stay."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '130px repeat(4, 1fr)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--color-surface)',
        }}
      >
        {/* ── Header row: images + names ── */}
        <div style={{ background: 'var(--color-surface)', padding: '12px' }} />

        {COMPARE_ROOMS.map((room) => (
          <div
            key={room.id}
            style={{ borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          >
            <div style={{ height: 110, overflow: 'hidden' }}>
              <img
                src={room.image}
                alt={room.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'var(--color-text-primary)',
                  marginBottom: 3,
                }}
              >
                {room.name}
              </p>
              {room.badge && (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 7px',
                  }}
                >
                  {room.badge}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* ── Attribute rows ── */}
        {ROWS.map((row, rowIndex) => {
          const rowBg = rowIndex % 2 === 0 ? 'var(--color-bg)' : 'var(--color-surface)'
          return (
            <Fragment key={row.id}>
              <div
                style={{
                  padding: '10px 12px',
                  background: rowBg,
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {row.label}
                </span>
              </div>

              {COMPARE_ROOMS.map((room) => {
                const values = getCellValues(room, row.id)
                return (
                  <div
                    key={room.id}
                    style={{
                      padding: '10px 12px',
                      background: rowBg,
                      borderTop: '1px solid var(--color-border)',
                      borderLeft: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 4,
                      minHeight: 44,
                    }}
                  >
                    {values ? (
                      values.map((v, i) => <Chip key={i} label={v.label} />)
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>—</span>
                    )}
                  </div>
                )
              })}
            </Fragment>
          )
        })}

        {/* ── Footer: price + CTA ── */}
        <div
          style={{
            padding: '16px 12px',
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
          }}
        />

        {COMPARE_ROOMS.map((room) => (
          <div
            key={room.id}
            style={{
              padding: '16px 12px',
              background: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 1 }}>
              SGD {room.basePricePerNight}
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)' }}>/night</span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              SGD {room.basePricePerNight * NIGHTS} total
            </p>
            <button
              onClick={() => handleSelect(room)}
              className="transition-opacity hover:opacity-90"
              style={{
                width: '100%',
                padding: '11px',
                background: 'var(--color-text-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Select →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
