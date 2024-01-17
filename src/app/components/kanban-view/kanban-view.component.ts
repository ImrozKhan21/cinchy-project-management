import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {AppStateService} from "../../services/app-state.service";
import {UtilService} from "../../services/util.service";
import {Observable} from "rxjs";
import {IProjectDetails, IStatus} from "../../models/common.model";

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
  filterValues: any;

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
    this.filterValues = filterValues;
    let updatedTasks = this.utilService.getUpdatedTasks(allTasks, filterValues);
    this.kanbanData = {...this.kanbanData, mappedTasks: updatedTasks};
    this.kanbanView?.destructor();
    this.initKanban();
  }

  initKanban(): void {
    const {mappedStatuses, mappedTasks, userSet, projects} = this.kanbanData;
    if (webix.env.mobile) webix.ui.fullScreen();
    const projectsForSelection = projects.map((project: IProjectDetails) => ({
      id: project.id,
      value: project.project_name
    }));

    const statusesForSelection = this.appStateService.allStatuses.map((status: IStatus) => ({
      id: status.id,
      value: status.name
    }));
    webix.CustomScroll.init();
    this.kanbanView = webix.ui({
      container: document.getElementById("kanban-parent"),
      rows: [
        {
          container: document.getElementById("kanban-add-view"),
          css: "toolbar",
          borderless: true,
          paddingY: 7,
          paddingX: 10,
          margin: 7,
          cols: [
            {view: "label", label: "Board"},
      /*      {
              view: "button", type: "danger", label: "Remove selected", width: 150, click: () => {
                const kanbanView = $$("kanban") as any;
                const id = kanbanView.getSelectedId();
                if (!id) {
                  return webix.alert("Please selected a card that you want to remove!");
                }
                kanbanView.remove(id);
              }
            },*/
            {
              view: "button", type: "form", label: "Add new activity", width: 150, click: () => {
                const kanbanView = $$("kanban") as any;
                kanbanView.showEditor();
                const editorForm: any = kanbanView.getEditor();
                const formValues = editorForm.getValues();
                const projectField = $$('$combo1');
                const selectedProject = this.filterValues?.selectedProjects;
                if (selectedProject?.length) {
                  const updatedFormValues = {...formValues,
                    parent: `project-${selectedProject[0].project_id}`,
                    project_name: selectedProject[0].project_name,
                    parent_id: selectedProject[0].project_id
                  };
                  editorForm.setValues(updatedFormValues);
                  projectField.disable();
                }
              }
            }
          ]
        },
        {
          view: "kanban",
          id: "kanban",
          container: document.getElementById("kanban-view"),
          cols: mappedStatuses,
          data: mappedTasks,
          userList: true,
          users: userSet,
          projects: projectsForSelection,
          editor: {
            elements: [
              {view: "combo", name: "parent", label: "Project", options: projectsForSelection, disabled: true},
              {view: "text", name: "text", label: "Task"},
              {
                margin: 10,
                cols: [
                  {view: "combo", name: "user_id", label: "Assign to", options: userSet},
                  {view: "combo", name: "status_id", label: "Status", options: statusesForSelection}
                ]
              },
           /*   {
                margin: 10,
                cols: [
                  { view: "datepicker", name: "start_date", label: "Start Date" },
                  { view: "datepicker", name: "end_date", label: "End Date" }
                ]
              },*/
              { view: "text", name: "estimate", label: "Task Effort" },
              {
                margin: 10,
                cols: [
                  { view: "text", name: "effortCompleted", label: "Effort Completed" },
                  { view: "text", name: "effortRemaining", label: "Effort Remaining" },
                ]
              },
              { view: "textarea", height: 100, name: "qaNotes", label: "QA Notes" }
            ]
          },
          cardActions: [
            //default
            "edit", "remove"
          ],
          on:
            {
              onListItemClick: (id: any, ev: any) => {
            /*    const kanbanView: any = $$("kanban");
                const editorForm: any = kanbanView.getEditor();
                const formValues = kanbanView.getItem(id);
                kanbanView.showEditor();

                const projectField = $$('$combo1');  // Assuming '$combo1' is the "project" field
                const statusField = $$('$combo3');  // Assuming '$combo3' is the "status" field
                !formValues.parent ?  projectField.enable() :  projectField.disable();
                if (!formValues.text) {
                  const updatedFormValues = {...formValues, status_id: 1};
                  editorForm.setValues(updatedFormValues);
                  statusField.disable();
                } else {
                  statusField.enable();
                }
                editorForm.setValues(formValues);*/
              },
              onDataUpdate: (v: any, itemData: any) => {
                this.utilService.updateActivityWithNewValues(itemData, 'UPDATE');
              },
              onBeforeAdd: (obj: any, list: any, e: any) => {
                this.utilService.updateActivityWithNewValues({...list, type: 'task'}, 'INSERT')
              },
              onAfterEditorShow: () => {
                const kanbanView: any = $$("kanban");
                const editorForm: any = kanbanView.getEditor();
                const formValues = editorForm.getValues();
                const projectField = $$('$combo1');  // Assuming '$combo1' is the "project" field
                const textField = $$('$text1');  // Assuming '$combo1' is the "project" field

                // Check if the editor is for a new card
                !formValues.parent ?  projectField.enable() :  projectField.disable();
          //      !formValues.text ?  textField.enable() :  textField.disable();
                const statusField = $$('$combo3');  // Assuming '$combo3' is the "status" field
                // Check if the editor is for a new card
                if (!formValues.text) {
                  const updatedFormValues = {...formValues, status_id: 1};
                  editorForm.setValues(updatedFormValues);
                  statusField.disable();
                } else {
                  statusField.enable();
                }
              },
              onListBeforeDrag: this.utilService.onKanbanBeforeDrag,
              onListBeforeDragIn: this.utilService.onKanbanBeforeDragIn,
            },
        }
      ],
    });

  }
}
