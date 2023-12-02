class Tooltip {
  element;
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener("pointerover", this.handlerPointerOver);
    document.addEventListener("pointerout", this.handlerPointerOut);
  }

  render(text) {
    this.element = this.createElement(this.createTemplate(text));
    document.body.append(this.element);
  }

  createElement(html) {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild;
  }

  createTemplate(text) {
    return `<div class="tooltip">${text}</div>`;
  }

  handlerPointerOver = (e) => {
    const tooltip = e.target.dataset.tooltip;

    if (tooltip) {
      this.render(tooltip);
      document.addEventListener("pointermove", this.moveTooltip);
    }
  };

  moveTooltip = (e) => {
    const shift = 12;
    const x = e.clientX + shift;
    const y = e.clientY + shift;

    this.element.style.top = `${y}px`;
    this.element.style.left = `${x}px`;
  };

  handlerPointerOut = (e) => {
    this.remove();
    document.removeEventListener("pointermove", this.moveTooltip);
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener("pointerover", this.handlerPointerOver);
    document.removeEventListener("pointerout", this.handlerPointerOut);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
