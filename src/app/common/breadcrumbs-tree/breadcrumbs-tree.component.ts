import {Component} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {AppStateService} from "../../services/app-state.service";
import {FilterDataService} from "../../services/filter-data.service";

@Component({
  selector: 'app-breadcrumbs-tree',
  templateUrl: './breadcrumbs-tree.component.html',
  styleUrls: ['./breadcrumbs-tree.component.scss']
})
export class BreadcrumbsTreeComponent {
  items: MenuItem[];

  home: MenuItem;

  constructor(private appStateService: AppStateService, private filterDataService: FilterDataService) {
  }

  ngOnInit() {
    this.home = {icon: 'pi pi-home', id: 'home'};
    this.appStateService.getSlicerFilterItems().subscribe((items: any) => {
      if (items?.length) {
        this.items = this.createBreadcrumb(items);
      //  console.log('111 BREAD items', this.items)
      }
    });
  }

  breadcrumbClicked({item}: any) {
   // console.log('ITEM click', item);
    if(item.id === 'home') {
      this.filterDataService.scopeInTask(undefined, true);
      this.items = [];
      return ;
    }
    this.filterDataService.scopeInTask(item, false);
  }

  createBreadcrumb(data: any[]): any[] {
    const taskMap = new Map(data.map(task => [task.id, task]));
    const breadcrumb: any[] = [];

    const addTaskToBreadcrumb = (taskId: string) => {
      const task = taskMap.get(taskId);
      if (task) {
        breadcrumb.push({...task, label: task.text});
        data.forEach(child => {
          if (child.parent === taskId) {
            addTaskToBreadcrumb(child.id);
          }
        });
      }
    }

    const rootTask = data.find(task => task.parent === null || task.parent === 0);
    if (rootTask) {
      addTaskToBreadcrumb(rootTask.id);
    }

    return breadcrumb;
  }
}


