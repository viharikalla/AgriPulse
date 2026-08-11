import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, ArrowRight, Menu, X, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../config/routes';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#how-it-works');
    }
  };

  return (
    <header className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div
        className={`max-w-6xl mx-auto h-14 px-4 sm:px-6 rounded-full flex items-center justify-between pointer-events-auto transition-all duration-500 ${
          scrolled
            ? 'glass-deep border-white/20 shadow-2xl scale-[0.99]'
            : 'glass-medium border-white/12 shadow-glass-sm'
        }`}
      >
        {/* Logo */}
        <NavLink
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 text-[#F5F2E8] hover:text-[#B9E48C] transition-colors group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#10251C] border border-[#B9E48C]/30 flex items-center justify-center text-[#B9E48C] group-hover:scale-105 transition-transform">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-heading text-base font-bold tracking-tight text-[#F5F2E8]">
            AgriPulse
          </span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <a
            href="#how-it-works"
            onClick={handleHowItWorksClick}
            className="text-xs font-medium text-[#F5F2E8]/75 hover:text-[#F5F2E8] hover:bg-white/[0.06] px-3 py-1.5 rounded-full transition-colors"
          >
            How it works
          </a>
          <NavLink
            to={ROUTES.ANALYZE}
            className={({ isActive }) =>
              `text-xs font-medium transition-all duration-200 px-3 py-1.5 rounded-full ${
                isActive
                  ? 'text-[#B9E48C] bg-white/[0.1] border border-white/12 font-semibold'
                  : 'text-[#F5F2E8]/75 hover:text-[#F5F2E8] hover:bg-white/[0.06]'
              }`
            }
          >
            Field analysis
          </NavLink>
          <NavLink
            to={ROUTES.HISTORY}
            className={({ isActive }) =>
              `text-xs font-medium transition-all duration-200 px-3 py-1.5 rounded-full ${
                isActive
                  ? 'text-[#B9E48C] bg-white/[0.1] border border-white/12 font-semibold'
                  : 'text-[#F5F2E8]/75 hover:text-[#F5F2E8] hover:bg-white/[0.06]'
              }`
            }
          >
            History
          </NavLink>

          {user && (
            <NavLink
              to={ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `text-xs font-medium transition-all duration-200 px-3 py-1.5 rounded-full ${
                  isActive
                    ? 'text-[#B9E48C] bg-white/[0.1] border border-white/12 font-semibold'
                    : 'text-[#F5F2E8]/75 hover:text-[#F5F2E8] hover:bg-white/[0.06]'
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth / CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light border-white/15 text-xs text-[#F5F2E8] hover:border-[#B9E48C]/40 transition-colors">
              <UserIcon className="w-3.5 h-3.5 text-[#B9E48C]" />
              <span className="font-medium max-w-[120px] truncate">{user.name}</span>
            </NavLink>
          ) : (
            <>
              <NavLink to={ROUTES.LOGIN} className="text-xs font-medium text-[#F5F2E8]/80 hover:text-[#F5F2E8] px-3 py-1.5 rounded-full transition-colors">
                Sign In
              </NavLink>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(ROUTES.SIGNUP)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="rounded-full text-xs font-semibold px-4 py-1.5 bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] shadow-glow-living border-0 whitespace-nowrap"
              >
                Register →
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full glass-light border border-white/15 flex items-center justify-center text-[#F5F2E8] hover:text-[#B9E48C] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Floating Glass Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden max-w-6xl mx-auto mt-2 px-4 pointer-events-auto"
          >
            <div className="glass-deep rounded-3xl p-5 border-white/20 shadow-2xl space-y-4">
              <div className="flex flex-col gap-2">
                <a
                  href="#how-it-works"
                  onClick={handleHowItWorksClick}
                  className="px-4 py-3 rounded-2xl glass-light text-sm font-medium text-[#F5F2E8] hover:text-[#B9E48C] flex items-center justify-between"
                >
                  <span>How it works</span>
                  <ArrowRight className="w-4 h-4 text-[#F5F2E8]/40" />
                </a>

                <NavLink
                  to={ROUTES.ANALYZE}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between transition-colors ${
                      isActive
                        ? 'glass-medium text-[#B9E48C] font-semibold border-white/20'
                        : 'glass-light text-[#F5F2E8] hover:text-[#B9E48C]'
                    }`
                  }
                >
                  <span>Field analysis</span>
                  <ArrowRight className="w-4 h-4 text-[#F5F2E8]/40" />
                </NavLink>

                <NavLink
                  to={ROUTES.HISTORY}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between transition-colors ${
                      isActive
                        ? 'glass-medium text-[#B9E48C] font-semibold border-white/20'
                        : 'glass-light text-[#F5F2E8] hover:text-[#B9E48C]'
                    }`
                  }
                >
                  <span>History</span>
                  <ArrowRight className="w-4 h-4 text-[#F5F2E8]/40" />
                </NavLink>

                {user && (
                  <NavLink
                    to={ROUTES.DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between transition-colors ${
                        isActive
                          ? 'glass-medium text-[#B9E48C] font-semibold border-white/20'
                          : 'glass-light text-[#F5F2E8] hover:text-[#B9E48C]'
                      }`
                    }
                  >
                    <span>Dashboard ({user.name})</span>
                    <ArrowRight className="w-4 h-4 text-[#F5F2E8]/40" />
                  </NavLink>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(ROUTES.DASHBOARD);
                    }}
                    className="w-full rounded-2xl py-3 bg-[#B9E48C] text-[#07130F] font-semibold text-sm shadow-glow-living border-0 whitespace-nowrap justify-center"
                  >
                    Go to Farmer Dashboard
                  </Button>
                ) : (
                  <>
                    <NavLink to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-2xl py-3 border-white/20 text-[#F5F2E8] text-sm">
                        Sign In
                      </Button>
                    </NavLink>
                    <NavLink to={ROUTES.SIGNUP} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-2xl py-3 bg-[#B9E48C] text-[#07130F] font-semibold text-sm border-0">
                        Create Account
                      </Button>
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
