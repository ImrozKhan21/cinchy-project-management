import {HttpClient} from '@angular/common/http';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {forkJoin} from 'rxjs';
import {tap} from 'rxjs/operators';
import {CinchyConfig} from '@cinchy-co/angular-sdk';
import {IEnv} from "./models/common.model";
import {WindowRefService} from "./services/window-ref.service";
import {isPlatformBrowser} from "@angular/common";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  enviornmentConfig: IEnv | undefined;
  fullScreenHeight: any;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, @Inject(PLATFORM_ID) private platformId: any,
              private windowRefService: WindowRefService) {
    window.addEventListener('message', this.receiveMessage, false);

    this.setRowAndFormId();
  }

  setRowAndFormId() {
    let modelId = this.getQueryStringValue('modelId', window.location.search);
    const parentUri = modelId ? window.location.search : document.referrer;
    if (isPlatformBrowser(this.platformId)) {
      modelId = this.getQueryStringValue('modelId', parentUri);
      let viewType = this.getQueryStringValue('viewType', parentUri);
      let owner = this.getQueryStringValue('owner', parentUri);
      let status = this.getQueryStringValue('status', parentUri);
      let project = this.getQueryStringValue('project', parentUri);
      let searchValue = this.getQueryStringValue('searchValue', parentUri);
      let projectOwner = this.getQueryStringValue('projectOwner', parentUri);
      let isProjectsExpanded = this.getQueryStringValue('isProjectsExpanded', parentUri);
      let hideHeader = this.getQueryStringValue('hideHeader', parentUri);
      let showOnlyProjectFilter = this.getQueryStringValue('showOnlyProjectFilter', parentUri);
      let scopedTaskId = this.getQueryStringValue('scopedTaskId', parentUri);
      let workType = this.getQueryStringValue('workType', parentUri);
      let department = this.getQueryStringValue('department', parentUri);
      let portfolio = this.getQueryStringValue('portfolio', parentUri);
      let priority = this.getQueryStringValue('priority', parentUri);

      modelId && sessionStorage.setItem('modelId', modelId);
      viewType && sessionStorage.setItem('viewType', viewType);
      owner && sessionStorage.setItem('owner', owner);
      status && sessionStorage.setItem('status', status);
      project && sessionStorage.setItem('project', project);
      searchValue && sessionStorage.setItem('searchValue', searchValue);
      projectOwner && sessionStorage.setItem('projectOwner', projectOwner);
      isProjectsExpanded && sessionStorage.setItem('isProjectsExpanded', isProjectsExpanded);
      hideHeader && sessionStorage.setItem('hideHeader', hideHeader);
      showOnlyProjectFilter && sessionStorage.setItem('showOnlyProjectFilter', showOnlyProjectFilter);
      scopedTaskId && sessionStorage.setItem('scopedTaskId', scopedTaskId);
      workType && sessionStorage.setItem('workType', workType);
      department && sessionStorage.setItem('department', department);
      portfolio && sessionStorage.setItem('portfolio', portfolio);
      priority && sessionStorage.setItem('priority', priority);

      if (!sessionStorage.getItem('modelId') || modelId) {
        modelId && modelId != "null" ? sessionStorage.setItem('modelId', modelId) : sessionStorage.setItem('modelId', '');
      }

      if (!sessionStorage.getItem('viewType') || viewType) {
        viewType && viewType != "null" ? sessionStorage.setItem('viewType', viewType) : sessionStorage.setItem('viewType', '');
      }

      if (!sessionStorage.getItem('status') || status) {
        status && status != "null" ? sessionStorage.setItem('status', status) : sessionStorage.setItem('status', '');
      }

      if (!sessionStorage.getItem('owner') || owner) {
        owner && owner != "null" ? sessionStorage.setItem('owner', owner) : sessionStorage.setItem('owner', '');
      }

      if (!sessionStorage.getItem('project') || project) {
        project && project != "null" ? sessionStorage.setItem('project', project) : sessionStorage.setItem('project', '');
      }

      if (!sessionStorage.getItem('projectOwner') || projectOwner) {
        projectOwner && projectOwner != "null" ? sessionStorage.setItem('projectOwner', projectOwner) : sessionStorage.setItem('projectOwner', '');
      }

      if (!sessionStorage.getItem('isProjectsExpanded') || isProjectsExpanded) {
        isProjectsExpanded && isProjectsExpanded != "null" ? sessionStorage.setItem('isProjectsExpanded', isProjectsExpanded)
          : sessionStorage.setItem('isProjectsExpanded', '');
      }

      if (!sessionStorage.getItem('searchValue') || searchValue) {
        searchValue && searchValue != "null" ? sessionStorage.setItem('searchValue', searchValue)
          : sessionStorage.setItem('searchValue', '');
      }

      if (!sessionStorage.getItem('hideHeader') || hideHeader) {
        hideHeader && hideHeader != "null" ? sessionStorage.setItem('hideHeader', hideHeader)
          : sessionStorage.setItem('hideHeader', '');
      }

      if (!sessionStorage.getItem('showOnlyProjectFilter') || showOnlyProjectFilter) {
        showOnlyProjectFilter && showOnlyProjectFilter != "null" ? sessionStorage.setItem('showOnlyProjectFilter', showOnlyProjectFilter)
          : sessionStorage.setItem('showOnlyProjectFilter', '');
      }

      if (!sessionStorage.getItem('scopedTaskId') || scopedTaskId) {
        scopedTaskId && scopedTaskId != "null" ? sessionStorage.setItem('scopedTaskId', scopedTaskId)
          : sessionStorage.setItem('scopedTaskId', '');
      }

      if (!sessionStorage.getItem('workType') || workType ) {
        workType && workType != "null" ? sessionStorage.setItem('workType', workType) : sessionStorage.setItem('workType', '');
      }

      if (!sessionStorage.getItem('department') || department ) {
        department && department != "null" ? sessionStorage.setItem('department', department) : sessionStorage.setItem('department', '');
      }

      if (!sessionStorage.getItem('portfolio') || portfolio ) {
        portfolio && portfolio != "null" ? sessionStorage.setItem('portfolio', portfolio) : sessionStorage.setItem('portfolio', '');
      }

      if (!sessionStorage.getItem('priority') || priority ) {
        priority && priority != "null" ? sessionStorage.setItem('priority', priority) : sessionStorage.setItem('priority', '');
      }
    }
  }

  getQueryStringValue(key: string, url: string) {
    return decodeURIComponent(url.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  get envConfig(): CinchyConfig {
    return this.enviornmentConfig as CinchyConfig;
  }

  loadConfig() {
    return forkJoin(this.getEnvUrl());
  }

  getEnvUrl() {
    console.log('111 env', environment.production)
    const whichConfig = environment.production ? 'config_prod.json' : 'config.json';
    const url = `${this.baseUrl}assets/${whichConfig}`;
    /*    const headers = new HttpHeaders({
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
        })*/
    return this.http
      .get<any>(url).pipe(
        tap(config => {
          this.enviornmentConfig = config
        }));
  }

  receiveMessage(event: any) {
    if (event.data.toString().startsWith('[Cinchy][innerHeight]')) {
      this.fullScreenHeight = parseInt(event.data.toString().substring(21), 10) + 4;
      console.log('receiveMessage  IF', this.fullScreenHeight)
      localStorage.setItem('fullScreenHeight', this.fullScreenHeight.toString());
      const elements = document.getElementsByClassName('full-height-element');
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < elements.length; i++) {
        setTimeout(() => {
          if (window.location !== window.parent.location) {
            // @ts-ignore
            elements[i]['style'].height = this.fullScreenHeight + 'px';
          }
        }, 500)
      }
    }
  }
}
