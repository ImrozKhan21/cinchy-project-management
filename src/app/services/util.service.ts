import {Injectable} from '@angular/core';
import {IProjectDetails} from "../models/common.model";
import {projectDetails} from "../data";

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() {
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
    const uniqueStatus = [...new Set(projectDetails.map(item => item.status))];
    const mappedStatuses = uniqueStatus.map((status: string) => {
      return {
        header: status,
        body: {view: "kanbanlist", status}
      }
    });
    const mappedTasks = projectDetails.map((taskItem: IProjectDetails, index) => {
      return {...taskItem, id: index}
    });
    return {mappedTasks, mappedStatuses};
  }

  transformToGanttData(projectDetails: IProjectDetails[]) {
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
    const mappedTasks = projectDetails.map((taskItem, i: number) => {
      return {
        ...taskItem,
        start_date: new Date(taskItem.start_date),
        end_date: new Date(taskItem.end_date),
        id: i + 1,
        type: 'task',
        progress: 10,
        parent: "0",
      };
    });
    const mappedAssigned = this.transformToAssigned(mappedResources, mappedTasks);
    return {mappedResources, mappedTasks, mappedAssigned}
  }

  transformToAssigned(mappedResources: any, mappedTasks: any) {
    const sample = {
      "task": "1.3",
      "resource": "3",
      "value": 4,
      "id": "1"
    }
    const allAssigned: any[] = []
    mappedResources.forEach((resource: any) => {
      const allTasksForResource = mappedTasks.filter((task: any) => task.owner === resource.name);
      const assigned = allTasksForResource.map((task: any) => {
        return {
          "task": task.id,
          "resource": resource.id,
          "value": 4,
          "id": `${task.id}-${resource.id}`
        }
      });
      allAssigned.push(assigned);
    });
    return allAssigned.flat();
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
console.log('111 uniqrRes', uniqueResource);
    return Object.keys(uniqueResource).map((name, index) => {
      return {
        "category_id": "1",
        "avatar": uniqueResource[name]['owner_photo'],
        "id": index + 1,
        name
      }
    })
  }


  beforeDrag(item: any, context: any) {
    const name = item.text || "(no title)";
    const mode = context.mode;
    if (mode == "move")
      webix.message("'" + name + "' is being moved");
    else if (mode == "start" || mode == "end")
      webix.message(
        mode + " date of '" + name + "' is being changed"
      );
    else if (mode == "progress")
      webix.message("'" + name + "' progress is being changed");
    else if (mode == "links") {
      const from = context.fromStart ? "start" : "end";
      webix.message(
        "The new link is being added from " +
        from +
        " of '" +
        name +
        "'"
      );
    }
    return true;
  }

  afterDrag(item: any, context: any) {
    const name = item.text || "(no title)";
    const mode = context.mode;
    if (context.mode == "move")
      webix.message("'" + name + "' has been moved");
    else if (mode == "start" || mode == "end")
      webix.message(
        mode + " date has been changed by " + context.timeShift
      );
    else if (mode == "progress")
      webix.message(
        "'" + name + "' progress is now " + context.progress + "%"
      );
    else if (mode == "links") {
      const targetName =
        projectDetails.mappedTasks.getItem(context.targetId).text || "(no title)";
      const t = context.linkType;
      let type = "";
      if (t == 0) type = "end-to-start";
      else if (t === 1) type = "start-to-start";
      else if (t == 2) type = "end-to-end";
      else if (t == 3) type = "start-to-end";
      webix.message(
        "The new '" +
        type +
        "' link has been added added for " +
        name +
        " and " +
        targetName
      );
    }
    return true;
  }

}
