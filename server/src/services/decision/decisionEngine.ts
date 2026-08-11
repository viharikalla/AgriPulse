import {
  SupportedCrop,
  SeverityLevel,
  WeatherSnapshot,
  WeatherHour,
  ActionWindowStatus,
  HourlyWindowScore,
  ActionWindow,
  DecisionResult,
  ActionWindowWeatherSummary,
} from '../../types/index.js';
import { AgronomyService } from '../agronomy/agronomyService.js';
import { AgronomyConditionEntry } from '../../schemas/agronomySchema.js';

export interface ScoringWeights {
  precipitationWeight: number;
  humidityWeight: number;
  windWeight: number;
  temperatureWeight: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  precipitationWeight: 1.0,
  humidityWeight: 0.8,
  windWeight: 0.7,
  temperatureWeight: 0.5,
};

export class DecisionEngine {
  public static scoreHour(
    hour: WeatherHour,
    agronomy: AgronomyConditionEntry,
    _weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
  ): HourlyWindowScore {
    let isEligible = true;
    let baseScore = 100;
    const reasons: string[] = [];
    const constraints: string[] = [];

    const precipProb = hour.precipitationProbabilityPct ?? hour.rainfallProbabilityPercent ?? 0;
    const precipMm = hour.precipitationMm ?? hour.rainMm ?? 0;
    const windKmh = hour.windSpeedKmh ?? 0;
    const humidityPct = hour.relativeHumidityPct ?? hour.humidityPercent ?? 50;
    const tempC = hour.temperatureC ?? 25;

    const profile = agronomy.weatherSensitivity;

    // 1. HARD CONSTRAINTS
    // Rain Constraint
    if (
      (profile.rainfall === 'unfavorable' || profile.rainfall === 'favorable_for_disease') &&
      (precipProb > 40 || precipMm > 0.5)
    ) {
      isEligible = false;
      constraints.push(`High precipitation risk (${precipProb}% chance, ${precipMm} mm) will wash off spray treatment.`);
    } else {
      reasons.push(`Low rain probability (${precipProb}%) ensures treatment dry time.`);
    }

    // Wind Operational Constraint (> 20 km/h)
    if (windKmh > 20) {
      isEligible = false;
      constraints.push(`Wind speed (${windKmh} km/h) exceeds safe operational limit of 20 km/h.`);
    }

    // Daylight Constraint
    if (profile.daylightPreferred) {
      const localHour = this.getLocalHourFromTimestamp(hour.timestamp);
      if (localHour < 6 || localHour >= 18) {
        isEligible = false;
        constraints.push(`Application restricted to daylight hours (06:00 to 18:00 local time).`);
      }
    }

    // 2. SOFT FACTORS (Apply sub-scores if eligible)
    let precipScore = 100;
    let windScore = 100;
    let humidityScore = 100;
    let tempScore = 100;

    if (isEligible) {
      // Humidity soft factor
      if (profile.humidity === 'favorable_for_disease' && humidityPct > 75) {
        const penalty = Math.min(40, (humidityPct - 75) * 1.5);
        humidityScore -= penalty;
        reasons.push(`Relative humidity (${humidityPct}%) is elevated for disease development.`);
      }

      // Wind soft factor (10..20 km/h)
      if (windKmh > 10) {
        const penalty = Math.min(30, (windKmh - 10) * 2.5);
        windScore -= penalty;
        reasons.push(`Wind speed (${windKmh} km/h) increases spray drift potential.`);
      } else {
        reasons.push(`Calm wind (${windKmh} km/h) maximizes foliage droplet deposition.`);
      }

      // Temperature soft factor
      if (tempC > 32 || tempC < 15) {
        tempScore -= 20;
        reasons.push(`Temperature (${tempC}°C) is outside optimal uptake window.`);
      }

      // Weighted Base Score
      baseScore = Math.round(
        (precipScore * 0.4) + (windScore * 0.3) + (humidityScore * 0.2) + (tempScore * 0.1)
      );
      baseScore = Math.max(0, Math.min(100, baseScore));
    } else {
      baseScore = 0;
    }

    return {
      timestamp: hour.timestamp || new Date().toISOString(),
      time: hour.time || '00:00',
      score: baseScore,
      isEligible,
      factors: {
        precipitationScore: precipScore,
        windScore: Math.round(windScore),
        humidityScore: Math.round(humidityScore),
        temperatureScore: Math.round(tempScore),
      },
      reasons,
      constraints,
    };
  }

  public static evaluateHourlyConditions(
    forecastHours: WeatherHour[],
    agronomy: AgronomyConditionEntry
  ): HourlyWindowScore[] {
    const horizon = Math.min(48, forecastHours.length);
    const hourlyScores: HourlyWindowScore[] = [];

    for (let i = 0; i < horizon; i++) {
      const hour = forecastHours[i];
      if (!hour || !hour.timestamp) continue;
      hourlyScores.push(this.scoreHour(hour, agronomy));
    }

    return hourlyScores;
  }

  public static findEligibleWindows(
    hourlyScores: HourlyWindowScore[],
    forecastHours: WeatherHour[],
    agronomy: AgronomyConditionEntry
  ): ActionWindow[] {
    const dryHoursRequired = agronomy.weatherSensitivity.dryWindowHours || 4;
    const windows: ActionWindow[] = [];

    let currentBlock: HourlyWindowScore[] = [];
    let currentBlockWeather: WeatherHour[] = [];

    for (let i = 0; i < hourlyScores.length; i++) {
      const hScore = hourlyScores[i];
      const hWeather = forecastHours[i];

      if (hScore.isEligible) {
        currentBlock.push(hScore);
        currentBlockWeather.push(hWeather);
      } else {
        if (currentBlock.length >= dryHoursRequired) {
          windows.push(this.buildActionWindow(currentBlock, currentBlockWeather));
        }
        currentBlock = [];
        currentBlockWeather = [];
      }
    }

    if (currentBlock.length >= dryHoursRequired) {
      windows.push(this.buildActionWindow(currentBlock, currentBlockWeather));
    }

    return windows;
  }

  public static selectBestWindow(candidateWindows: ActionWindow[]): ActionWindow | null {
    if (!candidateWindows || candidateWindows.length === 0) return null;

    // Rank candidate windows:
    // 1. Sort by averageScore descending
    // 2. Tie-breaker: If two windows have averageScores within 5 points, pick earlier startTime
    const sorted = [...candidateWindows].sort((a, b) => {
      const scoreDiff = b.averageScore - a.averageScore;
      if (Math.abs(scoreDiff) <= 5) {
        // Pick earlier start time
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
      return scoreDiff;
    });

    return sorted[0];
  }

  public static selectAlternativeWindows(
    candidateWindows: ActionWindow[],
    bestWindow: ActionWindow | null
  ): ActionWindow[] {
    if (!candidateWindows || candidateWindows.length === 0) return [];
    if (!bestWindow) return candidateWindows.slice(0, 3);

    return candidateWindows
      .filter((w) => w.startTime !== bestWindow.startTime)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3);
  }

  public static evaluate(
    crop: SupportedCrop,
    condition: string,
    _severity: SeverityLevel = 'Moderate',
    weatherSnapshot: WeatherSnapshot
  ): DecisionResult {
    const evaluatedAt = new Date().toISOString();
    const timezone = weatherSnapshot.timezone || 'Asia/Kolkata';

    // 1. Data Freshness & Data Validation Check
    if (
      !weatherSnapshot ||
      !weatherSnapshot.hourlyForecast ||
      weatherSnapshot.hourlyForecast.length === 0
    ) {
      return {
        status: 'INSUFFICIENT_DATA',
        summaryTitle: 'INSUFFICIENT WEATHER DATA',
        summaryText: 'Hourly weather forecast is unavailable for the selected field location.',
        bestWindow: null,
        alternativeWindows: [],
        hourlyScores: [],
        reasons: ['Required hourly weather parameters are missing.'],
        constraints: ['Forecast feed incomplete.'],
        confidence: 'Low',
        evaluatedAt,
        timezone,
      };
    }

    // 2. Fetch Agronomy Rules
    let agronomy: AgronomyConditionEntry;
    try {
      agronomy = AgronomyService.getCondition(crop, condition);
    } catch {
      return {
        status: 'INSUFFICIENT_DATA',
        summaryTitle: 'AGRONOMIC PROFILE MISSING',
        summaryText: `Agronomic knowledge entry for '${crop}/${condition}' was not found.`,
        bestWindow: null,
        alternativeWindows: [],
        hourlyScores: [],
        reasons: ['Agronomic disease weather profile is missing.'],
        constraints: ['Condition not in knowledge base.'],
        confidence: 'Low',
        evaluatedAt,
        timezone,
      };
    }

    // 3. Hourly Evaluation
    const forecastHours = weatherSnapshot.hourlyForecast || weatherSnapshot.hours || [];
    const hourlyScores = this.evaluateHourlyConditions(forecastHours, agronomy);

    // 4. Contiguous Window Detection (Duration >= dryWindowHours)
    const candidateWindows = this.findEligibleWindows(hourlyScores, forecastHours, agronomy);
    const bestWindow = this.selectBestWindow(candidateWindows);
    const alternativeWindows = this.selectAlternativeWindows(candidateWindows, bestWindow);

    // 5. Determine Overall Action Window Status & Farmer Summary
    let status: ActionWindowStatus = 'NO_SUITABLE_WINDOW';
    let summaryTitle = 'NO SAFE WINDOW AVAILABLE';
    let summaryText = `No contiguous ${agronomy.weatherSensitivity.dryWindowHours}-hour dry window was found within the next 48 hours.`;
    const reasons: string[] = [];
    const constraints: string[] = [];

    if (bestWindow) {
      const firstScore = hourlyScores[0];
      const isCurrentHourEligible = firstScore ? firstScore.isEligible : false;

      if (isCurrentHourEligible && bestWindow.startTime === hourlyScores[0]?.timestamp) {
        status = 'ACT_NOW';
        summaryTitle = 'THE FIELD SAYS: ACT NOW';
        summaryText = `Current weather conditions are favorable for ${agronomy.displayName} management. A continuous ${bestWindow.durationHours}-hour window is available.`;
      } else {
        status = 'WAIT';
        summaryTitle = 'THE FIELD SAYS: WAIT';
        const formattedStart = this.formatDisplayWindowTime(bestWindow.startTime, timezone);
        const formattedEnd = this.formatDisplayWindowTime(bestWindow.endTime, timezone);
        summaryText = `Rain or adverse weather is expected soon. Postpone application until ${formattedStart} – ${formattedEnd} for optimal efficacy.`;
      }

      reasons.push(...bestWindow.reasons);
      constraints.push(...bestWindow.constraints);
    } else {
      status = 'NO_SUITABLE_WINDOW';
      constraints.push(`Rainfall or high wind risk persists throughout the 48-hour forecast horizon.`);
      reasons.push(`Continuous ${agronomy.weatherSensitivity.dryWindowHours} dry hours required for treatment uptake.`);
    }

    return {
      status,
      summaryTitle,
      summaryText,
      bestWindow,
      alternativeWindows,
      hourlyScores,
      reasons: Array.from(new Set(reasons)),
      constraints: Array.from(new Set(constraints)),
      confidence: agronomy.sources.length > 0 ? 'High' : 'Moderate',
      evaluatedAt,
      timezone,
    };
  }

  private static buildActionWindow(
    block: HourlyWindowScore[],
    weatherBlock: WeatherHour[]
  ): ActionWindow {
    const startTime = block[0].timestamp;
    const lastTime = block[block.length - 1].timestamp;

    // Calculate end time by adding 1 hour to last hour timestamp
    const endDate = new Date(lastTime);
    endDate.setHours(endDate.getHours() + 1);
    const endTime = endDate.toISOString();

    const durationHours = block.length;
    const scores = block.map((b) => b.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const minimumScore = Math.min(...scores);
    const maximumScore = Math.max(...scores);

    const reasons = Array.from(new Set(block.flatMap((b) => b.reasons)));
    const constraints = Array.from(new Set(block.flatMap((b) => b.constraints)));

    // Weather Summary
    const temps = weatherBlock.map((w) => w.temperatureC);
    const humidities = weatherBlock.map((w) => w.relativeHumidityPct ?? w.humidityPercent ?? 0);
    const precipProbs = weatherBlock.map((w) => w.precipitationProbabilityPct ?? w.rainfallProbabilityPercent ?? 0);
    const precipMms = weatherBlock.map((w) => w.precipitationMm ?? w.rainMm ?? 0);
    const winds = weatherBlock.map((w) => w.windSpeedKmh ?? 0);
    const gusts = weatherBlock.map((w) => w.windGustKmh ?? 0);

    const weatherSummary: ActionWindowWeatherSummary = {
      minTempC: Math.min(...temps),
      maxTempC: Math.max(...temps),
      avgHumidityPct: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      maxPrecipProbabilityPct: Math.max(...precipProbs),
      totalPrecipitationMm: parseFloat(precipMms.reduce((a, b) => a + b, 0).toFixed(1)),
      maxWindSpeedKmh: Math.max(...winds),
      maxWindGustKmh: Math.max(...gusts),
      dominantCondition: weatherBlock[0]?.conditionDescription || 'Clear',
    };

    const formattedStart = this.formatDisplayWindowTime(startTime);
    const formattedEnd = this.formatDisplayWindowTime(endTime);

    return {
      startTime,
      endTime,
      durationHours,
      averageScore,
      minimumScore,
      maximumScore,
      status: averageScore >= 80 ? 'FAVORABLE' : 'WAIT',
      reasons,
      constraints,
      weatherSummary,
      // Backward display aliases
      bestStartTime: formattedStart,
      bestEndTime: formattedEnd,
      suitabilityScore: averageScore,
      recommendationReason: `Continuous ${durationHours}-hour window with average score ${averageScore}/100.`,
      riskFactors: constraints,
      weatherConstraintReasoning: `Wind < ${weatherSummary.maxWindSpeedKmh} km/h, rain chance max ${weatherSummary.maxPrecipProbabilityPct}%.`,
    };
  }

  private static getLocalHourFromTimestamp(isoTimestamp: string): number {
    try {
      const date = new Date(isoTimestamp);
      return date.getHours();
    } catch {
      return 12;
    }
  }

  private static formatDisplayWindowTime(isoTimestamp: string, _tz = 'Asia/Kolkata'): string {
    try {
      const date = new Date(isoTimestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch {
      return isoTimestamp;
    }
  }
}
