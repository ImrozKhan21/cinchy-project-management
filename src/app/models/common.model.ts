import {CinchyConfig} from '@cinchy-co/angular-sdk';


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
  status_id: number;
  full_status: string;
  owner: string;
  owner_department: string;
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
  percent_done: number;
  project_color?: string;
  status_commentary?: string;
  priority: string;
  effort?: string;
  effort_id?: number;
  rgb_project_color?: string;
  project_portfolio?: string;
  project_owner_id?: string;
  description?: string;
  work_url?: string;
  project_url?: string;
}

export interface IStatus {
  name: string;
  status_color: string;
  status_color_hex: string;
  status_collapsed: string;
  sort_order: number;
  id: number;
}

export interface IActivityType { /// TODO: remove this in future and use combo type
  value: string;
  id: number;
  icon?: string;
}

export interface IComboType {
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

export const COLORS_MAP: any = {
  'Light Grey': '#707070', // Darker grey
  'Light Green': '#006400', // Darker green, like a dark green
  'Light Yellow': '#CCCC00', // Darker yellow, a bit like gold
  'Light Red': 'red', // Darker red, deep red or maroon
  'Light Blue': 'skyblue', // Darker blue, navy blue
  'Light Indigo': '#4B0082', // Darker indigo, more towards the actual indigo color
};

export const PRIORITY_OPTIONS: { [key: string]: any } = {
  '1. Very High': {id: '1. Very High', value: '1. Very High', color: 'orangered'},
  '2. High': {id: '2. High', value: '2. High', color: 'orange'},
  '3. Medium': {id: '3. Medium', value: '3. Medium', color: '#dee348cf'},
  '4. Low': {id: '4. Low', value: '4. Low', color: '#00B050'},
  '5. Very Low': {id: '5. Very Low', value: '5. Very Low', color: '#0070C0'}
}


export const WORK_TABLE_URL = "https://cinchy.net/Tables/140?viewId=0&fil[Title].Op=1&fil[Title].Val={{title}}"

export interface ICinchyConfigExtended extends CinchyConfig {
  "projectFormUrl": string;
  "workTableUrl": string;
}
