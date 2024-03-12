import {Component, Inject, Input, PLATFORM_ID} from '@angular/core';
import {IActivityType, IComboType, IProjectDetails, IStatus, IUser, PRIORITY_OPTIONS} from "../../models/common.model";
import {AppStateService} from "../../services/app-state.service";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom, ReplaySubject, take} from "rxjs";
import {DateFilters} from "../../models/general-values.model";
import {UtilService} from "../../services/util.service";

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
  priorities = Object.keys(PRIORITY_OPTIONS).map((key: string) => PRIORITY_OPTIONS[key]);
  selectedStatusesAdvanced: any[];
  selectedPriorityAdvanced: any[];

  filteredStatuses: any[];

  projects: IProjectDetails[];
  activityTypes: IActivityType[];
  selectedProjectsAdvanced: IProjectDetails[];
  selectedWorkType: IActivityType[];
  scopedTaskId: string | undefined;
  isProjectsExpanded: boolean;

  dateRange: any;
  fromDate: any;
  toDate: any;
  allDateFilters = DateFilters;
  selectedPreselectDateRange: string | undefined;
  dateTypes = [
    { name: 'Start Date', code: 'start_date' },
    { name: 'End Date', code: 'end_date' }]
  selectedDateType = this.dateTypes[0];

  filteredProjects: IProjectDetails[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  constructor(@Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private utilService: UtilService,) {
  }

  ngOnInit() {
    this.users = this.appStateService.users;
    this.statuses = this.appStateService.allStatuses;
    this.projects = this.appStateService.projects;
    this.activityTypes = this.appStateService.activityTypes;
    this.departments = this.appStateService.departments;
    this.portfolios = this.appStateService.portfolios;
    this.activatedRoute.queryParams.pipe(take(1)).subscribe(params => {
      let {
        status,
        owner,
        project,
        projectOwner,
        isProjectsExpanded,
        scopedTaskId,
        workType,
        department,
        portfolio,
        priority
      } = params;
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

      if (priority) {
        const allPriorityInParams: string[] = (decodeURIComponent(priority)).split(',');
        this.selectedPriorityAdvanced = this.priorities.filter((priorityItem: any) => allPriorityInParams.includes(priorityItem.id));
      }

      if (scopedTaskId) {
        this.scopedTaskId = scopedTaskId;
      }

      this.isProjectsExpanded = isProjectsExpanded === "true";
      this.apply(true);
    });
  }

  async getFiltersSelected() {
    const currentFilters = await lastValueFrom(this.appStateService.getGlobalFilter().pipe(take(1)));
    const currentSearchParamInState = this.appStateService.getFiltersState().searchValue;
    return {
      searchValue: currentSearchParamInState,
      selectedProjectUsers: this.selectedProjectUserAdvanced,
      selectedUsers: this.selectedUserAdvanced,
      selectedStatuses: this.selectedStatusesAdvanced,
      selectedProjects: this.selectedProjectsAdvanced,
      isProjectsExpanded: this.isProjectsExpanded,
      selectedWorkType: this.selectedWorkType,
      selectedDepartment: this.selectedDepartmentAdvanced,
      selectedPortfolios: this.selectedPortfoliosAdvanced,
      selectedPriorities: this.selectedPriorityAdvanced,
      slicedActivity: currentFilters?.slicedActivity?.id ? currentFilters?.slicedActivity : {
        id: this.scopedTaskId,
        isTaskSliced: false
      },
      dateRange: this.dateRange,
      selectedDateType: this.selectedDateType.code
    };
  }

  itemRemoved(e: any) {
    console.log('itemRemoved', e)
  }

  toggleExpansion() {
    this.apply();
  }

  applyRange(days: number, type: string) {
    this.selectedPreselectDateRange = type;
    const lastSevenDays = this.utilService.getDateRange(days, type);
    this.dateRange = [lastSevenDays.start, lastSevenDays.end];
  }

  clearFilters() {
    this.dateRange = undefined;
    this.fromDate = undefined;
    this.toDate = undefined;
    this.selectedUserAdvanced = [];
    this.selectedProjectUserAdvanced = [];
    this.selectedDepartmentAdvanced = [];
    this.selectedPortfoliosAdvanced = [];
    this.selectedStatusesAdvanced = [];
    this.selectedProjectsAdvanced = [];
    this.selectedWorkType = [];
    this.selectedPriorityAdvanced = [];
    this.scopedTaskId = undefined;
    this.isProjectsExpanded = false;
    this.selectedPreselectDateRange = undefined;
    this.apply();
  }

  async apply(dontAddParam?: boolean) {
    const filterSelected = await this.getFiltersSelected();

    this.appStateService.setFiltersState(filterSelected);
    this.appStateService.applyGlobalFilter({
      ...filterSelected
    });

    if (!dontAddParam) {
      const currentParams = this.activatedRoute.snapshot.queryParams;
      this.appStateService.addParamsInRoute(currentParams);
    }
  }
}
