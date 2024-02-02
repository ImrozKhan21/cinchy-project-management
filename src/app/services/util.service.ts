import {Injectable} from '@angular/core';
import {IActivityType, IProjectDetails, IStatus, IUser} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {ApiCallsService} from "./api-calls.service";
import {take} from "rxjs";
import {MessageService} from "primeng/api";
import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private appStateService: AppStateService, private apiCallsService: ApiCallsService, private messageService: MessageService) {
  }
  // UPDATE ACTIVITIES

  updateActivityWithNewValues(itemData: any, queryType?: string, viewType?: string) {
    const model: string = sessionStorage.getItem('modelId') as string;
    if (queryType === 'UPDATE' && itemData.isExisting) {
      this.updateProjectOrActivity(itemData, model, viewType);
    } else if (itemData.text && itemData.type === 'project') {
      this.insertNewProject(itemData, model, viewType);
    } else if (itemData.text && itemData.type === 'task' && itemData.parent) {
      this.insertNewActivity(itemData, model, viewType);
    }
  }

  updateProjectOrActivity(itemData: any, model: string, viewType?: string) {
    const {status, project_id, user_id, owner_id, type} = itemData;
    const newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => statusItem.name === status) as IStatus;
    const peopleIdToUse = user_id ? user_id : owner_id;
    const updatedValues = {
      activityId: project_id,
      statusId: newStatus.id,
      userId: parseInt(peopleIdToUse),
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text,
      progress: itemData.progress ? itemData.progress/100 : 0
    }
    if (type === "task") {
      this.appStateService.setSpinnerState(true);
      this.apiCallsService.updateActivity(model, updatedValues).pipe(take(1)).subscribe(() => {
        this.appStateService.setSpinnerState(false);
        if (viewType !== 'gantt') {
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
        }
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
    const newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => itemData.status ?
      itemData.status === statusItem.name : statusItem.sort_order === 1) as IStatus;
    const activityTypeSelected = this.appStateService.activityTypes.find((type: IActivityType) => type.value === itemData.activity_type);
    this.appStateService.setSpinnerState(true);
    const parentId = Number(itemData.parent.split('-')[1]);
    const projectId = this.getProjectId(itemData, parentId);
    const insertValues: any = {
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text,
      statusId: `${newStatus.id}`,
      parentId: `${parentId}`,
      activityTypeId: activityTypeSelected?.id,
      projectId: `${projectId}`
    }
    if (itemData.user_id) {
      insertValues.userId = itemData.user_id;
    }
    this.apiCallsService.insertActivity(model, insertValues).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      if (viewType !== 'gantt') {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
      }
    });
  }

  getProjectId(itemData: any, parentId: number) {
    const parent = itemData.parent;
    if(parent.includes('activity')) {
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

}
