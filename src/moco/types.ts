export interface MocoProject {
  id: number;
  identifier: string;
  name: string;
  active: boolean;
  billable: boolean;
  customer: {
    id: number;
    name: string;
  };
  tasks: Array<MocoTask>;
  contract: {
    user_id: number;
    active: boolean;
  };
}

export interface MocoTask {
  id: number;
  name: string;
  active: boolean;
  billable: boolean;
}

export interface MocoUser {
  id: number;
  firstname: string;
  lastname: string;
  active: boolean;
  email: string;
  mobile_phone: string;
  work_phone: string;
  home_address: string;
  info: string;
  birthday: string;
  custom_properties: Record<string, unknown>;
  unit: {
    id: number;
    name: string;
  };
  type: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface MocoActivity {
  id: number;
  date: string;
  seconds: number;
  description: string;
  project_id: number;
  task_id: number;
  user_id: number;
  timer_started_at?: string;
  timer_stopped_at?: string;
  status: "active" | "locked";
  billable: boolean;
  tag_names?: string[];
}

// For creating new activities, we need a subset of fields
export interface CreateMocoActivity {
  date: string;
  seconds: number;
  description: string;
  project_id: number;
  task_id: number;
  billable?: boolean;
}
