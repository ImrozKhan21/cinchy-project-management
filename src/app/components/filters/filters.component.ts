import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {IProjectDetails, IStatus, IUser} from "../../models/common.model";
import {AppStateService} from "../../services/app-state.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ReplaySubject, take, takeUntil} from "rxjs";
import {setProjectDetails} from "../../data";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {
  users: IUser[];
  selectedUserAdvanced: any[];

  filteredUsers: any[];

  statuses: any;
  selectedStatusesAdvanced: any[];

  filteredStatuses: any[];

  projects: IProjectDetails[];
  selectedProjectsAdvanced: IProjectDetails[];
  searchValue: string;

  filteredProjects: IProjectDetails[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  constructor(@Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private router: Router,) {
  }

  ngOnInit() {
    this.users = this.appStateService.users;
    this.statuses = this.appStateService.allStatuses;
    this.projects = this.appStateService.projects;
    this.activatedRoute.queryParams.pipe(take(1)).subscribe(params => {
      let status = params['status'];
      let owner = params['owner'];
      let project = params['project'];
      if (status) {
        const allStatusesInParams: string[] = (decodeURIComponent(status)).split(',');
        this.selectedStatusesAdvanced = this.statuses.filter((statusItem: IStatus) => allStatusesInParams.includes(statusItem.name));
      }

      if (owner) {
        const allOwnersInParams: string[] = (decodeURIComponent(owner)).split(',');
        this.selectedUserAdvanced = this.users.filter((user: IUser) => allOwnersInParams.includes(user.owner));
      }

      if (project) {
        const allProjectInParams: string[] = (decodeURIComponent(owner)).split(',');
        this.selectedUserAdvanced = this.projects.filter((project: IProjectDetails) => allProjectInParams.includes(project.project_name));
      }
      this.apply(true);
    });
  }

  valueChanged() {
    console.log('111', this.searchValue);
    this.apply(true);
  }

  filterUser(event: any) {
    let query = event.query;

    setTimeout(() => {
      if (!query) {
        this.filteredUsers = this.users;
      } else {
        this.filteredUsers = [...this.users].filter((user: IUser) => {
          return user.owner.toLowerCase().indexOf(query.toLowerCase()) == 0;
        });
      }
    }, 100)
  }

  filterStatus(event: any) {
    let query = event.query;

    setTimeout(() => {
      if (!query) {
        this.filteredStatuses = this.statuses;
      } else {
        this.filteredStatuses = [...this.statuses].filter((status: IStatus) => {
          return status.name.toLowerCase().indexOf(query.toLowerCase()) == 0;
        });
      }
    }, 100)
  }

  apply(dontAddParam?: boolean) {
    this.appStateService.applyGlobalFilter({
      selectedUsers: this.selectedUserAdvanced,
      selectedStatuses: this.selectedStatusesAdvanced,
      selectedProjects: this.selectedProjectsAdvanced,
      searchValue: this.searchValue
    });

    if (!dontAddParam) {
      const params = {
        owner: (this.selectedUserAdvanced?.map((user: IUser) => user.owner)),
        status: (this.selectedStatusesAdvanced?.map((status: IStatus) => status.name)),
        project: (this.selectedProjectsAdvanced?.map((project: IProjectDetails) => project.project_name))
      };

      if (isPlatformBrowser(this.platformId)) {
          !this.selectedUserAdvanced?.length && sessionStorage.removeItem('owner');
          !this.selectedUserAdvanced?.length && sessionStorage.removeItem('status');
          !this.selectedUserAdvanced?.length && sessionStorage.removeItem('project');
      }
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams: params,
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
    }
  }
}
