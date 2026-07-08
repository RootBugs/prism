interface RequestMetrics {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  provider: string;
  model: string;
  promptLength: number;
  responseLength: number;
  latencyMs: number;
  status: number;
  tokensUsed: number;
  layerCount: number;
  escalationLevel: number;
}

const metrics: RequestMetrics[] = [];
const MAX_METRICS = 10000;

function generateId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const metricsTracker = {
  start(method: string, path: string): { id: string; timestamp: string } {
    return {
      id: generateId(),
      timestamp: new Date().toISOString()
    };
  },

  record(entry: Omit<RequestMetrics, 'id' | 'timestamp'>): void {
    const record: RequestMetrics = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...entry
    };

    metrics.push(record);

    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }
  },

  getMetrics(): RequestMetrics[] {
    return [...metrics];
  },

  getMetricsById(id: string): RequestMetrics | undefined {
    return metrics.find(m => m.id === id);
  },

  getStats(): {
    totalRequests: number;
    averageLatency: number;
    totalTokens: number;
    providerBreakdown: Record<string, number>;
  } {
    const totalRequests = metrics.length;
    const averageLatency = totalRequests > 0
      ? metrics.reduce((sum, m) => sum + m.latencyMs, 0) / totalRequests
      : 0;
    const totalTokens = metrics.reduce((sum, m) => sum + m.tokensUsed, 0);
    
    const providerBreakdown: Record<string, number> = {};
    for (const m of metrics) {
      providerBreakdown[m.provider] = (providerBreakdown[m.provider] || 0) + 1;
    }

    return {
      totalRequests,
      averageLatency,
      totalTokens,
      providerBreakdown
    };
  },

  clear(): void {
    metrics.length = 0;
  }
};