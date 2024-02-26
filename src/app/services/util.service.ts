import {Injectable} from '@angular/core';
import {IActivityType, IComboType, IProjectDetails, IStatus} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {ApiCallsService} from "./api-calls.service";
import {take} from "rxjs";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private appStateService: AppStateService, private apiCallsService: ApiCallsService, private messageService: MessageService) {
  }

  // UPDATE ACTIVITIES

  updateActivityWithNewValues(itemData: any, queryType?: string, viewType?: string, isFromDrag?: boolean) {
    const model: string = sessionStorage.getItem('modelId') as string;
    if (queryType === 'UPDATE' && itemData.isExisting) {
      this.updateProjectOrActivity(itemData, model, viewType, isFromDrag);
    } else if (itemData.text && itemData.type === 'project') {
      this.insertNewProject(itemData, model, viewType);
    } else if (itemData.text && (itemData.type === 'task' || viewType === "kanban") && (itemData.parent || itemData.parent_id)) {
      // as from kanban we can only add activities
      this.insertNewActivity(itemData, model, viewType);
    }
  }

  updateProjectOrActivity(itemData: any, model: string, viewType?: string, isFromDrag?: boolean) {
    const {status, status_id, project_id, user_id, owner_id, type, activity_id, effort_id, description} = itemData;
    let newStatus = this.appStateService.allStatuses
      .find((statusItem: IStatus) => statusItem.id == status_id) as IStatus;

    let newEffortSelected = this.appStateService.estimates
      .find((effortItem: IComboType) => effortItem.id == effort_id) as IComboType;

    // as from drag, only status is updated
    if (isFromDrag) {
      newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => statusItem.name == status) as IStatus;
    }
    const peopleIdToUse = user_id ? user_id : owner_id;
    const updatedValues = {
      activityId: type === "task" || type === "milestone" ? activity_id : project_id,
      statusId: newStatus.id,
      userId: parseInt(peopleIdToUse),
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text,
      progress: itemData.percent_done ? itemData.percent_done / 100 : 0,
      statusCommentary: itemData.status_commentary,
      priority: itemData.priority,
      effortId: newEffortSelected?.id,
      description
    }
//    console.log('111', itemData, updatedValues)
    if (type === "task" || type === "milestone") {
      this.appStateService.setSpinnerState(true);
      this.apiCallsService.updateActivity(model, updatedValues).pipe(take(1)).subscribe(() => {
        this.appStateService.setSpinnerState(false);
        if (viewType !== 'gantt') {
          this.appStateService.updateActivitiesStateOnUpdateForKanban(itemData, newStatus);
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
        }
      }, error => {
        this.messageService.add({severity: 'error', summary: 'Error', detail: JSON.stringify(error)});
        this.appStateService.setSpinnerState(false);
      });
    } else if (type === "project") {
      this.apiCallsService.updateProject(model, updatedValues).pipe(take(1)).subscribe(() => {
        this.appStateService.setSpinnerState(false);
        if (viewType !== 'gantt') {
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
        }
      });
    }

  }

  insertNewProject(itemData: any, model: string, viewType?: string) {
    const newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => statusItem.sort_order === 1) as IStatus;
    this.appStateService.setSpinnerState(true);
    const insertValues = {
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text,
      statusId: newStatus.id,
    }
    this.apiCallsService.insertProject(model, insertValues).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      if (viewType !== 'gantt') {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
      }
    });
  }

  insertNewActivity(itemData: any, model: string, viewType?: string) {
 /*   const newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => itemData.status ?
      itemData.status === statusItem.name : statusItem.sort_order === 1) as IStatus;*/
    let newStatus = this.appStateService.allStatuses
      .find((statusItem: IStatus) => statusItem.id == itemData.status_id) as IStatus;
    const activityTypeSelected = this.appStateService.activityTypes
      .find((type: IActivityType) => type.value === itemData.activity_type || type.id === Number(itemData.activity_type_id));
    this.appStateService.setSpinnerState(true);
    const parentId = itemData.parent_id ? itemData.parent_id : Number(itemData.parent.split('-')[1]);
    const projectId = viewType === "kanban" ? parentId : this.getProjectId(itemData, parentId);
    const insertValues: any = {
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text,
      description: itemData.description,
      statusId: `${newStatus.id}`,
      parentId: `${parentId}`,
      activityTypeId: `${activityTypeSelected?.id}`,
      projectId: `${projectId}`
    }
    if (itemData.user_id) {
      insertValues.userId = itemData.user_id;
    }
    this.apiCallsService.insertActivity(model, insertValues).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      if (viewType !== 'gantt') {
        this.appStateService.updateActivitiesStateOnInsert(itemData, newStatus, activityTypeSelected);
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
      }
    }, error => {
      this.messageService.add({severity: 'error', summary: 'Error', detail: JSON.stringify(error)});
      this.appStateService.setSpinnerState(false);
    });
  }

  deleteActivity(activityId: any, viewType?: string) {
    const model: string = sessionStorage.getItem('modelId') as string;
    const activityIdToUse = activityId.split('-')[1];
    this.appStateService.setSpinnerState(true);
    this.apiCallsService.deleteActivity(model, activityIdToUse).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      if (viewType !== 'gantt') {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
      }
    });
  }

  getProjectId(itemData: any, parentId: number) {
    const parent = itemData.parent;
    if (parent.includes('activity')) {
      const activityId = parseInt(itemData.parent.split('-')[1]);
      const parentActivity = this.appStateService.activities.find((activity: IProjectDetails) => activity.activity_id === activityId);
      return parentActivity?.project_id;
    }
    return parentId;
  }

  updateProjectForActivity(itemData: any, queryType?: string, viewType?: string) {

    const activityId = parseInt(itemData.id.split('-')[1]);
    const parentId = itemData.parent_id;
    const model: string = sessionStorage.getItem('modelId') as string;
    this.apiCallsService.updateProjectForActivity(model, {parentId, activityId}).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
    });
  }

  updateAssignmentInGantt(resources: any, id: any) {
    const userId = resources.resource;
    const activityId = parseInt(id.split('-')[1]);
    const model: string = sessionStorage.getItem('modelId') as string;
    this.apiCallsService.updateAssignment(model, {userId, activityId}).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
    });
  }

  showAssignmentAlreadyPresentError() {
    this.messageService.add({severity: 'error', summary: 'Error', detail: 'Only 1 assignment per task is allowed'});

  }

  beforeDrag(item: any, context: any) {
    console.log('111 drag gantt');
  }

  afterDrag(item: any, context: any) {
  }

  onKanbanBeforeDrag(dragContext: any) {
    //  webix.message("Drag has been started");
    return true
  }

  onKanbanBeforeDragIn(dragContext: any, e: any, list: any) {
    return true;
  }

  onKanbanAfterDrop(kanbanView: any, dragContext: any, e: any, list: any) {
    // Get the ID of the dropped item
    const itemId = dragContext.source;
    // Get the actual data of the dropped item
    const itemData = kanbanView.getItem(itemId);
    this.updateActivityWithNewValues(itemData);

  }

  convertFromHexToRGB(hex: any, alpha: number) {
    // Remove the hash at the start if it's there
    if (!hex) { return 'white'}
    hex = hex.replace(/^#/, '');
    // Parse the hex string
    let r, g, b;
    if (hex.length === 3) {
      // In case of shorthand hex color
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
      // In case of full hex color
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      throw new Error('Invalid hex color: ' + hex);
    }

    // Return the RGBA color
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getAbbreviation(name: string) {
    return `${name?.substring(0, 10)}...`;
    /* return name.split(" ") // Split the string into an array of words
       .map(word => word.charAt(0).toUpperCase()) // Map over the array and take the first character of each word in uppercase
       .join(""); // Join the first letters back into a string*/
  }

}
