import {Component, ElementRef, AfterViewInit, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {GanttBackendService} from "../../webix-services/gantt-backend.service";
import {AppStateService} from "../../services/app-state.service";
import {projectDetails, setProjectDetails, setUtilServiceInstance, utilServiceInstance} from "../../data";
import {UtilService} from "../../services/util.service";
import {IProjectDetails, IStatus, IUser} from "../../models/common.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ReplaySubject, takeUntil} from "rxjs";

declare let webix: any;
declare let gantt: any;

@Component({
  selector: 'app-gantt-view',
  template: `
    <div id="gantt-parent" style="width: 100%; height: 100vh;"></div>
    <div id="gantt-toolbar"></div>
    <div id="gantt-chart" style="width: 100%; height: 100%;"></div>
  `,  // Webix will replace this div with the Gantt chart
  styleUrls: ['./gantt-view.component.scss']
})
export class GanttViewComponent implements OnInit, AfterViewInit {
  ganttData: any;
  ganttView: any;
  currentViewType: string;

  constructor(private element: ElementRef,@Inject(PLATFORM_ID) private platformId: any, private activatedRoute: ActivatedRoute,
              private appStateService: AppStateService, private router: Router,
              private utilService: UtilService) {
  }

  ngOnInit() {
    setUtilServiceInstance(this.utilService);
    this.ganttData = this.utilService.transformToGanttData(this.appStateService.projectDetails, this.appStateService.projects);
    setProjectDetails(this.ganttData);
  }

  ngAfterViewInit(): void {
    this.appStateService.getGlobalFilter().subscribe(({selectedUsers, selectedStatuses, selectedProjects, searchValue}) => {
      this.setDetailsAndRender(selectedUsers, selectedStatuses, selectedProjects, searchValue);
    });
  }

  setDetailsAndRender(selectedUsers: IUser[], selectedStatuses: IStatus[], selectedProjects: IProjectDetails[], searchValue: string) {
    const {allTasks} = projectDetails;
    let updatedTasks = this.utilService.getUpdatedTasks(allTasks, selectedUsers, selectedStatuses, selectedProjects, searchValue);
    setProjectDetails({...projectDetails, mappedTasks: updatedTasks});
    this.ganttView?.destructor();
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
    this.ganttView = webix.ui({
      container: document.getElementById('gantt-parent'),

      rows: [
        {
          container: document.getElementById('gantt-toolbar'),

          view: "toolbar",
          //css: "webix_dark",
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
          },
          elements: [
            {},
            {
              view: "segmented",
              label: "",
              width: 350,
              value: this.currentViewType,
              options: [
                { value: "Task view", id: "tasks" },
                { value: "Resource view", id: "resources" },
              ],
              on: {
                onChange: (v:any) => {
                  const gantView = $$("gantt") as any;
                  gantView.getState().display = v;
                  this.currentViewType = v;
                }
              },
            },
            {},
          ],
        },
        {
          container: document.getElementById('gantt-chart'),
          view: "gantt",
          id: "gantt",
          resources: true,
          display: this.currentViewType === 'resources' ? 'resources' : "tasks",
          resourcesDiagram: false,
          on: {
            onBeforeDrag: this.utilService.beforeDrag,
            onBeforeDrop: this.utilService.afterDrag,
          },
          override: new Map<any, any>([
            [gantt.views["chart/bars"], CustomBars],
            [gantt.services.Backend, GanttBackendService]
          ])
        }
      ]
    });

  }
}
