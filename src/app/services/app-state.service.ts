import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {IActivityType, IComboType, IProjectDetails, IStatus, IUser, PRIORITY_OPTIONS} from "../models/common.model";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./window-ref.service";
import {ActivatedRoute, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  activities: IProjectDetails[] = [];
  activityTypes: IActivityType[];
  allStatuses: IStatus[];
  users: IUser[];
  projects: IProjectDetails[];
  estimates: IComboType[];
  departments: IComboType[];
  portfolios: IComboType[];
  filtersState: any = {};

  globalFilters$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  slicerFilteredItems$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  refreshViews$: Subject<any> = new Subject<any>();
  showSpinner$: Subject<boolean> = new Subject<boolean>();

  constructor(@Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private windowRef: WindowRefService, private router: Router) {
  }


  applyGlobalFilter(val: any) {
    this.globalFilters$.next(val);
  }

  getGlobalFilter() {
    return this.globalFilters$.asObservable();
  }

  setSlicerFilterItems(val: any) {
    this.slicerFilteredItems$.next(val);
  }

  getSlicerFilterItems() {
    return this.slicerFilteredItems$.asObservable();
  }

  setSpinnerState(val: boolean) {
    this.showSpinner$.next(val);
  }

  getSpinnerState() {
    return this.showSpinner$.asObservable();
  }

  setRefreshViewState(refresh: any, activity: any) {
    this.refreshViews$.next({refresh, activity});
  }

  getRefreshViewState() {
    return this.refreshViews$.asObservable();
  }

  setFiltersState(state: any) {
    this.filtersState = state;
  }

  getFiltersState() {
    return this.filtersState;
  }

  setCurrentUrl() {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.windowRef.nativeWindow.location.href;
      sessionStorage.setItem('current-dashboard-id', url);
    }
  }

  mergeObjectsWithout$Keys(obj1: any, obj2: any) {
    let filteredObj2: any = {};
    for (let key in obj2) {
      if (!key.startsWith('$')) {
        filteredObj2[key] = obj2[key];
      }
    }
    return { ...obj1, ...filteredObj2 };
  }

  updateActivitiesStateOnUpdateForKanban(activity: any, newStatus: IStatus) {
    const kanban: any = $$("kanban");
    let activityToUpdate: any = kanban.getItem(activity.id);
      activityToUpdate = this.mergeObjectsWithout$Keys(activityToUpdate, activity);
    // Update status
    if (newStatus && activityToUpdate) {
      activityToUpdate.status = newStatus.name;
      activityToUpdate.status_id = newStatus.id;
      activityToUpdate.status_color = newStatus.status_color;
      activityToUpdate.status_color_hex = newStatus.status_color_hex;
      //   activityToUpdate.$css = newStatus.status_color ? `kanban-task-${newStatus.status_color.replace(/\s+/g, '-').toLowerCase()}` : '';
    }
    activityToUpdate.color = PRIORITY_OPTIONS[activity.priority]?.color || 'white';
    // Update assignee
    const assigneeIdToUse = activity.user_id ? +activity.user_id : activity.owner_id;
    const newAssignee = this.users.find((user: IUser) => user.owner_id === assigneeIdToUse);
    if (newAssignee) {
      activityToUpdate.owner = newAssignee.owner;
      activityToUpdate.owner_photo = newAssignee.owner_photo;
      activityToUpdate.owner_id = newAssignee.owner_id;
    }

    if (activity.activity_type_id) {
      const activityTypeSelected = this.activityTypes.find((activityType: IActivityType) => activityType.id == activity.activity_type_id) as IActivityType;
      if (activityTypeSelected) {
        activityToUpdate.activity_type = activityTypeSelected.value;
        activityToUpdate.activity_type_id = activityTypeSelected.id;
        activityToUpdate.activity_type_icon = activityTypeSelected.icon;
      }
    }

    // Updating activity so that any filter change get latest details
    this.activities = this.activities.map((activityItem: IProjectDetails) => {
      return activityItem.activity_id === activityToUpdate.activity_id ? activityToUpdate : activityItem;
    });
    this.setRefreshViewState(true, activityToUpdate);
  }

  updateActivitiesStateOnInsert(newId: number, activity: any, newStatus: IStatus, activityTypeSelected?: IActivityType) {
    // this.activities = activities;
    activity.activity_id = newId;
    //   activity.id = `activity-${activity.activity_id}`
    activity.project_id = activity.project_id || activity.parent_id;
    const projectDetails = this.projects.find((project: IProjectDetails) => project.project_id == activity.project_id);

    activity.isExisting = true;
    if (newStatus) {
      activity.status = newStatus.name;
      activity.status_id = newStatus.id;
      activity.status_color = newStatus.status_color;
      activity.status_color_hex = newStatus.status_color_hex;
      //    activity.$css = newStatus.status_color ? `kanban-task-${newStatus.status_color.replace(/\s+/g, '-').toLowerCase()}` : '';
    }

    if (projectDetails) {
      activity.project_name = projectDetails.text;
      activity.project_color = projectDetails.project_color;
      // TODO: remove below convertFromHexToRGB from two places and add it in common service
      activity.rgb_project_color = this.convertFromHexToRGB(projectDetails.project_color, 1);
    }

    if (activityTypeSelected) {
      activity.activity_type = activityTypeSelected.value;
      activity.activity_type_id = activityTypeSelected.id;
      activity.activity_type_icon = activityTypeSelected.icon;
    }

    if (activity.parent_activity) {
      const parentActivity = this.activities.find((activityItem: IProjectDetails) => activityItem.activity_id == activity.parent_activity);
      activity.parent_name = parentActivity?.text;
    }

    const parentField: any = $$('parent-combo'); // make sure it is unique and see how we can get from editor
    if (parentField) {
       const optionsList = parentField.getPopup().getList();
       // Add the new task as an option. You might need to adjust according to your data structure
      optionsList.add({id: activity.activity_id, value: activity?.text});
    }

    activity.color = PRIORITY_OPTIONS[activity.priority]?.color || 'white';

    const assigneeIdToUse = activity.user_id ? +activity.user_id : activity.owner_id;
    const newAssignee = this.users.find((user: IUser) => user.owner_id === assigneeIdToUse);
    if (newAssignee) {
      activity.owner = newAssignee.owner;
      activity.owner_photo = newAssignee.owner_photo;
      activity.owner_id = newAssignee.owner_id;
    }
    this.activities.push(activity);
    this.setRefreshViewState(true, activity);
  }

  addParamsInRoute(currentParams: any) {
    const params = {
      ...currentParams,
      projectOwner: (this.filtersState.selectedProjectUsers?.map((user: IUser) => user.owner_id))?.join(','),
      owner: (this.filtersState.selectedUsers?.map((user: IUser) => user.owner_id))?.join(','),
      status: (this.filtersState.selectedStatuses?.map((status: IStatus) => status.name))?.join(','),
      project: (this.filtersState.selectedProjects?.map((project: IProjectDetails) => project.project_id))?.join(','),
      searchValue: this.filtersState.searchValue,
      workType: (this.filtersState.selectedWorkType?.map((activityType: IActivityType) => activityType.id))?.join(','),
      isProjectsExpanded: this.filtersState.isProjectsExpanded ? true : null,
      department: (this.filtersState.selectedDepartment?.map((department: IComboType) => department.id))?.join(','),
      portfolio: (this.filtersState.selectedPortfolios?.map((portfolio: IComboType) => portfolio.id))?.join(','),
      priority: (this.filtersState.selectedPriorities?.map((priority: any) => priority.id))?.join(','),
      activityId: this.filtersState.activityId
    };

    if (isPlatformBrowser(this.platformId)) {
      !this.filtersState.selectedUsers?.length && sessionStorage.removeItem('owner');
      !this.filtersState.selectedStatuses?.length && sessionStorage.removeItem('status');
      !this.filtersState.selectedProjects?.length && sessionStorage.removeItem('project');
      !this.filtersState.selectedProjectUsers?.length && sessionStorage.removeItem('projectOwner');
      !this.filtersState.searchValue && sessionStorage.removeItem('searchValue');
      !this.filtersState.isProjectsExpanded && sessionStorage.removeItem('isProjectsExpanded');
      !this.filtersState.selectedWorkType?.length && sessionStorage.removeItem('workType');
      !this.filtersState.selectedDepartment?.length && sessionStorage.removeItem('department');
      !this.filtersState.selectedPortfolios?.length && sessionStorage.removeItem('portfolio');
      !this.filtersState.selectedPriorities?.length && sessionStorage.removeItem('priority');
      !this.filtersState.slicedActivity?.id && sessionStorage.removeItem('scopedTaskId');
      !this.filtersState.activityId && sessionStorage.removeItem('activityId');
    }
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: params,
        queryParamsHandling: '', // Do not preserve other params, since we're spreading them in the updatedParams
      });
  }

  convertFromHexToRGB(hex: any, alpha: number) {
    // Remove the hash at the start if it's there
    if (!hex) {
      return 'white'
    }
    hex = hex.replace(/^#/, '');
    // Parse the hex string
    let r, g, b;
    if (hex.length === 3) {
      // In case of shorthand hex color
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
      // In case of full hex color
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      throw new Error('Invalid hex color: ' + hex);
    }

    // Return the RGBA color
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

}
