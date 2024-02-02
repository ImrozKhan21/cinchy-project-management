import {Injectable} from '@angular/core';
import {IProjectDetails, IStatus, IUser} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {ApiCallsService} from "./api-calls.service";
import {take} from "rxjs";
import {MessageService} from "primeng/api";
import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

@Injectable({
  providedIn: 'root'
})
export class DataTransformerService {

  constructor(private appStateService: AppStateService, private messageService: MessageService) {
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
    const projects = this.appStateService.projects.map((taskItem: any, i: number) => {
      return {...taskItem, id: `project-${taskItem.project_id}`, user_id: taskItem.owner_id}
    });
    const childMappedTasks = projectDetails.map((taskItem, i: number) => {
      return {
        ...taskItem, id: `activity-${taskItem.activity_id}`,
        color: taskItem.status_color_hex,
        type: 'task',
        parent: taskItem.parent_id ? `activity-${taskItem.parent_id}` : `project-${taskItem.project_id}`,
        user_id: taskItem.owner_id,
        isExisting: true,
        start_date: taskItem.start_date ? new Date(taskItem.start_date) : taskItem.end_date ? new Date(taskItem.end_date) : new Date(),
        end_date: taskItem.end_date ? new Date(taskItem.end_date) : taskItem.start_date ? new Date(taskItem.start_date) : new Date(),
      }
    });
    const allMappedTasks = [...childMappedTasks];
    return {mappedTasks: allMappedTasks, mappedStatuses, userSet, allTasks: allMappedTasks, projects};
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
        start_date: taskItem.start_date ? new Date(taskItem.start_date) : taskItem.end_date ? new Date(taskItem.end_date) : new Date(),
        end_date: taskItem.end_date ? new Date(taskItem.end_date) : taskItem.start_date ? new Date(taskItem.start_date) : new Date(),
        id: `project-${taskItem.project_id}`,
        type: 'project',
        parent: taskItem.parent_id ? `project-${taskItem.parent_id}` : 0,
        progress: taskItem.progress ? taskItem.progress*100 : 0,
        isExisting: true,
        open: true
      };
    });

    const childMappedTasks = projectDetails.map((taskItem, i: number) => {
      return {
        ...taskItem,
        start_date: taskItem.start_date ? new Date(taskItem.start_date) : taskItem.end_date ? new Date(taskItem.end_date) : new Date(),
        end_date: taskItem.end_date ? new Date(taskItem.end_date) : taskItem.start_date ? new Date(taskItem.start_date) : new Date(),
        id: `activity-${taskItem.activity_id}`,
        dependencies: taskItem.dependency_ids ? `activity-${taskItem.dependency_ids}` : null,
        type: taskItem.milestone ? 'milestone' : 'task',
        progress: taskItem.progress ? taskItem.progress*100 : 0,
        parent: taskItem.parent_id ? `activity-${taskItem.parent_id}` : `project-${taskItem.project_id}`,
        isExisting: true
      };
    });
    const allMappedTasks = [...mappedTasks, ...childMappedTasks];
    console.log('1111 PROJECT',childMappedTasks, mappedTasks);

    const mappedAssigned = this.transformToAssigned(mappedResources, allMappedTasks);
    const links = this.transformToLinks(allMappedTasks);
    return {mappedResources, allMappedTasks, mappedAssigned, allTasks: allMappedTasks, links}
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

  transformToLinks(projectDetails: IProjectDetails[]) {
    const sample = [
      { id: 1, source: 3, target: 4, type: 0 },
      { id: 2, source: 1, target: 2, type: 2 },
      { id: 3, source: 5, target: 6, type: 3 },
      { id: 4, source: 8, target: 6, type: 1 },
    ];

    const allProjectWithLinks = projectDetails.filter(task => task.dependencies);

    return allProjectWithLinks.map((task, index) => {
      return {
        id: index,
        source: task.id,
        target: task.dependencies,
        type: 0 }
    });
  }
}
