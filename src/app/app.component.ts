import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./services/window-ref.service";
import {ApiCallsService} from "./services/api-calls.service";
import {lastValueFrom} from 'rxjs';
import {IProjectDetails} from "./models/common.model";
import {AppStateService} from "./services/app-state.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cinchy-kanban';
  isLoggedIn: boolean | undefined;
  fullScreenHeight: number = 400;
  projectDetails: IProjectDetails[] | undefined;
  viewType: string | null;

  constructor(private cinchyService: CinchyService, @Inject(PLATFORM_ID) private platformId: any,
              private windowRefService: WindowRefService, private apiCallsService: ApiCallsService,
              private appStateService: AppStateService) {
  }

  async ngOnInit() {
    this.setHeight();
    this.cinchyService.checkIfSessionValid().toPromise().then((response: any) => {
      if (response.accessTokenIsValid) {
        this.setDetails();
      } else {
        if (isPlatformBrowser(this.platformId)) {
          const url = this.windowRefService.nativeWindow.location.href;
          this.cinchyService.login().then(success => {
            if (success) {
              this.setDetails();
            }
          }, error => {
            console.error('Could not login: ', error)
          });
        }
      }
    })
  }

  async setDetails() {
    await lastValueFrom(this.apiCallsService.getEnvDetails());
    this.isLoggedIn = true;
    if (isPlatformBrowser(this.platformId)) {
      this.viewType = sessionStorage.getItem('viewType');
      console.log('111 VT', this.viewType)
      const model: string = sessionStorage.getItem('modelId') as string;
      this.appStateService.projectDetails = await lastValueFrom(this.apiCallsService.getProjectDetails(model));
    }
    this.projectDetails = this.appStateService.projectDetails;
  }

  setHeight() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('fullScreenHeight')) {
        const height: string = localStorage.getItem('fullScreenHeight') || '400';
        this.fullScreenHeight = parseInt(height, 10);
      }
    }
    console.log('set height', this.fullScreenHeight)
    const elements: any = document.getElementsByClassName('full-height-element');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < elements.length; i++) {
      setTimeout(() => {
        if (this.windowRefService.iniFrame()) {
          elements[i]['style'].height = this.fullScreenHeight + 'px';
        }
      }, 500)
    }
  }
}
