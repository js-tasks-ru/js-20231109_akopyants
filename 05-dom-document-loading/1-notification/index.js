export default class NotificationMessage {
  static currentNotification = null;

  constructor(
    notificationText = "",
    { duration = "", type = "", target = "" } = {}
  ) {
    this.notificationText = notificationText;
    this.duration = duration;
    this.type = type;
    this.target = target;
    this.element = this.createElement(this.createTemplate());
  }

  createElement(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.firstElementChild;
  }

  createTemplate() {
    return `<div class="notification ${this.type}" style="--value: ${this.duration}ms">
                <div class="timer"></div>
                <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.notificationText}
                </div>
                </div>
            </div>`;
  }

  show(target = document.body) {
    if (NotificationMessage.currentNotification) {
      this.remove(NotificationMessage.currentNotification);
    }

    target.append(this.element);
    NotificationMessage.currentNotification = this;

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove(target = this.element) {
    target.remove();

    if (NotificationMessage.currentNotification === this) {
      NotificationMessage.currentNotification = null;
    }
  }

  destroy() {
    this.remove();
  }
}