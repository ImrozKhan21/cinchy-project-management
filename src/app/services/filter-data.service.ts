import {Injectable} from '@angular/core';
import {IComboType, IProjectDetails, IStatus, IUser} from "../models/common.model";
import {AppStateService} from "./app-state.service";
import {ActivatedRoute, Router} from "@angular/router";
import {lastValueFrom, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilterDataService {

  constructor(private appStateService: AppStateService, private activatedRoute: ActivatedRoute, private router: Router) {

  }

  getUpdatedTasks(allTasks: any, filterValues: any, fromKanban?: boolean) {
    const filters = filterValues || {};
    const {
      selectedUsers,
      selectedProjectUsers,
      selectedStatuses,
      selectedProjects,
      searchValue,
      isProjectsExpanded,
      slicedActivity,
      selectedWorkType,
      selectedDepartment,
      selectedPortfolios,
      selectedPriorities
    } = filters;

    let updatedTasks = allTasks.slice(); // ON square can be ON, by making this a map object but our data is not that big

    if (selectedStatuses?.length) {
      updatedTasks = updatedTasks?.filter((task: any) => {
        return selectedStatuses.find((status: IStatus) => status.name === task.status);
      });
    }

    // because below all need to add either all children or parents back
    if (selectedProjects?.length || selectedProjectUsers?.length || selectedPortfolios?.length) {
      if (fromKanban && selectedProjects?.length) {
        updatedTasks = updatedTasks?.filter((task: any) => {
          return selectedProjects.find((project: IProjectDetails) => project.project_name === task.project_name);
        });
      } else {
        const slicedTasksForMultipleProjects: any = [];
        if (selectedProjects?.length) {
          const hierarchyTasks = this.getAllHierarchyTask(selectedProjects, updatedTasks, fromKanban);
          slicedTasksForMultipleProjects.push(...hierarchyTasks);
        }
        if (selectedPortfolios?.length) {
          const selectedProjects = updatedTasks?.filter((task: any) => {
            return selectedPortfolios.find((portfolio: IComboType) => {
              return (task.type === "project" && portfolio.value === task.portfolio)
            });
          });
          const hierarchyTasks = this.getAllHierarchyTask(selectedProjects, updatedTasks, fromKanban);
          console.log('111 updatedTasks 2', hierarchyTasks, selectedProjects);

          slicedTasksForMultipleProjects.push(...hierarchyTasks);
        }

        if (selectedProjectUsers?.length) {
          const selectedProjects = updatedTasks?.filter((task: any) => {
            return (selectedProjectUsers.find((ownerFilter: IUser) => (((ownerFilter.owner_id === task.owner_id
                || ownerFilter.owner === task.owner) && task.type === 'project'))))
          });
          const hierarchyTasks = this.getAllHierarchyTask(selectedProjects, updatedTasks, fromKanban);
          slicedTasksForMultipleProjects.push(...hierarchyTasks);
        }

        updatedTasks = slicedTasksForMultipleProjects;
        updatedTasks = this.getUniqueItemsBasedOnId(updatedTasks);
      }
    }

    // work owner or work type as both may need to add all parents
    if (selectedUsers?.length || selectedWorkType?.length || selectedDepartment?.length || selectedPriorities?.length) {
      let [filteredItemsByWorkType, filteredItemsByWorkOwner, filterItemsByDepartmentType, filterItemsByPriority]: any = [[], [], [], []]
      if (selectedUsers?.length) {
        const filterByWorkOwnerFn = (task: any) => {
          return selectedUsers.some((ownerFilter: IUser) =>
            task.owner && (task.owner === ownerFilter.owner || ownerFilter.owner_id == task.owner_id) && task.type !== 'project'
          );
        };
        filteredItemsByWorkOwner = this.findTasksAndAncestors(allTasks, filterByWorkOwnerFn, fromKanban);
        filteredItemsByWorkOwner = filteredItemsByWorkOwner?.length ? filteredItemsByWorkOwner : [{}];
      }

      if (selectedWorkType?.length) {
        const filterByTaskTypeFn = (task: IProjectDetails) => {
          return selectedWorkType.some((workType: IComboType) =>
            task.activity_type_id && (task.activity_type_id === workType.id)
          );
        };
        filteredItemsByWorkType = this.findTasksAndAncestors(allTasks, filterByTaskTypeFn, fromKanban);
        filteredItemsByWorkType = filteredItemsByWorkType?.length ? filteredItemsByWorkType : [{}];
      }

      if (selectedDepartment?.length) {
        const filterByDepartmentTypeFn = (task: IProjectDetails) => {
          return selectedDepartment.some((department: IComboType) =>
            task.owner_department && (task.owner_department === department.value)
          );
        };
        filterItemsByDepartmentType = this.findTasksAndAncestors(allTasks, filterByDepartmentTypeFn, fromKanban);
        filterItemsByDepartmentType = filterItemsByDepartmentType?.length ? filterItemsByDepartmentType : [{}];
      }

      if (selectedPriorities?.length) {
        const filterByPriorityTypeFn = (task: IProjectDetails) => {
          return selectedPriorities.some((priority: any) =>
            task.priority && (task.priority === priority.id)
          );
        };
        filterItemsByPriority = this.findTasksAndAncestors(allTasks, filterByPriorityTypeFn, fromKanban);
        filterItemsByPriority = filterItemsByPriority?.length ? filterItemsByPriority : [{}];
      }

      updatedTasks = this.findCommonObjects(updatedTasks, filteredItemsByWorkType,
        filteredItemsByWorkOwner, filterItemsByDepartmentType, filterItemsByPriority);
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

    if (fromKanban) {
      updatedTasks = updatedTasks.filter((item: any) => {
        return item.type === "task";
      });
    }
    // actualList = this.augmentFilteredList(updatedTasks, allTasks);
    return updatedTasks.map((item: any) => {
      return {...item, open: isProjectsExpanded};
    });
  }

  getAllHierarchyTask(selectedProjects: any, updatedTasks: any, fromKanban?: boolean) {
    const needOnlyChildren = fromKanban;
    const hierarchyTasks: any = [];
    selectedProjects.forEach((task: any) => {
      const idToUse = task.id ? task.id : `project-${task.project_id}`
      const tasksForSlicers: any = this.getSlicedTasksAndProjectOnly(updatedTasks, idToUse, !needOnlyChildren);
      if (tasksForSlicers) {
        hierarchyTasks.push(...tasksForSlicers);
      }
    });
    return hierarchyTasks;
  }

  // To also add the parent project if it is not returned after search, is some task has parentId and that parentId task is not present
  findTasksAndAncestors(items: any, filterFn: any, fromKanban?: boolean) {
    // Map to store parent relationships for quick lookup
    const parentMap = new Map(items.map((item: any) => [item.id, item.parent]));
    // Set to store IDs of tasks that match the filter or are ancestors of filtered tasks
    const relevantIds = new Set();

    // Step 1: Directly mark tasks that match the filter and store their IDs
    items.forEach((item: any) => {
      if (filterFn(item)) {
        relevantIds.add(item.id);
      }
    });

    // Step 2: Given a child ID, recursively mark all its ancestors
    const markAncestors = (childId: any) => {
      const parentId = parentMap.get(childId);
      if (parentId && !relevantIds.has(parentId)) {
        relevantIds.add(parentId);
        markAncestors(parentId); // Recurse to mark further ancestors
      }
    };

    // Start marking ancestors from each directly filtered task
    if (!fromKanban) {
      relevantIds.forEach(markAncestors);
    }

    // Step 3: Collect all relevant tasks and their ancestors into the final list
    return items.filter((item: any) => relevantIds.has(item.id));
  }

  projectsWithAllChildren(filteredList: IProjectDetails[], allTasks: IProjectDetails[]) {
    const projectIds = new Set(filteredList.map(task => task.project_id));
    return allTasks.filter(task => projectIds.has(Number(task.project_id)) || projectIds.has(Number(task.parent_id)));
  }

  addTaskAndParents(taskId: any, taskMap: { get: (arg0: any) => any; }, result: any[]) {
    let task = taskMap.get(taskId);
    // console.log('TASK 2',taskMap, task, taskId)

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

    if (!needAllTask) {
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
    const filterSelected = {...currentFilters, slicedActivity: {id: task?.id, isTaskSliced}};
    this.appStateService.setFiltersState(filterSelected);
    this.appStateService.applyGlobalFilter(filterSelected);
    this.routeWithParams(task?.id, isTaskSliced);
  }

  getUniqueItemsBasedOnId(dataArray: any) {
    return Array.from(new Map(dataArray.map((item: any) => [item.id, item])).values());
  }

  findCommonObjects(...arrays: any[]) {
    // Filter out any empty arrays or assume they contain all possible ids
    const nonEmptyArrays = arrays.filter(arr => arr.length > 0);
    // If all arrays are empty, return an empty array (or adjust based on requirements)
    if (nonEmptyArrays.length === 0) return [];

    // Finding common objects
    const common: any = nonEmptyArrays.reduce((acc, arr, index) => {
      if (index === 0) {
        // The accumulator for the first array is the array itself
        return arr;
      } else {
        // For subsequent arrays, find common elements
        return acc.filter((a: any) => arr.some((b: any) => a.id === b.id));
      }
    });

    return common;
  }
  routeWithParams(scopedTaskId: string, isTaskSliced?: boolean) {
    const currentParams = this.activatedRoute.snapshot.queryParams;
    !scopedTaskId && sessionStorage.removeItem('scopedTaskId');
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
