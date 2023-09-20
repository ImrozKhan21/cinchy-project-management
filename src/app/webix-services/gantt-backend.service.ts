import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

declare let webix: any;
declare let gantt: any;
declare let categories: any;

export class GanttBackendService extends gantt.services.Backend {
  tasks() {
    return webix.promise.resolve(ganttGlobalDataSingleton.projectDetails.mappedTasks);
  }

  categories() {
    return Promise.resolve(categories);
  }

  // custom resources structure: "customMaxTime" included
  resources() {
    return Promise.resolve(ganttGlobalDataSingleton.projectDetails.mappedResources);
  }

  assignments() {
    return webix.promise.resolve(ganttGlobalDataSingleton.projectDetails.mappedAssigned);
  }

  links() {
    return webix.promise.resolve([]);
  }

  addTask(taskDetails: any) {
   // ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'gantt');

    return webix.promise.resolve({id: webix.uid()});
  }

  updateTask(taskId: any, taskDetails: any, e:any) {
    ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'gantt');
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
    ganttGlobalDataSingleton.utilServiceInstance.updateAssignmentInGantt(resources, id);
    return Promise.resolve({});
  }
  removeAssignment(id: any) {
    return Promise.resolve({});
  }

}
