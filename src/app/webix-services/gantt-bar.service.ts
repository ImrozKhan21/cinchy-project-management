declare let webix: any;
declare let gantt: any;


export class CustomBar extends gantt.views["chart/bars"] {

  init(view: any) {
    super.init(view);

    // @ts-ignore
    this.on(this.app, "chart:scroll", date => {
      // @ts-ignore
      const scales = this.Local.getScales();
      let x;
      if (scales.minUnit === "month") {
        const d = webix.Date.strToDate("%d.%m.%Y")(date);
        const startMonth = new Date(scales.start.getFullYear(), scales.start.getMonth(), 1);
        const monthDiff = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth());
        x = monthDiff * scales.cellWidth;
      } else {
        // date processing logic can be whatever you want
        const d = webix.Date.strToDate("%d.%m.%Y")(date);
        // get X coords from scale cell position
        x = (d - scales.start) / 86400000 * scales.cellWidth;
      }

      // @ts-ignore
      const {y} = this.Bars.getScrollState();

      // scroll the chart horizontally, preserve Y pos
      // @ts-ignore

      this.Bars.scrollTo(x, y);
    });
  }
}
