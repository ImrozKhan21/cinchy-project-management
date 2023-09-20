import {Component, ElementRef, AfterViewInit, OnInit} from '@angular/core';
import {AppStateService} from "../../services/app-state.service";
import {UtilService} from "../../services/util.service";
import {IProjectDetails, IStatus, IUser} from "../../models/common.model";
import {Observable} from "rxjs";

declare let webix: any;
declare let kanban: any;
declare let base_task_set: any;

@Component({
  selector: 'app-kanban-view',
  templateUrl: './kanban-view.component.html',
  styleUrls: ['./kanban-view.component.scss']
})
export class KanbanViewComponent implements OnInit, AfterViewInit {
  kanbanData: any;
  kanbanView: any;
  showSpinner$: Observable<boolean>;

  constructor(private element: ElementRef, private appStateService: AppStateService,
              private utilService: UtilService) {
  }

  ngOnInit() {
    this.showSpinner$ = this.appStateService.getSpinnerState();
    this.kanbanData = this.utilService.transformToKanbanData(this.appStateService.projectDetails);
  }

  ngAfterViewInit(): void {
    this.appStateService.getGlobalFilter().subscribe((filterValues) => {
      this.setDetailsAndRender(filterValues);
    });
  }

  setDetailsAndRender(filterValues: any) {
    const {allTasks} = this.kanbanData;
    let updatedTasks = this.utilService.getUpdatedTasks(allTasks, filterValues);
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
        container: document.getElementById("kanban-view"),
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
