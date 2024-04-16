import {Injectable} from '@angular/core';
import {IActivityType, IComboType, IProjectDetails, IStatus} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {ApiCallsService} from "./api-calls.service";
import {lastValueFrom, take} from "rxjs";

import {MessageService} from "primeng/api";
@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(private appStateService: AppStateService, private apiCallsService: ApiCallsService, private messageService: MessageService) {
  }

  // UPDATE ACTIVITIES

  async updateActivityWithNewValues(itemData: any, queryType?: string, viewType?: string, isFromDrag?: boolean) {
    const model: string = sessionStorage.getItem('modelId') as string;
    try {
      if (queryType === 'UPDATE' && itemData.isExisting) {
        await this.updateProjectOrActivity(itemData, model, viewType, isFromDrag);
      } else if (itemData.text && itemData.type === 'project') {
        return this.insertNewProject(itemData, model, viewType);
      } else if (itemData.text && (itemData.type === 'task' || viewType === "kanban") && (itemData.parent || itemData.parent_id)) {
        // as from kanban we can only add activities
        return await this.insertNewActivity(itemData, model, viewType);
      }
    } catch (e) {
      throw new Error('Error in updating activity');
    }
  }

  updateProjectOrActivity(itemData: any, model: string, viewType?: string, isFromDrag?: boolean): Promise<any> {
    const {
      status,
      status_id,
      project_id,
      user_id,
      owner_id,
      type,
      activity_id,
      effort_id,
      description,
      activity_type_id,
      activity_type,
      parent_activity
    } = itemData;
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
      activityTypeId: activity_type_id ? parseInt(activity_type_id) : null,
      description,
      parentActivityId: parent_activity ? parseInt(parent_activity) : null
    }
//    console.log('111', itemData, updatedValues)
    return new Promise((resolve, reject) => {
      if (type === "task" || type === "milestone") {
        this.appStateService.setSpinnerState(true);
        this.apiCallsService.updateActivity(model, updatedValues).pipe(take(1)).subscribe(() => {
          this.appStateService.setSpinnerState(false);
          if (viewType !== 'gantt') {
            this.appStateService.updateActivitiesStateOnUpdateForKanban(itemData, newStatus);
            this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
          }
          resolve('success');
        }, error => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error in updating work item'});
          this.appStateService.setSpinnerState(false);
          reject('Error in updating activity');
        });
      } else if (type === "project") {
        this.apiCallsService.updateProject(model, updatedValues).pipe(take(1)).subscribe(() => {
          this.appStateService.setSpinnerState(false);
          if (viewType !== 'gantt') {
            this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
          }
          resolve('success');
        }, error => {
          this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error in updating project'});
          this.appStateService.setSpinnerState(false);
          reject('Error in updating project');
        });
      }
    });

  }

  insertNewActivity(itemData: any, model: string, viewType?: string) {
    /*   const newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => itemData.status ?
         itemData.status === statusItem.name : statusItem.sort_order === 1) as IStatus;*/
    let newStatus = this.appStateService.allStatuses
      .find((statusItem: IStatus) => statusItem.id == itemData.status_id) as IStatus;
    // as from gantt, only status is updated
    let parentId = itemData.parent_id ? itemData.parent_id : Number(itemData.parent.split('-')[1]);
    if (viewType === "gantt") {
      newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => statusItem.name == itemData.status) as IStatus;
    } else {
      parentId = itemData.parent_activity ? parseInt(itemData.parent_activity) : null;
    }
    const activityTypeSelected = this.appStateService.activityTypes
      .find((type: IActivityType) => type.value === itemData.activity_type || type.id === Number(itemData.activity_type_id));
    let newEffortSelected = this.appStateService.estimates
      .find((effortItem: IComboType) => effortItem.id == itemData.effort_id) as IComboType;
    this.appStateService.setSpinnerState(true);

    const projectId = viewType === "kanban" ? itemData.parent_id : this.getProjectId(itemData, parentId);
    const insertValues: any = {
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text,
      description: itemData.description,
      statusId: `${newStatus?.id}`,
      parentId: `${parentId}`,
      activityTypeId: `${activityTypeSelected?.id}`,
      projectId: `${projectId}`,
      progress: itemData.percent_done ? itemData.percent_done / 100 : 0,
      statusCommentary: itemData.status_commentary,
      priority: itemData.priority,
      effortId: newEffortSelected?.id,
    }
    if (itemData.user_id || itemData.owner_id) {
      insertValues.userId = itemData.user_id || `${itemData.owner_id}`;
    }
    return new Promise((resolve, reject) => {
      this.apiCallsService.insertActivity(model, insertValues).pipe(take(1)).subscribe((response) => {
        this.appStateService.setSpinnerState(false);
        if (viewType !== 'gantt') {
          const {id} = response[0];
          this.appStateService.updateActivitiesStateOnInsert(id, itemData, newStatus, activityTypeSelected);
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
          resolve('success');
        }
      }, error => {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error in adding work item'});
        this.appStateService.setSpinnerState(false);
        reject('Error in inserting activity');
      });
    });

  }

  deleteActivity(activityId: any, viewType?: string) {
    const model: string = sessionStorage.getItem('modelId') as string;
    const activityIdToUse = isNaN(activityId) ? activityId.split('-')[1] : activityId;
    this.appStateService.setSpinnerState(true);
    this.apiCallsService.deleteActivity(model, activityIdToUse).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      if (viewType !== 'gantt') {
        this.messageService.add({severity: 'success', summary: 'Deleted', detail: 'Task deleted successfully'});
      }
    });
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

  pingCallToCheckSession() {
    const model: string = sessionStorage.getItem('modelId') as string;
    return new Promise((resolve, reject) => {
      this.apiCallsService.getAllStatuses(model).pipe(take(1)).subscribe((response) => {
        this.appStateService.setSpinnerState(false);
        resolve('success');
      }, error => {
        console.log('Error in pingCallToCheckSession', error);
        reject('Error in inserting activity');
        throw new Error('Error in pingCallToCheckSession');
      });
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

  // below care called from gantt singleton instance of service
  updateProjectForActivity(itemData: any, queryType?: string, viewType?: string) {
    const activityId = parseInt(itemData.id.split('-')[1]);
    const parentId = itemData.parent_id;
    const model: string = sessionStorage.getItem('modelId') as string;
    this.apiCallsService.updateProjectForActivity(model, {parentId, activityId}).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
    });
  }

  updateParentForActivity(itemData: any, queryType?: string, viewType?: string) {
    const activityId = parseInt(itemData.id.split('-')[1]);
    const parentId = itemData.parent_id;
    const model: string = sessionStorage.getItem('modelId') as string;
    this.apiCallsService.updateParentForActivity(model, {parentId, activityId}).pipe(take(1)).subscribe(() => {
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

  beforeGanttTimelineDrag(...args: any[]) {
  }

  afterGanttTimelineDrag(...args: any[]) {
    const [item, context] = args;
    const mode = context.mode;
    // task is moved
    console.log("MOde", mode, context);
    if (mode === "move" || mode === "end" || mode === "start") {
      // display dialog and observe the result
      const confirmDialog = webix.confirm(`Are you sure, you want to change dates for "${item.text}"?`) as any;
      context.$waitUpdate = confirmDialog.then((result: any) => {
        // success - update the data
        context.from.master.Action({
          action: "update-task-time",
          mode: context.mode,
          time: context.timeShift,
          id: context.id,
        })
        this.doUpdateAfterConfirm(item);
      }).fail(() => {
        // fail - do nothing
        webix.message("Drag discarded");
      });

      // disable "move" by default
      return false;
    }
    if (mode === "progress") {
      this.doUpdateAfterConfirm(item);
    }
    return true;
  }

  doUpdateAfterConfirm(item: any) {
    // below are old as new values are updated after this event has been called that's why setTimeout is used for actual new values
    const old_start_date = item.start_date;
    const old_end_date = item.end_date;

    setTimeout(() => { // using setTimeout as start_date update value is coming a little late
      const {project_id, type, activity_id, start_date, end_date, priority, text, progress} = item;
      console.log('111 PROGRESS', progress);
      const model: string = sessionStorage.getItem('modelId') as string;
      const updatedValues = {
        activityId: type === "task" || type === "milestone" ? activity_id : project_id,
        startDate: start_date,
        endDate: end_date,
        priority: priority,
        progress: progress ? progress / 100 : 0
      }
      if (type === "task" || type === "milestone") {
        this.apiCallsService.updateDatesForActivity(model, updatedValues).pipe(take(1)).subscribe(() => {
          const sd = start_date ? start_date.toLocaleString() : start_date;
          const ed = end_date ? end_date.toLocaleString() : end_date;
          this.appStateService.setSpinnerState(false);
          this.messageService.add({
            severity: 'success', summary: 'Success', life: 8000,
            detail: `${text} has been updated.  Start Date: ${sd}, End Date: ${ed}`
          });
        }, error => {

        });
      }
    }, 300);
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
    if (!hex) {
      return 'white'
    }
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

  getDateRange(daysToSubtract: number, type?: string) {
    const endDate = new Date(); // Today's date
    const startDate = new Date();

    if (daysToSubtract) {
      startDate.setDate(endDate.getDate() - (daysToSubtract - 1));
    } else if (type) {
      switch (type) {
        case 'MTD':
          startDate.setDate(1);
          break;
        case 'YTD':
          startDate.setMonth(0, 1);
          break;
        case 'QTD':
          const startMonthOfQuarter = Math.floor(endDate.getMonth() / 3) * 3;
          startDate.setMonth(startMonthOfQuarter, 1);
          break;
      }
    }
    return {
      start: startDate,
      end: endDate
    };
  }

}

