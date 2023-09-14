import {IProjectDetails} from "./models/common.model";
import {UtilService} from "./services/util.service";

interface IDetails {
  mappedResources: any;
  mappedTasks: any;
  mappedAssigned: any;
  allTasks: any;
}

export let projectDetails: IDetails = {} as IDetails;

export const setProjectDetails = (details: any) => {
  projectDetails = details;
}

export let utilServiceInstance: any = {};

export const setUtilServiceInstance = (instance: any) => {
  utilServiceInstance = instance;
}
