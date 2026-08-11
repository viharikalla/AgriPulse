import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FieldAnalysis } from '../types';
import { ApiClient } from '../services/apiClient';
import { ROUTES } from '../config/routes';
import { FieldHeader } from '../components/advisory/FieldHeader';
import { DiagnosisCard } from '../components/advisory/DiagnosisCard';
import { ActionCard } from '../components/advisory/ActionCard';
import { ActionTimeline } from '../components/advisory/ActionTimeline';
import { WeatherCard } from '../components/weather/WeatherCard';
import { RecommendationReason } from '../components/advisory/RecommendationReason';
import { ManagementCard } from '../components/advisory/ManagementCard';
import { MonitoringCard } from '../components/advisory/MonitoringCard';
import { AskAgriPulse } from '../components/ai/AskAgriPulse';
import { Skeleton, ErrorState } from '../components/ui';
import { formatDate } from '../utils/formatters';

export const AdvisoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<FieldAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetId = id || 'demo-1';
    setLoading(true);
    setError(null);

    ApiClient.getAnalysis(targetId)
      .then((res) => {
        if (res) {
          setAnalysis(res);
        } else {
          setError('Advisory report not found or access denied.');
        }
      })
      .catch(() => setError('Error loading field advisory report.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-md mx-auto my-12">
        <ErrorState
          title="Advisory Report Not Found"
          message={error || 'The requested field decision record could not be loaded.'}
          onRetry={() => navigate(ROUTES.HISTORY)}
        />
      </div>
    );
  }

  const { crop, location, createdAt, assessment, weatherSnapshot, decision } = analysis;
  const isNeedsReview = assessment.confidenceLevel === 'Low' || decision.decisionStatus === 'INSUFFICIENT_DATA';

  const windowScore = decision.actionWindow?.suitabilityScore ?? decision.actionWindow?.averageScore ?? 88;
  const bestWindowStr = decision.actionWindow?.bestStartTime && decision.actionWindow?.bestEndTime
    ? `${decision.actionWindow.bestStartTime} – ${decision.actionWindow.bestEndTime}`
    : 'Pending Weather Window';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300 pb-20">
      {/* Field Advisory Header */}
      <FieldHeader
        cropName={crop.name}
        location={location}
        date={formatDate(createdAt)}
        advisoryId={analysis.id}
      />

      {/* Needs Review / Uncertainty Banner */}
      {isNeedsReview && (
        <div className="p-5 rounded-2xl glass-medium border-[#EBCB78]/40 bg-[#EBCB78]/10 text-[#EBCB78] space-y-2">
          <div className="flex items-center gap-2 font-heading font-bold text-base text-[#F5F2E8]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EBCB78] animate-pulse" />
            <span>AGRONOMIC VERIFICATION NEEDED</span>
          </div>
          <p className="text-xs text-[#F5F2E8]/90 leading-relaxed">
            {assessment.diagnosisSummary || 'AgriPulse needs a clearer view before recommending a condition-specific chemical action window.'}
          </p>
        </div>
      )}

      {/* Main Advisory Cards */}
      <div className="space-y-8">
        {/* 1. WHAT'S WRONG? */}
        <section>
          <DiagnosisCard
            conditionName={assessment.primaryCondition.name}
            scientificName={assessment.primaryCondition.id}
            confidence={assessment.confidenceLevel || 'High'}
            confidenceScore={assessment.confidenceScore}
            severity={assessment.primaryCondition.severity}
            symptoms={
              assessment.primaryCondition.symptoms && assessment.primaryCondition.symptoms.length > 0
                ? assessment.primaryCondition.symptoms
                : assessment.visualObservations
            }
            photoUrl={analysis.photoUrl}
          />
        </section>

        {/* 2. WHAT SHOULD I DO & WHEN SHOULD I ACT? */}
        <section>
          <ActionCard
            decision={decision.decisionStatus || 'WAIT'}
            bestWindow={bestWindowStr}
            windowScore={windowScore}
            actionText={decision.rationale || decision.primaryAction?.description}
          />
        </section>

        {/* 3. ACTION TIMELINE */}
        <section>
          <ActionTimeline isNeedsReview={isNeedsReview} />
        </section>

        {/* WEATHER SNAPSHOT */}
        <section>
          <WeatherCard
            temperatureC={weatherSnapshot.currentTempC}
            humidityPercent={weatherSnapshot.currentHumidity}
            rainProbabilityPercent={weatherSnapshot.hours?.[0]?.precipitationProbabilityPct ?? 10}
            windSpeedKmh={weatherSnapshot.currentWindSpeedKmh}
            conditionDescription={weatherSnapshot.currentCondition}
            location={location}
          />
        </section>

        {/* 4. WHY THIS RECOMMENDATION? */}
        <section>
          <RecommendationReason isNeedsReview={isNeedsReview} />
        </section>

        {/* 5. MANAGEMENT DETAILS */}
        <section>
          <ManagementCard isNeedsReview={isNeedsReview} />
        </section>

        {/* 6. WHAT SHOULD I MONITOR? */}
        <section>
          <MonitoringCard />
        </section>

        {/* 7. ASK AGRIPULSE */}
        <section>
          <AskAgriPulse
            cropName={crop.name}
            conditionName={assessment.primaryCondition.name}
            isNeedsReview={isNeedsReview}
            analysisId={analysis.id}
          />
        </section>
      </div>
    </div>
  );
};
