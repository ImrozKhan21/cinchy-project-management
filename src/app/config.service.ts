import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {forkJoin} from 'rxjs';
import {map, tap} from 'rxjs/operators';
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
    if (isPlatformBrowser(this.platformId)) {
      let modelId = this.getQueryStringValue('modelId', window.location.search);
      let viewType = this.getQueryStringValue('viewType', window.location.search);
      if (!modelId) {
        modelId = this.getQueryStringValue('modelId', document.referrer);
        viewType = this.getQueryStringValue('viewType', document.referrer);
      }
      modelId && sessionStorage.setItem('modelId', modelId);
      viewType && sessionStorage.setItem('viewType', viewType);

      if (!sessionStorage.getItem('modelId') || modelId) {
        modelId && modelId != "null" ? sessionStorage.setItem('modelId', modelId) : sessionStorage.setItem('modelId', '');
      }

      if (!sessionStorage.getItem('viewType') || viewType) {
        viewType && viewType != "null" ? sessionStorage.setItem('viewType', viewType) : sessionStorage.setItem('viewType', '');
      }
      console.log('session', sessionStorage.getItem('modelId'));
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
