import {IProjectDetails} from "./models/common.model";

interface IDetails {
  mappedResources: any;
  mappedTasks: any;
  mappedAssigned: any;
}

export let projectDetails: IDetails = {} as IDetails;

export const setProjectDetails = (details: any) => {
  projectDetails = details;
}
