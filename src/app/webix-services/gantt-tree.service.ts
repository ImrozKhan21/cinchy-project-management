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
    let alreadyResized = false;

    // double click handler
    ui.on.onItemDblClick = (id: any, e: any) => {
      const task = ganttGlobalDataSingleton.getCurrentTaskDetailsForFormValues();
      const slicedTask = ganttGlobalDataSingleton.getCurrentSlicedTaskDetails();
      const isTaskSliced = task?.id === slicedTask?.id ? slicedTask?.isSliced : false;
      this.onSliceButtonClick(task, isTaskSliced)
    };

    ui.on.onViewResize = () => {
      if (alreadyResized) {
        return;
      }

      const newMinWidth = '200px';
      // Select elements by class and apply new min-width
      const elements = document.querySelectorAll('.webix_gantt_tree, .webix_hs_center, .webix_ss_center');
      elements.forEach(function (element: any) {
        element.style.minWidth = newMinWidth;
      });
      alreadyResized = true;
    }

    ui.columns.forEach((column: any) => {
      if (column.id === "text") {
        column.width = 300;
        column.minWidth = 300;
        column.template = (obj: any, common: any) => {
          let icon = obj.$count ? "folder" : "file";
          let space = "<span style='display:inline-block; width:" + ((obj.$level - 1) * 20) + "px;'></span>";
          const imageIcon = obj.activity_type_icon ?
            `<img height="20px" style="margin-right: 5px; margin-top: 5px; height: 20px;" src=${obj.activity_type_icon}  alt="icon"/>`
            : `<span class='webix_icon wxi-${icon}'></span>`;
          return `${space}${common.icon(obj, common)}
                    <span class='webix_icon'>${imageIcon}</span>
                    <span>${obj.text}</span>`;
        };
      }

      if (column.id === "action") {
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
