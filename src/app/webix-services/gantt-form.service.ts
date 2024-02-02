import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";

declare let webix: any;
declare let gantt: any;

export class CustomForm extends gantt.views["task/form"] {

  config() {
    ganttGlobalDataSingleton.setGanttFormInstance(this); // so that we can refresh form from outside if we change task while form being open
    const ui = super.config();
    const toolbar = ui.body.rows.find((row:any) => row.view === "toolbar");
    if (toolbar) {
      const doneButton = toolbar.elements.find((el:any) => el.value === "Done");
      if (doneButton) {
        // Add a click handler to the "Done" button
        doneButton.click = () => {
          console.log("Done button clicked",ganttGlobalDataSingleton.currentTaskDetails, ganttGlobalDataSingleton.currentProjectDetails, ganttGlobalDataSingleton.viewType);
          const taskDetails = ganttGlobalDataSingleton.currentTaskDetails;
          const projectDetails = ganttGlobalDataSingleton.currentProjectDetails;
          ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, ganttGlobalDataSingleton.viewType, 'gantt');
          ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(projectDetails, ganttGlobalDataSingleton.viewType, 'gantt');
          // Additional logic for handling the click event
        };
      }
    }
    const form = ui.body.rows[1];
    // options for "css" richselect
    const paletteOptions: any = [{$empty: true, value: ""}];
    for (let i = 0; i < 7; i++) {
      const id: any = "mytask" + i;
      paletteOptions.push({id, value: id});
    }
    // "css" richselect definition ("Style")
    const newFormElements: any = [];
    form.elements.forEach((item: any, index: number) => {
      if (item.name === "text" || item.name === "type") {
        const newItem = {
          ...item,
          disabled: ganttGlobalDataSingleton.viewType === 'UPDATE',
          readonly: ganttGlobalDataSingleton.viewType === 'UPDATE'
        };
        newFormElements.push(newItem);
      } else if(item.name === "duration") {
        const newItem = {
          ...item,
          label: "Days"
        };
        newFormElements.push(newItem);
      } else if(item.multi) {
/*
        const newItem = {
          ...item,
          view: "combo",
          label: "Assignee",
          name: "resourceId",  // or whatever the key in the task data is
          value: "John Doe",
          options: {
            // Assuming a static list, but you could also connect to a dynamic data source
            data: [
              { id: 1, value: "John Doe" },
              { id: 2, value: "Jane Smith" },
              // ... other users or resources
            ]
          }
        }
*/
        newFormElements.push(item);
      }
      else {
        newFormElements.push(item);
      }
    });
    const currentFormValuesForCustomFields = ganttGlobalDataSingleton.getCurrentTaskDetailsForFormValues();
    if(!currentFormValuesForCustomFields) {
      // means when closing the form and all, since we now refresh form on selection of gantt row
      ganttGlobalDataSingleton.setGanttFormInstance(null);
    }
    const allActivityTypes = [...ganttGlobalDataSingleton.projectDetails.activityTypes];
    const activityTypes = {
      options: allActivityTypes.map((statusItem: any) => ({id: statusItem.value, value: statusItem.value})),
      view: "richselect",
      label: "Activity Type",
      name: "activity_type",
      value: currentFormValuesForCustomFields?.activity_type,
      disabled: currentFormValuesForCustomFields ? currentFormValuesForCustomFields.type === "project" : false
    };

    const allStatuses = [...ganttGlobalDataSingleton.projectDetails.allStatuses];
    const status = {
      options: allStatuses.map((statusItem: any) => ({id: statusItem.name, value: statusItem.name})),
      view: "richselect",
      label: "Status",
      name: "status"
    };

    // insert "css" richselect below "type"
    form.elements = [...newFormElements];
    console.log('111 fom', form.elements);
    const index = form.elements.findIndex((obj: any) => obj.name == "type");
    form.elements.splice(index + 1, 0, activityTypes);
    const indexOfActivityType = form.elements.findIndex((obj: any) => obj.name == "activity_type");
    form.elements.splice(indexOfActivityType + 1, 0, status);

    return ui;
  }
}
