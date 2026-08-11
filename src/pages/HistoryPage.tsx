import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldAnalysis } from '../types';
import { ApiClient } from '../services/apiClient';
import { getHistoryDetailPath, ROUTES } from '../config/routes';
import { Card, CardContent, Badge, Button, Input, Select, EmptyState, Skeleton } from '../components/ui';
import { History, Search, MapPin, ArrowRight, Sprout } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<FieldAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrop, setFilterCrop] = useState<string>('All');

  useEffect(() => {
    ApiClient.getHistory().then((data) => {
      setAnalyses(data);
      setLoading(false);
    });
  }, []);

  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch =
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assessment.primaryCondition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = filterCrop === 'All' || item.crop.name === filterCrop;
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C] flex items-center gap-1.5 mb-1">
            <History className="w-3.5 h-3.5" /> Field Decision Archives
          </span>
          <h1 className="font-serif italic text-3xl sm:text-5xl text-[#F5F2E8]">
            Field Advisory <span className="not-italic font-heading font-extrabold text-[#F5F2E8]">History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#F5F2E8]/70 mt-1">
            Review past field assessments, matched weather windows, and historical chemical intervention logs.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate(ROUTES.ANALYZE)}
          leftIcon={<Sprout className="w-4 h-4" />}
          className="rounded-full bg-[#B9E48C] text-[#07130F] font-semibold border-0"
        >
          New Analysis
        </Button>
      </div>

      {/* Filter and search bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 glass-medium p-4 rounded-2xl border-white/12 shadow-glass-sm">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search location, disease, or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-[#F5F2E8]/40" />}
          />
        </div>
        <div>
          <Select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            options={[
              { value: 'All', label: 'All Supported Crops' },
              { value: 'Rice', label: 'Rice' },
              { value: 'Tomato', label: 'Tomato' },
              { value: 'Chilli', label: 'Chilli' },
              { value: 'Potato', label: 'Potato' },
              { value: 'Maize', label: 'Maize' },
            ]}
          />
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <EmptyState
          title="No Advisory Records Found"
          description={
            searchTerm || filterCrop !== 'All'
              ? 'No field decisions match your filter parameters. Try clearing your search parameters.'
              : 'You have not created any field crop assessments yet.'
          }
          actionLabel="Create Field Assessment"
          onAction={() => navigate(ROUTES.ANALYZE)}
        />
      ) : (
        <div className="space-y-4">
          {filteredAnalyses.map((item) => (
            <Card
              key={item.id}
              glassLevel="medium"
              hoverable
              onClick={() => navigate(getHistoryDetailPath(item.id))}
              className="cursor-pointer transition-all hover:border-[#B9E48C]/40"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#10251C] border border-[#B9E48C]/30 flex items-center justify-center text-2xl shrink-0">
                      {item.crop?.icon || (item.crop?.name === 'Rice' ? '🌾' : item.crop?.name === 'Tomato' ? '🍅' : item.crop?.name === 'Chilli' ? '🌶️' : item.crop?.name === 'Potato' ? '🥔' : item.crop?.name === 'Maize' ? '🌽' : '🌱')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-[#F5F2E8] text-base">{item.crop.name}</span>
                        <Badge variant="glass" size="sm">
                          {formatDate(item.createdAt)}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#F28B78] font-bold mt-0.5">
                        {item.assessment.primaryCondition.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-mono text-[#F5F2E8]/60 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B9E48C]" />
                          {item.location}
                        </span>
                        <span>&bull;</span>
                        <span>Window: {item.decision.actionWindow.bestStartTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-[#F5F2E8]/50 block">Suitability Score</span>
                      <span className="text-sm font-bold font-mono text-[#B9E48C]">
                        {item.decision.actionWindow.suitabilityScore}/100
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
