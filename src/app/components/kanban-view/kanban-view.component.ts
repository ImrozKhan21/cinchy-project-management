import {Component, ElementRef, AfterViewInit, OnInit} from '@angular/core';
import {AppStateService} from "../../services/app-state.service";
import {projectDetails, setProjectDetails} from "../../data";
import {UtilService} from "../../services/util.service";
import {IProjectDetails, IStatus, IUser} from "../../models/common.model";

declare let webix: any;
declare let kanban: any;
declare let base_task_set: any;

@Component({
  selector: 'app-kanban-view',
  template: '<div style="width: 100%; height: 100vh;"></div>',  // Webix will replace this div with the kanban chart
  styleUrls: ['./kanban-view.component.scss']
})
export class KanbanViewComponent implements OnInit, AfterViewInit {
  kanbanData: any;
  kanbanView: any;

  constructor(private element: ElementRef, private appStateService: AppStateService,
              private utilService: UtilService) {
  }

  ngOnInit() {
    this.kanbanData = this.utilService.transformToKanbanData(this.appStateService.projectDetails);
  }

  ngAfterViewInit(): void {
    this.appStateService.getGlobalFilter().subscribe(({selectedUsers, selectedStatuses, selectedProjects, searchValue}) => {
      this.setDetailsAndRender(selectedUsers, selectedStatuses, selectedProjects, searchValue);
    });
  }

  setDetailsAndRender(selectedUsers: IUser[], selectedStatuses: IStatus[], selectedProjects: IProjectDetails[], searchValue: string) {
    const {allTasks} = this.kanbanData;
    let updatedTasks = this.utilService.getUpdatedTasks(allTasks, selectedUsers, selectedStatuses, selectedProjects, searchValue);
    this.kanbanData = {...this.kanbanData, mappedTasks: updatedTasks};
    this.kanbanView?.destructor();
    this.initKanban();
  }

  initKanban(): void {
    const {mappedStatuses, mappedTasks, userSet} = this.kanbanData;
    if (webix.env.mobile) webix.ui.fullScreen();
    webix.CustomScroll.init();
    this.kanbanView = webix.ui(
      {
        view: "kanban",
        container: this.element.nativeElement.firstChild,
        cols: mappedStatuses,
        data: mappedTasks,
        userList: true,
        users: userSet,
        editor:true,
        cardActions: [
          //default
          "edit", "remove"
        ],
        on: {
          onDataUpdate: (v:any, itemData: any) => {
            this.utilService.updateActivityWithNewValues(itemData);
          },
          onBeforeCardAction:(action: any, id: any) => {
            // this.utilService.onKanbanCardUpdate(this.kanbanView, action, id);
          },
          onListAfterDrop: (dragContext: any, e: any, list: any) => {
           // this.utilService.onKanbanAfterDrop(this.kanbanView, dragContext, e, list);
          },
          onListItemClick: function (id: any, e: any, node: any, list: any) {
            //  webix.message("Item '"+"' has been clicked.");
          },
          onListBeforeSelect: function (id: any, state: any, list: any) {
            // webix.message("Item '"+"' will be selected.");
            return true;
          },
          onListAfterSelect: function (id: any, state: any, list: any) {
            //   webix.message("Item '"+"' has been selected.");
          },
          onListBeforeDrag: this.utilService.onKanbanBeforeDrag,
          onListBeforeDragIn: this.utilService.onKanbanBeforeDragIn,
        },

      });

  }
}
