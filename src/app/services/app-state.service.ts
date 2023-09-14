import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {IProjectDetails, IStatus, IUser} from "../models/common.model";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./window-ref.service";

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  projectDetails: IProjectDetails[] = [];
  allStatuses: IStatus[];
  users: IUser[];
  projects: IProjectDetails[];

  globalFilters$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: any,
              private windowRef: WindowRefService,) { }


  applyGlobalFilter(val: any) {
    this.globalFilters$.next(val);
  }

  getGlobalFilter() {
    return this.globalFilters$.asObservable();
  }

  setCurrentUrl() {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.windowRef.nativeWindow.location.href;
      sessionStorage.setItem('current-dashboard-id', url);
    }
  }

}
