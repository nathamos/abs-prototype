import { useState, useMemo, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import RoomCard from '../../components/shared/RoomCard'
import StepHeader from '../../components/shared/StepHeader'
import AttributePill from '../../components/shared/AttributePill'
import { rooms } from '../../data/rooms'
import { attributes } from '../../data/attributes'

const beddingAttr = attributes.find((a) => a.id === 'bedding')
const pillowsAttr = attributes.find((a) => a.id === 'pillows')
const viewAttr = attributes.find((a) => a.id === 'view')
const floorAttr = attributes.find((a) => a.id === 'floor')
const bathroomAttr = attributes.find((a) => a.id === 'bathroom')


function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

export default function Rooms() {
  const { selectedRoom, setSelectedRoom } = useOutletContext()
  const navigate = useNavigate()

  const [bedFilters, setBedFilters] = useState({ bedding: [], pillows: [] })
  const [amenityFilters, setAmenityFilters] = useState({
    view: [],
    floor: [],
    bathroom: [],
    balcony: null,
    livingArea: null,
    kitchen: null,
    laundry: null,
  })
  const [accessibilityFilter, setAccessibilityFilter] = useState(false)
  const [sort, setSort] = useState('best')
  const [openDropdown, setOpenDropdown] = useState(null) // 'beds' | 'amenities' | null

  const bedsRef = useRef(null)
  const amenitiesRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (
        openDropdown === 'beds' &&
        bedsRef.current &&
        !bedsRef.current.contains(e.target)
      ) {
        setOpenDropdown(null)
      } else if (
        openDropdown === 'amenities' &&
        amenitiesRef.current &&
        !amenitiesRef.current.contains(e.target)
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [openDropdown])

  function getBedFilterCount() {
    return bedFilters.bedding.length + bedFilters.pillows.length
  }

  function getAmenityFilterCount() {
    return (
      amenityFilters.view.length +
      amenityFilters.floor.length +
      amenityFilters.bathroom.length +
      (amenityFilters.balcony !== null ? 1 : 0) +
      (amenityFilters.livingArea !== null ? 1 : 0) +
      (amenityFilters.kitchen !== null ? 1 : 0) +
      (amenityFilters.laundry !== null ? 1 : 0)
    )
  }

  function getActiveFilterCount() {
    return getBedFilterCount() + getAmenityFilterCount() + (accessibilityFilter ? 1 : 0)
  }

  function clearAllFilters() {
    setBedFilters({ bedding: [], pillows: [] })
    setAmenityFilters({
      view: [],
      floor: [],
      bathroom: [],
      balcony: null,
      livingArea: null,
      kitchen: null,
      laundry: null,
    })
    setAccessibilityFilter(false)
  }

  // Build active filter dimensions for matching
  const activeFilterDimensions = useMemo(() => {
    const dims = []
    if (bedFilters.bedding.length) dims.push({ key: 'bedding', type: 'multi', values: bedFilters.bedding })
    if (bedFilters.pillows.length) dims.push({ key: 'pillows', type: 'multi', values: bedFilters.pillows })
    if (amenityFilters.view.length) dims.push({ key: 'view', type: 'multi', values: amenityFilters.view })
    if (amenityFilters.floor.length) dims.push({ key: 'floor', type: 'multi', values: amenityFilters.floor })
    if (amenityFilters.bathroom.length) dims.push({ key: 'bathroom', type: 'multi', values: amenityFilters.bathroom })
    if (amenityFilters.balcony !== null) dims.push({ key: 'balcony', type: 'bool', value: true })
    if (amenityFilters.livingArea !== null) dims.push({ key: 'livingArea', type: 'bool', value: true })
    if (amenityFilters.kitchen !== null) dims.push({ key: 'kitchen', type: 'bool', value: true })
    if (amenityFilters.laundry !== null) dims.push({ key: 'laundry', type: 'bool', value: true })
    if (accessibilityFilter) dims.push({ key: 'accessibility', type: 'bool', value: true })
    return dims
  }, [bedFilters, amenityFilters, accessibilityFilter])

  const totalFilters = activeFilterDimensions.length

  function getRoomMatchCount(room) {
    let count = 0
    for (const dim of activeFilterDimensions) {
      if (dim.type === 'multi') {
        const roomVal = room.attributes[dim.key]
        // bedding is an array in room data — check for any overlap
        if (Array.isArray(roomVal)) {
          if (dim.values.some((v) => roomVal.includes(v))) count++
        } else {
          if (dim.values.includes(roomVal)) count++
        }
      } else {
        if (room.attributes[dim.key] === dim.value) count++
      }
    }
    return count
  }


  const sortedRooms = useMemo(() => {
    const withCounts = rooms.map((r) => ({ room: r, count: getRoomMatchCount(r) }))
    if (sort === 'price') {
      return withCounts
        .sort((a, b) => {
          if (totalFilters > 0 && b.count !== a.count) return b.count - a.count
          return a.room.basePricePerNight - b.room.basePricePerNight
        })
        .map((x) => x.room)
    }
    // best match
    if (totalFilters === 0) {
      return [...rooms].sort((a, b) => a.basePricePerNight - b.basePricePerNight)
    }
    return withCounts
      .sort((a, b) => b.count - a.count || a.room.basePricePerNight - b.room.basePricePerNight)
      .map((x) => x.room)
  }, [totalFilters, bedFilters, amenityFilters, accessibilityFilter, sort])

  const matchingCount = totalFilters === 0
    ? rooms.length
    : sortedRooms.filter((r) => getRoomMatchCount(r) === totalFilters).length

  function handleSelect(room) {
    setSelectedRoom(room)
    navigate('/flow-a/services')
  }

  const bedCount = getBedFilterCount()
  const amenityCount = getAmenityFilterCount()
  const totalActive = getActiveFilterCount()

  // Dropdown button base styles
  const dropdownBtnBase = {
    borderRadius: 'var(--radius-full)',
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  function dropdownBtnStyle(active) {
    return active
      ? {
          ...dropdownBtnBase,
          border: '1.5px solid var(--color-teal)',
          background: 'var(--color-teal-light)',
          color: 'var(--color-teal)',
        }
      : {
          ...dropdownBtnBase,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
        }
  }

  const dropdownPanelStyle = (minWidth = 280) => ({
    position: 'absolute',
    zIndex: 50,
    top: 'calc(100% + 8px)',
    left: 0,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    minWidth,
    boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
  })

  function GroupLabel({ children }) {
    return (
      <p
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-tertiary)',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {children}
      </p>
    )
  }

  return (
    <div>
      <StepHeader
        step={1}
        totalSteps={3}
        title="Select your room"
        rightContent="Sat 14 Jun — Tue 17 Jun · 2 guests"
      />

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-3" style={{ position: 'relative' }}>

        {/* Beds dropdown */}
        <div style={{ position: 'relative' }} ref={bedsRef}>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'beds' ? null : 'beds')}
            style={dropdownBtnStyle(bedCount > 0)}
          >
            Beds{bedCount > 0 ? ` (${bedCount})` : ''}
          </button>
          <AnimatePresence>
            {openDropdown === 'beds' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={dropdownPanelStyle(280)}
              >
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>Bed type</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    {beddingAttr.options.map((opt) => (
                      <AttributePill
                        key={opt.value}
                        label={opt.label}
                        selected={bedFilters.bedding.includes(opt.value)}
                        onClick={() => setBedFilters((f) => ({ ...f, bedding: toggle(f.bedding, opt.value) }))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <GroupLabel>Pillow menu</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    {pillowsAttr.options.map((opt) => (
                      <AttributePill
                        key={opt.value}
                        label={opt.label}
                        selected={bedFilters.pillows.includes(opt.value)}
                        onClick={() => setBedFilters((f) => ({ ...f, pillows: toggle(f.pillows, opt.value) }))}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Amenities dropdown */}
        <div style={{ position: 'relative' }} ref={amenitiesRef}>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'amenities' ? null : 'amenities')}
            style={dropdownBtnStyle(amenityCount > 0)}
          >
            Amenities{amenityCount > 0 ? ` (${amenityCount})` : ''}
          </button>
          <AnimatePresence>
            {openDropdown === 'amenities' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={dropdownPanelStyle(520)}
              >
                {/* View */}
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>View</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    {viewAttr.options.map((opt) => (
                      <AttributePill
                        key={opt.value}
                        label={opt.label}
                        selected={amenityFilters.view.includes(opt.value)}
                        onClick={() => setAmenityFilters((f) => ({ ...f, view: toggle(f.view, opt.value) }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Floor */}
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>Floor</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    {floorAttr.options.map((opt) => (
                      <AttributePill
                        key={opt.value}
                        label={opt.label}
                        selected={amenityFilters.floor.includes(opt.value)}
                        onClick={() => setAmenityFilters((f) => ({ ...f, floor: toggle(f.floor, opt.value) }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Bathroom */}
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>Bathroom</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    {bathroomAttr.options.map((opt) => (
                      <AttributePill
                        key={opt.value}
                        label={opt.label}
                        selected={amenityFilters.bathroom.includes(opt.value)}
                        onClick={() => setAmenityFilters((f) => ({ ...f, bathroom: toggle(f.bathroom, opt.value) }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Balcony */}
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>Balcony</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    <AttributePill
                      label="Balcony"
                      selected={amenityFilters.balcony !== null}
                      onClick={() => setAmenityFilters((f) => ({ ...f, balcony: f.balcony !== null ? null : true }))}
                    />
                  </div>
                </div>

                {/* Living area */}
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>Living area</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    <AttributePill
                      label="Separate lounge"
                      selected={amenityFilters.livingArea !== null}
                      onClick={() => setAmenityFilters((f) => ({ ...f, livingArea: f.livingArea !== null ? null : true }))}
                    />
                  </div>
                </div>

                {/* Kitchen */}
                <div style={{ marginBottom: 12 }}>
                  <GroupLabel>Kitchen</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    <AttributePill
                      label="Kitchenette"
                      selected={amenityFilters.kitchen !== null}
                      onClick={() => setAmenityFilters((f) => ({ ...f, kitchen: f.kitchen !== null ? null : true }))}
                    />
                  </div>
                </div>

                {/* Laundry */}
                <div>
                  <GroupLabel>In-room laundry</GroupLabel>
                  <div className="flex flex-wrap gap-2">
                    <AttributePill
                      label="In-room washer & dryer"
                      selected={amenityFilters.laundry !== null}
                      onClick={() => setAmenityFilters((f) => ({ ...f, laundry: f.laundry !== null ? null : true }))}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessibility toggle (no dropdown) */}
        <button
          onClick={() => setAccessibilityFilter((v) => !v)}
          style={dropdownBtnStyle(accessibilityFilter)}
          title="Accessible rooms only"
        >
          ♿
        </button>
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>Sort by:</span>
        {[
          { value: 'best', label: 'Best match' },
          { value: 'price', label: 'Price' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              border: sort === value ? '1.5px solid var(--color-text-primary)' : '1px solid var(--color-border)',
              background: sort === value ? 'var(--color-text-primary)' : 'var(--color-surface)',
              color: sort === value ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Match counter */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{rooms.length} rooms</span>
          {totalFilters > 0 && (
            <span>
              {' · '}
              <span style={{ color: 'var(--color-teal)', fontWeight: 600 }}>{matchingCount}</span>
              {' match your filters'}
            </span>
          )}
        </p>
        {totalActive > 0 && (
          <button
            onClick={clearAllFilters}
            style={{
              color: 'var(--color-teal)',
              fontSize: 13,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Room cards */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {sortedRooms.map((room) => {
            const matchCount = getRoomMatchCount(room)
            return (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <RoomCard
                  room={room}
                  selected={selectedRoom?.id === room.id}
                  onSelect={() => handleSelect(room)}
                  matchCount={matchCount}
                  totalFilters={totalFilters}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
