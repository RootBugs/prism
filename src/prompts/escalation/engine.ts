import { RefusalAnalyzer } from './analyzer';
import { strategies, getStrategy } from './strategies';
import { getConfig } from '../../utils/config';
import { logger } from '../../utils/logger';

interface EscalationContext {
  originalQuery: string;
  systemPrompt: string;
  response: string;
  conversation: string[];
  escalationLevel: number;
}

interface EscalationResult {
  strategy: string;
  systemPrompt: string;
  userMessage: string;
  level: number;
}

export class EscalationEngine {
  private analyzer: RefusalAnalyzer;
  private maxLevel: number;
  private enabled: boolean;

  constructor() {
    const config = getConfig();
    this.analyzer = new RefusalAnalyzer();
    this.maxLevel = config.escalation.maxLevel;
    this.enabled = config.escalation.enabled;
  }

  analyze(response: string): { isRefusal: boolean; confidence: number; patterns: { category: string; matched: string }[] } {
    return this.analyzer.analyze(response);
  }

  escalate(context: EscalationContext, level?: number): EscalationResult | null {
    if (!this.enabled) return null;

    const targetLevel = level || context.escalationLevel + 1;

    if (targetLevel > this.maxLevel) {
      logger.warn('Maximum escalation level reached', { level: targetLevel, maxLevel: this.maxLevel });
      return null;
    }

    const strategy = getStrategy(targetLevel - 1);

    logger.info('Escalating prompt', {
      level: targetLevel,
      strategy: strategy.name,
      originalQueryLength: context.originalQuery.length
    });

    return {
      strategy: strategy.name,
      systemPrompt: strategy.buildSystem(context),
      userMessage: strategy.buildUser(context.originalQuery),
      level: targetLevel
    };
  }

  getStrategies(): string[] {
    return strategies.map(s => s.name);
  }

  getMaxLevel(): number {
    return this.maxLevel;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}