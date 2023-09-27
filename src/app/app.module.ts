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
import { FiltersComponent } from './components/filters/filters.component';
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {MultiSelectModule} from "primeng/multiselect";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";
import {HeaderComponent} from "./components/header/header.component";
import {CheckboxModule} from "primeng/checkbox";
import { EditFormComponent } from './common/edit-form/edit-form.component';

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
    KanbanViewComponent,
    FiltersComponent,
    HeaderComponent,
    EditFormComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        AutoCompleteModule,
        CinchyModule.forRoot(),
        FormsModule,
        MultiSelectModule,
        ButtonModule,
        InputTextModule,
        ProgressSpinnerModule,
        ToastModule,
        CheckboxModule,
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
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
