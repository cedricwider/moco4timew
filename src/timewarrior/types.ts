export interface TimewarriorConfig {
  [key: string]: string;
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
