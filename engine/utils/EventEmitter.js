import gsap from "gsap";

export default class EventEmitter {
  listeners = [];
  emit(eventName, ...args) {
    this.listeners
      .filter(({ name }) => name === eventName)
      .forEach((event) => event.callback(...(args || [])));
  }
  on(name, callback = (...args) => {}) {
    if (typeof callback === "function" && typeof name === "string") {
      this.listeners.push({ name, callback });
    }
  }
  off(eventName, callback) {
    this.listeners = this.listeners.filter(
      (listener) =>
        !(listener.name === eventName && listener.callback === callback)
    );
  }
  destroy() {
    this.listeners.length = 0;
  }
}
