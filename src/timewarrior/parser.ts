import {
  TimewarriorConfig,
  TimewarriorData,
  TimewarriorInterval,
} from "./types.ts";

export class TimewarriorParser {
  /**
   * Parses raw input from Timewarrior into structured data
   * @param input Raw input string from Timewarrior (config + JSON data)
   * @returns Parsed Timewarrior data including config and intervals
   */
  public static parse(input: string): TimewarriorData {
    const [configStr, jsonStr] = input.split("\n\n");

    return {
      config: this.parseConfig(configStr),
      intervals: this.parseIntervals(jsonStr),
    };
  }

  /**
   * Parses the configuration section of Timewarrior input
   * @param configStr Raw configuration string
   * @returns Parsed configuration object
   */
  private static parseConfig(configStr: string): TimewarriorConfig {
    const config: TimewarriorConfig = {};

    configStr.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(": ");
      if (key && valueParts.length > 0) {
        config[key] = valueParts.join(": ");
      }
    });

    return config;
  }

  /**
   * Parses the intervals JSON section of Timewarrior input
   * @param jsonStr Raw JSON string containing intervals
   * @returns Array of parsed intervals
   */
  private static parseIntervals(jsonStr: string): TimewarriorInterval[] {
    return JSON.parse(jsonStr);
  }
}
