import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ReplaySubject} from "rxjs";
import {ApiCallsService} from "../../services/api-calls.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AppStateService} from "../../services/app-state.service";
import {WindowRefService} from "../../services/window-ref.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerDetails: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);


  constructor(private apiCallsService: ApiCallsService, private changeDetectorRef: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private router: Router, private windowRefService: WindowRefService) {
  }

  ngOnInit(): void {
  }

  goBack() {
    const url = "https://cinchy.net";
    this.windowRefService.openUrl(url);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
