import { useOutletContext, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { serviceCategories } from '../../data/services'
import StepHeader from '../../components/shared/StepHeader'
import BookingSummary from '../../components/shared/BookingSummary'

const allItems = serviceCategories.flatMap((c) => c.items)
const standardItems = allItems.filter((i) => i.standardInclusion)
const standardInclusionsPerNight = standardItems.reduce((sum, i) => sum + (i.price || 0), 0)

const bundles = [
  {
    id: 'minimal',
    name: 'Minimal – Room Only',
    description: 'Room access only. Standard inclusions (breakfast, housekeeping, gym) are not included.',
    serviceIds: [],
    emoji: null,
    noInclusions: true,
  },
  {
    id: 'room-only',
    name: 'Basic Room',
    description: 'The Straits experience — daily breakfast, housekeeping, and gym access included.',
    serviceIds: [],
    emoji: null,
  },
  {
    id: 'romantic',
    name: 'Romantic getaway',
    description: 'Everything for a special occasion.',
    serviceIds: ['bottle-wine', 'turndown', 'occasion-setup'],
    emoji: '💑',
  },
  {
    id: 'weekend',
    name: 'Weekend escape',
    description: 'Rest, relax, and recharge.',
    serviceIds: ['welcome-amenity', 'spa-access'],
    emoji: '🌿',
  },
  {
    id: 'work-trip',
    name: 'Work trip',
    description: 'A room that works as hard as you do.',
    serviceIds: ['premium-wifi', 'desk-setup', 'fnb-credit'],
    emoji: '💼',
  },
  {
    id: 'family',
    name: 'Family break',
    description: 'Room for everyone, and a little extra ease.',
    serviceIds: ['cot', 'baby-kit', 'extra-bed'],
    emoji: '👨‍👩‍👧',
  },
  {
    id: 'explorer',
    name: 'City explorer',
    description: "You're here for the city. Let's set you up.",
    serviceIds: ['cultural-tour', 'bike-hire', 'fnb-credit', 'welcome-amenity'],
    emoji: '🚲',
  },
]

// Build a flat map of serviceId -> item
function buildServiceMap() {
  const map = {}
  serviceCategories.forEach((cat) => {
    cat.items.forEach((item) => {
      map[item.id] = item
    })
  })
  return map
}

const serviceMap = buildServiceMap()

function getBundleServices(bundle) {
  return bundle.serviceIds.map((id) => serviceMap[id]).filter(Boolean)
}

function getBundleServicesTotal(bundle) {
  return getBundleServices(bundle).reduce((sum, svc) => sum + (svc.price || 0), 0)
}

function getBundleTotal(bundle, roomTotal) {
  return roomTotal + getBundleServicesTotal(bundle)
}

function getSavings(bundle, roomTotal) {
  const individual = getBundleServicesTotal(bundle)
  if (individual === 0) return 0
  const discounted = Math.round(individual * 0.88)
  return individual - discounted
}

export default function Services() {
  const { selectedRoom, selectedBundleId, setters, bookingContext } = useOutletContext()
  const navigate = useNavigate()

  const nights = bookingContext.nights
  const roomTotal = selectedRoom ? selectedRoom.basePricePerNight * nights : 0
  const roomName = selectedRoom ? selectedRoom.name : 'Your room'

  const selectedBundle = bundles.find((b) => b.id === selectedBundleId) || null

  function handleSelectBundle(bundleId) {
    setters.setSelectedBundleId(bundleId)
  }

  function handleContinue() {
    navigate('/flow-c/confirmation')
  }

  const minimalTotal = roomTotal - standardInclusionsPerNight * nights

  // Build BookingSummary selectedServices
  let summaryServices = []
  const isSimple = !selectedBundle || selectedBundle.id === 'room-only' || selectedBundle.id === 'minimal'
  if (selectedBundle && !isSimple) {
    summaryServices = getBundleServices(selectedBundle).map((svc) => ({
      id: svc.id,
      name: svc.name,
      price: svc.price,
    }))
  }

  const bundleServicesTotal = selectedBundle ? getBundleServicesTotal(selectedBundle) : 0
  const savings = !isSimple ? getSavings(selectedBundle, roomTotal) : 0
  const discountedServicesTotal = savings > 0 ? bundleServicesTotal - savings : bundleServicesTotal
  const summaryTotal = selectedBundle?.id === 'minimal'
    ? minimalTotal
    : roomTotal + (!isSimple ? discountedServicesTotal : 0)

  const checkIn = new Date(bookingContext.checkIn)
  const checkOut = new Date(bookingContext.checkOut)
  const checkInLabel = checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const checkOutLabel = checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div style={{ paddingBottom: 160 }}>
      <button
        onClick={() => navigate('/flow-c/rooms')}
        className="text-sm mb-3"
        style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        ← Back
      </button>
      <StepHeader
        step={2}
        totalSteps={3}
        title="How does your stay sound?"
        subtitle="Choose a bundle, or continue with room only."
      />

      {/* Context strip */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 24,
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>Room</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{roomName}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>Nights</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{nights}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>Room total</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>SGD {roomTotal}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>Dates</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{checkInLabel}–{checkOutLabel}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>Guests</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{bookingContext.guests} guests</div>
        </div>
      </div>

      {/* Standard inclusions banner */}
      <div
        style={{
          background: 'var(--color-teal-light)',
          border: '1px solid var(--color-teal)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: 10 }}>
          Included in all rooms ex. Minimal
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {standardItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 6 }}>{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle cards */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        {bundles.map((bundle) => {
          const isSelected = selectedBundleId === bundle.id
          const services = getBundleServices(bundle)
          const bundleTotal = getBundleTotal(bundle, roomTotal)
          const isBundleSimple = bundle.id === 'room-only' || bundle.id === 'minimal'
          const saving = !isBundleSimple ? getSavings(bundle, roomTotal) : 0
          const discountedTotal = saving > 0 ? bundleTotal - saving : bundleTotal
          const cardTotal = bundle.id === 'minimal' ? minimalTotal : roomTotal

          const selectBtnStyle = {
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-teal)',
            background: 'var(--color-teal-light)',
            border: '1px solid var(--color-teal)',
            borderRadius: 'var(--radius-md)',
            padding: '7px 16px',
            cursor: 'pointer',
          }

          if (isBundleSimple) {
            return (
              <motion.div
                key={bundle.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectBundle(bundle.id)}
                style={{
                  background: 'var(--color-surface)',
                  border: isSelected ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {bundle.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{bundle.description}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>SGD {cardTotal}</div>
                    {bundle.id === 'minimal' && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                        Save SGD {roomTotal - cardTotal} vs. Basic Room
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectBundle(bundle.id) }}
                    style={selectBtnStyle}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={bundle.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelectBundle(bundle.id)}
              style={{
                background: 'var(--color-surface)',
                border: isSelected ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  {bundle.emoji && <span style={{ marginRight: 8 }}>{bundle.emoji}</span>}
                  {bundle.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{bundle.description}</div>
              </div>

              {/* Item pills */}
              <div className="flex flex-wrap gap-2">
                {services.map((svc) => (
                  <span
                    key={svc.id}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-surface-alt)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      padding: '5px 11px',
                    }}
                  >
                    {svc.name}
                  </span>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    SGD {discountedTotal}
                  </div>
                  {saving > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--color-positive)', fontWeight: 500, marginTop: 2 }}>
                      Save SGD {saving} vs. booking à la carte
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSelectBundle(bundle.id) }}
                  style={selectBtnStyle}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Sticky BookingSummary */}
      {selectedBundleId && (
        <BookingSummary
          roomName={roomName}
          nights={nights}
          roomTotal={roomTotal}
          selectedServices={summaryServices}
          total={summaryTotal}
          onContinue={handleContinue}
          ctaLabel="Continue to payment ↗"
        />
      )}
    </div>
  )
}
