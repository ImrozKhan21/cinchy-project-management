import {Component, Inject, Input, PLATFORM_ID} from '@angular/core';
import {IActivityType, IComboType, IProjectDetails, IStatus, IUser} from "../../models/common.model";
import {AppStateService} from "../../services/app-state.service";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom, ReplaySubject, take} from "rxjs";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {
  @Input() viewType: string;
  @Input() showOnlyProjectFilter: boolean;
  users: IUser[];
  departments: IComboType[];
  portfolios: IComboType[];
  selectedUserAdvanced: any[];
  selectedProjectUserAdvanced: any[];
  selectedDepartmentAdvanced: IComboType[];
  selectedPortfoliosAdvanced: IComboType[];

  filteredUsers: any[];

  statuses: any;
  selectedStatusesAdvanced: any[];

  filteredStatuses: any[];

  projects: IProjectDetails[];
  activityTypes: IActivityType[];
  selectedProjectsAdvanced: IProjectDetails[];
  selectedWorkType: IActivityType[];
  searchValue: string;
  scopedTaskId: string;
  isProjectsExpanded: boolean;

  filteredProjects: IProjectDetails[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  constructor(@Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private router: Router,) {
  }

  ngOnInit() {
    this.users = this.appStateService.users;
    this.statuses = this.appStateService.allStatuses;
    this.projects = this.appStateService.projects;
    this.activityTypes = this.appStateService.activityTypes;
    this.departments = this.appStateService.departments;
    this.portfolios = this.appStateService.portfolios;
    this.activatedRoute.queryParams.pipe(take(1)).subscribe(params => {
      let {status, owner, project, searchValue, projectOwner, isProjectsExpanded, scopedTaskId, workType, department, portfolio} = params;
      if (status) {
        const allStatusesInParams: string[] = (decodeURIComponent(status)).split(',');
        this.selectedStatusesAdvanced = this.statuses.filter((statusItem: IStatus) => allStatusesInParams.includes(statusItem.name));
      }

      if (owner) {
        const allOwnersInParams: string[] = (decodeURIComponent(owner)).split(',');
        this.selectedUserAdvanced = this.users.filter((user: IUser) => allOwnersInParams.includes(`${user.owner_id}`));
      }

      if (projectOwner) {
        const allOwnersInParams: string[] = (decodeURIComponent(projectOwner)).split(',');
        this.selectedProjectUserAdvanced = this.users.filter((user: IUser) => allOwnersInParams.includes(`${user.owner_id}`));
      }

      if (project) {
        const allProjectInParams: string[] = (decodeURIComponent(project)).split(',');
        this.selectedProjectsAdvanced = this.projects.filter((project: IProjectDetails) => allProjectInParams.includes(`${project.project_id}`));
      }

      if (workType) {
        const allWorkTypeInParams: string[] = (decodeURIComponent(workType)).split(',');
        this.selectedWorkType = this.activityTypes.filter((activityType: IComboType) => allWorkTypeInParams.includes(`${activityType.id}`));
      }

      if (department) {
        const allDepartmentInParams: string[] = (decodeURIComponent(department)).split(',');
        this.selectedDepartmentAdvanced = this.departments.filter((departmentItem: IComboType) => allDepartmentInParams.includes(`${departmentItem.id}`));
      }

      if (portfolio) {
        const allPortfolioInParams: string[] = (decodeURIComponent(portfolio)).split(',');
        this.selectedPortfoliosAdvanced = this.portfolios.filter((portfolioItem: IComboType) => allPortfolioInParams.includes(`${portfolioItem.id}`));
      }

      if (scopedTaskId) {
        this.scopedTaskId = scopedTaskId;
      }

      if (searchValue) {
        this.searchValue = searchValue;
      }

      this.isProjectsExpanded = isProjectsExpanded === "true";
      this.apply(true);
    });
  }

  valueChanged() {
    this.apply();
  }

  toggleExpansion() {
    this.apply();
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

  async apply(dontAddParam?: boolean) {
    const currentFilters = await lastValueFrom(this.appStateService.getGlobalFilter().pipe(take(1)));

    this.appStateService.applyGlobalFilter({
      selectedProjectUsers: this.selectedProjectUserAdvanced,
      selectedUsers: this.selectedUserAdvanced,
      selectedStatuses: this.selectedStatusesAdvanced,
      selectedProjects: this.selectedProjectsAdvanced,
      searchValue: this.searchValue,
      isProjectsExpanded: this.isProjectsExpanded,
      selectedWorkType: this.selectedWorkType,
      selectedDepartment: this.selectedDepartmentAdvanced,
      selectedPortfolios: this.selectedPortfoliosAdvanced,
      slicedActivity: currentFilters?.slicedActivity?.id ? currentFilters?.slicedActivity : {
        id: this.scopedTaskId,
        isTaskSliced: false
      }
    });

    if (!dontAddParam) {
      const currentParams = this.activatedRoute.snapshot.queryParams;

      const params = {
        ...currentParams,
        projectOwner: (this.selectedProjectUserAdvanced?.map((user: IUser) => user.owner_id))?.join(','),
        owner: (this.selectedUserAdvanced?.map((user: IUser) => user.owner_id))?.join(','),
        status: (this.selectedStatusesAdvanced?.map((status: IStatus) => status.name))?.join(','),
        project: (this.selectedProjectsAdvanced?.map((project: IProjectDetails) => project.project_id))?.join(','),
        searchValue: this.searchValue,
        workType: (this.selectedWorkType?.map((activityType: IActivityType) => activityType.id))?.join(','),
        isProjectsExpanded: this.isProjectsExpanded ? true : null,
        department: (this.selectedDepartmentAdvanced?.map((department: IComboType) => department.id))?.join(','),
        portfolio: (this.selectedPortfoliosAdvanced?.map((portfolio: IComboType) => portfolio.id))?.join(','),
      };

      if (isPlatformBrowser(this.platformId)) {
        !this.selectedUserAdvanced?.length && sessionStorage.removeItem('owner');
        !this.selectedStatusesAdvanced?.length && sessionStorage.removeItem('status');
        !this.selectedProjectsAdvanced?.length && sessionStorage.removeItem('project');
        !this.selectedProjectUserAdvanced?.length && sessionStorage.removeItem('projectOwner');
        !this.searchValue && sessionStorage.removeItem('searchValue');
        !this.isProjectsExpanded && sessionStorage.removeItem('isProjectsExpanded');
        !this.selectedWorkType?.length && sessionStorage.removeItem('workType');
        !this.selectedDepartmentAdvanced?.length && sessionStorage.removeItem('department');
        !this.selectedPortfoliosAdvanced?.length && sessionStorage.removeItem('portfolio');
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
}
