export default class SortableTable {
  subElements = {};

  constructor(headersConfig = "", { data = [], sorted = {} } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;

    if (sorted) {
      const { id, order } = sorted;
      this.data = this.getSortedData(id, order);
    }

    this.element = this.createElement(this.createTemplate());
    this.selectSubElements();
    this.createEventListeners();
  }

  createElement(html) {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild;
  }

  createEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.handleHeaderClick);
  }

  destroyEventListeners() {
    this.subElements.header.removeEventListener("pointerdown", this.handleHeaderClick);
  }

  selectSubElements() {
    const subElements = Array.from(this.element.querySelectorAll("[data-element]"));

    subElements.forEach((element) => {
      const name = element.dataset.element;
      this.subElements[name] = element;
    });
  }

  createTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">      
              <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.createHeaderTemplate()}
                </div>
                <div data-element="body" class="sortable-table__body">
                  ${this.createBodyTemplate()}
                </div>
              </div>
            </div>`;
  }

  createHeaderTemplate() {
    return this.headersConfig
      .map(({ id, sortable, title }) => {
        const order = id === this.sorted.id ? this.sorted.order : "";

        return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
                  <span>${title}</span>
                  ${this.createLinkTemplate(sortable)}
                </div>`;
      })
      .join("");
  }

  createBodyTemplate(data = this.data) {
    return data.map(this.createProductCardTemplate).join("");
  }

  createProductCardTemplate = (info) => {
    return `<a href="${info.id}" class="sortable-table__row">
              ${this.createProductCardCellTemplate(info)}
            </a>`;
  };

  createProductCardCellTemplate = (info) => {
    return this.headersConfig
      .map((item) => {
        return item.template
          ? item.template(info[item.id])
          : `<div class="sortable-table__cell">${info[item.id]}</div>`;
      })
      .join("");
  };

  sort(fieldValue, orderValue) {
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(fieldValue, orderValue) {
    const getSortedData = this.getSortedData(fieldValue, orderValue);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
    currentColumn.dataset.order = orderValue;

    this.updateBody(getSortedData);
  }

  getSortedData(fieldValue, orderValue) {
    const direction = orderValue === "asc" ? 1 : -1;
    let sortFunction;

    const { sortType } = this.headersConfig.filter((el) => {
      return el.id === fieldValue;
    })[0];

    if (sortType === "string") {
      sortFunction = (a, b) => direction * (a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']));
    }
    if (sortType === "number") {
      sortFunction = (a, b) => direction * (a[fieldValue] - b[fieldValue]);
    }

    return [...this.data].sort(sortFunction);
  }

  sortOnClient(fieldValue, orderValue) {
    const getSortedData = this.getSortedData(fieldValue, orderValue);
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);
    currentColumn.dataset.order = orderValue;

    this.updateBody(getSortedData);
  }

  sortOnServer() {}

  updateBody(getSortedData) {
    this.subElements.body.innerHTML = this.createBodyTemplate(getSortedData);
  }

  createLinkTemplate(sortable) {
    return sortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : "";
  }

  handleHeaderClick = (e) => {
    const headerTitle = e.target.closest("[data-id]");
    const id = headerTitle.dataset.id;
    const { sortable, order } = headerTitle.dataset;

    if (sortable === "true") {
      const newOrder = order === 'desc' ? 'asc' : 'desc';
      headerTitle.setAttribute("data-order", newOrder);
      this.subElements.header
        .querySelectorAll(".sortable-table__cell")
        .forEach((cell) => (cell.dataset.order = ""));

      this.sort(id, newOrder);
    }
  };
  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyEventListeners();
    this.remove();
  }
}
