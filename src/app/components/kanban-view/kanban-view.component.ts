import {Component, ElementRef, AfterViewInit, OnInit} from '@angular/core';
import {AppStateService} from "../../services/app-state.service";
import {projectDetails, setProjectDetails} from "../../data";
import {UtilService} from "../../services/util.service";

declare let webix: any;
declare let kanban: any;
declare let base_task_set: any;

@Component({
  selector: 'app-kanban-view',
  template: '<div style="width: 100%; height: 100vh;"></div>',  // Webix will replace this div with the kanban chart
  styleUrls: ['./kanban-view.component.scss']
})
export class KanbanViewComponent implements OnInit, AfterViewInit {

  constructor(private element: ElementRef, private appStateService: AppStateService,
              private utilService: UtilService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.initKanban();
  }

  initKanban(): void {
    const {mappedStatuses, mappedTasks} = this.utilService.transformToKanbanData(this.appStateService.projectDetails);
    if (webix.env.mobile) webix.ui.fullScreen();
    webix.CustomScroll.init();

    webix.ui({
      view:"kanban",
      container: this.element.nativeElement.firstChild,
      cols: mappedStatuses,
      data: mappedTasks
    });

  }
}
