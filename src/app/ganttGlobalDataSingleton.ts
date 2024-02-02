import { IDetails } from "./models/common.model";
declare let webix: any;

class GanttGlobalDataSingleton {
  public projectDetails: IDetails = {} as IDetails;
  public utilServiceInstance: any = {};
  public viewType: string;
  public currentTaskDetails: any;
  public currentProjectDetails: any;

  public quarterStart(date: any): any {
    date = webix.Date.copy(date);
    date.setMonth(Math.floor(date.getMonth() / 3) * 3);
    date.setDate(1);
    return date;
  }
  public yearScale = { unit: "year", format: "%Y" };
  public quarterScale = {
    unit: "quarter",
    format: (start: any, end: any) => {
      const parser = webix.Date.dateToStr("%M");
      const qstart = this.quarterStart(start);
      const qend = webix.Date.add(
        webix.Date.add(qstart, 3, "month", true),
        -1,
        "day",
        true
      );
      return parser(qstart) + " - " + parser(qend);
    },
  };
  public monthScale = { unit: "month", format: "%F %Y" };
  public weekScale = {
    unit: "week",
    format: (start: any) => {
      const parser = webix.Date.dateToStr("%d %M");
      const wstart = webix.Date.weekStart(start);
      const wend = webix.Date.add(
        webix.Date.add(wstart, 1, "week", true),
        -1,
        "day",
        true
      );
      return parser(wstart) + " - " + parser(wend);
    },
  };
  public dayScale = { unit: "day", format: "%M %d" };
  public hourScale = { unit: "hour", format: "%H:00" };
  public cellWidths: any = {
    year: 400,
    quarter: 400,
    month: 400,
    week: 200,
    day: 200,
    hour: 50,
  };

  private filterDataServiceInstance: any = {};
  private currentTaskDetailsForFormValues: any;
  private currentSlicedTaskDetails: any;
  private ganttFormInstance: any;


  setProjectDetails(details: IDetails) {
    this.projectDetails = details;
  }

  getActivities(): IDetails {
    return this.projectDetails;
  }

  setUtilServiceInstance(instance: any) {
    this.utilServiceInstance = instance;
  }

  setFilterDataServiceInstance(instance: any) {
    this.filterDataServiceInstance = instance;
  }

  getFilterDataServiceInstance() {
    return this.filterDataServiceInstance;
  }

  setViewType(viewType: string) {
    this.viewType = viewType;
  }

  setCurrentTaskDetails(taskDetails: any) {
    this.currentTaskDetails = taskDetails;
  }

  setCurrentTaskDetailsForFormValues(taskDetails: any) {
    this.currentTaskDetailsForFormValues = taskDetails;
  }

  getCurrentTaskDetailsForFormValues() {
    return this.currentTaskDetailsForFormValues
  }

  setCurrentSlicedTaskDetails(taskDetails: any) {
    this.currentSlicedTaskDetails = taskDetails;
  }

  getCurrentSlicedTaskDetails() {
    return this.currentSlicedTaskDetails
  }

  setCurrentProjectDetails(taskDetails: any) {
    this.currentProjectDetails = taskDetails;
  }

  getGanttFormInstance() {
    return this.ganttFormInstance
  }

  setGanttFormInstance(ganttFormInstance: any) {
    this.ganttFormInstance = ganttFormInstance;
  }

  getUtilServiceInstance(): any {
    return this.utilServiceInstance;
  }
}

const ganttGlobalDataSingleton = new GanttGlobalDataSingleton();

export default ganttGlobalDataSingleton;
