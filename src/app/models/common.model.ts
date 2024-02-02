export interface IEnv {
  "authority": string;
  "cinchyRootUrl": string;
  "clientId": string;
  "redirectUri": string;
  "version": string;
}

export interface IProjectDetails {
  milestone: boolean;
  activity_id: any;
  activity_type: string;
  activity_type_id: any;
  id?: any;
  project_name: string;
  project_id: number;
  progress: number;
  status: string;
  status_id: string;
  full_status: string;
  owner: string;
  start_date: string;
  end_date: string;
  text: string;
  status_sort: string;
  owner_photo: string;
  owner_id: string;
  parent_id: string;
  type: string;
  isExisting?: boolean;
  dependencies: any;
  dependency_ids: any;
  status_color: string;
  status_color_hex: string;
}

export interface IStatus {
  name: string;
  sort_order: number;
  id: number;
}

export interface IActivityType {
  value: string;
  id: number;
}


export interface IUser {
  owner: string;
  owner_photo: number;
  owner_id: number;
}

export interface IDetails {
  mappedResources: any;
  mappedTasks: any;
  mappedAssigned: any;
  allTasks: any;
  allStatuses: any;
  links: any;
  effortEstimate?: any;
  activityTypes: IActivityType[];
}

