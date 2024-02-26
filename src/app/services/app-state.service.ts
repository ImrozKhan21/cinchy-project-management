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

  updateActivitiesStateOnUpdateForKanban(activity: any, newStatus: IStatus) {
    const kanban: any = $$("kanban");
    const activityToUpdate: any = kanban.getItem(activity.id);
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

    // Updating activity so that any filter change get latest details
    this.activities = this.activities.map((activityItem: IProjectDetails) => {
      return activityItem.activity_id === activityToUpdate.activity_id ? activityToUpdate : activityItem;
    });
    this.setRefreshViewState(true, activityToUpdate);
  }

  updateActivitiesStateOnInsert(activity: any, newStatus: IStatus, activityTypeSelected?: IActivityType) {
    // this.activities = activities;
    if (newStatus) {
      activity.status = newStatus.name;
      activity.status_id = newStatus.id;
      activity.status_color = newStatus.status_color;
      activity.status_color_hex = newStatus.status_color_hex;
      activity.$css = newStatus.status_color ? `kanban-task-${newStatus.status_color.replace(/\s+/g, '-').toLowerCase()}` : '';
    }

    if (activityTypeSelected) {
      activity.activity_type = activityTypeSelected.value;
      activity.activity_type_id = activityTypeSelected.id;
      activity.activity_type_icon = activityTypeSelected.icon;
    }

    const assigneeIdToUse = activity.user_id ? +activity.user_id : activity.owner_id;
    const newAssignee = this.users.find((user: IUser) => user.owner_id === assigneeIdToUse);
    if (newAssignee) {
      activity.owner = newAssignee.owner;
      activity.owner_photo = newAssignee.owner_photo;
      activity.owner_id = newAssignee.owner_id;
    }
    this.activities.push(activity);
    console.log('111 NEW ACTIVITY', activity)
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
    }
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: params,
        queryParamsHandling: '', // Do not preserve other params, since we're spreading them in the updatedParams
      });
  }

}
