import ganttGlobalDataSingleton from "../ganttGlobalDataSingleton";
import {IUser, PRIORITY_OPTIONS} from "../models/common.model";

declare let webix: any;
declare let gantt: any;

export class CustomForm extends gantt.views["task/form"] {

  config() {
    ganttGlobalDataSingleton.setGanttFormInstance(this); // so that we can refresh form from outside if we change task while form being open
    const ui = super.config();
    ui.width = 1100; // Set the form width

    const toolbar = ui.body.rows.find((row: any) => row.view === "toolbar");
    if (toolbar) {
      const doneButton = toolbar.elements.find((el: any) => el.value === "Done");
      if (doneButton) {
        // Add a click handler to the "Done" button
        doneButton.click = () => {
          const currentTaskOwnerId = ganttGlobalDataSingleton.getCurrentTaskOwner();
          console.log("Done button clicked", ganttGlobalDataSingleton.viewType);
          const taskDetails = {
            ...ganttGlobalDataSingleton.currentTaskDetails,
            owner_id: currentTaskOwnerId ? currentTaskOwnerId : ganttGlobalDataSingleton.currentTaskDetails.owner_id
          };
          const projectDetails = ganttGlobalDataSingleton.currentProjectDetails;
          ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(taskDetails, ganttGlobalDataSingleton.viewType, 'gantt');
          ganttGlobalDataSingleton.utilServiceInstance.updateActivityWithNewValues(projectDetails, ganttGlobalDataSingleton.viewType, 'gantt');
        };
      }
    }

    const form = ui.body.rows[1];
    form.css = 'gantt_custom_form'; // Add a custom CSS class to the form

    const currentFormValuesForCustomFields = ganttGlobalDataSingleton.getCurrentTaskDetailsForFormValues();
    if (!currentFormValuesForCustomFields) {
      ganttGlobalDataSingleton.setGanttFormInstance(null);
    }
    this.addingFormFields(form, currentFormValuesForCustomFields);
    return ui;
  }

  addingFormFields(form: any, currentFormValuesForCustomFields: any) {
    const newFormElements: any = [];
    form.elements.forEach((item: any) => {
      console.log('item', item)
      if (item.name === "text" || item.name === "type") {
        if (item.name === "type") {
          item.options = [{ id: 'task', value: 'Task' }, { id: 'milestone', value: 'Milestone' }];
        }
        const newItem = {
          ...item,
          disabled: ganttGlobalDataSingleton.viewType === 'UPDATE',
          readonly: ganttGlobalDataSingleton.viewType === 'UPDATE'
        };
        newFormElements.push(newItem);
      } else if (item.name === "details") {
        const descriptionLabel = {
          view: "template",
          template: `<div style='font-weight: 500; margin-top: 5px'>Description</div>`,
          autoheight: true,
          borderless: true
        };
        const newItem = {
          ...item,
          name: "description",
          label: "",
          view: "richtext",
          labelPosition: "left",
          labelAlign: "left",
          value: currentFormValuesForCustomFields?.description || '',
          height: 120,
        };
        newFormElements.push(descriptionLabel);
        newFormElements.push(newItem);
      } else if (item.name === "duration") {
        const newItem = {
          ...item,
          disabled: true,
          readonly: true,
          visible: false
        };
        newFormElements.push(newItem);
      } else if (item.view === "accordion") { // Skip adding the old assignments field
        item.css = "webix_gantt_accordion hidden";
        newFormElements.push(item);
      } else {
        newFormElements.push(item);
      }
    });
    // Add the richselect field for assignments
    const allUsers = [...ganttGlobalDataSingleton.projectDetails.allUsers];
    const allUsersOptions =  allUsers.map((statusItem: IUser) => ({ id: statusItem.owner_id, value: statusItem.owner }));

    const assignments = {
      view: "richselect",
      label: "Assignee",
      name: "owner_id",
      options:allUsersOptions,
      value: currentFormValuesForCustomFields?.owner_id
    };

    const allActivityTypes = [...ganttGlobalDataSingleton.projectDetails.activityTypes];
    const selectedActivityType = allActivityTypes.find(activityType => {
      return activityType.value.includes(currentFormValuesForCustomFields?.activity_type);
    });

    const activityTypes = {
      options: allActivityTypes.map((statusItem: any) => ({ id: statusItem.value, value: statusItem.value })),
      view: "richselect",
      label: "Activity Type",
      name: "activity_type",
      value: selectedActivityType?.value,
      disabled: currentFormValuesForCustomFields ? currentFormValuesForCustomFields.type === "project" : false
    };

    const allStatuses = [...ganttGlobalDataSingleton.projectDetails.allStatuses];
    const status = {
      options: allStatuses.map((statusItem: any) => ({ id: statusItem.name, value: statusItem.name })),
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
    };

    const statusCommentary = {
      view: "textarea",
      label: "Status Commentary",
      name: "status_commentary",
      height: 80,
      value: currentFormValuesForCustomFields?.status_commentary
    };

    const totalEffort = {
      view: "richselect",
      label: "Total Effort",
      name: "effort_id",
      options: ganttGlobalDataSingleton.getEstimateOptions(),
      value: currentFormValuesForCustomFields?.effort_id
    };

    form.elements = [...newFormElements];
    const index = form.elements.findIndex((obj: any) => obj.name == "type");
    form.elements.splice(index + 1, 0, activityTypes);
    const indexOfActivityType = form.elements.findIndex((obj: any) => obj.name == "activity_type");
    form.elements.splice(indexOfActivityType + 1, 0, status);
    const indexOfStatus = form.elements.findIndex((obj: any) => obj.name == "status");
    form.elements.splice(indexOfStatus + 1, 0, priority);
    form.elements.splice(indexOfStatus + 1, 0, assignments);
    const indexOfDuration = form.elements.findIndex((obj: any) => obj.name == "duration");
    form.elements.splice(indexOfDuration + 1, 0, totalEffort);
    const indexOfDescription = form.elements.findIndex((obj: any) => obj.name == "progress");
    form.elements.splice(indexOfDescription + 1, 0, statusCommentary);
  }
}
