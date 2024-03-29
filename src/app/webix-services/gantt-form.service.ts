import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";
import {PRIORITY_OPTIONS} from "../models/common.model";

declare let webix: any;
declare let gantt: any;

export class CustomForm extends gantt.views["task/form"] {

  config() {
    ganttGlobalDataSingleton.setGanttFormInstance(this); // so that we can refresh form from outside if we change task while form being open
    const ui = super.config();
  //  ui.width = 800; // TODO: it does not work

    const toolbar = ui.body.rows.find((row: any) => row.view === "toolbar");
    if (toolbar) {
      const doneButton = toolbar.elements.find((el: any) => el.value === "Done");
      if (doneButton) {
        // Add a click handler to the "Done" button
        doneButton.click = () => {
          const currentTaskOwnerId = ganttGlobalDataSingleton.getCurrentTaskOwner();
          console.log("Done button clicked", ganttGlobalDataSingleton.viewType);
          const taskDetails = {...ganttGlobalDataSingleton.currentTaskDetails, owner_id: currentTaskOwnerId};
          const projectDetails = ganttGlobalDataSingleton.currentProjectDetails;
          console.log('111 TASK DETAISL', taskDetails);
          console.log('111 projectDetails DETAISL', projectDetails);
          ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, ganttGlobalDataSingleton.viewType, 'gantt');
       //   ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(projectDetails, ganttGlobalDataSingleton.viewType, 'gantt');
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

    const currentFormValuesForCustomFields = ganttGlobalDataSingleton.getCurrentTaskDetailsForFormValues();
    if (!currentFormValuesForCustomFields) {
      // means when closing the form and all, since we now refresh form on selection of gantt row
      ganttGlobalDataSingleton.setGanttFormInstance(null);
    }
    this.addingFormFields(form, currentFormValuesForCustomFields);
    return ui;
  }

  addingFormFields(form: any, currentFormValuesForCustomFields: any) {
    const newFormElements: any = [];
    form.elements.forEach((item: any, index: number) => {
      if (item.name === "text" || item.name === "type") {
        const newItem = {
          ...item,
          disabled: ganttGlobalDataSingleton.viewType === 'UPDATE',
          readonly: ganttGlobalDataSingleton.viewType === 'UPDATE'
        };
        newFormElements.push(newItem);
      } else if (item.multi) {
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
      } else if (item.name === "details") {
        const newItem = {
          ...item,
          name: "description",
          label: "Description",
          view: "richtext",
          labelPosition: "left",
          labelAlign: "left",
          value: currentFormValuesForCustomFields?.description || '',
          height: 120,
        };
        newFormElements.push(newItem);
      } else if (item.name === "duration") {
        const newItem = {
          ...item,
          disabled: true,
          readonly: true,
          visible: false
        };
        newFormElements.push(newItem);
      } else {
        newFormElements.push(item);
      }
    });
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

    const priority = {
      view: "richselect",
      label: "Priority",
      name: "priority",
      options: Object.keys(PRIORITY_OPTIONS).map((key: string) => PRIORITY_OPTIONS[key]),
      value: currentFormValuesForCustomFields?.priority
    }

    const statusCommentary = {
      view: "textarea",
      label: "Status Commentary",
      name: "status_commentary",
      height: 80,
      value: currentFormValuesForCustomFields?.status_commentary
    }

    const totalEffort = {
      view: "richselect",
      label: "Total Effort",
      name: "effort_id",
      options: ganttGlobalDataSingleton.getEstimateOptions(),
      value: currentFormValuesForCustomFields?.effort_id
    };


    // insert "css" richselect below "type"
    form.elements = [...newFormElements];
    const index = form.elements.findIndex((obj: any) => obj.name == "type");
    form.elements.splice(index + 1, 0, activityTypes);
    const indexOfActivityType = form.elements.findIndex((obj: any) => obj.name == "activity_type");
    form.elements.splice(indexOfActivityType + 1, 0, status);
    const indexOfStatus = form.elements.findIndex((obj: any) => obj.name == "status");
    form.elements.splice(indexOfStatus + 1, 0, priority);
    const indexOfDuration = form.elements.findIndex((obj: any) => obj.name == "duration");
    form.elements.splice(indexOfDuration + 1, 0, totalEffort);
    const indexOfDescription = form.elements.findIndex((obj: any) => obj.name == "progress");
    form.elements.splice(indexOfDescription + 1, 0, statusCommentary);
  }
}
