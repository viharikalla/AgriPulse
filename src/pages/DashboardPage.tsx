import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, getAdvisoryDetailPath } from '../config/routes';
import { FieldAnalysis } from '../types';
import { ApiClient } from '../services/apiClient';
import { Card, Button, Badge } from '../components/ui';
import { Sprout, PlusCircle, LogOut, Clock, Calendar, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<FieldAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ApiClient.getHistory()
      .then((records) => {
        if (isMounted) setHistory(records);
      })
      .catch(() => {
        if (isMounted) setHistory([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Welcome Banner */}
      <Card glassLevel="medium" className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-light border-[#B9E48C]/30 text-[#B9E48C] text-xs font-mono font-bold">
              <Sprout className="w-3.5 h-3.5" /> FARMER DASHBOARD
            </div>
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#F5F2E8]">
              Welcome back, <span className="not-italic font-heading font-extrabold text-[#B9E48C]">{user?.name || 'Farmer'}!</span>
            </h1>
            <p className="text-xs text-[#F5F2E8]/70 max-w-xl">
              Monitor your crop diagnosis history, spray decision windows, and local weather advisories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={ROUTES.ANALYZE}>
              <Button
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-xs shadow-glow-living border-0"
              >
                Analyze New Field
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="border-white/20 text-[#F5F2E8] hover:bg-white/10 text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glassLevel="light" className="p-5 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]">
            Total Field Analyses
          </p>
          <p className="font-mono text-3xl font-extrabold text-[#F5F2E8]">{history.length}</p>
          <p className="text-[11px] text-[#F5F2E8]/60">Saved field diagnoses</p>
        </Card>

        <Card glassLevel="light" className="p-5 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]">
            Optimal Windows Active
          </p>
          <p className="font-mono text-3xl font-extrabold text-[#B9E48C]">
            {history.filter((h) => h.decision.decisionStatus === 'ACT_NOW' || h.decision.decisionStatus === 'FAVORABLE').length}
          </p>
          <p className="text-[11px] text-[#F5F2E8]/60">Actionable weather windows</p>
        </Card>

        <Card glassLevel="light" className="p-5 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]">
            Account Status
          </p>
          <p className="font-mono text-sm font-bold text-[#F5F2E8] flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-[#B9E48C]" /> Verified Farmer
          </p>
          <p className="text-[11px] text-[#F5F2E8]/60">{user?.email}</p>
        </Card>
      </div>

      {/* Recent Field Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif italic text-2xl text-[#F5F2E8]">
            Your Field <span className="not-italic font-heading font-extrabold text-[#B9E48C]">Analyses</span>
          </h2>
          {history.length > 0 && (
            <Link to={ROUTES.HISTORY} className="text-xs font-mono text-[#B9E48C] hover:underline flex items-center gap-1">
              View all archives <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <Card glassLevel="light" className="p-12 text-center text-xs text-[#F5F2E8]/60">
            Loading your field records...
          </Card>
        ) : history.length === 0 ? (
          <Card glassLevel="light" className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full glass-medium border-white/20 mx-auto flex items-center justify-center text-[#B9E48C]">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-[#F5F2E8]">No Field Analyses Recorded Yet</h3>
              <p className="text-xs text-[#F5F2E8]/60 max-w-sm mx-auto">
                Capture or upload a photo of your leaf crop to get real-time disease diagnostic & spray weather recommendations.
              </p>
            </div>
            <Link to={ROUTES.ANALYZE} className="inline-block pt-2">
              <Button
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-xs shadow-glow-living border-0"
              >
                Start First Field Analysis
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((record) => {
              const dateStr = new Date(record.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const isReliable = record.assessment.confidenceLevel !== 'Low';

              return (
                <Card
                  key={record.id}
                  glassLevel="medium"
                  className="p-5 flex flex-col justify-between space-y-4 hover:border-[#B9E48C]/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]">
                          {record.crop.displayName}
                        </span>
                        <h3 className="font-heading font-bold text-base text-[#F5F2E8]">
                          {record.assessment.primaryCondition.name}
                        </h3>
                      </div>
                      <Badge
                        variant={isReliable ? 'success' : 'warning'}
                        size="sm"
                        className="font-mono text-[10px]"
                      >
                        {isReliable ? 'RELIABLE' : 'NEEDS REVIEW'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#F5F2E8]/60 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B9E48C]" /> {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B9E48C]" /> {record.location}
                      </span>
                    </div>

                    <p className="text-xs text-[#F5F2E8]/80 line-clamp-2 leading-relaxed">
                      {record.decision.rationale}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#F5F2E8]/70">
                      <Clock className="w-3.5 h-3.5 text-[#B9E48C]" />
                      <span>Status: {record.decision.decisionStatus}</span>
                    </div>

                    <Link to={getAdvisoryDetailPath(record.id)}>
                      <Button
                        size="sm"
                        variant="ghost"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        className="text-xs text-[#B9E48C] hover:text-white hover:bg-white/10 p-0 px-2"
                      >
                        View Advisory
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
