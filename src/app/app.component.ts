import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {CinchyService} from "@cinchy-co/angular-sdk";
import {isPlatformBrowser} from "@angular/common";
import {WindowRefService} from "./services/window-ref.service";
import {ApiCallsService} from "./services/api-calls.service";
import {catchError, forkJoin, lastValueFrom, of} from 'rxjs';
import {IActivityType, IProjectDetails} from "./models/common.model";
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
  fullScreenHeight: number = 1000;
  projectDetails: IProjectDetails[] | undefined;
  activityTypes: IActivityType[];
  viewType: string | null;
  hideHeader: boolean;
  showOnlyProjectFilter: boolean;

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
    const project: any = sessionStorage.getItem('project');
    const owner: any = sessionStorage.getItem('owner');
    const status: any = sessionStorage.getItem('status');
    const searchValue: any = sessionStorage.getItem('searchValue');
    const projectOwner: any = sessionStorage.getItem('projectOwner');
    const isProjectsExpanded: any = sessionStorage.getItem('isProjectsExpanded');
    const showOnlyProjectFilter: any = sessionStorage.getItem('showOnlyProjectFilter');
    const scopedTaskId: any = sessionStorage.getItem('scopedTaskId');
    const workType: any = sessionStorage.getItem('workType');
    const department: any = sessionStorage.getItem('department');
    const portfolio: any = sessionStorage.getItem('portfolio');
    const priority: any = sessionStorage.getItem('priority');
    this.showOnlyProjectFilter = showOnlyProjectFilter === "true";
    const hideHeader: any = sessionStorage.getItem('hideHeader');
    const activityId: any = sessionStorage.getItem('activityId');
    this.hideHeader = hideHeader === "true";
    const queryParams: any = {
      modelId, viewType, owner, status, project,
      searchValue, projectOwner, isProjectsExpanded, hideHeader, showOnlyProjectFilter, scopedTaskId,
      workType, department, portfolio, priority, activityId
    };
    const cleanedQueryParams: any = Object.fromEntries(
      Object.entries(queryParams).filter(([key, value]) => Boolean(value))
    );
    this.router.navigate([`/`], {queryParams: cleanedQueryParams});
    this.getViewDetailsAndSetStates();

  }

  getViewDetailsAndSetStates() {
 /*   this.apiCallsService.getTableEntitlements().subscribe((response: any) => {
      console.log('entitlements', response);
    })*/
    if (isPlatformBrowser(this.platformId)) {
      this.viewType = sessionStorage.getItem('viewType');
      const model: string = sessionStorage.getItem('modelId') as string;
      const allObs = [this.apiCallsService.getAllProjects(model).pipe(
        catchError(error => of('Fetch API failed'))
      ),
        this.apiCallsService.getAllStatuses(model).pipe(
          catchError(error => of('Fetch API failed'))
        ),
        this.apiCallsService.getAllActivityUsers(model).pipe(
          catchError(error => of('Fetch API failed'))
        ),
        this.apiCallsService.getActivities(model).pipe(
          catchError(error => of('Fetch API failed'))
        ),
        this.apiCallsService.getAllActivityTypes(model).pipe(
          catchError(error => of('Fetch API failed'))
        ),
        this.apiCallsService.getAllEstimates(model).pipe(
          catchError(error => of('Fetch API failed'))
        ),
        this.apiCallsService.getDistinctDepartments(model).pipe(
          catchError(error => of('Fetch API failed'))
        ),
        this.apiCallsService.getPortfolios(model).pipe(
          catchError(error => of('Fetch API failed'))
        )
      ];

      forkJoin(allObs).subscribe((value: any) => {
        const [projects, statuses, owners, activities, activityTypes, estimates, departments, portfolios] = value;
        this.appStateService.projects = projects;
        this.appStateService.allStatuses = statuses;
        this.appStateService.users = owners;
        this.appStateService.activityTypes = activityTypes;
        this.appStateService.activities = activities;
        this.appStateService.estimates = estimates;
        this.appStateService.departments = departments;
        this.appStateService.portfolios = portfolios;
        this.projectDetails = this.appStateService.activities;
      },catchError(error => {
        return of('Fetch API failed')
      }));
    }

  }

  setHeight() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('fullScreenHeight')) {
        const height: string = localStorage.getItem('fullScreenHeight') || '400';
        this.fullScreenHeight = parseInt(height, 10);
      }
    }
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
