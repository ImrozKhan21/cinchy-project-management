declare let webix: any;
declare let gantt: any;

export class CustomInfo extends gantt.views["task/info"] {

  InfoTemplate(obj: any) {
    //remove links data
    //   return customQuickInfoTemplate(obj);
    obj.targets = obj.sources = [];
    delete obj.details;
    const originalContent = super.InfoTemplate(obj);

    // Create custom content using the status property from obj
    const customContent = `
                <div class="quick_info_line" style="margin-bottom: 10px; text-align: center;">
                    <span style="font-weight: 500; font-size: 20px;">${obj.text}</span>
                </div>

                <div class="quick_info_line">
                    <span style="font-weight: 500;">Start Date:</span> ${obj.start_date?.toDateString()}
                </div>

                 <div class="quick_info_line">
                    <span style="font-weight: 500;">End Date:</span> ${obj.end_date?.toDateString()}
                </div>

                 <div class="quick_info_line">
                    <span style="font-weight: 500;">Days:</span> ${obj.duration ? obj.duration : ''}
                </div>

                  <div class="quick_info_line">
                    <span style="font-weight: 500;">Progress:</span> ${obj.progress}
                </div>

                <div class="quick_info_line">
                    <span style="font-weight: 500;">Status:</span> ${obj.status ? obj.status : ''}
                </div>
            `;

    // Concatenate the original content with custom content and return
    return customContent;
  }

  EditTask() {
    super.EditTask();
  }
}
