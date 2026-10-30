export interface ScenarioConfig {
  latencyMs: number;
  forceHttpError: number | null; // e.g. 500, 401, 404
  simulateSessionExpired: boolean;
  simulatePaymentFailure: boolean;
  simulatePriceShiftOnCheckout: boolean;
  simulateOutOfOrder: boolean;
  simulateSlowSkeletons: boolean;
}

const DEFAULT_SCENARIO: ScenarioConfig = {
  latencyMs: 100,
  forceHttpError: null,
  simulateSessionExpired: false,
  simulatePaymentFailure: false,
  simulatePriceShiftOnCheckout: false,
  simulateOutOfOrder: false,
  simulateSlowSkeletons: false,
};

class ScenarioManager {
  private config: ScenarioConfig = { ...DEFAULT_SCENARIO };
  private listeners: Array<(config: ScenarioConfig) => void> = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem('__jungle_scenario_config__');
      if (stored) {
        this.config = { ...DEFAULT_SCENARIO, ...JSON.parse(stored) };
      }
    } catch {
      this.config = { ...DEFAULT_SCENARIO };
    }
  }

  public getConfig(): ScenarioConfig {
    return this.config;
  }

  public update(partial: Partial<ScenarioConfig>) {
    this.config = { ...this.config, ...partial };
    try {
      localStorage.setItem('__jungle_scenario_config__', JSON.stringify(this.config));
    } catch {
      // Ignore
    }
    this.notify();
  }

  public reset() {
    this.config = { ...DEFAULT_SCENARIO };
    try {
      localStorage.removeItem('__jungle_scenario_config__');
    } catch {
      // Ignore
    }
    this.notify();
  }

  public subscribe(listener: (config: ScenarioConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.config));
  }
}

export const scenarioManager = new ScenarioManager();

if (typeof window !== 'undefined') {
  (window as any).__jungle_scenario__ = scenarioManager;
}
