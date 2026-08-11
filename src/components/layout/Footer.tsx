import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07130F] text-[#F5F2E8]/60 border-t border-white/10 mt-auto pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <NavLink to={ROUTES.HOME} className="flex items-center gap-2.5 text-[#F5F2E8]">
              <div className="w-8 h-8 rounded-full bg-[#10251C] border border-[#B9E48C]/30 flex items-center justify-center text-[#B9E48C]">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-lg text-[#F5F2E8]">AgriPulse</span>
            </NavLink>
            <p className="text-xs text-[#F5F2E8]/70 leading-relaxed max-w-sm">
              AgriPulse pairs visual crop evidence with micro-weather forecasts — helping farmers identify disease, choose target treatments, and act during optimal weather windows.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
              Platform Navigation
            </h4>
            <ul className="text-xs space-y-2 font-medium">
              <li>
                <a href="#how-it-works" className="hover:text-[#F5F2E8] transition-colors">How it works</a>
              </li>
              <li>
                <NavLink to={ROUTES.ANALYZE} className="hover:text-[#F5F2E8] transition-colors">Field analysis</NavLink>
              </li>
              <li>
                <NavLink to={ROUTES.HISTORY} className="hover:text-[#F5F2E8] transition-colors">History archives</NavLink>
              </li>
            </ul>
          </div>

          {/* Supported Crops */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
              Supported Crops
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-full glass-light border-white/10 text-[#F5F2E8]">🍅 Tomato</span>
              <span className="px-2.5 py-1 rounded-full glass-light border-white/10 text-[#F5F2E8]">🌾 Rice</span>
              <span className="px-2.5 py-1 rounded-full glass-light border-white/10 text-[#F5F2E8]">🌶️ Chilli</span>
              <span className="px-2.5 py-1 rounded-full glass-light border-white/10 text-[#F5F2E8]">🥔 Potato</span>
              <span className="px-2.5 py-1 rounded-full glass-light border-white/10 text-[#F5F2E8]">🌽 Maize</span>
            </div>
          </div>
        </div>

        {/* Copyright & Developer Credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-[#F5F2E8]/60 gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>&copy; 2026 AgriPulse. Weather-Aware Agricultural Decision Support.</p>
            <p className="text-[11px] font-mono font-semibold text-[#B9E48C] tracking-wide">
              Designed and Developed by <span className="font-bold underline decoration-[#B9E48C]/40 underline-offset-2">VIHARI KALLA (24KT1A4720)</span>
            </p>
          </div>
          <p className="text-[#F5F2E8]/40 text-center md:text-right">
            Always inspect local wind and field conditions before chemical application.
          </p>
        </div>
      </div>
    </footer>
  );
};
