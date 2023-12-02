export default class DoubleSlider {
  subElements = {};

  constructor({
    min = 0,
    max = 0,
    formatValue = (value) => value,
    selected = {
      from: min,
      to: max,
    },
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = selected;
    this.element = this.createElement(this.createTemplate());
    this.createEventListeners();
    this.selectSubElements();
  }

  createEventListeners() {
    this.element.addEventListener("pointerdown", this.handleSliderPointerDown);
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
    const left = Math.round(((this.selected.from - this.min) / (this.max - this.min)) * 100) + "%";
    const right = Math.round(((this.max - this.selected.to) / (this.max - this.min)) * 100) + "%";

    return `<div class="range-slider">
          	<span data-element="from">${this.formatValue(this.selected.from)}</span>
							<div class="range-slider__inner">
									<span data-element="progress" class="range-slider__progress" style="left: ${left}; right: ${right};"></span>
									<span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${left};"></span>
									<span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${right};"></span>
							</div>
						<span data-element="to">${this.formatValue(this.selected.to)}</span>
        	</div>`;
  }

  handleSliderPointerDown = (event) => {
    this.currentThumb = event.target;

    document.addEventListener("pointermove", this.handleSliderPointerMove);
    document.addEventListener("pointerup", this.handleSliderPointerUp);
  };

  updateSliderPosition(position, thumb, direction) {
    const percentage = (direction === "left" ? position : 1 - position) * 100;
    const side = direction === "left" ? "left" : "right";

    thumb.style[side] = this.subElements.progress.style[side] = `${percentage}%`;

    const value = Math.round(this.min + position * (this.max - this.min));
    this.subElements[direction === "left" ? "from" : "to"].textContent = `${this.formatValue(value)}`;

    return value;
  }

  handleSliderPointerMove = (event) => {
    const rangeSliderInner = this.element.querySelector(".range-slider__inner");
    const { left: innerLeft, width } = rangeSliderInner.getBoundingClientRect();
    let position = (event.clientX - innerLeft) / width;
    position = Math.min(Math.max(position, 0), 1);

    const thumb = this.currentThumb;

    if (thumb.classList.contains("range-slider__thumb-left")) {
      position = Math.min(position, 1 - parseFloat(this.subElements.thumbRight.style.right) / 100);
      this.selected.from = this.updateSliderPosition(position, thumb, "left");
    }

    if (thumb.classList.contains("range-slider__thumb-right")) {
      position = Math.max(position, parseFloat(this.subElements.thumbLeft.style.left) / 100);
      this.selected.to = this.updateSliderPosition(position, thumb, "right");
    }
  };

  handleSliderPointerUp = () => {
    this.element.classList.remove("range-slider_dragging");
    document.removeEventListener("pointermove", this.handleSliderPointerMove);
    document.removeEventListener("pointerup", this.handleSliderPointerUp);

    const rangeSelect = new CustomEvent("range-select", {
      bubles: true,
      detail: this.selected,
    });

    this.element.dispatchEvent(rangeSelect);
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element.removeEventListener("pointerdown", this.handleSliderPointerDown);
  }
}
