import {
  CreateMocoActivity,
  formatISOString,
  MocoProject,
  MocoTask,
  SearchUtil,
  TimewarriorInterval,
} from '../mod.ts';

/**
 * Transforms Timewarrior intervals into Moco activities
 * using fuzzy matching for project and task identification.
 */
export class IntervalTransformer {
  /** Tags that indicate non-billable work */
  NO_BILL_TAGS = [
    'vacation',
    'holiday',
    'sick',
    'illness',
    'ill',
    'non-billabe',
    'nobi',
    'nobill',
    'no-bill',
    'unbillable',
    'unbill',
    'un-bill',
    'nonbillable',
    'nonbill',
    'non-bill',
    'non-billable',
  ];

  private readonly searchUtil: SearchUtil;

  /**
   * Creates a new IntervalTransformer
   * @param projects Array of Moco projects with their tasks
   * @param options Optional configuration parameters
   */
  constructor(private readonly projects: MocoProject[]) {
    this.validateProjects(projects);
    this.searchUtil = new SearchUtil();
  }

  /**
   * Transforms a Timewarrior interval into a Moco activity
   * @param interval The Timewarrior interval to transform
   * @returns A Moco activity ready to be created
   * @throws Error if no matching project is found or if interval data is invalid
   */
  public toActivity(
    interval: TimewarriorInterval,
  ): CreateMocoActivity | undefined {
    // Validate interval
    this.validateInterval(interval);

    const project = this.findProject(interval.project);
    const technicalTask = this.findTask(interval.tags, project.tasks);
    if (!technicalTask) {
      console.error(
        `!!! No technical task found for interval ${JSON.stringify(interval)}`,
      );
      return;
    }

    return this.buildCreateMocoActivity(project, technicalTask, interval);
  }

  /**
   * Searches for activities with the same date, project,
   * activity and description and merges them by summing up the seconds
   * @param activities Array of Timewarrior intervals
   * @returns Array of Moco activities ready to be created
   */
  public summarize(
    activities: Array<CreateMocoActivity | undefined>,
  ): Array<CreateMocoActivity> {
    const summarized: Array<CreateMocoActivity> = [];

    activities
      .filter((activity) => !!activity)
      .forEach((interval) => {
        const existing = summarized.find(
          (item) =>
            item.date === interval.date &&
            item.project_id === interval.project_id &&
            item.description === interval.description,
        );

        if (existing) {
          existing.seconds += interval.seconds;
        } else {
          summarized.push(interval);
        }
      });

    return summarized;
  }

  /**
   * Builds a Moco activity object based on interval data
   * @param project The matched Moco project
   * @param technicalTask The matched Moco task
   * @param interval The Timewarrior interval
   * @returns A Moco activity object
   */
  private buildCreateMocoActivity(
    project: MocoProject,
    technicalTask: MocoTask,
    interval: TimewarriorInterval,
  ): CreateMocoActivity {
    const createMocoActivity: CreateMocoActivity = {
      project_id: project.id,
      task_id: technicalTask?.id,
      date: new Date(formatISOString(interval.start))
        .toISOString()
        .split('T')[0],
      seconds: this.calculateSeconds(interval),
      description: interval.description,
    };

    if (interval.tags.some((tag) => this.NO_BILL_TAGS.includes(tag))) {
      createMocoActivity.billable = false;
    }

    return createMocoActivity;
  }

  /**
   * Finds the most appropriate project based on interval project name
   * @param searchTerm Project name from the Timewarrior interval
   * @returns The best matching project
   * @throws Error if no matching project is found
   */
  private findProject(searchTerm: string) {
    const project = this.searchUtil.fuzzyFind(this.projects, searchTerm, [
      'name',
    ]);

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
    const searchTerms = tags
      .filter((tag) => tag !== 'work') // work is just the context added by taskwarrior
      .filter((tag) => !this.NO_BILL_TAGS.includes(tag));

    // Chose "software engineering" as "sane default"
    if (searchTerms.length === 0) searchTerms.push('software engineering');

    const activeTasks = tasks.filter((task) => task.active);
    if (activeTasks.length === 0) {
      console.warn('No active tasks found for project');
      return undefined;
    }

    const rankedTasks = this.searchUtil.fuzzyRank(activeTasks, searchTerms, [
      'name',
    ]);
    const { thing: task } = rankedTasks[0];
    return task;
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
        throw new Error('Invalid date format');
      }

      if (end < start) {
        throw new Error('End date is before start date');
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
      throw new Error('Projects must be a valid array');
    }

    if (projects.length === 0) {
      console.warn('No projects provided to IntervalTransformer');
    }
  }

  /**
   * Validates interval data
   * @param interval Interval to validate
   * @throws Error if interval data is invalid
   */
  private validateInterval(interval: TimewarriorInterval): void {
    if (!interval) {
      throw new Error('Interval cannot be null or undefined');
    }

    if (!interval.start || !interval.end) {
      throw new Error('Interval must have start and end dates');
    }

    if (!interval.project) {
      throw new Error('Interval must have a project name');
    }
  }
}
