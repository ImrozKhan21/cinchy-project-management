import {ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Observable, ReplaySubject, take, takeUntil} from "rxjs";
import {ApiCallsService} from "../../services/api-calls.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AppStateService} from "../../services/app-state.service";
import {WindowRefService} from "../../services/window-ref.service";
import {map} from "rxjs/operators";
import {MessageService} from "primeng/api";
import {FilterDataService} from "../../services/filter-data.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() viewType: any;
  headerDetails: any;
  searchValue: string;
  currentUrl$: Observable<any>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  constructor(private apiCallsService: ApiCallsService, private filterDataService: FilterDataService,
              @Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private messageService: MessageService, private windowRefService: WindowRefService) {
  }

  ngOnInit(): void {
    this.filterDataService.getClearedFilters().pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.searchValue = '';
    });
    this.currentUrl$ = this.activatedRoute.queryParams.pipe(map((params: any) => window.location.href));
    this.activatedRoute.queryParams.pipe(take(1)).subscribe(params => {
      let {searchValue} = params;

      if (searchValue) {
        this.searchValue = searchValue;
        this.apply(true);
      }
    });
  }

  valueChanged() {
    this.apply();
  }

  async apply(dontDoActualFilter?: boolean) {

    const currentSearchParamInState = this.appStateService.getFiltersState();
    const filterSelected = {
      ...currentSearchParamInState,
      searchValue: this.searchValue
    }
    this.appStateService.setFiltersState(filterSelected);

    if (!dontDoActualFilter) {
      this.appStateService.applyGlobalFilter(filterSelected);
      const currentParams = this.activatedRoute.snapshot.queryParams;
      this.appStateService.addParamsInRoute(currentParams);
    }
  }


  goBack() {
    const url = "https://cinchy.net";
    this.windowRefService.openUrl(url);
  }

  toggleView() {
    let currentUrl = this.windowRefService.nativeWindow.location.href;
    const newViewType = this.viewType === 'kanban' ? 'gantt' : 'kanban';
    currentUrl = currentUrl.replace(`viewType=${this.viewType}`, `viewType=${newViewType}`);
    this.windowRefService.openUrl(currentUrl, true);
  }

  onClipboardCopy(e: any) {
    this.messageService.add({severity: 'info', summary: '', detail: 'Copied'});

  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
