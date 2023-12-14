import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};

  constructor(productId) {
    this.productId = productId;
  }

  selectSubElements() {
    const subElements = Array.from(this.element.querySelectorAll('[data-element]'));

    subElements.forEach((element) => {
      const name = element.dataset.element;
      this.subElements[name] = element;
    });
  }

  async render() {
    this.catagories = await this.getCategories();

    if (this.isEditMode()) {
      this.productInfo = (await this.getProductInfo())[0];
    }

    this.element = this.createElement(this.createTemplate());
    this.selectSubElements();
    this.createEventListeners();

    if (this.isEditMode()) {
      this.fillFormData();
    }

    return this.element;
  }

  async save(e) {
    const formData = this.createFormData();

    const url = new URL('api/rest/products', BACKEND_URL);
    const method = this.isEditMode() ? 'PATCH' : 'PUT';

    await fetchJson(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    this.createEvent();
  }

  createFormData() {
    const form = this.subElements.productForm;
    const formData = new FormData(form);

    const imagesUrls = formData.getAll('url');
    const imagesSource = formData.getAll('source');

    const images = imagesUrls.map((url, index) => ({
      url,
      source: imagesSource[index],
    }));

    return {
      id: this.productId,
      title: formData.get('title'),
      description: formData.get('description'),
      quantity: Number(formData.get('quantity')),
      subcategory: formData.get('subcategory'),
      status: Number(formData.get('status')),
      price: Number(formData.get('price')),
      discount: Number(formData.get('discount')),
      images,
    };
  }

  createEvent() {
    const event = this.isEditMode() ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(event, { bubbles: true }));
  }

  createEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.handleFormSubmit);
    this.subElements.imageListContainer.addEventListener('pointerdown', this.handleImageListClick);
    this.subElements.uploadImage.addEventListener('pointerdown', this.handleUploadImageClick);
  }

  destroyEventListeners() {
    this.subElements.productForm.removeEventListener('submit', this.handleFormSubmit);
    this.subElements.imageListContainer.removeEventListener('pointerdown', this.handleImageListClick);
    this.subElements.inputFile.removeEventListener('change', this.handleImageChange);
    this.subElements.uploadImage.removeEventListener('pointerdown', this.handleUploadImageClick);
  }

  handleImageListClick = (e) => {
    this.deleteImage(e);
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.save(e);
  };

  handleUploadImageClick = (e) => {
    this.loadImage();
  };

  loadImage = (e) => {
    const input = this.subElements.inputFile;
    input.click();
    this.subElements.uploadImage.classList.add('is-loading');
    input.addEventListener('change', this.handleImageChange);
  };

  handleImageChange = async (e) => {
    const file = e.target.files[0];
    const response = await this.loadImageToServer(file);

    try {
      if (response.success) {
        const url = response.data.link;
        const source = file.name;
        const img = [
          {
            url,
            source,
          },
        ];
  
        await this.subElements.sortableList.append(this.createElement(this.cteateImageListItemTemplate(img)));
        
      } 
    } catch (error) {
      this.subElements.uploadImage.classList.remove('is-loading');
    } finally {
      this.subElements.uploadImage.classList.remove('is-loading');
    }   
  };

  async loadImageToServer(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    return await response.json();
  }

  deleteImage = (e) => {
    const imageItem = e.target.closest('li');

    if (e.target.closest('button')) {
      imageItem.remove();
    }
  };

  isEditMode() {
    return Boolean(this.productId);
  }

  createElement(html) {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.firstElementChild;
  }

  async getProductInfo() {
    const params = new URLSearchParams({
      id: this.productId,
    });
    const url = new URL(`${BACKEND_URL}/api/rest/products?${params}`);
    const data = await fetchJson(url);
    return data;
  }

  async getCategories() {
    const params = new URLSearchParams({
      _sort: 'weight',
      _refs: 'subcategory',
    });
    const url = new URL(`${BACKEND_URL}/api/rest/categories?${params}`);
    const data = await fetchJson(url);
    return data;
  }

  fillFormData() {
    if (this.productInfo) {
      const form = this.subElements.productForm;
      const fields = ['title', 'description', 'quantity', 'subcategory', 'status', 'price', 'discount'];
      const subcategory = this.productInfo.subcategory;

      fields.forEach((field) => {
        form.elements[field].value = this.productInfo[field];
      });

      const options = form.elements['subcategory'].querySelectorAll('option');

      options.forEach((option) => {
        if (option.value === this.productInfo.subcategory) {
          option.selected = true;
        }
      });

      const selectedOption = Array.from(form.elements['subcategory'].options).find(
        (option) => option.value === subcategory
      );

      if (selectedOption) {
        selectedOption.selected = true;
      }
    }
  }

  createTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" id="form" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        ${this.createImageListTemplate()}
        </div>
        <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
          <input data-element="inputFile" type="file" accept="image/*" style="display: none" />
        </button>
      </div>
      ${this.createCategoryTemplate()}
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button data-element="submitButton" type="submit" name="save" class="button-primary-outline">
          ${this.isEditMode() ? 'Сохранить товар' : 'Добавить товар'}
        </button>
      </div>
    </form>
  </div>`;
  }

  createImageListTemplate() {
    return `<ul data-element="sortableList" class="sortable-list">
              ${this.cteateImageListItemTemplate()}
            </ul>`;
  }

  cteateImageListItemTemplate(images = this.productInfo?.images) {
    if (!images) return '';

    return images
      .map((item) => {
        return `<li class="products-edit__imagelist-item sortable-list__item">
                <input type="hidden" name="url" value="${escapeHtml(item.url)}">
                <input type="hidden" name="source" value="${escapeHtml(item.source)}">
                <span>
                  <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                  <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(item.url)}">
                  <span>${escapeHtml(item.source)}</span>
                </span>
                <button type="button">
                  <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
              </li>`;
      })
      .join('');
  }

  createCategoryTemplate() {
    return `<div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select id="subcategory" class="form-control" name="subcategory">
                ${this.createSelectOptionsTemplate()}
              </select>
            </div>`;
  }

  getOptionsValue() {
    const values = [];

    this.catagories.forEach((category) => {
      if (category.hasOwnProperty('subcategories')) {
        const subcategories = category.subcategories;

        subcategories.forEach((subcategory) => {
          values.push({
            id: subcategory.id,
            title: `${category.title}  > ${subcategory.title}`,
          });
        });
      }
    });

    return values;
  }

  createSelectOptionsTemplate() {
    return this.getOptionsValue()
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`)
      .join('');
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