import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NIGHTS = 3
const BASE_ROOM = 'Classic Room'
const BASE_PRICE = 180

// Each step: what the user sends, the assistant's reply, and what gets added to the booking.
// Segments: { text, type: 'room' | 'service' | null }
const SCRIPT = [
  {
    prefill: "I'd love something high up with a skyline view — I'm visiting for work so a late checkout would be really helpful. Oh and ideally a balcony if possible.",
    userSegments: [
      { text: "I'd love something high up with a ", type: null },
      { text: 'skyline view', type: 'room' },
      { text: " — I'm visiting for work so a ", type: null },
      { text: 'late checkout', type: 'service' },
      { text: ' would be really helpful. Oh and ideally a ', type: null },
      { text: 'balcony', type: 'room' },
      { text: ' if possible.', type: null },
    ],
    assistantSegments: [
      { text: "Got it — I've added a ", type: null },
      { text: 'skyline view', type: 'room' },
      { text: ' and ', type: null },
      { text: 'balcony', type: 'room' },
      { text: ' to your room, and noted ', type: null },
      { text: 'late checkout', type: 'service' },
      { text: " until 2pm. A couple of follow-ups: any preference on bed type, and would you like a quiet wing or are you fine closer to the lifts?", type: null },
    ],
    bookingAdd: {
      attrs: [
        { label: 'Skyline view', price: 45 },
        { label: 'Balcony', price: 30 },
      ],
      services: [
        { label: 'Late checkout (2pm)', price: 40 },
      ],
    },
  },
  {
    prefill: "King bed please. And quiet is good — I have early calls. Actually, can you also add daily breakfast?",
    userSegments: [
      { text: 'King bed', type: 'room' },
      { text: ' please. And quiet is good — I have early calls. Actually, can you also add ', type: null },
      { text: 'daily breakfast', type: 'service' },
      { text: '?', type: null },
    ],
    assistantSegments: [
      { text: 'Perfect. ', type: null },
      { text: 'King bed', type: 'room' },
      { text: ' in a ', type: null },
      { text: 'quiet wing', type: 'room' },
      { text: " with your skyline view and balcony — and I've added ", type: null },
      { text: 'daily breakfast', type: 'service' },
      { text: ' for 2. Your room is looking great. Anything else before I pull together the total?', type: null },
    ],
    bookingAdd: {
      attrs: [
        { label: 'King bed', price: 0 },
        { label: 'Quiet wing', price: 0 },
      ],
      services: [
        { label: 'Daily breakfast × 3', price: 90 },
      ],
    },
  },
  {
    prefill: "Could I switch to a queen bed with a separate living area and a kitchenette?",
    userSegments: [
      { text: 'Could I switch to a queen bed with a separate living area and a kitchenette?', type: null },
    ],
    assistantSegments: [
      { text: "I've noted that — your booking on the right will update as we refine your stay. Anything else you'd like to adjust?", type: null },
    ],
    bookingAdd: null,
  },
]

// ── Inline segment renderer ───────────────────────────────────────────────────

function Segments({ segments }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.type) return <span key={i}>{seg.text}</span>
        return (
          <span
            key={i}
            style={{
              display: 'inline',
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              margin: '0 1px',
              fontWeight: 600,
              background: seg.type === 'room' ? 'rgba(22,163,74,0.13)' : 'rgba(99,102,241,0.13)',
              color: seg.type === 'room' ? '#16a34a' : '#6366f1',
            }}
          >
            {seg.text}
          </span>
        )
      })}
    </>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Message({ role, segments }) {
  const isUser = role === 'user'
  return (
    <div style={{ marginBottom: 20 }}>
      {!isUser && (
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
          Assistant
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        <div
          style={{
            maxWidth: '78%',
            padding: '11px 14px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isUser ? 'var(--color-surface-alt)' : 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--color-text-primary)',
          }}
        >
          <Segments segments={segments} />
        </div>
      </div>
      {isUser && (
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginTop: 6, textAlign: 'right' }}>
          You
        </div>
      )}
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function Typing() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
        Assistant
      </div>
      <div
        style={{
          display: 'inline-flex',
          gap: 5,
          padding: '12px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px 16px 16px 4px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-tertiary)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Booking row ───────────────────────────────────────────────────────────────

function BookingRow({ label, price, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        borderRadius: 'var(--radius-md)',
        background: color === 'room' ? 'rgba(22,163,74,0.08)' : 'rgba(99,102,241,0.08)',
        marginBottom: 5,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: color === 'room' ? '#16a34a' : '#6366f1' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: color === 'room' ? '#16a34a' : '#6366f1' }}>
        +SGD {price}
      </span>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Chat() {
  const navigate = useNavigate()
  const bottomRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      segments: [{ text: "Hi! Tell me about your ideal stay — what matters most to you? Views, space, sleep quality, things to do?", type: null }],
    },
  ])
  const [step, setStep] = useState(0)
  const [inputValue, setInputValue] = useState(SCRIPT[0].prefill)
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const [attrs, setAttrs] = useState([])
  const [services, setServices] = useState([])

  const baseTotal = BASE_PRICE * NIGHTS
  const attrsTotal = attrs.reduce((s, a) => s + a.price, 0)
  const servicesTotal = services.reduce((s, a) => s + a.price, 0)
  const grandTotal = baseTotal + attrsTotal + servicesTotal

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend() {
    if (isTyping || step >= SCRIPT.length) return
    const s = SCRIPT[step]

    setMessages((prev) => [...prev, { role: 'user', segments: s.userSegments }])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: 'assistant', segments: s.assistantSegments }])

      if (s.bookingAdd) {
        if (s.bookingAdd.attrs) setAttrs((prev) => [...prev, ...s.bookingAdd.attrs])
        if (s.bookingAdd.services) setServices((prev) => [...prev, ...s.bookingAdd.services])
      }

      const next = step + 1
      if (next < SCRIPT.length) {
        setInputValue(SCRIPT[next].prefill)
        setStep(next)
      } else {
        setIsDone(true)
        setStep(next)
      }
    }, 1100)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden' }}>

      {/* Exit */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 18, right: 22, zIndex: 100,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 13, color: 'var(--color-text-secondary)',
        }}
      >
        Exit
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left: chat ────────────────────────────────────────────── */}
        <div style={{ flex: '0 0 56%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Room builder</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Message role={msg.role} segments={msg.segments} />
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Typing /></motion.div>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex', gap: 8, alignItems: 'flex-end',
                background: '#fff', border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '6px 6px 6px 14px',
              }}
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you'd like..."
                disabled={isTyping || isDone}
                rows={2}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  resize: 'none', fontSize: 14, color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)', lineHeight: 1.5, paddingTop: 4, paddingBottom: 4,
                }}
              />
              {isDone ? (
                <button
                  onClick={() => navigate('/complete')}
                  style={{
                    background: 'var(--color-teal)', color: '#fff', border: 'none',
                    borderRadius: 'var(--radius-md)', padding: '9px 16px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Confirm →
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={isTyping}
                  style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: isTyping ? 'var(--color-border)' : 'var(--color-text-primary)',
                    border: 'none', cursor: isTyping ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: booking panel ──────────────────────────────────── */}
        <div style={{ flex: '0 0 44%', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Your booking</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* Base room */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                {BASE_ROOM} · {NIGHTS} nights
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                SGD {baseTotal}
              </span>
            </div>

            {/* Room attributes */}
            <AnimatePresence>
              {attrs.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: '#16a34a' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
                      Room attributes
                    </span>
                  </div>
                  {attrs.map((a) => <BookingRow key={a.label} label={a.label} price={a.price} color="room" />)}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Services */}
            <AnimatePresence>
              {services.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: '#6366f1' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
                      Services
                    </span>
                  </div>
                  {services.map((s) => <BookingRow key={s.label} label={s.label} price={s.price} color="service" />)}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            {(attrs.length > 0 || services.length > 0) && (
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#16a34a' }} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Room attribute</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6366f1' }} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Service</span>
                </div>
              </div>
            )}
          </div>

          {/* Total bar */}
          <div
            style={{
              background: 'var(--color-text-primary)', color: '#fff',
              padding: '18px 24px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Total · {NIGHTS} nights</span>
            <motion.span
              key={grandTotal}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 24, fontWeight: 700 }}
            >
              SGD {grandTotal}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}
