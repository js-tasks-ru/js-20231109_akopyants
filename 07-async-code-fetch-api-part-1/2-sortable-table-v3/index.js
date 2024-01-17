import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  start = 0;
  end = 20;
  step = 20;

  constructor(
    headersConfig = '',
    {
      data = [],
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: 'asc',
      },
      url = '',
      isSortLocally = false,
    } = {}
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = url;
    this.render();
  }

  async render() {
    this.element = this.createElement(this.createTemplate());
    this.selectSubElements();
    this.data = await this.loadData();
    this.renderProduct();
    this.createEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.subElements.table.classList.add('sortable-table_loading');
    const params = new URLSearchParams({
      _sort: id,
      _order: order,
      _start: start,
      _end: end,
    });
    const url = new URL(`${BACKEND_URL}/${this.url}?${params}`);
    const data = await fetchJson(url);

    this.data = data;
    this.subElements.table.classList.remove('sortable-table_loading');

    return data;
  }

  renderProduct() {
    if (!this.data.length) {
      this.subElements.table.classList.add('sortable-table_empty');
      return;
    }

    this.subElements.body.innerHTML = this.createBodyTemplate();
  }

  dataUpdate(data = []) {
    this.data = Object.values(data);
    this.updateBody(this.data);
  }

  createElement(html) {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.firstElementChild;
  }

  createEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleHeaderClick);

    if (!this.isSortLocally) {
      window.addEventListener('scroll', this.handleWindowScroll);
    }
  }

  destroyEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.handleHeaderClick);

    if (!this.isSortLocally) {
      window.removeEventListener('scroll', this.handleWindowScroll);
    }
  }

  selectSubElements() {
    const subElements = Array.from(this.element.querySelectorAll('[data-element]'));

    subElements.forEach((element) => {
      const name = element.dataset.element;
      this.subElements[name] = element;
    });
  }

  createTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">      
              <div data-element="table" class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.createHeaderTemplate()}
                </div>
                <div data-element="body" class="sortable-table__body">
                  ${this.createBodyTemplate()}
                </div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">No products</div>
              </div>
            </div>`;
  }

  createHeaderTemplate() {
    return this.headersConfig
      .map(({ id, sortable, title }) => {
        const order = id === this.sorted.id ? this.sorted.order : '';

        return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
                  <span>${title}</span>
                  ${this.createLinkTemplate(sortable)}
                </div>`;
      })
      .join('');
  }

  createBodyTemplate(data = this.data) {
    return data.map(this.createProductCardTemplate).join('');
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
      .join('');
  };

  sort(id, order) {
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
    currentColumn.dataset.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  resetData() {
    this.data = [];
    this.subElements.body.innerHTML = '';
  }

  sortOnClient(id, order) {
    const getSortedData = this.getSortedData(id, order);
    this.updateBody(getSortedData);

    return getSortedData;
  }

  async sortOnServer(id = this.sorted.id, order = this.sorted.order) {
    this.resetData();
    await this.loadData(id, order, this.start, this.end);
    this.renderProduct();
  }

  getSortedData(id = this.sorted.id, order = this.sorted.order) {
    const direction = order === 'asc' ? 1 : -1;
    let sortFunction;

    const { sortType } = this.headersConfig.filter((el) => {
      return el.id === id;
    })[0];

    if (sortType === 'string') {
      sortFunction = (a, b) => direction * a[id].localeCompare(b[id], ['ru', 'en']);
    }
    if (sortType === 'number') {
      sortFunction = (a, b) => direction * (a[id] - b[id]);
    }

    return [...this.data].sort(sortFunction);
  }

  updateBody(getSortedData) {
    this.subElements.body.innerHTML = this.createBodyTemplate(getSortedData);
  }

  createLinkTemplate(sortable) {
    return sortable
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  handleHeaderClick = (e) => {
    const headerTitle = e.target.closest('[data-id]');
    const { id, sortable, order } = headerTitle.dataset;

    if (sortable === 'true') {
      const newOrder = order === 'desc' ? 'asc' : 'desc';
      headerTitle.setAttribute('data-order', newOrder);
      this.subElements.header.querySelectorAll('.sortable-table__cell').forEach((cell) => (cell.dataset.order = ''));
      this.sorted.id = id;
      this.sorted.order = newOrder;
      this.sort(id, newOrder);
    }
  };

  updateDataOnScroll(data) {
    const element = document.createElement('div');
    element.innerHTML = this.createBodyTemplate(data);
    this.subElements.body.append(...element.children);
  }

  async update(from, to) {
    this.dataUpdate();
    const url = new URL(`${BACKEND_URL}/${this.url}?from=${from}&to=${to}`);
    const data = await fetchJson(url);

    this.dataUpdate(data);

    return data;
  }

  handleWindowScroll = async () => {
    const { bottom } = document.body.getBoundingClientRect();

    if (bottom < document.documentElement.clientHeight && !this.isDataLoading) {
      this.isDataLoading = true;
      this.start = this.end;
      this.end = this.start + this.step;
      const data = await this.loadData(this.sorted.id, this.sorted.order);

      this.updateDataOnScroll(data);
      this.isDataLoading = false;
    }
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.destroyEventListeners();
    this.remove();
  }
}
