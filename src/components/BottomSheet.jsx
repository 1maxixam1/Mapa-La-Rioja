import React, { useEffect, useRef, useState } from 'react'

/**
 * BottomSheet (mobile)
 * - Simple drag-to-resize (30%..85% of viewport height)
 * - Fallback toggle open/close by tapping the grabber
 */
export default function BottomSheet({ open, onOpenChange, children, initialHeightPct = 0.5 }) {
  const sheetRef = useRef(null)
  const startY = useRef(0)
  const startH = useRef(0)
  const [heightPct, setHeightPct] = useState(initialHeightPct) // 0..1

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

  function onTouchStart(e) {
    const t = e.touches[0]
    startY.current = t.clientY
    startH.current = heightPct
  }

  function onTouchMove(e) {
    const t = e.touches[0]
    const dy = startY.current - t.clientY  // dragging up increases height
    const vh = Math.max(window.innerHeight, document.documentElement.clientHeight)
    const delta = dy / vh
    setHeightPct(clamp(startH.current + delta, 0.3, 0.75))
  }

  function onTouchEnd() {
    // Snap to 0.4 / 0.65 / 0.85 based on proximity
    const targets = [0.4, 0.65, 0.85]
    const best = targets.reduce((a,b) => Math.abs(b - heightPct) < Math.abs(a - heightPct) ? b : a, targets[0])
    setHeightPct(best)
  }

  // inline style to set height, also used when hidden to keep layout calculations predictable
  const h = `${Math.round(heightPct * 100)}vh`

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-x-0 bottom-0 z-50 md:hidden max-h-[75vh] transition-transform duration-300 will-change-transform ${
        open ? 'translate-y-0' : 'translate-y-[calc(100%)]'
      }`}
      style={{ height: h }}
      ref={sheetRef}
    >
      <div className="h-full bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.15)] rounded-t-2xl overflow-hidden">
        {/* Grabber */}
        <div
          className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => onOpenChange(!open)}
        >
          <div className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>
        <div className="h-[calc(100%-2.75rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
