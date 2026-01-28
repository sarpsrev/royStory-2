import * as PIXI from "pixi.js";

import gsap from "gsap";
import globals from "../../../../globals";

export default class Joystick3D extends PIXI.Container {
  constructor(speed = 12, deltaOn = false, isStatic = false) {
    super();
    this._className = "Joystick3D";
    this.speed = speed;
    this.isStatic = isStatic;
    this.#deltaOn = deltaOn;
    this.alpha = 1;
    this.#init();

    globals.pixiScene.addChild(this);
    globals.threeUpdateList.push(this);

    this.alpha = 0;
  }
  #deltaOn = false;
  #base = null;
  #handle = null;
  #joystickOn = false;
  #velocity = { x: 0, y: 0 };
  #deadZone = 0;

  #init() {
    this.#setSize();
    this.resize(window.innerWidth, window.innerHeight);
    this.#addBase();
    this.#addHandle();
    this.#addListeners();
  }

  #setSize() {
    this.width = 100;
    this.height = 100;

    this.baseWidth = 100;
    this.baseHeight = 100;

    this.pivot.set(this.baseWidth / 2, this.baseHeight / 2);
  }

  resize(w, h) {
    this.scale.set(
      Math.min((w * 0.2) / this.baseWidth, (h * 0.2) / this.baseHeight)
    );
    if (this.isStatic) this.position.set(w * 0.5, h * 0.8);
  }

  #addBase() {
    // Create the joystick base
    let base = new PIXI.Sprite.from("Joystick_Base");
    base.anchor.set(0.5);
    base.position.set(50, 50);
    this.addChild(base);
    this.#base = base;
  }

  #addHandle() {
    // Create the joystick handle
    let handle = new PIXI.Sprite.from("Joystick_Handle");
    handle.anchor.set(0.5);

    handle.x = 0;
    handle.y = 0;
    this.#base.addChild(handle);
    this.#handle = handle;
  }

  #addListeners() {
    globals.pixiScene.on("pointerdown", (event) => {
      if (!event.data.isPrimary) return;
      if (globals.gameEnded) return;

      if (!this.#joystickOn) {
        if (!this.isStatic) {
          this.x = event.data.global.x;
          this.y = event.data.global.y;
        }
        this.#joystickOn = true;
      }
      this.#handle.x = event.data.global.x - this.x;
      this.#handle.y = event.data.global.y - this.y;
    });
    globals.pixiScene.on("pointermove", (event) => {
      if (!event.data.isPrimary || !this.#joystickOn) return;
      if (globals.gameEnded) return;
      // Update the joystick handle position to the touch position
      this.#handle.x = event.data.global.x - this.x;
      this.#handle.y = event.data.global.y - this.y;

      // Calculate the angle and distance of the joystick this.#handle
      let angle = Math.atan2(this.#handle.y, this.#handle.x);
      let distance = Math.sqrt(
        this.#handle.x * this.#handle.x + this.#handle.y * this.#handle.y
      );

      // Limit the distance to the joystick base radius
      if (distance > 50) {
        this.#handle.x = Math.cos(angle) * 50;
        this.#handle.y = Math.sin(angle) * 50;
      }
      this.alpha = 0.6;
      if (distance > this.#deadZone) {
        this.#velocity.x = (this.#handle.x / 50) * this.speed;
        this.#velocity.y = (this.#handle.y / 50) * this.speed;
      } else {
        // dead zone
        this.alpha = 0;
        this.#velocity.x = 0;
        this.#velocity.y = 0;
      }
    });
    globals.pixiScene.on("pointerup", (event) => {
      if (!event.data.isPrimary) return;
      // if (globals.gameEnded) return;

      this.#joystickOn = false;
      // Reset the joystick handle position
      this.#handle.x = 0;
      this.#handle.y = 0;

      // Reset the character velocity
      this.#velocity.x = 0;
      this.#velocity.y = 0;

      this.alpha = 0;
    });
  }

  update(time, delta) {
    if (globals.upgradePopup?.visible) {
      this.#deadZone = 30;
    } else {
      this.#deadZone = 0;
    }

    globals.joystickData = {
      x: this.#velocity.x,
      y: this.#velocity.y,
      isMoving: this.#velocity.x || this.#velocity.y ? true : false,
      angle: Math.atan2(this.#velocity.x, this.#velocity.y),
    };
  }
}
