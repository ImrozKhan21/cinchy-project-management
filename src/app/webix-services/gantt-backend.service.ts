import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

declare let webix: any;
declare let gantt: any;
declare let categories: any;

export class GanttBackendService extends gantt.services.Backend {
  tasks() {
    ganttGlobalDataSingleton.projectDetails.mappedTasks.forEach((item: any) => {
      item.css = "task-light-indigo";
    })
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
    ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'INSERT', 'gantt');
    return webix.promise.resolve({id: webix.uid()});
  }

  updateTask(taskId: any, taskDetails: any, e: any, i: any) {
     console.log('111 taskId', taskId, taskDetails, e, i)
    ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'UPDATE','gantt');
  //  return new Promise(resolve => resolve);
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

  addAssignment(obj: any, e: any) {
    const currentItem = ganttGlobalDataSingleton.projectDetails.mappedTasks.find((item: any) => item.id === obj.task);
    if (!currentItem.owner) {
      return Promise.resolve({id: obj.id});
    } else {
      ganttGlobalDataSingleton.utilServiceInstance.showAssignmentAlreadyPresentError();
      return new Promise(resolve => resolve);
    }
  }

  updateAssignment(id: any, resources: any) {
    ganttGlobalDataSingleton.utilServiceInstance.updateAssignmentInGantt(resources, id);
    return Promise.resolve({});
  }

  removeAssignment(id: any) {
    return Promise.resolve({});
  }

}
