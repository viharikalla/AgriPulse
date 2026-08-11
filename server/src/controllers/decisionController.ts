import { Request, Response, NextFunction } from 'express';
import { DecisionEvaluationSchema } from '../schemas/decisionSchema.js';
import { OpenMeteoWeatherProvider } from '../providers/weather/OpenMeteoWeatherProvider.js';
import { DecisionEngine } from '../services/decision/decisionEngine.js';

const weatherProvider = new OpenMeteoWeatherProvider();

export async function evaluateDecision(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = DecisionEvaluationSchema.parse(req.body);

    // 1. Fetch real weather for coordinates
    const weatherSnapshot = await weatherProvider.getWeatherByCoords({
      locationName: input.locationName,
      latitude: input.latitude,
      longitude: input.longitude,
      hours: 48,
    });

    // 2. Run deterministic decision engine
    const decisionResult = DecisionEngine.evaluate(
      input.crop,
      input.condition,
      input.severity,
      weatherSnapshot
    );

    res.status(200).json({
      success: true,
      data: decisionResult,
    });
  } catch (err) {
    next(err);
  }
}
