import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./services/window-ref.service";
import {ApiCallsService} from "./services/api-calls.service";
import {forkJoin, lastValueFrom} from 'rxjs';
import {IProjectDetails} from "./models/common.model";
import {AppStateService} from "./services/app-state.service";
import {Router} from "@angular/router";

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
              private appStateService: AppStateService, private router: Router) {
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
    const modelId: any = sessionStorage.getItem('modelId');
    const viewType: any = sessionStorage.getItem('viewType');
    const owner: any = sessionStorage.getItem('owner');
    const status: any = sessionStorage.getItem('status');
    const queryParams: any = {modelId, viewType, owner, status};
    this.router.navigate([`/`], {queryParams});
    this.getViewDetailsAndSetStates();

  }

  getViewDetailsAndSetStates() {
    if (isPlatformBrowser(this.platformId)) {
      this.viewType = sessionStorage.getItem('viewType');
      const model: string = sessionStorage.getItem('modelId') as string;
      const allObs = [this.apiCallsService.getAllProjects(model),
        this.apiCallsService.getAllStatuses(model), this.apiCallsService.getAllActivityUsers(model), this.apiCallsService.getProjectDetails(model)];

      forkJoin(allObs).subscribe((value: any) => {
        const [projects, statuses, owners, projectDetails] = value;
        this.appStateService.projects = projects;
        this.appStateService.allStatuses = statuses;
        this.appStateService.users = owners;
        this.appStateService.projectDetails = projectDetails;
        this.projectDetails = this.appStateService.projectDetails;
      });
    }

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
