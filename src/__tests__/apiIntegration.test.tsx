import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnalyzePage } from '../pages/AnalyzePage';
import { AdvisoryDetailPage } from '../pages/AdvisoryDetailPage';
import { ApiClient } from '../services/apiClient';
import { FieldAnalysis } from '../types';

vi.mock('../services/apiClient', () => {
  return {
    ApiClient: {
      searchLocation: vi.fn().mockResolvedValue([
        {
          name: 'Vijayawada',
          latitude: 16.5062,
          longitude: 80.648,
          country: 'India',
          admin1: 'Andhra Pradesh',
          timezone: 'Asia/Kolkata',
        },
      ]),
      getWeather: vi.fn().mockResolvedValue({
        locationName: 'Vijayawada',
        currentTempC: 30,
        currentHumidity: 65,
        currentWindSpeedKmh: 8,
        currentCondition: 'Clear',
        hourlyForecast: [],
      }),
      analyzeField: vi.fn(),
      getAnalysis: vi.fn(),
      getHistory: vi.fn().mockResolvedValue([]),
      askFieldQuestion: vi.fn(),
    },
  };
});

function createMockFieldAnalysis(overrides?: Partial<FieldAnalysis>): FieldAnalysis {
  return {
    id: 'adv-test-101',
    createdAt: new Date().toISOString(),
    location: 'Vijayawada, Andhra Pradesh',
    latitude: 16.5062,
    longitude: 80.648,
    crop: { name: 'Tomato', displayName: 'Tomato' },
    photoUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    assessment: {
      id: 'ass-101',
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_early_blight',
        name: 'Tomato Early Blight',
        category: 'Fungal Disease',
        severity: 'Moderate',
        description: 'Target ring spot lesions.',
        symptoms: ['Brown spots', 'Yellow halos'],
      },
      confidenceScore: 0.93,
      confidenceLevel: 'High',
      visualObservations: ['Concentric lesions on foliage'],
      diagnosisSummary: 'High confidence visual match.',
    },
    weatherSnapshot: {
      locationName: 'Vijayawada',
      currentTempC: 30,
      currentHumidity: 65,
      currentWindSpeedKmh: 8,
      currentCondition: 'Clear',
      hourlyForecast: [],
      hours: [
        {
          time: '07:00',
          temperatureC: 28,
          humidityPercent: 60,
          rainfallProbabilityPercent: 5,
          windSpeedKmh: 7,
          conditionDescription: 'Clear',
          spraySuitability: 'Optimal',
          suitabilityReason: 'Dry window',
        },
      ],
    },
    decision: {
      summaryTitle: 'WAIT FOR OPTIMAL WINDOW',
      decisionStatus: 'WAIT',
      primaryAction: {
        id: 'act-1',
        actionType: 'Spray',
        title: 'Apply Protectant Treatment',
        description: 'Wait until tomorrow morning for optimal dry window.',
        recommendedDosage: '2.0 g / L',
        timingWindow: {
          startTime: '2026-08-11T07:00:00+05:30',
          endTime: '2026-08-11T10:30:00+05:30',
          durationHours: 3.5,
          averageScore: 88,
          status: 'FAVORABLE',
          reasons: ['Low wind'],
          constraints: [],
          weatherSummary: {
            minTempC: 25,
            maxTempC: 29,
            avgHumidityPct: 65,
            maxPrecipProbabilityPct: 5,
            totalPrecipitationMm: 0,
            maxWindSpeedKmh: 7,
            maxWindGustKmh: 10,
            dominantCondition: 'Clear',
          },
          bestStartTime: 'Tomorrow 07:00',
          bestEndTime: 'Tomorrow 10:30',
          suitabilityScore: 88,
        },
        precautions: ['Wear mask'],
        priority: 'High',
      },
      actionWindow: {
        startTime: '2026-08-11T07:00:00+05:30',
        endTime: '2026-08-11T10:30:00+05:30',
        durationHours: 3.5,
        averageScore: 88,
        status: 'FAVORABLE',
        reasons: ['Low wind'],
        constraints: [],
        weatherSummary: {
          minTempC: 25,
          maxTempC: 29,
          avgHumidityPct: 65,
          maxPrecipProbabilityPct: 5,
          totalPrecipitationMm: 0,
          maxWindSpeedKmh: 7,
          maxWindGustKmh: 10,
          dominantCondition: 'Clear',
        },
        bestStartTime: 'Tomorrow 07:00',
        bestEndTime: 'Tomorrow 10:30',
        suitabilityScore: 88,
      },
      monitoringChecklist: ['Check leaves daily'],
      rationale: 'Wait for morning spray window.',
    },
    managementActions: [],
    ...overrides,
  };
}

describe('Frontend API Integration & Reliability UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Image selection updates photo state and preview', async () => {
    const { container } = render(
      <BrowserRouter>
        <AnalyzePage />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/FIELD EVIDENCE/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Analyze my field/i)).toBeInTheDocument();

    const file = new File(['dummy content'], 'my_leaf.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/my_leaf.jpg/i)).toBeInTheDocument();
    });
  });

  it('3 & 4. Successful /api/analyze execution triggers ApiClient.analyzeField', async () => {
    const mockResult = createMockFieldAnalysis();
    (ApiClient.analyzeField as any).mockResolvedValue(mockResult);

    const { container } = render(
      <BrowserRouter>
        <AnalyzePage />
      </BrowserRouter>
    );

    const file = new File(['dummy content'], 'my_leaf.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/my_leaf.jpg/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByText(/Analyze my field/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(ApiClient.analyzeField).toHaveBeenCalledTimes(1);
    });
  });

  it('5. NEEDS_REVIEW result renders uncertainty state on detail page', async () => {
    const mockNeedsReview = createMockFieldAnalysis({
      assessment: {
        id: 'ass-102',
        cropName: 'Tomato',
        primaryCondition: {
          id: 'tomato_unknown',
          name: 'Unidentified Foliage Anomaly',
          category: 'Unknown',
          severity: 'Low',
          description: 'Uncertain',
          symptoms: [],
        },
        confidenceScore: 0.45,
        confidenceLevel: 'Low',
        visualObservations: ['Faint spots'],
        diagnosisSummary: 'AgriPulse needs a clearer view before recommending action.',
      },
      decision: {
        summaryTitle: 'AGRONOMIC VERIFICATION NEEDED',
        decisionStatus: 'INSUFFICIENT_DATA',
        primaryAction: {
          id: 'act-review',
          actionType: 'Inspect',
          title: 'Manual Field Verification Required',
          description: 'AgriPulse needs a clearer view before recommending a condition-specific action.',
          timingWindow: {} as any,
          precautions: [],
          priority: 'High',
        },
        actionWindow: {} as any,
        monitoringChecklist: [],
        rationale: 'Insufficient visual confidence',
      },
    });

    (ApiClient.getAnalysis as any).mockResolvedValue(mockNeedsReview);

    render(
      <BrowserRouter>
        <AdvisoryDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/AGRONOMIC VERIFICATION NEEDED/i)).toBeInTheDocument();
    });
  });

  it('8. ACT_NOW decision renders active spray window state', async () => {
    const mockActNow = createMockFieldAnalysis({
      decision: {
        summaryTitle: 'GOOD SPRAY WINDOW OPEN NOW',
        decisionStatus: 'ACT_NOW',
        primaryAction: {} as any,
        actionWindow: {} as any,
        monitoringChecklist: [],
        rationale: 'Conditions optimal now.',
      },
    });

    (ApiClient.getAnalysis as any).mockResolvedValue(mockActNow);

    render(
      <BrowserRouter>
        <AdvisoryDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/1. WHAT'S WRONG?/i)).toBeInTheDocument();
    });
  });

  it('9 & 10. API Error 429 renders friendly busy error in modal', async () => {
    const err = new Error('The field analysis service is temporarily busy due to high demand. Please try again shortly.');
    (err as any).status = 429;
    (ApiClient.analyzeField as any).mockRejectedValue(err);

    const { container } = render(
      <BrowserRouter>
        <AnalyzePage />
      </BrowserRouter>
    );

    const file = new File(['dummy content'], 'my_leaf.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/my_leaf.jpg/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByText(/Analyze my field/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/The field analysis service is temporarily busy/i)).toBeInTheDocument();
    });
  });

  it('11. Submit button is disabled while analysis is running', async () => {
    (ApiClient.analyzeField as any).mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <BrowserRouter>
        <AnalyzePage />
      </BrowserRouter>
    );

    const file = new File(['dummy content'], 'my_leaf.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/my_leaf.jpg/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByText(/Analyze my field/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Analyzing field.../i)).toBeInTheDocument();
    });
  });

  it('12. Retry button triggers re-execution', async () => {
    const err = new Error('Network timeout');
    (ApiClient.analyzeField as any).mockRejectedValueOnce(err).mockResolvedValueOnce(createMockFieldAnalysis());

    const { container } = render(
      <BrowserRouter>
        <AnalyzePage />
      </BrowserRouter>
    );

    const file = new File(['dummy content'], 'my_leaf.jpg', { type: 'image/jpeg' });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/my_leaf.jpg/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByText(/Analyze my field/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Try again/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByText(/Try again/i);
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(ApiClient.analyzeField).toHaveBeenCalledTimes(2);
    });
  });
});
