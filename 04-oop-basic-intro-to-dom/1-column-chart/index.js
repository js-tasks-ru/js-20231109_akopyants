export default class ColumnChart {
  
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = "",
    formatHeading = (data) => data,
  } = {}) {
    this.subElements = {};
    this.formatHeading = formatHeading;
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;

    this.element = this.createElement(this.createTemplate());
    this.toggleLoaderStatus();
    this.selectSubElements();
  }

  createElement(html) {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild;
  }

  selectSubElements() {
    const subElements = Array.from(this.element.querySelectorAll("[data-element]"));

    subElements.forEach((element) => {
      const name = element.dataset.element;
      this.subElements[name] = element;
    });
  }

  createLinkTemplate() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : "";
  }

  createTitleTemplate() {
    return `Total ${this.label} ${this.createLinkTemplate()}`;
  }

  toggleLoaderStatus() {
    const isDataEmpty = this.data.length === 0;
    
    this.element.classList.toggle('column-chart_loading', isDataEmpty);
  }

  createTemplate() {
    return `<div class="column-chart" style="--chart-height: ${this.chartHeight}">
              <div data-element="title" class="column-chart__title">
                ${this.createTitleTemplate()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                  ${this.createHeaderTemplate()}
                </div>
                <div data-element="body" class="column-chart__chart">${this.createBodyTemplate()}</div>
              </div>
			      </div>`;
  }

  createHeaderTemplate(value = this.value) {
    return this.formatHeading(value);
  }

  createBodyTemplate() {
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

    this.subElements.body.innerHTML = this.createBodyTemplate();
    this.toggleLoaderStatus();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
