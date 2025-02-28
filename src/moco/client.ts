import { MocoProject, MocoTask, MocoUser } from "./types.ts";

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
      `/projects/assigned${activeOnly ? "?active=true" : ""}`,
    );
  }

  public async getTasks(projectId: number): Promise<Array<MocoTask>> {
    return await this.request<Array<MocoTask>>(`/projects/${projectId}/tasks`);
  }

  public async getUsers(activeOnly = false, internalOnly = false) {
    const active = `active=${activeOnly ? "true" : "false"}`;
    const internal = `internal=${internalOnly ? "true" : "false"}`;
    return await this.request<Array<MocoUser>>(`/users?${active}&${internal}`);
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Token token=${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
