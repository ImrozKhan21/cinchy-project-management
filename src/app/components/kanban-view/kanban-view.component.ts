import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {AppStateService} from "../../services/app-state.service";
import {UtilService} from "../../services/util.service";
import {Observable} from "rxjs";
import {IProjectDetails, IStatus, PRIORITY_OPTIONS, WORK_TABLE_URL} from "../../models/common.model";
import {DataTransformerService} from "../../services/data-transformer.service";
import {FilterDataService} from "../../services/filter-data.service";

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
  dontMakeCallToUpdate: boolean = false;
  isDragged: boolean = false;

  constructor(private element: ElementRef, private appStateService: AppStateService,
              private utilService: UtilService, private dataTransformerService: DataTransformerService,
              private filterDataService: FilterDataService) {
  }

  ngOnInit() {
    this.showSpinner$ = this.appStateService.getSpinnerState();
    this.kanbanData = this.dataTransformerService.transformToKanbanData(this.appStateService.activities);
    this.appStateService.getRefreshViewState().subscribe(({refresh, activity}) => {
      if (refresh) {
        this.dontMakeCallToUpdate = true;
        const kanban: any = $$("kanban");
        kanban.updateItem(activity.id, activity);
        this.dontMakeCallToUpdate = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.appStateService.getGlobalFilter().subscribe((filterValues) => {
      this.setDetailsAndRender(filterValues);
    });
  }

  setDetailsAndRender(filterValues: any) {
    const selectedProjects = filterValues?.selectedProjects;
    this.kanbanData = this.dataTransformerService.transformToKanbanData(this.appStateService.activities, selectedProjects);
    const {allTasks, projects} = this.kanbanData;
    this.filterValues = filterValues;
    let updatedTasks = this.filterDataService.getUpdatedTasks(allTasks.concat(projects), filterValues, true);
    this.kanbanData = {...this.kanbanData, mappedTasks: updatedTasks};
    this.kanbanView?.destructor();
    this.initKanban();
  }

  initKanban(): void {
    const {mappedStatuses, mappedTasks, userSet, projects, tagsList} = this.kanbanData;
    if (webix.env.mobile) webix.ui.fullScreen();
    const projectsForSelection = projects.map((project: IProjectDetails) => ({
      id: project.id,
      value: project.project_name
    }));

    const statusesForSelection = this.appStateService.allStatuses.map((status: IStatus) => ({
      id: status.id,
      value: status.name
    }));

    const typesForSelection = this.appStateService.activityTypes;
    const estimatesForSelection = this.appStateService.estimates;
    webix.CustomScroll.init();

    // Custom footer in cards (tags and icons)
    webix.type(webix.ui.kanbanlist, {
      name: "cards",
      templateBody:function(obj: any){
        const defaultHtml =`<span>${obj.text}</span>`;
        return `${defaultHtml}`;
      },
      templateFooter: (obj: any, common: any, kanban: any) => {
        const defaultTags = common.templateTags(obj, common, kanban);
        const defaultIconsString = common.templateIcons(obj, common, kanban);
        // TODO: find a better way to do below
        const updateIcons = defaultIconsString.replace('webix_kanban_icon kbi-cogs', 'wxi-dots');
        const defaultHtml =
          `<span style="background-color: ${obj.rgb_project_color}" class="custom-tag" title="${obj.project_name}">
            ${obj.project_name?.substring(0, 16)}...</span>` + updateIcons;
        return `<span class="center-item-flex" title="${obj.activity_type}">
                    <img height="20px" style="margin-right: 5px;" src=${obj.activity_type_icon}  alt="icon"/>
                </span> ${defaultHtml}`;
      }
    });

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
            {
              view: "button", type: "form", label: "Add new activity", width: 150, click: () => {
                const kanbanView = $$("kanban") as any;
                kanbanView.showEditor();
                const editorForm: any = kanbanView.getEditor();
                const formValues = editorForm.getValues();
                const projectField = $$('project-combo');
                const selectedProject = this.filterValues?.selectedProjects;
                if (selectedProject?.length === 1) {
                  const updatedFormValues = {
                    ...formValues,
                    parent_project: `project-${selectedProject[0].project_id}`,
                    project_name: selectedProject[0].project_name,
                    parent_id: selectedProject[0].project_id
                  };
                  editorForm.setValues(updatedFormValues);
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
          tags: tagsList,
          projects: projectsForSelection,
          editor: {
            elements: [
              {
                id: "project-combo",
                view: "combo",
                name: "parent_project",
                label: "Project",
                options: projectsForSelection,
                disabled: true
              },
              {
                margin: 10,
                cols: [
                  {view: "text", name: "text", label: "Task"},
                  {
                    id: "activity-type-combo",
                    view: "combo",
                    name: "activity_type_id",
                    label: "Type",
                    options: typesForSelection
                  }
                ]
              },
              {
                margin: 10,
                cols: [
                  {id: "user-combo", view: "combo", name: "user_id", label: "Assign to", options: userSet},
                  {id: "status-combo", view: "combo", name: "status_id", label: "Status", options: statusesForSelection}
                ]
              },
              {
                margin: 10,
                cols: [
                  {id: "priority-combo", view: "combo", name: "priority", label: "Priority", options: PRIORITY_OPTIONS},
                  {id: "estimates-combo", view: "combo", name: "effort_id", label: "Total Effort", options: estimatesForSelection},
                ]
              },
              {id: "percent-done", view: "slider", name: "percent_done", label: "Percent Done"},
              {
                margin: 10,
                cols: [
                  {view: "datepicker", name: "start_date", label: "Start Date"},
                  {view: "datepicker", name: "end_date", label: "End Date"}
                ]
              },
              {view: "textarea", height: 140, name: "status_commentary", label: "Status Commentary"}

              /* {view: "textarea", height: 100, name: "qaNotes", label: "QA Notes"}*/
            ],
            rules:{
              parent_project: webix.rules.isNotEmpty,
              text: webix.rules.isNotEmpty,
              activity_type_id: webix.rules.isNotEmpty
            }
          },
          cardActions: [
            //default
            "edit",
            // custom,
            'View in Table',
            "remove"
          ],
          on: {
            onBeforeCardAction:function(action: any, id: any){
              if(action === "View in Table") {
                const kanbanView: any = $$("kanban");
                const itemData = kanbanView.getItem(id);
                const updatedURL = WORK_TABLE_URL.replace("{{title}}", encodeURIComponent(itemData.text));
                window.open(updatedURL, '_blank');
              }
            },
            onListItemClick: (id: any, ev: any) => {
            },
            onListItemDblClick: function (id: any, e: any, node: any, list: any) {
              const kanbanView: any = $$("kanban");
              const editorForm: any = kanbanView.getEditor();
              const formValues = kanbanView.getItem(id);
              kanbanView.showEditor();
              const projectField = $$('project-combo');
              !formValues.parent ? projectField.enable() : projectField.disable();
              editorForm.setValues(formValues);
            },
            onDataUpdate: (v: any, itemData: any) => {
              if (!this.dontMakeCallToUpdate) {
                this.utilService.updateActivityWithNewValues(itemData, 'UPDATE', 'kanban', this.isDragged);
              }
            },
            onBeforeAdd: (obj: any, list: any, e: any) => {
              this.utilService.updateActivityWithNewValues({...list, type: 'task'}, 'INSERT', 'kanban');
            },
            onAfterEditorShow: () => {
              const kanbanView: any = $$("kanban");
              const editorForm: any = kanbanView.getEditor();
              const formValues = editorForm.getValues();
              const projectField = $$('project-combo');
              // Check if the editor is for a new card
              !formValues.parent ? projectField.enable() : projectField.disable();
            },
            onBeforeEditorAction: (action: any, editor: any, obj: any) => {
              return !(action === "save" && !editor.getForm().validate());
            },
            onBeforeDelete: (id: any) => {
              this.utilService.deleteActivity(id, 'kanban')
            },
            onListAfterDrop: (kanbanView: any, dragContext: any, e: any, list: any) => {
              this.isDragged = false;
            },
            onListBeforeDrag: () => {
              this.isDragged = true;
            },
            onListBeforeDragIn: this.utilService.onKanbanBeforeDragIn,
          },
        }
      ],
    });
    // EDITOR EVENTS
    const kanbanView: any = $$("kanban");
    const editorForm: any = kanbanView.getEditor();
    editorForm.attachEvent("onHide", function(){
      editorForm.getForm().clearValidation();
    });

  }
}
