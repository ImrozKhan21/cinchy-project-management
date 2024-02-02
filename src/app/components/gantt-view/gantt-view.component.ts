import {AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {GanttBackendService} from "../../webix-services/gantt-backend.service";
import {AppStateService} from "../../services/app-state.service";
import ganttGlobalDataSingleton from "../../ganttGlobalDataSingleton";
import {UtilService} from "../../services/util.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {CustomInfo} from "../../webix-services/gantt-task-info.service";
import {CustomForm} from "../../webix-services/gantt-form.service";
import {IProjectDetails} from "../../models/common.model";
import {CustomTree} from "../../webix-services/gantt-tree.service";
import {DataTransformerService} from "../../services/data-transformer.service";
import {FilterDataService} from "../../services/filter-data.service";

declare let webix: any;
declare let gantt: any;

@Component({
  selector: 'app-gantt-view',
  templateUrl: './gantt-view.component.html',
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit, AfterViewInit {
  ganttData: any;
  ganttView: any;
  currentViewType: string;
  showSpinner$: Observable<boolean>;
  showForm = false;

  constructor(private element: ElementRef, @Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private router: Router, private filterDataService: FilterDataService,
              private utilService: UtilService, private dataTransformerService: DataTransformerService) {
  }

  ngOnInit() {
    this.showSpinner$ = this.appStateService.getSpinnerState();
    ganttGlobalDataSingleton.setUtilServiceInstance(this.utilService);
    ganttGlobalDataSingleton.setFilterDataServiceInstance(this.filterDataService);
    this.ganttData = this.dataTransformerService.transformToGanttData(this.appStateService.activities, this.appStateService.projects);
    ganttGlobalDataSingleton.setProjectDetails(this.ganttData);
  }

  ngAfterViewInit(): void {
    this.appStateService.getGlobalFilter().subscribe((filterValues) => {
      this.setDetailsAndRender(filterValues);
    });
  }

  setDetailsAndRender(filterValues: any) {
    const {allTasks} = ganttGlobalDataSingleton.projectDetails;
    let updatedTasks = this.filterDataService.getUpdatedTasks(allTasks, filterValues);
    ganttGlobalDataSingleton.setProjectDetails({
      ...ganttGlobalDataSingleton.projectDetails, mappedTasks: updatedTasks,
      allStatuses: this.appStateService.allStatuses, activityTypes: this.appStateService.activityTypes
    });
    this.ganttView?.destructor();
    this.initGantt();
  }

  initGantt(): void {
    if (webix.env.mobile) webix.ui.fullScreen();
    webix.CustomScroll.init();


    const zoom = {
      view: "richselect",
      label: "View By:",
      value: "month",
      width: 300,
      options: ["day", "week", "month", "quarter", "year"],
      on: {
        onChange: GanttViewComponent.resetScales,
      },
    };

/*    webix.protoUI({
      name:"gantt",
      $init: function(){
        this.$app.attachEvent("app:task:click", (task: any) => {
          this.callEvent("onTaskClick", [task]);
        });
      }
    }, webix.ui.gantt);*/

    this.ganttView = webix.ui({
      container: document.getElementById('gantt-parent'),

      rows: [
        {
          view: "toolbar",
          id: "toolbar",
          container: document.getElementById('gantt-scales'),
          paddingX: 10,
          elements: [zoom, {}],
        },
        {
          container: document.getElementById('gantt-chart'),
          view: "gantt",
          id: "gantt",
          resources: true,
          display: this.currentViewType === 'resources' ? 'resources' : "tasks",
          resourcesDiagram: false,
          scales: [ganttGlobalDataSingleton.yearScale, ganttGlobalDataSingleton.monthScale],
          scaleCellWidth: 700,
          editor: false,  // assign custom editor configuration
          //scaleStart: new Date(),
          on: {
            onBeforeDrag: this.utilService.beforeDrag,
            onBeforeDrop: this.utilService.afterDrag
          },
          override: new Map<any, any>([
            [gantt.views.tree, CustomTree],
            [gantt.views["task/form"], CustomForm],
            [gantt.views["task/info"], CustomInfo],
            [gantt.services.Backend, GanttBackendService]
          ])
        }
      ]
    });

    const gantt1: any = $$("gantt");
    gantt1.getState().$observe("selected", (id: any) => {
      const formInstance = ganttGlobalDataSingleton.getGanttFormInstance();
      if (typeof id === 'string') {
        ganttGlobalDataSingleton.setViewType('UPDATE');
      } else {
        ganttGlobalDataSingleton.setViewType('INSERT');
      }
      let currentFormValues = ganttGlobalDataSingleton.projectDetails.mappedTasks.find((task: IProjectDetails) => task.id === id);
      ganttGlobalDataSingleton.setCurrentTaskDetailsForFormValues(currentFormValues);
      if (formInstance) {
        formInstance.refresh()
      }
    });

  }

  static getScales(minScale: any) {
    const scales = [];
    switch (minScale) {
      case "year":
        scales.push(ganttGlobalDataSingleton.yearScale);
        break;
      case "quarter":
        scales.push(ganttGlobalDataSingleton.yearScale, ganttGlobalDataSingleton.quarterScale);
        break;
      case "month":
        scales.push(ganttGlobalDataSingleton.yearScale, ganttGlobalDataSingleton.monthScale);
        break;
      case "week":
        scales.push(ganttGlobalDataSingleton.quarterScale, ganttGlobalDataSingleton.monthScale, ganttGlobalDataSingleton.weekScale);
        break;
      case "day":
        scales.push(ganttGlobalDataSingleton.yearScale, ganttGlobalDataSingleton.monthScale, ganttGlobalDataSingleton.dayScale);
        break;
      case "hour":
        scales.push(ganttGlobalDataSingleton.monthScale, ganttGlobalDataSingleton.dayScale, ganttGlobalDataSingleton.hourScale);
        break;
    }
    return scales;
  }

  static resetScales(v: any, o: any) {
    let originalStartDate: any = null;
    let originalEndDate: any = null;
    const gantView = $$("gantt") as any;
    const current = gantView.getService("local").getScales();
    if (!(originalEndDate || originalStartDate)) {
      originalStartDate = webix.Date.add(current.start, 1, o, true);
      originalEndDate = webix.Date.add(current.end, -1, o, true);
    }

    const cellWidth = ganttGlobalDataSingleton.cellWidths[v];
    const scales = GanttViewComponent.getScales(v);

    const start = webix.Date.add(originalStartDate, -1, v, true);
    const end = webix.Date.add(originalEndDate, 1, v, true);
    gantView
      .getService("local")
      .setScales(
        start,
        end,
        !(v == "day"),
        cellWidth,
        current.cellHeight,
        scales
      );
  }

}
