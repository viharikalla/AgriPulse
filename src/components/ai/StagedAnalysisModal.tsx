import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface StagedAnalysisModalProps {
  isOpen: boolean;
  isAnalyzing: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
}

export const StagedAnalysisModal: React.FC<StagedAnalysisModalProps> = ({
  isOpen,
  isAnalyzing,
  error,
  onRetry,
  onClose,
}) => {
  const steps = [
    { label: 'Reading field evidence', sub: 'Optimizing high-resolution crop photo' },
    { label: 'Analyzing visual symptoms', sub: 'Comparing leaf patterns against ground-truth taxonomy' },
    { label: 'Checking local weather forecast', sub: 'Scanning Open-Meteo precipitation & wind velocity' },
    { label: 'Synthesizing decision window', sub: 'Evaluating spray suitability & dry window constraints' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose || (() => {})} title={error ? 'Analysis Error' : 'Synthesizing Field Intelligence'}>
      <div className="space-y-6 py-2">
        {error ? (
          /* Error State */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl glass-medium border-[#F28B78]/40 bg-[#F28B78]/10 text-[#F28B78] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-sm text-[#F5F2E8]">
                  Field Analysis Interrupted
                </h4>
                <p className="text-xs text-[#F5F2E8]/80 mt-1 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {onClose && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full text-xs text-[#F5F2E8]/70"
                >
                  Close
                </Button>
              )}
              {onRetry && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={onRetry}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="rounded-full bg-[#B9E48C] text-[#07130F] font-semibold text-xs shadow-glow-living border-0"
                >
                  Try again
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Loading State */
          <>
            <div className="flex items-center gap-3 p-4 rounded-2xl glass-medium border-[#B9E48C]/30 bg-[#B9E48C]/5">
              <div className="p-2.5 rounded-xl bg-[#10251C] border border-[#B9E48C]/40 text-[#B9E48C] shadow-glow-living">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-[#F5F2E8]">
                  Weather-Aware Synthesis Active
                </h4>
                <p className="text-xs text-[#F5F2E8]/70">
                  Matching visual symptoms against hourly precipitation & wind velocity...
                </p>
              </div>
            </div>

            {/* Pipeline Step Storytelling */}
            <div className="space-y-3.5">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl glass-medium border-white/20 text-[#F5F2E8] shadow-glass-sm"
                >
                  <div className="mt-0.5 shrink-0">
                    {isAnalyzing && idx === 0 ? (
                      <Loader2 className="w-5 h-5 text-[#B9E48C] animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-[#B9E48C]" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-mono font-bold text-[#F5F2E8]">
                      ● {step.label}
                    </p>
                    <p className="text-[11px] text-[#F5F2E8]/60 mt-0.5">{step.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
