import ColumnChartMain from '../../04-oop-basic-intro-to-dom/1-column-chart/index.js';
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends ColumnChartMain {
  constructor({
    url = "",
    range: { from = new Date(), to = new Date() } = {},
    label = "",
    link = "",
    value = "",
  } = {}) {
    super();
    this.value = value;
    this.link = link;
    this.label = label;
    this.from = from.toISOString();
    this.to = to.toISOString();
    this.url = url;
    this.update(from, to);
  }

  async update(from, to) {
    this.dataUpdate();
    const url = new URL(`${BACKEND_URL}/${this.url}?from=${from}&to=${to}`);
    const data = await fetchJson(url);

    this.dataUpdate(data);

    return data;
  }

  dataUpdate(data = []) {
    this.data = Object.values(data);
    this.toggleLoaderStatus();

    const headerTotalValue = this.data.reduce((acc, curr) => acc + curr, 0);

    this.subElements.title.innerHTML = this.createTitleTemplate();
    this.subElements.header.innerHTML = this.createHeaderTemplate(headerTotalValue);
    this.subElements.body.innerHTML = this.createBodyTemplate();
  }
}
