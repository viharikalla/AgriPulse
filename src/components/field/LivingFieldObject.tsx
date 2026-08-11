import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CloudRain, Wind } from 'lucide-react';

export const LivingFieldObject: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // Scroll parallax transform
  const rotateY = useTransform(scrollY, [0, 600], [0, 15]);
  const rotateX = useTransform(scrollY, [0, 600], [0, -10]);
  const translateY = useTransform(scrollY, [0, 600], [0, -40]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 20,
        y: (e.clientY / innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full max-w-lg aspect-square mx-auto flex items-center justify-center pointer-events-none select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial-gradient from-[#B9E48C]/15 via-[#A8D8E8]/5 to-transparent rounded-full blur-3xl" />

      {/* Main Spatial Container */}
      <motion.div
        style={{
          rotateY,
          rotateX,
          translateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="relative w-full h-full p-6 sm:p-8 flex items-center justify-center"
      >
        {/* Glass Artifact Base */}
        <div className="absolute inset-4 rounded-[40px] glass-deep border border-white/20 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Light Sweep Highlight */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 2,
            }}
            className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          />

          {/* Topographic Field Elevation Contour Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 400 400" fill="none">
            <path
              d="M-50 200 C50 150, 150 250, 250 180 C350 110, 450 220, 500 200"
              stroke="#B9E48C"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M-50 240 C60 190, 140 280, 260 210 C340 140, 440 260, 500 240"
              stroke="#B9E48C"
              strokeWidth="1.2"
            />
            <path
              d="M-50 280 C70 230, 130 310, 270 240 C330 170, 430 300, 500 280"
              stroke="#A8D8E8"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <path
              d="M-50 320 C80 270, 120 340, 280 270 C320 200, 420 340, 500 320"
              stroke="#A8D8E8"
              strokeWidth="0.8"
            />
          </svg>

          {/* Floating Micro Mist Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -30, 0],
                  x: [0, i % 2 === 0 ? 15 : -15, 0],
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.7,
                }}
                style={{
                  top: `${20 + i * 12}%`,
                  left: `${15 + (i * 14) % 70}%`,
                }}
                className="absolute w-2 h-2 rounded-full bg-[#B9E48C]/40 blur-[1px]"
              />
            ))}
          </div>

          {/* Central Organic Stylized Crop Leaf Contour */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.svg
              viewBox="0 0 200 200"
              className="w-48 h-48 sm:w-64 sm:h-64 drop-shadow-[0_10px_20px_rgba(185,228,140,0.15)]"
              animate={{
                scale: [1, 1.02, 1],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <defs>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B9E48C" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#10251C" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#07130F" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B9E48C" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#A8D8E8" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Leaf Base Outline */}
              <path
                d="M 100 20 C 140 50, 170 100, 150 150 C 130 180, 70 180, 50 150 C 30 100, 60 50, 100 20 Z"
                fill="url(#leafGrad)"
                stroke="#B9E48C"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />

              {/* Main Vein & Ribs */}
              <path d="M 100 20 Q 100 100 100 170" stroke="url(#veinGrad)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 100 60 Q 130 50 145 65" stroke="url(#veinGrad)" strokeWidth="1" strokeOpacity="0.7" />
              <path d="M 100 85 Q 65 75 55 90" stroke="url(#veinGrad)" strokeWidth="1" strokeOpacity="0.7" />
              <path d="M 100 110 Q 135 100 145 115" stroke="url(#veinGrad)" strokeWidth="1" strokeOpacity="0.7" />
              <path d="M 100 135 Q 70 128 60 140" stroke="url(#veinGrad)" strokeWidth="1" strokeOpacity="0.7" />

              {/* Interactive Lesion Detection Node */}
              <circle cx="75" cy="85" r="8" fill="#F28B78" fillOpacity="0.3" stroke="#F28B78" strokeWidth="1.5" />
              <circle cx="75" cy="85" r="3" fill="#F28B78" />
            </motion.svg>
          </div>
        </div>

        {/* Micro Weather Indicators Overlay Badges */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-8 right-2 glass-deep px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-xs font-mono shadow-lg"
        >
          <CloudRain className="w-3.5 h-3.5 text-[#A8D8E8]" />
          <span className="text-[#F5F2E8]">Rain 82%</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-10 left-2 glass-deep px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-xs font-mono shadow-lg"
        >
          <Wind className="w-3.5 h-3.5 text-[#B9E48C]" />
          <span className="text-[#B9E48C]">07:00–10:30 Window</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
