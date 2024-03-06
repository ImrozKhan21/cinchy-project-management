import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

declare let webix: any;
declare let gantt: any;

export class CustomTree extends gantt.views.tree {
  /**
   * Sets action ot bar item click
   * @param {(string|number)} id  - ID of the clicked item
   */
  config() {
    const ui = super.config();

    // double click handler
    ui.on.onItemDblClick = (id: any, e: any) => {
      const task = ganttGlobalDataSingleton.getCurrentTaskDetailsForFormValues();
      const slicedTask = ganttGlobalDataSingleton.getCurrentSlicedTaskDetails();
      const isTaskSliced = task?.id === slicedTask?.id ? slicedTask?.isSliced : false;
      this.onSliceButtonClick(task, isTaskSliced)
    };

    ui.columns.forEach((column: any) => {
      console.log('111 columns', column)
      if (column.id === "text") {
        column.width = 300;
        column.minWidth = 300;
      }

      if(column.id === "action") {
        column.header.css = `${column.header.css} gantt-action-column`;
      }
    });
    ui.width = 700;
    return ui;
  }

  onSliceButtonClick(task: any, wasSliced: boolean) {
    // First time, there will be no sliced task, so from next time it will get sliced task
    const taskWithSliceUpdates = {...task, isSliced: !wasSliced}
    ganttGlobalDataSingleton.setCurrentSlicedTaskDetails(taskWithSliceUpdates);
    const filterDataServiceInstance = ganttGlobalDataSingleton.getFilterDataServiceInstance();
    filterDataServiceInstance.scopeInTask(task, wasSliced)
  }
}
