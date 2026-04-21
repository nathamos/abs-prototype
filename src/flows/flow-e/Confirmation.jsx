import { useOutletContext, useNavigate } from 'react-router-dom'
import { serviceCategories } from '../../data/services'

function buildServiceMap() {
  const map = {}
  serviceCategories.forEach((cat) => {
    cat.items.forEach((item) => { map[item.id] = item })
  })
  return map
}
const SERVICE_MAP = buildServiceMap()

const STANDARD_IDS = new Set(['daily-breakfast', 'daily-housekeeping', 'gym-access'])

function attrLabel(key, value) {
  const maps = {
    floor:    { low: 'Low floor', mid: 'Mid floor', high: 'High floor' },
    view:     { courtyard: 'Courtyard view', city: 'City view', marina: 'Marina view' },
    bedding:  { king: 'King bed', queen: 'Queen bed', twin: 'Twin beds', double: 'Double bed', sofa: 'Sofa bed' },
    bathroom: { shower: 'Shower', bathtub: 'Bathtub + shower', 'sep-bath-walkin': 'Walk-in shower' },
  }
  return maps[key]?.[value] ?? String(value)
}

export default function Confirmation() {
  const { selectedRoom, myServices, bookingContext } = useOutletContext()
  const navigate = useNavigate()

  const nights = bookingContext.nights
  const checkIn = new Date(bookingContext.checkIn)
  const checkOut = new Date(bookingContext.checkOut)
  const checkInLabel  = checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const checkOutLabel = checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const userServices  = myServices.filter((s) => !STANDARD_IDS.has(s.id))
  const roomTotal     = selectedRoom ? selectedRoom.basePricePerNight * nights : 0
  const servicesTotal = userServices.reduce((sum, { id }) => sum + (SERVICE_MAP[id]?.price || 0), 0)
  const grandTotal    = roomTotal + servicesTotal

  // Build day structure matching itinerary
  const allDays = Array.from({ length: nights + 1 }, (_, i) => {
    const d = new Date(checkIn)
    d.setDate(d.getDate() + i)
    const isCheckout = i === nights
    return {
      dayIndex: i,
      isCheckout,
      shortLabel: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    }
  })

  const cardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: 12,
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
          Review your trip
        </p>
        <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {bookingContext.property}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {checkInLabel} – {checkOutLabel} · {nights} nights · {bookingContext.guests} guests
        </p>
      </div>

      {/* Room card */}
      <div style={cardStyle}>
        {selectedRoom?.image && (
          <img
            src={selectedRoom.image}
            alt={selectedRoom?.name}
            style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
          />
        )}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
            Your room
          </div>
          <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            {selectedRoom ? `${selectedRoom.name} at ${bookingContext.property}` : 'No room selected'}
          </div>
          {selectedRoom && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: '🌇', label: 'View',     value: attrLabel('view',     selectedRoom.attributes.view) },
                { icon: '🛏️', label: 'Bed',      value: selectedRoom.attributes.bedding.map((b) => attrLabel('bedding', b)).join(' · ') },
                { icon: '🚿', label: 'Bathroom', value: attrLabel('bathroom', selectedRoom.attributes.bathroom) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13 }}>{row.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary */}
      <div style={cardStyle}>
        <div style={{ padding: '16px 20px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
            Your itinerary
          </div>
        </div>

        {/* Standard inclusions band */}
        <div
          style={{
            margin: '0 16px 12px',
            background: 'var(--color-teal-light)',
            border: '1px solid var(--color-teal)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: 8 }}>
            Included every night
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['daily-breakfast', 'daily-housekeeping', 'gym-access'].map((id) => {
              const svc = SERVICE_MAP[id]
              if (!svc) return null
              return (
                <span key={id} style={{ fontSize: 12, color: 'var(--color-teal)', fontWeight: 500 }}>
                  {svc.emoji} {svc.name}
                </span>
              )
            })}
          </div>
        </div>

        {/* User-added services by day */}
        {allDays.map(({ dayIndex, isCheckout, shortLabel }) => {
          const dayServices = userServices
            .filter((s) => s.day === dayIndex)
            .sort((a, b) => {
              const times = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM']
              return times.indexOf(a.time) - times.indexOf(b.time)
            })
          if (dayServices.length === 0) return null

          return (
            <div key={dayIndex}>
              <div
                style={{
                  padding: '8px 20px',
                  background: 'var(--color-surface-alt)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                {isCheckout ? `Check-out · ${shortLabel}` : shortLabel}
              </div>

              {dayServices.map(({ id, day, time }) => {
                const svc = SERVICE_MAP[id]
                if (!svc) return null
                return (
                  <div
                    key={`${id}-${day}-${time}`}
                    className="flex items-center justify-between"
                    style={{ padding: '9px 20px', borderTop: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-surface-alt)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {svc.emoji}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {svc.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{time}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0, marginLeft: 12 }}>
                      {svc.price === 0 ? 'Incl.' : `+SGD ${svc.price}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}

        <div style={{ height: 4 }} />
      </div>

      {/* Price breakdown */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Price breakdown
        </div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {selectedRoom?.name} · {nights} nights
            </span>
            <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>SGD {roomTotal}</span>
          </div>
          {servicesTotal > 0 && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                Itinerary add-ons ({userServices.length} item{userServices.length !== 1 ? 's' : ''})
              </span>
              <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>SGD {servicesTotal}</span>
            </div>
          )}
          <div
            className="flex items-center justify-between"
            style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>SGD {grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => navigate('/complete')}
        style={{
          width: '100%',
          background: 'var(--color-text-primary)',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 12,
        }}
        className="transition-opacity hover:opacity-90"
      >
        Confirm booking
      </button>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/flow-e/itinerary')}
          style={{
            flex: 1,
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}
          className="transition-opacity hover:opacity-70"
        >
          ← Edit itinerary
        </button>
        <button
          onClick={() => navigate('/flow-e')}
          style={{
            flex: 1,
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}
          className="transition-opacity hover:opacity-70"
        >
          Start over
        </button>
      </div>
    </div>
  )
}
