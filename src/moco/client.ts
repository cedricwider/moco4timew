import {
  CreateMocoActivity,
  MocoActivity,
  MocoProject,
  MocoTask,
  MocoUser,
} from './types.ts';

export class MocoClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(domain: string, apiKey: string) {
    this.baseUrl = `https://${domain}.mocoapp.com/api/v1`;
    this.apiKey = apiKey;
  }

  public async getAssignedProjects(
    activeOnly = true,
  ): Promise<Array<MocoProject>> {
    return await this.request<Array<MocoProject>>(
      `/projects/assigned${activeOnly ? '?active=true' : ''}`,
    );
  }

  public async getTasks(projectId: number): Promise<Array<MocoTask>> {
    return await this.request<Array<MocoTask>>(`/projects/${projectId}/tasks`);
  }

  public async getUsers(activeOnly = false, internalOnly = false) {
    const active = `active=${activeOnly ? 'true' : 'false'}`;
    const internal = `internal=${internalOnly ? 'true' : 'false'}`;
    return await this.request<Array<MocoUser>>(`/users?${active}&${internal}`);
  }

  public async createActivity(
    activity: CreateMocoActivity,
  ): Promise<MocoActivity> {
    return await this.request<MocoActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  public async createActivities(
    activities: Array<CreateMocoActivity>,
  ): Promise<MocoActivity> {
    return await this.request<MocoActivity>('/activities/bulk', {
      method: 'POST',
      body: JSON.stringify({ activities }),
    });
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Token token=${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
