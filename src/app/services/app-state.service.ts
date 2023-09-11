import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Subject} from "rxjs";
import {IProjectDetails} from "../models/common.model";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./window-ref.service";

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  projectDetails: IProjectDetails[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any,
              private windowRef: WindowRefService,) { }

  setCurrentUrl() {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.windowRef.nativeWindow.location.href;
      sessionStorage.setItem('current-dashboard-id', url);
    }
  }

}
