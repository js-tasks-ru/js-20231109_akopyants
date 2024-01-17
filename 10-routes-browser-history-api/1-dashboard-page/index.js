import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
  subElements = {};

  createEventListeners() {
    document.addEventListener("date-select", this.handleDateSelect);
  }


  removeEventListeners() {
    document.removeEventListener("date-select", this.handleDateSelect);
  }

  handleDateSelect = (e) => {
    const { from, to } = e.detail;

    this.ordersChart.update(from, to);
    this.salesChart.update(from, to);
    this.customersChart.update(from, to);
    this.sortableTable.update(from, to);
  }

  selectSubElements() {
    const subElements = Array.from(
      this.element.querySelectorAll("[data-element]")
    );

    subElements.forEach((element) => {
      const name = element.dataset.element;
      this.subElements[name] = element;
    });
  }

  createElement(html) {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild;
  }

  render() {
    this.element = this.createElement(this.createPageTemplate());
    this.selectSubElements();
    this.createEventListeners();

    const from = new Date();
    let to = new Date(from);
    to.setMonth(from.getMonth() + 1);

    this.rangePicker = new RangePicker({
      from: from,
      to: to
    });

    this.subElements.rangePicker.append(this.rangePicker.element);

    this.sortableTable = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
      sorted: { from: from, to: to },
      isSortLocally: true,
    });

    this.subElements.sortableTable.append(this.sortableTable.element);

    this.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      },
      label: 'orders',
      link: '#'
    });

    this.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from,
        to
      },
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    this.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      },
      label: 'customers',
    });

    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);
    
    return this.element;
  }

  createPageTemplate() {
    return `<div class="dashboard">
              <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
              </div>
              <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>

              <h3 class="block-title">Best sellers</h3>

              <div data-element="sortableTable"></div>
            </div>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}
