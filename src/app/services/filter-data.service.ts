import {Injectable} from '@angular/core';
import {IProjectDetails, IStatus, IUser} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilterDataService {

  constructor(private appStateService: AppStateService,  private activatedRoute: ActivatedRoute, private router: Router) {

  }

  getUpdatedTasks(allTasks: any, filterValues: any) {
    const {
      selectedUsers,
      selectedProjectUsers,
      selectedStatuses,
      selectedProjects,
      searchValue,
      isProjectsExpanded,
      slicedActivity
    } = filterValues;
 //   console.log("Slice button clicked for task:", allTasks, filterValues);

    let updatedTasks = allTasks.slice(); // ON square can be ON, by making this a map object but our data is not that big
    // Project owners
    if (selectedProjectUsers?.length) {
      updatedTasks = allTasks?.filter((task: any) => {
        return (selectedProjectUsers.find((ownerFilter: IUser) => (ownerFilter.owner_id === task.owner_id
          || ownerFilter.owner === task.owner)) && task.type === 'project');
      });
      const allActivitiesUnderFilteredProjects = this.projectsWithAllChildren(updatedTasks, allTasks);
      updatedTasks = [...updatedTasks, ...allActivitiesUnderFilteredProjects];
    }

    // activity owner
    if (selectedUsers?.length) {
      updatedTasks = updatedTasks?.filter((task: any) => {
        return (selectedUsers.find((ownerFilter: IUser) => ownerFilter.owner_id === task.owner_id
          || ownerFilter.owner === task.owner) && task.type === 'task');
      });
      // Adding all parent projects to list
      updatedTasks = this.augmentFilteredList(updatedTasks, allTasks);
    }

    if (selectedStatuses?.length) {
      updatedTasks = updatedTasks?.filter((task: any) => {
        return selectedStatuses.find((status: IStatus) => status.name === task.status);
      });
    }

    console.log('filter updatedTasks', updatedTasks)
    if (selectedProjects?.length) {
     /* updatedTasks = updatedTasks?.filter((task: any) => {
        return selectedProjects.find((project: IProjectDetails) => project.project_name === task.project_name);
      });*/
      const slicedTasksForMultipleProjects: any = [];
      console.log('111 selectedProjects', selectedProjects);
      selectedProjects.forEach((task: any) => {
        const idToUse = task.id ? task.id : `project-${task.project_id}`
        const tasksForSlicers: any = this.getSlicedTasksAndProjectOnly(updatedTasks, idToUse, true);
        if (tasksForSlicers) {
          slicedTasksForMultipleProjects.push(...tasksForSlicers);
        }
      });
      updatedTasks = slicedTasksForMultipleProjects;
      updatedTasks = this.getUniqueItemsBasedOnId(updatedTasks);
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
    if (slicedActivity && slicedActivity.id) {
      const {id, isTaskSliced} = slicedActivity;
      if (!isTaskSliced) {
        updatedTasks = this.getSlicedTasksAndProjectOnly(updatedTasks, id);
      }
    }
    // actualList = this.augmentFilteredList(updatedTasks, allTasks);
    return updatedTasks.map((item: any) => {
      return {...item, open: isProjectsExpanded};
    });
  }

  projectsWithAllChildren(filteredList: IProjectDetails[], allTasks: IProjectDetails[]) {
    const projectIds = new Set(filteredList.map(task => task.project_id));
    return allTasks.filter(task => projectIds.has(Number(task.parent_id)));
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

  addTaskAndParents(taskId: any, taskMap: { get: (arg0: any) => any; }, result: any[]) {
    let task = taskMap.get(taskId);
    if (task) {
      result.push(structuredClone({...task})) // Add the current task
    }

    if (task.parent) {
      this.addTaskAndParents(task.parent, taskMap, result); // Recursively add the parent
    }
  }

  addChildTasks(parentId: any, data: any[], result: any[]) {
    data.forEach(task => {
      if (task.parent === parentId) {
        result.push(task);
        this.addChildTasks(task.id, data, result); // Recursively add child tasks
      }
    });
  }

  getSlicedTasksAndProjectOnly(data: any, taskId: any, needAllTask?: boolean) {
    let taskMap = new Map(data.map((task: any) => [task.id, task]));
    let result: any[] = [];
    let resultWithParents: any[] = needAllTask ? result : [];


    let initialTask: any = taskMap.get(taskId);
    if (!initialTask) return;

    if(!needAllTask) {
      result.push(structuredClone({...initialTask, parent: 0})) // Add the current task
    }
    if (initialTask) {
      // this.addTaskAndParents(taskId, taskMap, result); // Add the task and its parents
      this.addChildTasks(taskId, data, result); // If it's a top-level task, add its children
    }
// result is getting updated in other fns
    this.addTaskAndParents(taskId, taskMap, resultWithParents);
    if (!needAllTask) {
      this.appStateService.setSlicerFilterItems(resultWithParents);
    }
    return result;
  }

  async scopeInTask(task?: IProjectDetails, isTaskSliced?: boolean) {
    // lastValueFrom requires observable to finish, that's why have to use take(1)
    const currentFilters = await lastValueFrom(this.appStateService.getGlobalFilter().pipe(take(1)));
    this.appStateService.applyGlobalFilter({...currentFilters, slicedActivity: {id: task?.id, isTaskSliced}});
    this.routeWithParams(task?.id, isTaskSliced);
    console.log('111 OUT task', task, currentFilters);
  }

  getUniqueItemsBasedOnId(dataArray: any) {
    return Array.from(new Map(dataArray.map((item: any) => [item.id, item])).values());
  }

  routeWithParams(scopedTaskId: string, isTaskSliced?: boolean) {
    const currentParams = this.activatedRoute.snapshot.queryParams;
    const params = {...currentParams, scopedTaskId: isTaskSliced ? null : scopedTaskId}
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: params,
        queryParamsHandling: '', // Do not preserve other params, since we're spreading them in the updatedParams
      });
  }
}
