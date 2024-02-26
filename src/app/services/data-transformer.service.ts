import {Injectable} from '@angular/core';
import {COLORS_MAP, IProjectDetails, IStatus, PRIORITY_OPTIONS} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {MessageService} from "primeng/api";
import {UtilService} from "./util.service";

@Injectable({
  providedIn: 'root'
})
export class DataTransformerService {

  constructor(private appStateService: AppStateService, private utilService: UtilService) {
  }

  transformToKanbanData(projectDetails: IProjectDetails[], selectedProjects?: IProjectDetails[]) {
    const sample = {
      id: 1,
      status: "new",
      text: "Task 1",
      tags: "webix,docs",
      comments: [{text: "Comment 1"},
        {text: "Comment 2"}]
    };
    //	{ id:2, status:"work", user_id: 5, text:"Performance tests", tags:[1] },
    const sampleStatus = {
      header: "Backlog",
      body: {view: "kanbanlist", status: "new"}
    };
    const projectsToUse = selectedProjects?.length ? selectedProjects : this.appStateService.projects;
    const projects = projectsToUse.map((taskItem: any, i: number) => {
      return {...taskItem, id: `project-${taskItem.project_id}`, user_id: taskItem.owner_id,  type: 'project'}
    });
// below is used to fill Project dropdown options
    const allProjects = this.appStateService.projects.map((taskItem: any, i: number) => {
      return {...taskItem, id: `project-${taskItem.project_id}`, user_id: taskItem.owner_id,  type: 'project'}
    });

    const rowsMapSorStatus: any = {};
    this.appStateService.allStatuses.forEach(statusItem => {
      const rows: any = projects.map((taskItem: any, i: number) => {
        return [{template: taskItem.text, height: 27},
          {
            id: `id-${statusItem.name}`,
            view: "kanbanlist",
            height: 200,
            status: {status: statusItem.name, parent_project: taskItem.id},
            name: taskItem.text
          }];
      });
      rowsMapSorStatus[statusItem.name] = rows;
    });

    const mappedStatuses = this.appStateService.allStatuses.map((status: IStatus) => {
      return {
        header: status.name,
        css: status.status_color_hex ? `task-${status.status_color_hex.replace(/#+/g, '')}` : '',
        body: { id: `id-${status.name}`, view: "kanbanlist", status: status.name, type:"cards" }
      }
      /* return {
         header: status.name,
         body: {margin:0, padding:8, rows: rowsMapSorStatus[status.name].flat()}
       }*/
    });

    /* sampleStatus with swimlanes
        cols:[

          { header:"In progress",
            body:{ margin:0, padding:8, rows:[
                { view:"kanbanheader", label:"Development", type:"sub", icon:"mdi mdi-code-tags"},
                { view:"kanbanlist", status:{ status: "work", team: 1 }, name:"Development"},
                { view:"kanbanheader", label:"Design", type:"sub", icon:"mdi mdi-pencil"},
                { view:"kanbanlist", status:{ status: "work", team: 2 }, name:"Design"}
              ]}
          },
        ],
    // For data { id:2, status:"work", team: 1, text:"Kanban tutorial", user_id: 2, tags:[2] }
    */

    const userSet = this.transformToKanbanUsers();

    const childMappedTasks = projectDetails.map((taskItem, i: number) => {
      return {
        ...taskItem, id: `activity-${taskItem.activity_id}`,
        color: PRIORITY_OPTIONS[taskItem.priority]?.color || 'white',
        rgb_project_color: this.utilService.convertFromHexToRGB(taskItem.project_color, 1),
        $css: taskItem.status_color ? `kanban-task-${taskItem.status_color.replace(/\s+/g, '-').toLowerCase()}` : '',
        type: 'task',
        parent: taskItem.parent_id ? `activity-${taskItem.parent_id}` : `project-${taskItem.project_id}`,
        parent_project: `project-${taskItem.project_id}`,
        user_id: taskItem.owner_id,
        isExisting: true,
        start_date: taskItem.start_date ? new Date(taskItem.start_date) : taskItem.end_date ? new Date(taskItem.end_date) : new Date(),
        end_date: taskItem.end_date ? new Date(taskItem.end_date) : taskItem.start_date ? new Date(taskItem.start_date) : new Date(),
        tags: [taskItem.project_id],
        progress: taskItem.percent_done
      }
    });
    const allMappedTasks = [...childMappedTasks];
    const tagsList = this.transformToTags(allMappedTasks);
    return {mappedTasks: allMappedTasks, mappedStatuses, userSet, allTasks: allMappedTasks, projects, allProjects, tagsList};
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

  transformToTags(workItems: any) {
    return workItems.flatMap((taskItem: any) => [
      {
        id: taskItem.activity_type_id,
        value: taskItem.activity_type
      },
      {
        id: taskItem.project_id,
        value: this.utilService.getAbbreviation(taskItem.project_name)
      },
    ]);
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
        progress: taskItem.progress ? taskItem.progress * 100 : 0,
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
        progress: taskItem.progress ? taskItem.progress * 100 : 0,
        parent: taskItem.parent_id ? `activity-${taskItem.parent_id}` : `project-${taskItem.project_id}`,
        isExisting: true
      };
    });
    const allMappedTasks = [...mappedTasks, ...childMappedTasks];

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
      {id: 1, source: 3, target: 4, type: 0},
      {id: 2, source: 1, target: 2, type: 2},
      {id: 3, source: 5, target: 6, type: 3},
      {id: 4, source: 8, target: 6, type: 1},
    ];

    const allProjectWithLinks = projectDetails.filter(task => task.dependencies);

    return allProjectWithLinks.map((task, index) => {
      return {
        id: index,
        source: task.id,
        target: task.dependencies,
        type: 0
      }
    });
  }
}
