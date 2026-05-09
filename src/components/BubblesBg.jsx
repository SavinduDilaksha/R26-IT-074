import React, { useEffect, useRef } from 'react'

export default function BubblesBg() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const bubbles = []

    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div')
      const size = Math.random() * 28 + 8
      b.className = 'bubble'
      b.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}%;
        bottom: -60px;
        animation-duration: ${Math.random() * 12 + 8}s;
        animation-delay: ${Math.random() * 10}s;
        opacity: ${Math.random() * 0.4 + 0.1};
      `
      container.appendChild(b)
      bubbles.push(b)
    }
    return () => bubbles.forEach(b => b.remove())
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at 20% 80%, #0c4a6e 0%, #082f49 40%, #051e2e 100%)',
      }}
    >
      {/* Caustic light effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(ellipse 600px 300px at 70% 20%, rgba(125,211,252,0.4) 0%, transparent 70%),
                            radial-gradient(ellipse 400px 200px at 20% 60%, rgba(45,212,191,0.3) 0%, transparent 70%)`,
        }}
      />
      {/* Depth layers */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ocean-950/60 to-transparent" />
    </div>
  )
}
