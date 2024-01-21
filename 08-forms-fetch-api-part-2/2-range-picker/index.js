export default class RangePicker {
  selected = {
    from: new Date(),
    to: new Date()
  };
  selectedValue = true;
  subElements = {};

  constructor({ from = new Date(), to = new Date() } = {}) {
    this.showFrom = new Date(from);
    this.selected = { from, to };
    this.israngePickerOpen = false;
    this.element = this.createElement(this.createTemplate());

    this.selectSubElements();
    this.createEventListeners();
  }

  dateFormat(date) {
    return date.toLocaleString("ru", { dateStyle: "short" });
  }

  createElement(html) {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild;
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

  createEventListeners() {
    const { input, selector } = this.subElements;
    
    document.addEventListener('click', this.handleDocumentClick);
    input.addEventListener('click', this.handleInputClick);
    selector.addEventListener('click', this.handleSelectorClick);
  }

  destroyEventListeners() {
    const { input, selector } = this.subElements;
    
    input.removeEventListener('click', this.handleInputClick);
    selector.removeEventListener('click', this.handleSelectorClick);
    document.removeEventListener('click', this.handleDocumentClick);
  }

  handleDocumentClick = (e) => {
    if (!e.target.closest('.rangepicker') && this.israngePickerOpen && e.target.classList.contains('control') === false) {
      this.close();
    }
  }

  handleInputClick = () => {
    this.element.classList.toggle('rangepicker_open');
    this.israngePickerOpen = !this.israngePickerOpen;
    this.createRangePickerSelectorTemplate();
  }

  close() {
    this.element.classList.remove('rangepicker_open');
    this.israngePickerOpen = false;
  }

  createTemplate() {
    return `<div class='rangepicker'>
              ${this.createRangePickerInputTemplate()} 
              <div class="rangepicker__selector" data-element="selector"></div>
            </div>`;
  }

  createRangePickerInputTemplate() {
    return `<div class="rangepicker__input" data-element="input">
              <span data-element="from">${this.dateFormat(this.selected.from)}</span> -
              <span data-element="to">${this.dateFormat(this.selected.to)}</span>
            </div>`;
  }

  createCalendarTemplate(curentDate) {
    let date = new Date(curentDate);

    const getDayIndex = (dayIndex) => {
      const index = dayIndex === 0 ? 6 : dayIndex - 1; 
      return index + 1;
    };

    const monthStr = date.toLocaleString("ru", { month: "long" });

    let table = `<div class="rangepicker__calendar">
                    <div class="rangepicker__month-indicator">
                      <time datetime="${monthStr}">${monthStr}</time>
                    </div>
                    <div class="rangepicker__day-of-week">
                      <div>Пн</div>
                      <div>Вт</div>
                      <div>Ср</div>
                      <div>Чт</div>
                      <div>Пт</div>
                      <div>Сб</div>
                      <div>Вс</div>
                    </div>
                    <div class="rangepicker__date-grid">`;

    date.setDate(1);

    while (date.getMonth() === curentDate.getMonth()) {
      
      table += `<button type="button" class="rangepicker__cell" 
                  data-value="${date.toISOString()}"
                  ${date.getDate() === 1 ? `style="--start-from: ${getDayIndex(date.getDay())}"` : ''}>
                  ${date.getDate()}
                </button>`;

      date.setDate(date.getDate() + 1);
    }

    table += "</div></div>";

    return table;
  }

  handleSelectorClick = (e) => {
    const cell = e.target.closest('.rangepicker__cell');
    
    if (cell) {
      const targetValue = e.target.dataset.value;
      const dateValue = new Date(targetValue);

      if (this.selectedValue) {
        this.selected = { from: dateValue, to: null };
        this.selectedValue = false;
      } else {
        if (dateValue > this.selected.from) {
          this.selected.to = dateValue;
          this.selectedValue = true;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = dateValue;
        }

        this.setInputDate();
        this.dispatchEvent();
        this.close();
      }

      this.highliteDates();
    }
  }

  setInputDate = () => {
    const {from, to} = this.subElements;

    from.textContent = this.dateFormat(this.selected.from);
    to.textContent = this.dateFormat(this.selected.to);
  }


  highliteDates() {
    const {selector} = this.subElements;
    const cell = selector.querySelectorAll('.rangepicker__cell');
    
    cell.forEach(element => {
      const value = element.dataset.value;
      
      element.classList.remove(
        'rangepicker__selected-between',
        'rangepicker__selected-from',
        'rangepicker__selected-to'
      );
        
      if (value === this.selected.from?.toISOString()) {
        element.classList.add('rangepicker__selected-from');
      } 

      if (value === this.selected.to?.toISOString()) {
        element.classList.add('rangepicker__selected-to');
      } 

      if (this.selected.from && this.selected.to && value > this.selected.from.toISOString() && value < this.selected.to.toISOString()) {
        element.classList.add('rangepicker__selected-between');
      }
    });
  }

  createRangePickerSelectorTemplate() {
    const currentMonth = new Date(this.showFrom);
    const nextMonth = new Date(this.showFrom);
    nextMonth.setMonth(this.showFrom.getMonth() + 1);

    this.subElements.selector.innerHTML = `
              <div class="rangepicker__selector-arrow"></div>
              <div class="rangepicker__selector-control-left control"></div>
              <div class="rangepicker__selector-control-right control"></div>
              ${this.createCalendarTemplate(currentMonth)}
              ${this.createCalendarTemplate(nextMonth)}`;

    const controlLeft = this.element.querySelector('.rangepicker__selector-control-left');
    const controlRight = this.element.querySelector('.rangepicker__selector-control-right');
          
    controlLeft.addEventListener('click', this.handleControlLeftClick);
    controlRight.addEventListener('click', this.handleControlRightClick);
            
    this.highliteDates();
  }

  handleControlLeftClick = () => {
    this.showFrom.setMonth(this.showFrom.getMonth() - 1);
    this.createRangePickerSelectorTemplate();
  }

  handleControlRightClick = () => {
    this.showFrom.setMonth( this.showFrom.getMonth() + 1);
    this.createRangePickerSelectorTemplate();
  }
  
  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected
    }));
  }

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
