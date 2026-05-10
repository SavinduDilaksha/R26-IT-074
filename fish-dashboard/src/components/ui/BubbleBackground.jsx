import React from 'react';

const bubbles = [
  { size: 4,  left: '5%',  opacity: 0.04, duration: 28, delay: 0,  drift: 8 },
  { size: 8,  left: '11%', opacity: 0.06, duration: 22, delay: 3,  drift: 12 },
  { size: 6,  left: '18%', opacity: 0.05, duration: 30, delay: 7,  drift: -10 },
  { size: 14, left: '25%', opacity: 0.08, duration: 18, delay: 1,  drift: 15 },
  { size: 5,  left: '32%', opacity: 0.04, duration: 35, delay: 12, drift: -8 },
  { size: 10, left: '38%', opacity: 0.07, duration: 24, delay: 5,  drift: 14 },
  { size: 18, left: '44%', opacity: 0.10, duration: 20, delay: 9,  drift: -12 },
  { size: 7,  left: '51%', opacity: 0.05, duration: 26, delay: 2,  drift: 10 },
  { size: 12, left: '57%', opacity: 0.09, duration: 19, delay: 14, drift: -15 },
  { size: 4,  left: '63%', opacity: 0.03, duration: 32, delay: 6,  drift: 7 },
  { size: 9,  left: '68%', opacity: 0.06, duration: 23, delay: 10, drift: -11 },
  { size: 16, left: '74%', opacity: 0.11, duration: 17, delay: 4,  drift: 13 },
  { size: 6,  left: '79%', opacity: 0.05, duration: 29, delay: 8,  drift: -9 },
  { size: 20, left: '84%', opacity: 0.12, duration: 16, delay: 0,  drift: 15 },
  { size: 5,  left: '89%', opacity: 0.04, duration: 33, delay: 11, drift: -7 },
  { size: 11, left: '93%', opacity: 0.07, duration: 21, delay: 3,  drift: 12 },
  { size: 8,  left: '15%', opacity: 0.06, duration: 27, delay: 15, drift: -13 },
  { size: 13, left: '48%', opacity: 0.08, duration: 25, delay: 13, drift: 10 },
];

export default function BubbleBackground() {
  return (
    <div className="bubble-container">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            '--bubble-opacity': b.opacity,
            '--bubble-duration': `${b.duration}s`,
            '--bubble-delay': `${b.delay}s`,
            '--bubble-drift': `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
