import { useEffect, useMemo, useState } from 'react';

// Spinning-rotor frames: the four corner rotors cycle through blade angles
// to read as a flying quadcopter. Pure ASCII for that terminal-art look.
const blades = ['--', '\\/', '||', '/\\'];

function drone(b: string) {
  return [
    `(${b})    (${b})`,
    `  \\______/`,
    `  |[o  o]|`,
    `  |~====~|`,
    `  /______\\`,
    `(${b})    (${b})`,
  ].join('\n');
}

type Drone = {
  id: number;
  top: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  phase: number;
  reverse: boolean;
};

type AsciiDronesProps = {
  className?: string;
  count?: number;
  color?: string;
};

export function AsciiDrones({ className = '', count = 7, color = '#77262d' }: AsciiDronesProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setFrame((f) => (f + 1) % blades.length), 110);
    return () => window.clearInterval(id);
  }, []);

  const drones = useMemo<Drone[]>(() => {
    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: count }, (_, id) => {
      const reverse = Math.random() > 0.5;
      return {
        id,
        top: rand(4, 82),
        duration: rand(26, 64),
        delay: -rand(0, 50),
        size: rand(0.62, 1.18),
        opacity: rand(0.1, 0.26),
        phase: Math.floor(rand(0, blades.length)),
        reverse,
      };
    });
  }, [count]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {drones.map((d) => (
        <div
          key={d.id}
          className="absolute left-0 will-change-transform"
          style={{
            top: `${d.top}%`,
            animation: `${d.reverse ? 'ascii-fly-rev' : 'ascii-fly'} ${d.duration}s linear ${d.delay}s infinite`,
          }}
        >
          <pre
            className="m-0 font-mono leading-[1.05]"
            style={{
              color,
              fontSize: `${d.size}rem`,
              opacity: d.opacity,
              animation: 'ascii-bob 4s ease-in-out infinite',
            }}
          >
            {drone(blades[(frame + d.phase) % blades.length])}
          </pre>
        </div>
      ))}
    </div>
  );
}
