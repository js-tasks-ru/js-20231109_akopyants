export default class SortableList {
  constructor(items = []) {
    this.items = items;
    this.element = this.render();
    this.createEventListeners();
  }

  createElement(html) {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild;
  }

  createEventListeners() {
    this.element.addEventListener("pointerdown", this.handleElementPointerDown);
    document.addEventListener("pointerup", this.handlePointerUpElement);
  }

  destroyEventListeners() {
    this.element.removeEventListener("pointerdown", this.handleElementPointerDown);
    document.removeEventListener("pointerup", this.handlePointerUpElement);
  }

  handleElementPointerDown = (e) => {
    e.preventDefault();

    const grabHandle = e.target.closest("[data-grab-handle]");
    const deleteHandle = e.target.closest("[data-delete-handle]");

    if (grabHandle) {
      this.startDrag(e);
    }

    if (deleteHandle) {
      e.target.closest(".sortable-list__item").remove();
    }
  };

  startDrag = (e) => {
    this.dragElement = e.target.closest(".sortable-list__item");

    if (this.dragElement) {
      this.rect = this.dragElement.getBoundingClientRect();
      this.offsetLeft = e.clientX - this.rect.left;

      this.placeholder = this.createElement(
        this.createPlaceholderTemplate(this.rect.width, this.rect.height)
      );
      this.element.replaceChild(this.placeholder, this.dragElement);
      this.element.append(this.dragElement);

      this.dragElement.classList.add("sortable-list__item_dragging");
      this.dragElement.style.width = `${this.rect.width}px`;
      this.dragElement.style.height = `${this.rect.height}px`;
      this.dragElement.style.top = `${this.rect.top}px`;
      this.dragElement.style.left = `${this.rect.left}px`;

      document.addEventListener("pointermove", this.handleMoveElement);
    }
  };

  handleMoveElement = (e) => {
    const { clientX, clientY } = e;
    const dragItemTop = clientY - this.rect.height / 2;
    const dragItemLeft = clientX - this.offsetLeft;

    this.dragElement.style.top = `${dragItemTop}px`;
    this.dragElement.style.left = `${dragItemLeft}px`;

    this.dragElement.style.display = 'none';
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY)?.closest('li');
    this.dragElement.style.display = '';
    
    if (!elementBelow) {
      return;
    }

    const rect = elementBelow.getBoundingClientRect();

    if (dragItemTop > rect.top) {
      this.placeholder.before(elementBelow);
    } else {
      elementBelow.before(this.placeholder);
    }
  };

  handlePointerUpElement = (e) => {
    if (!this.dragElement) {
      return;
    }

    document.removeEventListener("pointermove", this.handleMoveElement);
    this.dragElement.removeAttribute("style");
    this.dragElement.classList.remove("sortable-list__item_dragging");
    this.element.insertBefore(this.dragElement, this.placeholder);
    this.placeholder.remove();
    this.dragElement = null;
  };

  render() {
    const ul = this.createElement(
      '<ul class="sortable-list" data-element="sortable-list"></ul>'
    );

    this.items.items.forEach((element) => {
      element.classList.add('sortable-list__item');
      ul.append(element);
    });

    return ul;
  }

  createPlaceholderTemplate = (widht, height) => {
    return `<div class="sortable-list__placeholder" style="width: ${widht}px; height: ${height}px"></div>`;
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
