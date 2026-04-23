import { useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import StepHeader from '../../components/shared/StepHeader'
import AttributePill from '../../components/shared/AttributePill'
import { rooms } from '../../data/rooms'
import { attributes, conflicts } from '../../data/attributes'
import { findBestRoom, getActiveConflict as getActiveConflictFn } from '../../data/roomMatching'

const NIGHTS = 3

const sectionGroups = [
  {
    label: 'YOUR ROOM',
    ids: ['floor', 'view', 'balcony'],
  },
  {
    label: 'YOUR BED',
    ids: ['bedding', 'pillows'],
  },
  {
    label: 'YOUR BATHROOM & LIVING SPACE',
    ids: ['bathroom', 'livingArea', 'kitchen', 'laundry'],
  },
]




export default function Rooms() {
  const { selectedAttributes, setSelectedAttributes, setSelectedRoom, priced } = useOutletContext()
  const navigate = useNavigate()

  const matchedRoom = useMemo(() => findBestRoom(rooms, selectedAttributes), [selectedAttributes])
  const activeConflict = useMemo(() => getActiveConflictFn(conflicts, selectedAttributes), [selectedAttributes])
  const roomTotal = matchedRoom.basePricePerNight * NIGHTS

  const attrTotalPerNight = useMemo(() => {
    const displayedIds = sectionGroups.flatMap((g) => g.ids)
    let total = 0
    for (const attr of attributes) {
      if (!displayedIds.includes(attr.id)) continue
      const val = selectedAttributes[attr.id]
      if (val === undefined) continue
      if (Array.isArray(val)) {
        for (const v of val) {
          const opt = attr.options.find((o) => o.value === v)
          if (opt?.priceDelta) total += opt.priceDelta
        }
      } else {
        const opt = attr.options.find((o) => o.value === val)
        if (opt?.priceDelta) total += opt.priceDelta
      }
    }
    return total
  }, [selectedAttributes])

  function handlePillClick(attrId, value) {
    if (attrId === 'bedding') {
      setSelectedAttributes((prev) => {
        const current = Array.isArray(prev.bedding) ? prev.bedding : [prev.bedding]
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        // Keep at least one bed selected
        return { ...prev, bedding: next.length > 0 ? next : current }
      })
    } else {
      setSelectedAttributes((prev) => ({ ...prev, [attrId]: value }))
    }
  }

  function handleBook() {
    if (activeConflict) return
    setSelectedRoom(matchedRoom)
    navigate('../services')
  }

  // Collect selected pills for display
  const selectedPills = useMemo(() => {
    const pills = []
    for (const attr of attributes) {
      const val = selectedAttributes[attr.id]
      if (val === undefined) continue
      // Handle multi-select (array) attributes
      if (Array.isArray(val)) {
        for (const v of val) {
          const opt = attr.options.find((o) => o.value === v)
          if (opt && opt.emoji !== '🚫') pills.push({ label: opt.label, emoji: opt.emoji })
        }
        continue
      }
      const opt = attr.options.find((o) => o.value === val)
      if (opt && opt.emoji !== '🚫') pills.push({ label: opt.label, emoji: opt.emoji })
    }
    return pills
  }, [selectedAttributes])


  return (
    <div className="max-w-[1000px] mx-auto">
      <div
        className="flex gap-6 px-6 py-8 items-start"
        style={{ flexDirection: 'row' }}
      >
        {/* Left column — attribute checklist */}
        <div style={{ flex: '0 0 55%', paddingBottom: '120px' }}>
          <StepHeader
            step={1}
            totalSteps={3}
            title="Build your room"
            subtitle="Choose the attributes that matter to you."
          />

          <div className="flex flex-col gap-8">
            {sectionGroups.map((group) => (
              <div key={group.label}>
                <p
                  className="mb-4"
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {group.label}
                </p>
                <div className="flex flex-col gap-5">
                  {group.ids.map((attrId) => {
                    const attr = attributes.find((a) => a.id === attrId)
                    if (!attr) return null
                    return (
                      <div key={attrId}>
                        <p
                          className="mb-2"
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {attr.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {attr.options.map((opt) => (
                            <AttributePill
                              key={String(opt.value)}
                              label={opt.label}
                              selected={
                                attrId === 'bedding'
                                  ? (Array.isArray(selectedAttributes.bedding) ? selectedAttributes.bedding.includes(opt.value) : selectedAttributes.bedding === opt.value)
                                  : selectedAttributes[attrId] === opt.value
                              }
                              onClick={() => handlePillClick(attrId, opt.value)}
                              priceDelta={opt.priceDelta}
                              showPrice={priced}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Accessibility toggle */}
            <div>
              <p
                className="mb-4"
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                ACCESSIBILITY
              </p>
              <button
                onClick={() =>
                  setSelectedAttributes((prev) => ({ ...prev, accessibility: !prev.accessibility }))
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: selectedAttributes.accessibility
                    ? 'none'
                    : '1.5px solid var(--color-border)',
                  background: selectedAttributes.accessibility
                    ? 'var(--color-teal)'
                    : 'var(--color-surface)',
                  color: selectedAttributes.accessibility
                    ? 'white'
                    : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
              >
                ♿
              </button>
            </div>
          </div>
        </div>

        {/* Right column — booking card */}
        <div style={{ flex: '0 0 45%', position: 'sticky', top: '24px' }}>
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {/* Header */}
            <p
              style={{
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.12em',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              YOUR ROOM
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}
            >
              {matchedRoom.name}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              {matchedRoom.tagline}
            </p>
            <img
              src={matchedRoom.image}
              alt={matchedRoom.name}
              className="w-full object-cover rounded-lg mt-2"
              style={{ height: '144px', borderRadius: 'var(--radius-md)' }}
            />

            {/* Unpriced: pill list + price */}
            {!priced && (
              <div className="mt-4">
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Selected attributes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPills.map((pill, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-teal-light)',
                        color: 'var(--color-teal)',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      {pill.label}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    height: '1px',
                    background: 'var(--color-border)',
                    margin: '12px 0 10px',
                  }}
                />
                <div className="flex justify-between text-sm font-semibold">
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Room total ({NIGHTS} nights)
                  </span>
                  <span style={{ color: 'var(--color-text-primary)' }}>SGD {roomTotal}</span>
                </div>
              </div>
            )}

            {/* Priced: room base + attribute upgrades */}
            {priced && (
              <div className="mt-4">
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0 10px' }} />
                {attrTotalPerNight > 0 ? (
                  <>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        Base room · {NIGHTS} nights
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>SGD {roomTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        Room upgrades · {NIGHTS} nights
                      </span>
                      <span style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
                        +SGD {attrTotalPerNight * NIGHTS}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0 8px' }} />
                    <div className="flex justify-between text-sm font-semibold">
                      <span style={{ color: 'var(--color-text-primary)' }}>Room total</span>
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        SGD {(matchedRoom.basePricePerNight + attrTotalPerNight) * NIGHTS}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm font-semibold">
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      Room total ({NIGHTS} nights)
                    </span>
                    <span style={{ color: 'var(--color-text-primary)' }}>SGD {roomTotal}</span>
                  </div>
                )}
              </div>
            )}

            {/* Conflict alert */}
            {activeConflict && (
              <div
                className="mt-4"
                style={{
                  background: 'var(--color-danger-light)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-danger)' }}
                >
                  ⚠ Conflict detected
                </p>
                <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                  {activeConflict.message}
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleBook}
              disabled={!!activeConflict}
              className="w-full text-base font-semibold text-white transition-opacity hover:opacity-90 mt-4"
              style={{
                background: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                opacity: activeConflict ? 0.5 : 1,
                cursor: activeConflict ? 'not-allowed' : 'pointer',
              }}
            >
              Book this room →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
