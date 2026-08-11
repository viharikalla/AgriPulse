export type SupportedCrop =
  | 'Rice'
  | 'Wheat'
  | 'Maize'
  | 'Tomato'
  | 'Potato'
  | 'Chilli'
  | 'Soybean'
  | 'Groundnut'
  | 'Chickpea'
  | 'Cotton';

export type SeverityLevel = 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Critical';
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';
export type ActionType = 'Spray' | 'Wait' | 'Inspect' | 'Irrigate' | 'Fertilize' | 'Prune' | 'Sanitize';
export type ActionPriority = 'Low' | 'Medium' | 'High' | 'Immediate';
export type SuitabilityRating = 'Optimal' | 'Marginal' | 'Unfavorable';

export type ActionWindowStatus =
  | 'ACT_NOW'
  | 'FAVORABLE'
  | 'WAIT'
  | 'NO_SUITABLE_WINDOW'
  | 'INSUFFICIENT_DATA';

export interface ImageQuality {
  isValid: boolean;
  width?: number;
  height?: number;
  mimeType: string;
  sizeBytes: number;
  resized: boolean;
  qualityNotes?: string;
}

export interface CropCondition {
  id: string;
  name: string;
  category: 'Fungal Disease' | 'Bacterial Disease' | 'Viral Disease' | 'Pest Damage' | 'Healthy' | 'Unknown';
  severity: SeverityLevel;
  description: string;
  symptoms: string[];
}

export interface CropAssessment {
  id: string;
  cropName: SupportedCrop;
  primaryCondition: CropCondition;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  visualObservations: string[];
  diagnosisSummary: string;
  imageQuality: ImageQuality;
}

export interface WeatherHour {
  timestamp: string;
  time: string;
  timezone: string;
  temperatureC: number;
  relativeHumidityPct: number;
  humidityPercent: number;
  precipitationProbabilityPct: number;
  rainfallProbabilityPercent: number;
  precipitationMm: number;
  rainMm: number;
  windSpeedKmh: number;
  windGustKmh: number;
  dewPointC: number;
  cloudCoverPct: number;
  weatherCode: number;
  conditionDescription: string;
  spraySuitability: SuitabilityRating;
  suitabilityReason: string;
  et0Mm?: number;
}

export interface WeatherSnapshotSourceMetadata {
  provider: 'open-meteo' | 'mock';
  providerUrl: string;
  retrievedAt: string;
  latitude: number;
  longitude: number;
  timezone: string;
  forecastDays: number;
  attribution: string;
}

export interface WeatherSnapshot {
  locationName: string;
  location?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  fetchedAt: string;
  retrievedAt: string;
  timezone: string;
  currentTempC: number;
  currentHumidity: number;
  currentWindSpeedKmh: number;
  currentCondition: string;
  forecastHorizonHours: number;
  hourlyForecast: WeatherHour[];
  hours: WeatherHour[];
  provider: string;
  sourceMetadata: WeatherSnapshotSourceMetadata;
}

export interface ResolvedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  elevation?: number;
}

export interface HourlyWindowScore {
  timestamp: string;
  time: string;
  score: number;
  isEligible: boolean;
  factors: {
    precipitationScore: number;
    windScore: number;
    humidityScore: number;
    temperatureScore: number;
  };
  reasons: string[];
  constraints: string[];
}

export interface ActionWindowWeatherSummary {
  minTempC: number;
  maxTempC: number;
  avgHumidityPct: number;
  maxPrecipProbabilityPct: number;
  totalPrecipitationMm: number;
  maxWindSpeedKmh: number;
  maxWindGustKmh: number;
  dominantCondition: string;
}

export interface ActionWindow {
  startTime: string;
  endTime: string;
  durationHours: number;
  averageScore: number;
  minimumScore: number;
  maximumScore: number;
  status: ActionWindowStatus;
  reasons: string[];
  constraints: string[];
  weatherSummary: ActionWindowWeatherSummary;
  // Display aliases for UI backward compatibility
  bestStartTime?: string;
  bestEndTime?: string;
  suitabilityScore?: number;
  recommendationReason?: string;
  riskFactors?: string[];
  weatherConstraintReasoning?: string;
}

export interface DecisionResult {
  status: ActionWindowStatus;
  summaryTitle: string;
  summaryText: string;
  bestWindow: ActionWindow | null;
  alternativeWindows: ActionWindow[];
  hourlyScores: HourlyWindowScore[];
  reasons: string[];
  constraints: string[];
  confidence: 'Low' | 'Moderate' | 'High';
  evaluatedAt: string;
  timezone: string;
}

export interface ManagementAction {
  id: string;
  actionType: ActionType;
  title: string;
  description: string;
  recommendedDosage?: string;
  timingWindow: ActionWindow;
  precautions: string[];
  priority: ActionPriority;
}

export interface MonitoringItem {
  id: string;
  title: string;
  frequency: string;
  checkReason: string;
}

export interface FieldDecision {
  summaryTitle: string;
  decisionStatus: ActionWindowStatus;
  primaryAction: ManagementAction;
  actionWindow: ActionWindow;
  monitoringChecklist: string[];
  rationale: string;
}

export interface SourceMetadata {
  providerAI: string;
  providerWeather: string;
  engineVersion: string;
  processedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FieldAnalysis {
  id: string;
  sessionId: string;
  userId?: string;
  createdAt: string;
  location: string;
  latitude?: number;
  longitude?: number;
  crop: {
    name: SupportedCrop;
    displayName: string;
  };
  photoUrl: string;
  assessment: CropAssessment;
  weatherSnapshot: WeatherSnapshot;
  decision: FieldDecision;
  managementActions: ManagementAction[];
  sourceMetadata: SourceMetadata;
  notes?: string;
}

export interface AnalyzeRequestInput {
  crop: SupportedCrop;
  location: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface AssistantRequestInput {
  question: string;
  analysisId?: string;
  contextCrop?: SupportedCrop;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
