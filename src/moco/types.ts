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
