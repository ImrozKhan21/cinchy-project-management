import {Injectable} from '@angular/core';
import {IProjectDetails, IStatus, IUser} from "../models/common.model";
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

  transformToKanbanData(projectDetails: IProjectDetails[]) {
    const sample = {
      id: 1,
      status: "new",
      text: "Task 1",
      tags: "webix,docs",
      comments: [{text: "Comment 1"},
        {text: "Comment 2"}]
    };
    //	{ id:2, status:"work", user_id: 5, text:"Performance tests", tags:[1] },
    const cinchyData = {
      "project_name": "Project A",
      "status": "Not Started",
      "owner": "Dan DeMers (Cinchy)",
      "start_date": null,
      "end_date": "Sep 6, 2023 12:00:00 AM",
      "text": "Activity 1"
    }
    const sampleStatus = {
      header: "Backlog",
      body: {view: "kanbanlist", status: "new"}
    };
//    const uniqueStatus = [...new Set(projectDetails.map(item => item.status))];
    const mappedStatuses = this.appStateService.allStatuses.map((status: IStatus) => {
      return {
        header: status.name,
        body: {view: "kanbanlist", status: status.name}
      }
    });
    const userSet = this.transformToKanbanUsers();
    /*   const  mappedTasks = this.appStateService.projects.map((taskItem: any, i: number) => {
         return {...taskItem, id: taskItem.project_id, user_id: taskItem.owner_id}
       });*/
    const childMappedTasks = projectDetails.map((taskItem, i: number) => {
      return {...taskItem, id: taskItem.project_id, user_id: taskItem.owner_id}
    });
    const allMappedTasks = [...childMappedTasks];
    return {mappedTasks: allMappedTasks, mappedStatuses, userSet, allTasks: allMappedTasks};
  }

  transformToKanbanUsers() {
    const users_set = [
      {id: 1, value: "Rick Lopes", image: "../common/imgs/1.jpg"},
      {id: 2, value: "Martin Farrell", image: "../common/imgs/2.jpg"},
      {id: 3, value: "Douglass Moore", image: "../common/imgs/3.jpg"},
      {id: 4, value: "Eric Doe", image: "../common/imgs/4.jpg"},
      {id: 5, value: "Sophi Elliman", image: "../common/imgs/5.jpg"},
      {id: 6, value: "Anna O'Neal"},
      {id: 7, value: "Marcus Storm", image: "../common/imgs/7.jpg"},
      {id: 8, value: "Nick Branson", image: "../common/imgs/8.jpg"},
      {id: 9, value: "CC", image: "../common/imgs/9.jpg"}
    ];

    return this.appStateService.users.map((user, index) => {
      return {
        image: user.owner_photo,
        id: user.owner_id,
        value: user.owner
      }
    });
  }

  transformToGanttData(projectDetails: IProjectDetails[], projects: any) {
    const sample = {
      "progress": 0,
      "parent": "0",
      "text": "New one added",
      "start_date": "2018-06-10 00:00:00",
      "end_date": "2018-06-11 00:00:00",
      "duration": "1", // NEED TO CHECK ITS EFFECT
      "type": "task",
      "opened": 1, // NEED TO CHECK ITS EFFECT
      "id": "BjDgWWHBYgQZ80eV" // WE NEED
    };
    const mappedResources = this.transformToResources(projectDetails);
    const mappedTasks = projects.map((taskItem: any, i: number) => {
      return {
        ...taskItem,
        start_date: new Date(taskItem.start_date),
        end_date: new Date(taskItem.end_date),
        id: taskItem.project_id,
        type: 'project',
        parent: 0,
        progress: 0,
      };
    });
    const childMappedTasks = projectDetails.map((taskItem, i: number) => {
      return {
        ...taskItem,
        start_date: new Date(taskItem.start_date),
        end_date: new Date(taskItem.end_date),
        id: taskItem.project_id,
        type: 'task',
        progress: 10,
        parent: taskItem.parent_id,
      };
    });
    const allMappedTasks = [...mappedTasks, ...childMappedTasks];
    console.log('111 allMapped', allMappedTasks);
    const mappedAssigned = this.transformToAssigned(mappedResources, allMappedTasks);
    return {mappedResources, allMappedTasks, mappedAssigned, allTasks: allMappedTasks}
  }

  transformToAssigned(mappedResources: any, mappedTasks: any) {
    const sample = {
      "task": "1.3",
      "resource": "3",
      "value": 4,
      "id": "1"
    }
    return mappedTasks.flatMap((task: any) => {
      const resource = mappedResources.find((res: any) => res.name === task.owner);
      if (resource) {
        return {
          task: task.id,
          resource: resource.id,
          value: '1',
          id: `${task.id}-${resource.id}`
        };
      }
      return [];  // No assignments for this task if no matching resource is found
    });
  }

  transformToResources(projectDetails: IProjectDetails[]) {
    const sample = {
      "name": "John",
      "category_id": "1",
      "avatar": "https://docs.webix.com/usermanager-backend/users/101/avatar/092352563.jpg",
      "id": "1"
    }

    const uniqueResource = projectDetails.reduce((acc: any, curr: any) => {
      if (!acc[curr.owner]) {
        acc[curr.owner] = curr;
      }
      return acc;
    }, {});
    return this.appStateService.users.map((user, index) => {
      return {
        category_id: "1",
        avatar: user.owner_photo,
        id: user.owner_id,
        name: user.owner
      }
    });
  }


  // UPDATE ACTIVITIES

  updateActivityWithNewValues(itemData: any, viewType?: string) {
    this.appStateService.setSpinnerState(true);
    const {status, id, user_id, owner_id} = itemData;
    const newStatus = this.appStateService.allStatuses.find((statusItem: IStatus) => statusItem.name === status) as IStatus;
    const model: string = sessionStorage.getItem('modelId') as string;
    const peopleIdToUse = user_id ? user_id : owner_id;
    const updatedValues = {
      activityId: id,
      statusId: newStatus.id,
      userId: parseInt(peopleIdToUse),
      startDate: itemData.start_date,
      endDate: itemData.end_date,
      activityText: itemData.text
    }
    this.apiCallsService.updateActivity(model, updatedValues).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      if (viewType !== 'gantt') {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
      }

    });
  }

  updateAssignmentInGantt(resources: any, id: any) {
    const userId = resources.resource;
    const activityId = parseInt(id.split('-'));
    const model: string = sessionStorage.getItem('modelId') as string;
    this.apiCallsService.updateAssignment(model, {userId, activityId}).pipe(take(1)).subscribe(() => {
      this.appStateService.setSpinnerState(false);
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Task updated'});
    });
  }

  beforeDrag(item: any, context: any) {
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

  getUpdatedTasks(allTasks: any, filterValues: any) {
    const {selectedUsers, selectedStatuses, selectedProjects, searchValue, showOnlyProjects} = filterValues;
    let updatedTasks = allTasks.slice();
    if (selectedUsers?.length) {
      updatedTasks = allTasks?.filter((task: any) => {
        return (selectedUsers.find((ownerFilter: IUser) => ownerFilter.owner_id === task.owner_id || ownerFilter.owner === task.owner));
      });
    }


    if (selectedStatuses?.length) {
      updatedTasks = updatedTasks?.filter((task: any) => {
        return selectedStatuses.find((status: IStatus) => status.name === task.status);
      });
    }

    if (selectedProjects?.length) {
      updatedTasks = updatedTasks?.filter((task: any) => {
        return selectedProjects.find((project: IProjectDetails) => project.project_name === task.project_name);
      });
    }

    //task.owner.includes(searchValue)
    if (searchValue) {
      updatedTasks = updatedTasks?.filter((task: any) => {
        return task.owner?.toLowerCase().includes(searchValue.toLowerCase())
          || task.project_name?.toLowerCase().includes(searchValue.toLowerCase())
          || task.status?.toLowerCase().includes(searchValue.toLowerCase())
          || task.text?.toLowerCase().includes(searchValue.toLowerCase());
      });
    }
    let actualList;
    if (showOnlyProjects) {
      actualList = updatedTasks.filter((task: IProjectDetails) => task.type === 'project');
    } else {
      actualList = this.augmentFilteredList(updatedTasks, allTasks);
    }
    return actualList;
  }

  // To also add the parent project if it is not returned after search, is some task has parentId and that parentId task is not present
  augmentFilteredList(filteredList: IProjectDetails[], allTasks: IProjectDetails[]): IProjectDetails[] {
    const resultArray: IProjectDetails[] = [...filteredList];
    const filteredIds = new Set(filteredList.map(task => task.project_id));

    for (let task of filteredList) {
      if (task.parent_id && !filteredIds.has(Number(task.parent_id))) {
        // Find the parent task in allTasks
        const parentTask = allTasks.find(t => t.project_id === Number(task.parent_id));
        if (parentTask) {
          resultArray.push(parentTask);
          // Add the ID to the set so we don't add the same task twice
          filteredIds.add(parentTask.project_id);
        }
      }
    }

    return resultArray;
  }

}
