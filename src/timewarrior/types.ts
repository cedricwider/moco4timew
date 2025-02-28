export interface TimewarriorConfig {
  temp?: {
    report?: {
      start?: string;
      end?: string;
    };
  };
  debug: boolean;
  verbose: boolean;
  [key: string]: unknown;
}

export interface TimewarriorInterval {
  id: number;
  start: string;
  end: string;
  tags: string[];
}

export interface TimewarriorData {
  config: TimewarriorConfig;
  intervals: TimewarriorInterval[];
}
