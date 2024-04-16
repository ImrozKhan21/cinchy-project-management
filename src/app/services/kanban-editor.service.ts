import {Injectable} from '@angular/core';
import {IStatus, PRIORITY_OPTIONS} from "../models/common.model";
import {AppStateService} from "./app-state.service";

@Injectable({
  providedIn: 'root'
})
export class KanbanEditorService {

  constructor(private appStateService: AppStateService) {
  }

  getKanbanEditor(kanbanData: any, projectsForSelection: any, selectedProjects: any, webix: any) {
    const {allTasks, userSet} = kanbanData;
    const projectsMap = new Map(selectedProjects?.map((project: any) => [project.project_id, project]));
    const parentItemsForSelection = allTasks.filter((task: any) => projectsMap.has(task.project_id))
      .map((task: any) => ({
        id: task.activity_id,
        value: task.text
      }));

    const statusesForSelection = this.appStateService.allStatuses.map((status: IStatus) => ({
      id: status.id,
      value: status.name
    }));

    const typesForSelection = this.appStateService.activityTypes;
    const estimatesForSelection = this.appStateService.estimates;
    return {
      width: 1200, // Set your desired width
      elements: [
        {
          margin: 10,
          cols: [
            {
              id: "project-combo",
              view: "combo",
              name: "parent_project",
              label: "Project*",
              options: projectsForSelection,
              disabled: true
            },
            {
              id: "parent-combo",
              view: "combo",
              name: "parent_activity",
              label: "Parent",
              options: parentItemsForSelection
            }
          ]
        },
        {
          margin: 10,
          cols: [
            {view: "text", name: "text", label: "Task*"},
            {
              id: "activity-type-combo",
              view: "combo",
              name: "activity_type_id",
              label: "Type*",
              options: typesForSelection
            }
          ]
        },
        {
          margin: 10,
          cols: [
            {id: "user-combo", view: "combo", name: "user_id", label: "Assignee*", options: userSet},
            {
              id: "status-combo",
              view: "combo",
              name: "status_id",
              label: "Status*",
              options: statusesForSelection
            }
          ]
        },
        {
          margin: 10,
          cols: [
            {view: "datepicker", name: "start_date", label: "Start Date"},
            {view: "datepicker", name: "end_date", label: "End Date"}
          ]
        },
        {
          margin: 10,
          cols: [
            {
              id: "priority-combo", view: "combo", name: "priority", label: "Priority",
              options: Object.keys(PRIORITY_OPTIONS).map((key: string) => PRIORITY_OPTIONS[key])
            },
            {
              id: "estimates-combo",
              view: "combo",
              name: "effort_id",
              label: "Total Effort",
              options: estimatesForSelection
            },
            {id: "percent-done", view: "slider", name: "percent_done", label: "Percent Done"},
          ]
        },
        {view: "textarea", height: 70, name: "status_commentary", label: "Status Commentary"},
        {label: "Description", view: "label", height: 30},
        {view: "richtext", height: 150, name: "description", labelPosition: "top", label: ""}
      ],
      rules: {
        parent_project: webix.rules.isNotEmpty,
        text: webix.rules.isNotEmpty,
        activity_type_id: webix.rules.isNotEmpty,
        status_id: webix.rules.isNotEmpty,
        user_id: webix.rules.isNotEmpty
      }
    };
  }

  getTemplateFooter(obj: any, common: any, kanban: any) {
    const defaultTags = common.templateTags(obj, common, kanban);
    const defaultIconsString = common.templateIcons(obj, common, kanban);
    // TODO: find a better way to do below replacing of icon
    const updateIcons = defaultIconsString.replace('webix_kanban_icon kbi-cogs', 'wxi-dots');
    const imageIcon = obj.activity_type_icon ? `<img height="20px" style="margin-right: 5px; height: 20px;" src=${obj.activity_type_icon}  alt="icon"/>` : '';
    const parentImageIcon = obj.parent_type_icon ? `<img height="20px" style="margin-right: 5px; height: 20px;" src=${obj.parent_type_icon}  alt="icon"/>` : '';
    const defaultHtml =
      `

       <span style="background-color: ${obj.rgb_project_color}" class="custom-tag" title="${obj.project_name}">
            ${obj.project_name?.substring(0, 20)}...
       </span>

       <span style="background-color: ${obj.rgb_project_color}; display: ${obj.parent_name ? 'block' : 'none'}"
           class="custom-tag" title="${obj.parent_name}">
               <div class="flex flex-nowrap">
                    <span>${parentImageIcon}</span> <span>${obj.parent_name?.substring(0, 10)}...</span>
               </div>
       </span>

`;
    return `<div class="flex flex-nowrap" title="${obj.activity_type}">
                    ${imageIcon}
                    ${defaultHtml}
             </div> ${updateIcons}`;
  }
}
