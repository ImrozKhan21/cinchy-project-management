/*
import {projectDetails} from "../data";

declare let webix: any;
declare let tasks: any;
declare let resources: any;
declare let categories: any;
declare let assignments: any;
declare let links: any;
declare let kanban: any;

export class KanbanBackendService extends kanban.services.Backend {

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
    console.log('111 task added', taskDetails)
    return webix.promise.resolve({id: webix.uid()});
  }

  updateTask(taskId: any, taskDetails: any) {
    console.log('111 update', taskId, taskDetails);
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
  updateAssignment(id: any, obj: any) {
    return Promise.resolve({});
  }
  removeAssignment(id: any) {
    return Promise.resolve({});
  }

}
*/
