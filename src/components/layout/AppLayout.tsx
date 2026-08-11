import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastProvider } from '../ui/Toast';
import { CursorLight } from './CursorLight';
import { EnvironmentalParticles } from './EnvironmentalParticles';

export const AppLayout: React.FC = () => {
  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-[#07130F] text-[#F5F2E8] flex flex-col selection:bg-[#B9E48C]/30 selection:text-[#B9E48C]">
        {/* Pointer Spotlight & Ambient Particles */}
        <CursorLight />
        <EnvironmentalParticles mode="wind" />

        {/* Floating Glass Navigation */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ToastProvider>
  );
};
