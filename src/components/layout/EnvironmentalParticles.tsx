import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface EnvironmentalParticlesProps {
  mode?: 'rain' | 'wind' | 'dry';
}

export const EnvironmentalParticles: React.FC<EnvironmentalParticlesProps> = ({ mode = 'wind' }) => {
  // Generate a small array of 12-16 lightweight particle objects for maximum performance
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
      {particles.map((p) => {
        if (mode === 'rain') {
          return (
            <motion.div
              key={p.id}
              initial={{ y: '-10%', x: `${p.x}%`, opacity: 0 }}
              animate={{ y: '110%', opacity: [0, 0.6, 0] }}
              transition={{
                duration: p.duration * 0.4,
                repeat: Infinity,
                delay: p.delay,
                ease: 'linear',
              }}
              style={{
                width: '1px',
                height: `${p.size * 8}px`,
              }}
              className="absolute bg-gradient-to-b from-transparent via-[#A8D8E8] to-transparent"
            />
          );
        }

        return (
          <motion.div
            key={p.id}
            initial={{ x: '-10%', y: `${p.y}%`, opacity: 0 }}
            animate={{
              x: '110%',
              y: [`${p.y}%`, `${p.y + (p.id % 2 === 0 ? 5 : -5)}%`, `${p.y}%`],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            style={{
              width: `${p.size * 2}px`,
              height: `${p.size * 2}px`,
            }}
            className="absolute rounded-full bg-[#B9E48C]/40 blur-[0.5px]"
          />
        );
      })}
    </div>
  );
};
