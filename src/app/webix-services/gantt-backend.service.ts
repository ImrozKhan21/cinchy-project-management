import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

declare let webix: any;
declare let gantt: any;
declare let categories: any;

export class GanttBackendService extends gantt.services.Backend {
  tasks() {
    ganttGlobalDataSingleton.projectDetails.mappedTasks.forEach((item: any) => {
      if (item.type === 'project') {
        item.css = item.project_color ? `task-${item.project_color.replace(/#+/g, '')}` : ''
      } else {
        item.css = item.status_color_hex ? `task-${item.status_color_hex.replace(/#+/g, '')}` : ''
      }
    });
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
    return webix.promise.resolve(ganttGlobalDataSingleton.projectDetails.links);
  }

  addTask(taskDetails: any) {
    ganttGlobalDataSingleton.setViewType('INSERT');
    const currentTaskDetails = {...ganttGlobalDataSingleton.currentTaskDetails, ...taskDetails};
    if (taskDetails.parent && (taskDetails.type ==='task' || taskDetails.type === 'milestone')) {
      ganttGlobalDataSingleton.setCurrentTaskDetails(currentTaskDetails);
    } else {
      ganttGlobalDataSingleton.setCurrentProjectDetails(taskDetails);
    }
    // ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'gantt');
  //  ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'INSERT', 'gantt');
    return webix.promise.resolve({id: webix.uid()});
  }

  updateTask(taskId: any, taskDetails: any, e: any, i: any) {
    ganttGlobalDataSingleton.setViewType('UPDATE');
    if (taskDetails.parent && (taskDetails.type ==='task' || taskDetails.type === 'milestone')) {
      ganttGlobalDataSingleton.setCurrentTaskDetails(taskDetails);
    } else {
      ganttGlobalDataSingleton.setCurrentProjectDetails(taskDetails);
    //  ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, ganttGlobalDataSingleton.viewType, 'gantt');
    }
    //console.log('111 update taskId', taskId, taskDetails, e, i, ganttGlobalDataSingleton.viewType)
   // ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, 'UPDATE','gantt');
  //  return new Promise(resolve => resolve);
    return webix.promise.resolve();
  }

  reorderTask(taskId: any, dragDetails: any, e: any, i: any) {
    const currentItem = ganttGlobalDataSingleton.projectDetails.mappedTasks.find((item: any) => item.id === taskId);
    ganttGlobalDataSingleton.setViewType('UPDATE');

    const parentInDrag = dragDetails.parent;
   // console.log('11 IN UPDATE', taskId, currentItem, parentInDrag, dragDetails)

    const updatedItem = parentInDrag ?
      {...currentItem, parent: parentInDrag, parent_id: parseInt(parentInDrag?.split('-')[1])} : currentItem;
    if (updatedItem.parent_id) {
      if (parentInDrag.includes('activity')) {
        ganttGlobalDataSingleton.utilServiceInstance.updateParentForActivity(updatedItem, ganttGlobalDataSingleton.viewType, 'gantt');
      } else {
        ganttGlobalDataSingleton.utilServiceInstance.updateProjectForActivity(updatedItem, ganttGlobalDataSingleton.viewType, 'gantt');
      }
    } else {
      //  ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(updatedItem, ganttGlobalDataSingleton.viewType, 'gantt');
    }
    return webix.promise.resolve();
  }

  removeTask(id: any, taskDetails: any, e: any, i: any) {
    ganttGlobalDataSingleton.utilServiceInstance.deleteActivity(id);
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
    if (!currentItem) { // INSERT
      if (ganttGlobalDataSingleton.currentTaskDetails?.parent) {
        ganttGlobalDataSingleton.setCurrentTaskDetails({
          ...ganttGlobalDataSingleton.currentTaskDetails,
          owner_id: obj.resource
        });
      }
    } else {
      if (currentItem?.parent) { // UPDATE
        ganttGlobalDataSingleton.setCurrentTaskDetails({...currentItem, owner_id: obj.resource});
      } else {
        ganttGlobalDataSingleton.setCurrentProjectDetails({...currentItem, owner_id: obj.resource});
      }
    }
    ganttGlobalDataSingleton.setCurrentTaskOwner(obj.resource);
    if (!currentItem?.owner) {
      return Promise.resolve({id: obj.id});
    } else {
      ganttGlobalDataSingleton.utilServiceInstance.showAssignmentAlreadyPresentError();
      return new Promise(resolve => resolve);
    }
  }

  updateAssignment(id: any, resources: any) {
    const idSplit = id && id.split ? id.split('-') : []; // checking because id.slit fails on numbers
    const idToCheck = `${idSplit[0]}-${idSplit[1]}`;
    const currentItem = ganttGlobalDataSingleton.projectDetails.mappedTasks.find((item: any) => item.id === idToCheck);
    if (currentItem?.parent) {
      ganttGlobalDataSingleton.setCurrentTaskDetails({...currentItem, owner_id: resources.resource, estimate: resources.value});
    } else if(currentItem) {
      ganttGlobalDataSingleton.setCurrentProjectDetails({...currentItem, owner_id: resources.resource, estimate: resources.value});
    }
   // ganttGlobalDataSingleton.utilServiceInstance.updateAssignmentInGantt(resources, id);
    return Promise.resolve({});
  }

  removeAssignment(id: any) {
  //  ganttGlobalDataSingleton.utilServiceInstance.deleteActivity(id);
    return Promise.resolve({});
  }

}
