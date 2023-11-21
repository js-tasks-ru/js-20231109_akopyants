export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = "",
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);

    this.element = this.createElement(this.createTemplate());
    this.isLoaded();
  }

  createElement(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.firstElementChild;
  }

  setLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : "";
  }

  isLoaded() {
    const isDataEmpty = this.data.length === 0;

    if (!isDataEmpty) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  createTemplate() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
              <div class="column-chart__title">
                Total ${this.label} ${this.setLink()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.value}</div>
                <div data-element="body" class="column-chart__chart">${this.createBody()}</div>
              </div>
			      </div>`;
  }

  createBody() {
    const maxValue = Math.max(...this.data);

    return this.data
      .map((item) => {
        const value = Math.floor(item * (this.chartHeight / maxValue)).toFixed();
        const percent = ((item / maxValue) * 100).toFixed() + "%";

        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      })
      .join("");
  }

  update(data) {
    this.data = data;

    const isDataEmpty = this.data.length === 0;
    const columnChartBody = this.element.querySelector('[data-element="body"]');

    columnChartBody.innerHTML = this.createBody();

    if (isDataEmpty) {
      this.element.classList.add('column-chart_loading');
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
