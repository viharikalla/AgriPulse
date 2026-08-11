import { Request, Response, NextFunction } from 'express';
import { AnalysisService } from '../services/analysis/analysisService.js';
import { AssistantRequestSchema } from '../schemas/index.js';

const analysisService = new AnalysisService();

export async function askAssistant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = AssistantRequestSchema.parse(req.body);
    const answer = await analysisService.askAssistant(input.question, input.contextCrop);

    res.status(200).json({
      success: true,
      data: {
        question: input.question,
        answer,
        answeredAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}
