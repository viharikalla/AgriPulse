export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export type SupportedCropName =
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

export interface Crop {
  id: string;
  name: SupportedCropName;
  scientificName: string;
  category: 'Cereal' | 'Vegetable' | 'Spice' | 'Tuber' | 'Legume' | 'Oilseed' | 'Pulse' | 'Fiber';
  icon: string;
  description: string;
  commonDiseases: string[];
}

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

export interface WeatherHour {
  time: string;
  temperatureC: number;
  humidityPercent: number;
  rainfallProbabilityPercent: number;
  windSpeedKmh: number;
  conditionDescription: string;
  spraySuitability: SuitabilityRating;
  suitabilityReason: string;
  timestamp?: string;
  timezone?: string;
  relativeHumidityPct?: number;
  precipitationProbabilityPct?: number;
  precipitationMm?: number;
  rainMm?: number;
  windGustKmh?: number;
  dewPointC?: number;
  cloudCoverPct?: number;
  weatherCode?: number;
  et0Mm?: number;
}

export interface WeatherSnapshot {
  locationName: string;
  currentTempC: number;
  currentHumidity: number;
  currentWindSpeedKmh: number;
  currentCondition: string;
  hourlyForecast: WeatherHour[];
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
  fetchedAt?: string;
  retrievedAt?: string;
  forecastHorizonHours?: number;
  hours?: WeatherHour[];
  provider?: string;
  sourceMetadata?: {
    provider: string;
    providerUrl: string;
    retrievedAt: string;
    latitude: number;
    longitude: number;
    timezone: string;
    forecastDays: number;
    attribution: string;
  };
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

export interface CropCondition {
  id: string;
  name: string;
  category: string;
  severity: SeverityLevel;
  description: string;
  symptoms: string[];
}

export interface CropAssessment {
  id: string;
  cropName?: SupportedCropName;
  primaryCondition: CropCondition;
  confidenceScore: number;
  confidenceLevel?: ConfidenceLevel;
  visualObservations: string[];
  diagnosisSummary: string;
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
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  averageScore?: number;
  minimumScore?: number;
  maximumScore?: number;
  status?: ActionWindowStatus;
  reasons?: string[];
  constraints?: string[];
  weatherSummary?: ActionWindowWeatherSummary;
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

export interface FieldDecision {
  summaryTitle: string;
  decisionStatus?: ActionWindowStatus;
  primaryAction: ManagementAction;
  actionWindow: ActionWindow;
  monitoringChecklist: string[];
  rationale: string;
}

export interface FieldAnalysis {
  id: string;
  createdAt: string;
  location: string;
  latitude?: number;
  longitude?: number;
  crop: {
    name: SupportedCropName;
    displayName?: string;
    icon?: string;
  };
  photoUrl: string;
  assessment: CropAssessment;
  weatherSnapshot: WeatherSnapshot;
  decision: FieldDecision;
  managementActions: ManagementAction[];
  notes?: string;
}
