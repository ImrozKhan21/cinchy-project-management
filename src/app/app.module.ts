import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CinchyConfig, CinchyModule, CinchyService} from "@cinchy-co/angular-sdk";
import {ConfigService} from "./config.service";
import {lastValueFrom} from "rxjs";
import { GanttViewComponent } from './components/gantt-view/gantt-view.component';
import { KanbanViewComponent } from './components/kanban-view/kanban-view.component';

export function appLoadFactory(config: ConfigService) {
  return () => lastValueFrom(config.loadConfig());
}

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

@NgModule({
  declarations: [
    AppComponent,
    GanttViewComponent,
    KanbanViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CinchyModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appLoadFactory,
      deps: [ConfigService],
      multi: true
    },
    CinchyModule,
    CinchyService,
    {
      provide: CinchyConfig,
      useFactory: (config: ConfigService) => {
        return config.envConfig;
      },
      deps: [ConfigService]
    },
    {provide: 'BASE_URL', useFactory: getBaseUrl},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
