import * as THREE from "three";
import globals from "../../../../globals";
import gsap from "gsap";
import AudioManager from "../../../../engine/audio/AudioManager";
import data from "../../../config/data";

export default class Character extends THREE.Object3D {
  moveSpeed = 1;
  characterLevel = 0;

  constructor() {
    super();
    this.animations = {};
    // this.model = globals.cloneModel("fill-here");
    // this.add(this.model);
    this.scale.setScalar(1);
    this.position.set(0, 0, 0);
    this.rotation.y = 0;
    globals.threeScene.add(this);
    this.start();
    globals.threeUpdateList.push(this);
  }

  start() {
    // this.addPhysicsBody();
    // this.setupAnimations();
  }

  addPhysicsBody() {
    this.body = globals.physicsManager.createBodyFromObject(this, {
      type: "dynamic",
      mass: 1,
    });
    this.body.position.copy(this.position);
  }

  setupAnimations() {
    console.log("Setting up animations");
    if (this.model.actions) {
      this.animations.model = {
        mixer: this.model.mixer,
        actions: this.model.actions,
        currentAction: null,
      };

      // Play the first animation by default if it exists
      const firstAnimName = Object.keys(this.model.actions)[0];
      console.log("Available animations:", Object.keys(this.model.actions));
      if (firstAnimName) {
        this.playAnimation(firstAnimName);
      }
    } else {
      console.warn("No animations found in the model");
    }
  }

  playAnimation(animationName) {
    const anim = this.animations.model;
    if (!anim || !anim.actions || !anim.actions[animationName]) {
      console.warn(`Animation ${animationName} not found`);
      return;
    }

    if (anim.currentAction) {
      anim.currentAction.fadeOut(0.5);
    }

    anim.currentAction = anim.actions[animationName];
    anim.currentAction.reset().fadeIn(0.5).play().setLoop(THREE.LoopRepeat);
  }

  move(time, delta) {
    if (!globals.joystickData.isMoving) {
      this.body.velocity.set(0, 0, 0);

      // stop animation
      // this.animations.model.currentAction.stop();

      return;
    }
    this.tires.forEach((tire) => {
      tire.rotation.x += delta * 10 * this.moveSpeed * data.harvesterSpeed;
    });

    let theta = data.camTheta;
    if (data.camPhi < 0) theta += Math.PI;

    const movement = this.calculateMovement(
      globals.joystickData.x,
      globals.joystickData.y,
      theta
    );

    // this.animations.model.currentAction.play();
    this.body.velocity.x = movement.x * this.moveSpeed * data.harvesterSpeed;
    this.body.velocity.z = movement.y * this.moveSpeed * data.harvesterSpeed;

    // this.rotation.y = globals.joystickData.angle;

    let newQuat = new THREE.Quaternion();
    newQuat.setFromEuler(
      new THREE.Euler(0, globals.joystickData.angle + theta, 0)
    );

    this.quaternion.slerp(newQuat, delta * 10 * (this.moveSpeed / 2));
  }

  calculateMovement(x, y, theta) {
    // Convert joystick input to polar coordinates
    var r = Math.sqrt(x * x + y * y);
    var phi = Math.atan2(y, x);

    // Calculate the new angle based on camera angle (theta)
    var newPhi = phi - theta;

    // Calculate movement along x and y axes
    var moveX = r * Math.cos(newPhi);
    var moveY = r * Math.sin(newPhi);

    return { x: moveX, y: moveY, angle: newPhi };
  }

  update(ratio, delta) {
    // for (const key in this.animations) {
    //   if (this.animations[key].mixer) {
    //     this.animations[key].mixer.update(delta);
    //   }
    // }
    // this.move(ratio, delta);
    // this.body.velocity.y = 0;
    // this.body.position.y = 0;
    // this.body.quaternion.copy(this.quaternion);
    // this.position.copy(this.body.position);
  }
}
