import {Component, ElementRef, AfterViewInit, OnInit} from '@angular/core';
import {GanttBackendService} from "../../webix-services/gantt-backend.service";
import {AppStateService} from "../../services/app-state.service";
import {projectDetails, setProjectDetails} from "../../data";
import {UtilService} from "../../services/util.service";

declare let webix: any;
declare let gantt: any;

@Component({
  selector: 'app-gantt-view',
  template: '<div style="width: 100%; height: 100vh;"></div>',  // Webix will replace this div with the Gantt chart
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit, AfterViewInit {

  constructor(private element: ElementRef, private appStateService: AppStateService,
              private utilService: UtilService) {
  }

  ngOnInit() {
    const ganttData = this.utilService.transformToGanttData(this.appStateService.projectDetails);
    setProjectDetails(ganttData);
  }

  ngAfterViewInit(): void {
    this.initGantt();
  }

  initGantt(): void {
    class CustomBars extends gantt.views["chart/bars"] {
      BarTemplate(task: any) {
        console.log("Processing task:", task);  // Debug log

        const assignment = projectDetails.mappedAssigned.find((a: any) => a.task_id === task?.id);
        const resource = projectDetails.mappedResources.find((r: any) => r.id === assignment?.resource_id);
        return `${task?.text} (${resource?.name})`;
      }

      BarCSS(task: any, last: any) {
        // default classname
        let css = super.BarCSS(task, last);
        // add a subtype classname
        if (task.subtype && task.type == "task") css += " " + task.subtype;
        return css;
      }
    }
    if (webix.env.mobile) webix.ui.fullScreen();
    webix.CustomScroll.init();

    webix.ui({
      container: this.element.nativeElement.firstChild,
      view: "gantt",
      resources: true,
      display: "resources",
      resourcesDiagram: true,
      on: {
        onBeforeDrag: this.utilService.beforeDrag,
        onBeforeDrop: this.utilService.afterDrag,
      },
      override: new Map<any, any>([
        [gantt.views["chart/bars"], CustomBars],
        [gantt.services.Backend, GanttBackendService]
      ])
    });

  }
}
