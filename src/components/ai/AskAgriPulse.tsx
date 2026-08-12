import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { MessageSquare, Sparkles, Send, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { SupportedCropName } from '../../types';

export interface AskAgriPulseProps {
  cropName?: SupportedCropName;
  conditionName?: string;
  isNeedsReview?: boolean;
  analysisId?: string;
}

export const AskAgriPulse: React.FC<AskAgriPulseProps> = ({
  cropName = 'Tomato',
  conditionName = 'Early Blight',
  isNeedsReview = false,
  analysisId,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultNeedsReviewAnswer =
    'Agronomic Assistant Notice: The visual diagnosis for this crop is currently unconfirmed and requires certified agronomic field verification before chemical application. Keep monitoring foliage undersides and weather forecast trends.';

  const defaultReliableAnswer = `If rain begins earlier than the forecast window tomorrow, postpone application to the next calm dry window. Protectant treatments for ${conditionName} require rainfast drying time.`;

  const [activeAnswer, setActiveAnswer] = useState<string | null>(
    isNeedsReview ? defaultNeedsReviewAnswer : defaultReliableAnswer
  );

  const presetQuestions = isNeedsReview
    ? [
        {
          q: 'What if visual diagnosis is unconfirmed?',
          a: 'AgriPulse requires a certified agronomic field inspection before applying chemical controls. Inspect leaf undersides and monitor weather forecast trends.',
        },
        {
          q: 'Is chemical treatment safe now?',
          a: 'No chemical treatment is advised without confirmed diagnostic identification. Applying unconfirmed chemicals risks crop damage and wasted expenditure.',
        },
        {
          q: 'What weather parameters should I monitor?',
          a: 'Monitor precipitation probability, wind speed (<12 km/h), and canopy moisture while awaiting field verification.',
        },
      ]
    : [
        {
          q: 'What if it rains early tomorrow?',
          a: 'If rain begins earlier than the forecast window, postpone application to the next calm dry window. Do not spray while leaf surface wetness is visible.',
        },
        {
          q: 'How long must the protectant spray dry?',
          a: 'Foliar protectants require a minimum of 2 hours rainfast drying time under calm conditions (<10 km/h wind) for full uptake.',
        },
        {
          q: 'When should I re-evaluate the field?',
          a: 'Re-inspect leaf undersides 48 hours post-application to confirm lesion border halting before deciding on follow-up sprays.',
        },
      ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isNeedsReview) {
      setActiveAnswer(
        `Agronomic Guidance for "${query}": Visual diagnosis requires field confirmation. No condition-specific chemical treatment or dosage is advised until certified inspection confirms the disease. Keep monitoring field sanitation and weather trends.`
      );
      setQuery('');
      return;
    }

    setLoading(true);
    try {
      const answer = await ApiClient.askFieldQuestion(query, cropName, analysisId);
      setActiveAnswer(answer);
    } catch {
      setActiveAnswer(
        `Agronomic Guidance for "${query}": Keep monitoring relative humidity and wind speed. For ${conditionName}, ensure foliage undersides receive uniform spray coverage during calm morning dry windows.`
      );
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <Card glassLevel="deep" className="border-l-4 border-l-[#B9E48C] shadow-glass-deep">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#10251C] border border-[#B9E48C]/30 text-[#B9E48C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <CardTitle className="text-base text-[#F5F2E8]">Ask AgriPulse Agronomic Assistant</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#B9E48C] uppercase tracking-wider">
            Interactive Q&A
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preset Question Chips */}
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F2E8]/60 mb-2">
            Common Agronomic Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {presetQuestions.map((item) => (
              <button
                key={item.q}
                type="button"
                onClick={() => setActiveAnswer(item.a)}
                className="px-3 py-1.5 rounded-full text-xs font-mono glass-light border-white/15 text-[#F5F2E8]/80 hover:text-[#B9E48C] hover:border-[#B9E48C]/40 transition-colors flex items-center gap-1.5 text-left"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B9E48C] shrink-0" />
                <span>{item.q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Answer Box */}
        {activeAnswer && (
          <div className="glass-light p-4 rounded-2xl border-[#B9E48C]/30 bg-[#B9E48C]/5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B9E48C]">
              <CheckCircle2 className="w-4 h-4" />
              <span>AgriPulse Answer</span>
            </div>
            <p className="text-xs text-[#F5F2E8]/90 leading-relaxed font-sans">{activeAnswer}</p>
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSend} className="flex gap-2 items-center pt-1">
          <div className="flex-1">
            <Input
              placeholder="Ask any question about treatment dosage, rain risk, or drying time..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<MessageSquare className="w-4 h-4 text-[#B9E48C]" />}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            rightIcon={<Send className="w-4 h-4" />}
            className="rounded-xl bg-[#B9E48C] text-[#07130F] font-semibold text-xs border-0 shrink-0"
          >
            Ask
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
