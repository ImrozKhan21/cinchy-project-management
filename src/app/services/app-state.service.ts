import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {IActivityType, IProjectDetails, IStatus, IUser} from "../models/common.model";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./window-ref.service";

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  activities: IProjectDetails[] = [];
  activityTypes: IActivityType[];
  allStatuses: IStatus[];
  users: IUser[];
  projects: IProjectDetails[];

  globalFilters$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  slicerFilteredItems$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  refreshViews$: Subject<any> = new Subject<any>();
  showSpinner$: Subject<boolean> = new Subject<boolean>();

  constructor(@Inject(PLATFORM_ID) private platformId: any,
              private windowRef: WindowRefService,) {
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

  setCurrentUrl() {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.windowRef.nativeWindow.location.href;
      sessionStorage.setItem('current-dashboard-id', url);
    }
  }

  updateActivitiesStateOnUpdateForKanban(activity: any, newStatus: IStatus) {
    const kanban: any= $$("kanban");
    const activityToUpdate: any = kanban.getItem(activity.id);
    // Update status
    if (newStatus && activityToUpdate) {
      activityToUpdate.status = newStatus.name;
      activityToUpdate.status_id = newStatus.id;
      activityToUpdate.status_color = newStatus.status_color;
      activityToUpdate.status_color_hex = newStatus.status_color_hex;
      activityToUpdate.$css = newStatus.status_color ? `kanban-task-${newStatus.status_color.replace(/\s+/g, '-').toLowerCase()}` : '';
    }

    // Update assignee
    const assigneeIdToUse = activity.user_id ? +activity.user_id : activity.owner_id;
    const newAssignee = this.users.find((user: IUser) => user.owner_id === assigneeIdToUse);
    if (newAssignee) {
      activityToUpdate.owner = newAssignee.owner;
      activityToUpdate.owner_photo = newAssignee.owner_photo;
      activityToUpdate.owner_id = newAssignee.owner_id;
    }
    this.setRefreshViewState(true, activityToUpdate);
  }

  updateActivitiesStateOnInsert(activity: IProjectDetails) {
    // this.activities = activities;
  }

}
