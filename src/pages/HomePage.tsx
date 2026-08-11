import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { LivingFieldObject } from '../components/field/LivingFieldObject';
import { FieldReveal, DiagnosisScan, GlassEnter } from '../components/motion/MotionPrimitives';
import { Button, Badge } from '../components/ui';
import { ArrowRight, Sparkles, Camera, Cpu, CloudRain, Clock } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleHowItWorksClick = () => {
    const el = document.getElementById('section-01');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-32 sm:space-y-44 pb-24 animate-in fade-in duration-500 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-12 pt-4">
        {/* Left Copy Column */}
        <div className="flex-1 space-y-8 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-medium text-[#B9E48C] text-[11px] font-mono uppercase tracking-widest border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FIELD INTELLIGENCE</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F5F2E8] leading-[1.05] tracking-tight">
            Know what's happening <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-[#B9E48C]">in your field.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#F5F2E8]/80 leading-relaxed max-w-xl">
            Turn a simple crop photo into a weather-aware field advisory — helping you understand the problem, choose the right action, and know when conditions are most favorable.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.ANALYZE)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-sm shadow-glow-living px-7 py-3 rounded-full border-0 whitespace-nowrap"
            >
              Analyze my field →
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleHowItWorksClick}
              className="rounded-full px-6 text-sm glass-medium border-white/15 hover:border-white/30 text-[#F5F2E8]"
            >
              See how it works
            </Button>
          </div>

          {/* Floating Organic Signal Tags */}
          <div className="pt-6 flex items-center gap-3 font-mono text-[11px] text-[#F5F2E8]/60 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-[#B9E48C]">SIGNALS MATCHED:</span>
            <span className="px-3 py-1 rounded-full glass-light border border-white/10 text-[#F5F2E8]">🌿 LEAF</span>
            <span className="px-3 py-1 rounded-full glass-light border border-white/10 text-[#A8D8E8]">☁️ WEATHER</span>
            <span className="px-3 py-1 rounded-full glass-light border border-white/10 text-[#F5F2E8]">📍 LOCATION</span>
            <span className="px-3 py-1 rounded-full glass-light border border-white/10 text-[#EBCB78]">⏱ TIME</span>
          </div>
        </div>

        {/* Right Hero: Living Field Object Spatial Visualization */}
        <div className="flex-1 w-full flex items-center justify-center">
          <LivingFieldObject />
        </div>
      </section>

      {/* SECTION 01: EVERY FIELD LEAVES SIGNALS */}
      <section id="section-01" className="space-y-8 scroll-mt-24">
        <FieldReveal className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
            SECTION 01
          </span>
          <h2 className="font-heading text-3xl sm:text-6xl font-extrabold text-[#F5F2E8] tracking-tight">
            EVERY FIELD LEAVES SIGNALS.
          </h2>
          <p className="text-xs sm:text-base text-[#F5F2E8]/75 leading-relaxed max-w-xl mx-auto">
            A yellowing leaf edge, afternoon humidity rise, or sudden wind shift — your field emits constant environmental signals before crop yield is lost.
          </p>
        </FieldReveal>
      </section>

      {/* SECTION 02: A LEAF SHOWS WHAT CHANGED */}
      <section className="glass-deep rounded-3xl p-8 sm:p-14 border-white/20 shadow-glass-deep relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F28B78]">
              SECTION 02 &bull; VISUAL ASSESSMENT
            </span>

            <h2 className="font-serif italic text-4xl sm:text-6xl text-[#F5F2E8] leading-tight">
              A leaf shows <br />
              <span className="not-italic font-heading font-extrabold text-[#F28B78]">what changed.</span>
            </h2>

            <p className="text-xs sm:text-base text-[#F5F2E8]/80 leading-relaxed">
              Target concentric ring brown lesions on lower leaves signal fungal spores. AgriPulse visual assessment extracts symptomatic patterns with confidence scoring.
            </p>

            <div className="pt-2">
              <Badge variant="danger" size="md">
                VISUAL EVIDENCE DETECTED: Tomato Early Blight (93% Confidence)
              </Badge>
            </div>
          </div>

          {/* Interactive Leaf Photo Scan Line Simulation */}
          <div className="lg:col-span-6">
            <GlassEnter className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden glass-medium border border-white/20 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80"
                alt="Tomato Leaf Evidence Scan"
                className="w-full h-full object-cover opacity-90"
              />
              <DiagnosisScan isScanning />

              {/* Lesion Detection Marker */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 p-2 rounded-xl glass-deep border border-[#F28B78]/60 bg-[#F28B78]/20 flex items-center gap-2 text-xs font-mono text-[#F5F2E8] shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#F28B78] animate-ping" />
                <span>Lesion Cluster Detected &bull; High Severity</span>
              </div>
            </GlassEnter>
          </div>
        </div>
      </section>

      {/* SECTION 03: BUT A DIAGNOSIS IS ONLY HALF THE ANSWER */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <FieldReveal>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EBCB78]">
            SECTION 03 &bull; THE TIMING PROBLEM
          </span>
          <h2 className="font-serif italic text-4xl sm:text-6xl text-[#F5F2E8] leading-tight mt-2">
            But a diagnosis is <br />
            <span className="not-italic font-heading font-extrabold text-[#EBCB78]">only half the answer.</span>
          </h2>
          <p className="text-xs sm:text-base text-[#F5F2E8]/75 leading-relaxed max-w-xl mx-auto">
            Knowing the disease identity tells you what product to buy — but spraying right before an afternoon rainstorm washes away your investment into the soil.
          </p>
        </FieldReveal>
      </section>

      {/* SECTION 04: THE SKY CHANGES THE DECISION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <GlassEnter className="p-8 sm:p-10 rounded-3xl glass-medium border-[#F28B78]/30 bg-[#F28B78]/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F28B78]">
              UNFAVORABLE WINDOW
            </span>
            <h3 className="font-heading text-2xl font-bold text-[#F5F2E8]">
              Rain expected soon.
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F2E8]/80 leading-relaxed">
              82% precipitation chance causes instant chemical wash-off and environmental runoff.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-light border-white/10 flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-2 text-[#F28B78]">
              <CloudRain className="w-4 h-4" /> RAIN 82%
            </span>
            <span className="text-[#F28B78] font-bold">❌ WAIT</span>
          </div>
        </GlassEnter>

        <GlassEnter delay={0.15} className="p-8 sm:p-10 rounded-3xl glass-deep border-[#B9E48C]/40 bg-[#B9E48C]/5 space-y-6 flex flex-col justify-between shadow-glow-living">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
              OPTIMAL WEATHER WINDOW
            </span>
            <h3 className="font-heading text-2xl font-bold text-[#F5F2E8]">
              Tomorrow morning dry period.
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F2E8]/80 leading-relaxed">
              Rain chance drops to 10% and wind drops to 7 km/h — giving full 3.5 hours for rainfast foliar absorption.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-light border-[#B9E48C]/30 flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-2 text-[#B9E48C]">
              <Clock className="w-4 h-4" /> Tomorrow 07:00–10:30
            </span>
            <span className="text-[#B9E48C] font-bold">🟢 BEST WINDOW</span>
          </div>
        </GlassEnter>
      </section>

      {/* SECTION 05: AGRI PULSE CONNECTS THEM */}
      <section className="glass-medium rounded-3xl p-8 sm:p-12 border-white/12 shadow-glass-sm space-y-8 text-center">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
            SECTION 05 &bull; SYNTHESIS ENGINE
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F5F2E8]">
            AGRI PULSE CONNECTS THEM.
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 font-heading font-extrabold text-sm sm:text-base text-[#F5F2E8]">
          <span className="px-4 py-2.5 rounded-2xl glass-light border border-white/15 flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#B9E48C]" /> PHOTO
          </span>
          <span className="text-[#B9E48C] font-mono">+</span>
          <span className="px-4 py-2.5 rounded-2xl glass-light border border-white/15 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#A8D8E8]" /> LOCATION
          </span>
          <span className="text-[#B9E48C] font-mono">+</span>
          <span className="px-4 py-2.5 rounded-2xl glass-light border border-white/15 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-[#EBCB78]" /> WEATHER
          </span>
          <span className="text-[#B9E48C] font-mono">+</span>
          <span className="px-4 py-2.5 rounded-2xl glass-light border border-white/15 flex items-center gap-2">
            🌿 AGRONOMY
          </span>
          <span className="text-[#B9E48C] font-mono text-xl">&rarr;</span>
          <span className="px-6 py-2.5 rounded-2xl glass-deep border border-[#B9E48C]/40 text-[#B9E48C] shadow-glow-living">
            FIELD DECISION
          </span>
        </div>
      </section>

      {/* SECTION 06: KNOW WHAT TO DO. KNOW WHEN TO ACT */}
      <section className="text-center glass-deep rounded-3xl p-10 sm:p-16 border-white/20 shadow-glass-deep space-y-6 max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#B9E48C]/10 via-transparent to-transparent pointer-events-none" />

        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
          SECTION 06 &bull; TAKE CONTROL
        </span>

        <h2 className="font-heading text-3xl sm:text-6xl font-extrabold text-[#F5F2E8] tracking-tight">
          Know what to do. <br />
          <span className="font-serif italic font-normal text-[#B9E48C]">Know when to act.</span>
        </h2>

        <p className="text-xs sm:text-sm text-[#F5F2E8]/75 max-w-md mx-auto leading-relaxed">
          Upload a crop photograph to receive visual diagnosis matched with your optimal weather window.
        </p>

        <div className="pt-4">
          <Button
            size="lg"
            onClick={() => navigate(ROUTES.ANALYZE)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-sm shadow-glow-living px-8 py-3.5 rounded-full border-0 whitespace-nowrap"
          >
            Analyze your field →
          </Button>
        </div>
      </section>
    </div>
  );
};
