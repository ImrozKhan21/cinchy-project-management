import {projectDetails, utilServiceInstance} from "../data";

declare let webix: any;
declare let gantt: any;
declare let categories: any;

export class GanttBackendService extends gantt.services.Backend {
  tasks() {
    return webix.promise.resolve(projectDetails.mappedTasks);
  }

  categories() {
    return Promise.resolve(categories);
  }

  // custom resources structure: "customMaxTime" included
  resources() {
    return Promise.resolve(projectDetails.mappedResources);
  }

  assignments() {
    return webix.promise.resolve(projectDetails.mappedAssigned);
  }

  links() {
    return webix.promise.resolve([]);
  }

  addTask(taskDetails: any) {
    return webix.promise.resolve({id: webix.uid()});
  }

  updateTask(taskId: any, taskDetails: any, e:any) {
    utilServiceInstance.updateActivityWithNewValues(taskDetails);
    return webix.promise.resolve();
  }

  removeTask() {
    return webix.promise.resolve();
  }

  addLink() {
    return webix.promise.resolve({id: webix.uid()});
  }

  updateLink() {
    return webix.promise.resolve();
  }

  removeLink() {
    return webix.promise.resolve();
  }

  addAssignment(obj: any) {
    return Promise.resolve({ id: obj.id });
  }
  updateAssignment(id: any, resources: any) {
    utilServiceInstance.updateAssignmentInGantt(resources, id);
    return Promise.resolve({});
  }
  removeAssignment(id: any) {
    return Promise.resolve({});
  }

}
