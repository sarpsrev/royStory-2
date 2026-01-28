import { Container } from "pixi.js";

export default class Container2 extends Container {
  constructor(options = {}) {
    super();

    // Initial width height values
    this._width = options.width || 300;
    this._height = options.height || 300;

    // Scaling
    this.scale.set(options.scaleX || 1, options.scaleY || 1);

    this.sortableChildren = true;
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = value;
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = value;
  }

  // Override addChild method
  addChild(...children) {
    super.addChild(...children);
    // Make no changes here if you don't want to update the scalings or width&height
  }

  // Function to change the size of the container manually
  setSize(width, height) {
    this._width = width;
    this._height = height;
  }
}

// // Usage example
// const myContainer = new Container2({
//   scaleX: 1.5,
//   scaleY: 1.5,
// });

// // Manual size change
// myContainer.setSize(400, 250);

// console.log(myContainer.width, myContainer.height);
