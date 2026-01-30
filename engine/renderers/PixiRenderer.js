import * as PIXI from 'pixi.js';

export class PixiRenderer {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      transparent: true,
      antialias: true,
      resolution: 2,
      autoDensity: true,
    });

    // Ensure Pixi canvas is on top
    this.app.view.style.position = 'absolute';
    this.app.view.style.zIndex = '1';
    globalThis.__PIXI_APP__ = this.app;
    // Create main container for all game objects
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.container.sortableChildren = true;
    this.container.interactive = true;
    this.container.hitArea = new PIXI.Rectangle(0, 0, width, height);
  }

  get view() {
    return this.app.view;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.app.renderer.resize(width, height);
    this.container.hitArea = new PIXI.Rectangle(0, 0, width, height);
  }

  update(delta) {
    // Add any specific update logic here
  }
}
