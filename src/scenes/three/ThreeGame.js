import gsap from 'gsap';
import * as THREE from 'three';
import SphericalCamera from './scripts/sphericalCamera';
import globals from '../../../globals';
import { PhysicsManager } from '../../../engine/physics/PhysicsManager';
import { randFloat, randInt } from 'three/src/math/MathUtils.js';
import AudioManager from '../../../engine/audio/AudioManager';
import data from '../../config/data';

export default class ThreeGame {
  constructor() {
    console.log('ThreeGame constructor');
    this.scene = globals.threeScene;
    this.renderManager = globals.renderManager;
    this.models = this.renderManager.threeRenderer.models;

    // Setup orbit controls if needed
    // this.controls = new OrbitControls(this.renderManager.threeRenderer.camera, this.renderManager.threeRenderer.view);

    // Store animations and mixers
    this.animations = {};
    globals.threeUpdateList = [];
  }

  start() {
    console.log('ThreeGame start');
    this.physicsManager = new PhysicsManager(false);
    globals.physicsManager = this.physicsManager;

    let test_cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
    );
    test_cube.position.set(0, 0, 0);
    // globals.threeScene.add(test_cube);

    // Add a spherical camera
    new SphericalCamera(test_cube);
  }

  update(time, delta) {
    // Update animations
    globals.threeUpdateList.forEach((obj) => obj.update(time, delta));

    this.physicsManager.update(delta);

    // Update any other game logic here
  }
}
