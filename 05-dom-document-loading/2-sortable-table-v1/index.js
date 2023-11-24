export default class SortableTable {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.createElement(this.createTemplate());
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

  createTemplate() {
    return `<div class="sortable-table">
              <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.createHeaderTemplate()}
              </div>
              <div data-element="body" class="sortable-table__body">
                ${this.createBodyTemplate()}
              </div>
            </div>`;
  }

  createHeaderTemplate() {
    return this.headerConfig
      .map(({ id, sortable, title }) => {
        return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="">
                  <span>${title}</span>
              </div>`;
      })
      .join("");
  }

  createBodyTemplate(data = this.data) {
    return data.map((info) => this.createProductCardTemplate(info)).join("");
  }

  createProductCardTemplate(info) {
    return `<a href="${info.id}" class="sortable-table__row">
              ${this.createProductCardCellTemplate(info)}
            </a>`;
  }

  createProductCardCellTemplate(info) {
    return this.headerConfig
      .map((item) => {
        return item.template
          ? item.template(info[item.id])
          : `<div class="sortable-table__cell">${info[item.id]}</div>`;
      })
      .join("");
  }

  sort(fieldValue, orderValue) {
    const sortedType = orderValue === "asc" ? 1 : -1;
    let sortFunction;

    if (fieldValue === "title") {
      sortFunction = (a, b) => sortedType * a.title.localeCompare(b.title, ["ru", "en"]);
    } else {
      sortFunction = (a, b) => sortedType * (a[fieldValue] - b[fieldValue]);
    }

    const sortedData = this.data.sort(sortFunction);
    this.updateBody(sortedData);
    this.updateHeaderCell(fieldValue, orderValue);
  }

  updateBody(sortedData) {
    this.subElements.body.innerHTML = this.createBodyTemplate(sortedData);
  }

  updateHeaderCell(fieldValue, orderValue) {
    const celss = this.subElements.header.querySelectorAll(".sortable-table__cell");

    celss.forEach((cell) => {
      cell.setAttribute("data-order", "");
      if (cell.dataset.id === fieldValue) {
        const arrowElement = cell.querySelector("[data-element='arrow']");
        if (arrowElement) {
          arrowElement.remove();
        }

        cell.setAttribute("data-order", orderValue);
        cell.insertAdjacentHTML('beforeend', this.createTemplateLink());
      }
    });
  }

  createTemplateLink() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
