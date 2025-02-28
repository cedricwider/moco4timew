import {
  CreateMocoActivity,
  formatISOString,
  MocoProject,
  MocoTask,
  TimewarriorInterval,
} from "./mod.ts";
import { picoSearch } from "@scmmishra/pico-search";

/**
 * Transforms Timewarrior intervals into Moco activities
 * using fuzzy matching for project and task identification.
 */
export class IntervalTransformer {
  /** Tags that indicate non-billable work */
  NO_BILL_TAGS = [
    "vacation",
    "holiday",
    "sick",
    "illness",
    "ill",
    "non-billabe",
    "nobi",
    "nobill",
    "no-bill",
    "unbillable",
    "unbill",
    "un-bill",
    "nonbillable",
    "nonbill",
    "non-bill",
    "non-billable",
  ];

  /** Default fuzzy search threshold */
  private readonly fuzzyThreashold: number = 0.8;

  /** Available Moco projects */
  private readonly projects: MocoProject[];

  /**
   * Creates a new IntervalTransformer
   * @param projects Array of Moco projects with their tasks
   * @param options Optional configuration parameters
   */
  constructor(projects: MocoProject[], options?: { fuzzyThreshold?: number }) {
    this.validateProjects(projects);
    this.projects = projects;

    if (options?.fuzzyThreshold) {
      this.fuzzyThreashold = options.fuzzyThreshold;
    }
  }

  /**
   * Transforms a Timewarrior interval into a Moco activity
   * @param interval The Timewarrior interval to transform
   * @returns A Moco activity ready to be created
   * @throws Error if no matching project is found or if interval data is invalid
   */
  public toActivity(interval: TimewarriorInterval): CreateMocoActivity {
    // Validate interval
    this.validateInterval(interval);

    const project = this.findProject(interval.project);
    const technicalTask = this.findTask(interval.tags, project.tasks);

    return {
      project_id: project.id,
      task_id: technicalTask?.id ?? project.tasks[0].id,
      date: new Date(formatISOString(interval.start))
        .toISOString()
        .split("T")[0],
      seconds: this.calculateSeconds(interval),
      description: interval.description,
    };
  }

  private findProject(searchTerm: string) {
    const project = this.fuzzyFind(this.projects, searchTerm, ["name"]);

    if (!project) {
      throw new Error(
        `Could not find project for interval with project name: "${searchTerm}"`,
      );
    }

    if (!project.tasks || project.tasks.length === 0) {
      throw new Error(
        `Project "${project.name}" (ID: ${project.id}) has no tasks defined`,
      );
    }
    return project;
  }

  /**
   * Finds the most appropriate task based on interval tags
   * @param tags Tags from the Timewarrior interval
   * @param tasks Available tasks for the matched project
   * @returns The best matching task or undefined if none found
   */
  private findTask(
    tags: Array<string>,
    tasks: Array<MocoTask>,
  ): MocoTask | undefined {
    // Filter out work tag and keep only non-billable tags
    const nonBillableTags = tags
      .filter((tag) => tag !== "work") // work is just the context added by taskwarrior
      .filter((tag) => this.NO_BILL_TAGS.includes(tag));

    // Default to "software engineering" if no relevant tags found
    const searchTerm = nonBillableTags[0] ?? "software engineering";

    const activeTasks = tasks.filter((task) => task.active);
    if (activeTasks.length === 0) {
      console.warn("No active tasks found for project");
      return undefined;
    }

    const technicalTask = this.fuzzyFind(activeTasks, searchTerm, ["name"]);
    return technicalTask;
  }

  /**
   * Performs fuzzy search on an array of objects
   * @param things Array of objects to search through
   * @param searchTerm Term to search for
   * @param keys Object keys to search in
   * @returns The best matching object or undefined if none found
   */
  private fuzzyFind<T extends MocoProject | MocoTask>(
    things: Array<T>,
    searchTerm: string,
    keys: Array<keyof T>,
  ): T | undefined {
    if (!things || things.length === 0) {
      console.warn(`No items to search through for term: "${searchTerm}"`);
      return undefined;
    }

    const attributes = keys.map((key) => key.toString().toLowerCase());
    const results = picoSearch(things, searchTerm, attributes, {
      threshold: this.fuzzyThreashold,
    });

    if (results.length === 0) {
      console.warn(`No matches found for search term: "${searchTerm}"`);
    }

    return results[0];
  }

  /**
   * Calculates the duration of an interval in seconds
   * @param interval The Timewarrior interval
   * @returns Duration in seconds
   */
  private calculateSeconds(interval: TimewarriorInterval): number {
    try {
      const start = new Date(formatISOString(interval.start));
      const end = new Date(formatISOString(interval.end));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
      }

      if (end < start) {
        throw new Error("End date is before start date");
      }

      return (end.getTime() - start.getTime()) / 1000;
    } catch (error) {
      throw new Error(`Failed to calculate interval duration: ${error}`);
    }
  }

  /**
   * Validates projects array structure
   * @param projects Projects to validate
   * @throws Error if projects structure is invalid
   */
  private validateProjects(projects: MocoProject[]): void {
    if (!projects || !Array.isArray(projects)) {
      throw new Error("Projects must be a valid array");
    }

    if (projects.length === 0) {
      console.warn("No projects provided to IntervalTransformer");
    }
  }

  /**
   * Validates interval data
   * @param interval Interval to validate
   * @throws Error if interval data is invalid
   */
  private validateInterval(interval: TimewarriorInterval): void {
    if (!interval) {
      throw new Error("Interval cannot be null or undefined");
    }

    if (!interval.start || !interval.end) {
      throw new Error("Interval must have start and end dates");
    }

    if (!interval.project) {
      throw new Error("Interval must have a project name");
    }
  }
}
