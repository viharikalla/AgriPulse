import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface MotionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FieldReveal: React.FC<MotionProps> = ({ children, delay = 0, className = '', ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const LeafFloat: React.FC<MotionProps> = ({ children, className = '', ...props }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
      rotate: [0, 1.5, -1.5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const WeatherDrift: React.FC<MotionProps> = ({ children, className = '', ...props }) => (
  <motion.div
    animate={{
      x: [0, 8, -8, 0],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const GlassEnter: React.FC<MotionProps> = ({ children, delay = 0, className = '', ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: 'easeOut', delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const SignalPulse: React.FC<MotionProps> = ({ children, className = '', ...props }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const WindowSweep: React.FC<MotionProps> = ({ children, className = '', ...props }) => (
  <motion.div
    initial={{ backgroundPosition: '-200% 0' }}
    animate={{ backgroundPosition: '200% 0' }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'linear',
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const DiagnosisScan: React.FC<{ isScanning?: boolean; className?: string }> = ({
  isScanning = true,
  className = '',
}) => {
  if (!isScanning) return null;
  return (
    <motion.div
      initial={{ top: '0%' }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#B9E48C] to-transparent shadow-[0_0_12px_#B9E48C] pointer-events-none z-20 ${className}`}
    />
  );
};

export const ActionLock: React.FC<MotionProps> = ({ children, className = '', ...props }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
