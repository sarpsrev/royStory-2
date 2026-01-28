import * as CANNON from "cannon-es";
import { CannonDebugger } from "./CannonDebugger";
import globals from "../../globals";
import { Box3, Vector3 } from "three";

export class PhysicsManager {
  constructor(debug = false) {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    this.removeList = new Set();

    if (debug) {
      this.debugger = new CannonDebugger(globals.threeScene, this.world, {
        // Optional settings
        color: 0x00ff00, // Green wireframes
        scale: 1, // Scale of the debug meshes
      });
    }

    this.bodies = new Map();
    this.fixedTimeStep = 1.0 / 60.0;
    this.maxSubSteps = 3;
  }

  /**
   * Updates the physics simulation
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
    if (this.debugger) {
      this.debugger.update();
    }
    this.removeList.forEach((body) => {
      this.world.removeBody(body);
    });
    this.removeList.clear();
  }

  /**
   * Creates and adds a physics body to the world
   * @param {Object} options - Body configuration options
   * @param {string} options.type - Body type ('box', 'sphere', etc.)
   * @param {Object} options.position - Position {x, y, z}
   * @param {Object} options.size - Size {x, y, z} for box, radius for sphere
   * @param {number} options.mass - Mass of the body
   * @param {string} id - Unique identifier for the body
   * @returns {CANNON.Body} The created physics body
   */
  addBody({ type, state, position, size, mass }, id) {
    let shape;
    switch (type.toLowerCase()) {
      case "box":
        shape = new CANNON.Box(
          new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
        );
        break;
      case "sphere":
        shape = new CANNON.Sphere(size.radius);
        break;
      default:
        throw new Error(`Unsupported physics body type: ${type}`);
    }

    const body = new CANNON.Body({
      mass: mass,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: shape,
      type: state === "static" ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
    });

    this.world.addBody(body);
    if (id) {
      this.bodies.set(id, body);
    }
    return body;
  }

  /**
   * Creates a physics body from a Three.js object
   * @param {THREE.Object3D} object - The Three.js object to create a body from
   * @param {Object} options - Configuration options
   * @param {string} options.type - The body type ('dynamic' or 'static')
   * @param {number} options.mass - The mass of the body
   * @param {boolean} options.isSensor - Whether this body is a trigger (no collision response)
   * @param {Vector3} options.sizeMultiplier - Size multiplier for the body (default: {x:1, y:1, z:1})
   * @param {boolean} options.addToWorld - Whether to add the body to the physics world (default: true)
   * @returns {CANNON.Body} The created physics body
   */
  createBodyFromObject(
    object,
    {
      type = "dynamic",
      mass = 1,
      isSensor = false,
      sizeMultiplier = new Vector3(1, 1, 1),
      addToWorld = true,
    }
  ) {
    // Store original transform
    const originalPosition = object.position.clone();
    const originalQuaternion = object.quaternion.clone();
    const originalScale = object.scale.clone();
    const originalParent = object.parent;

    // Move to scene root temporarily for world space calculations

    globals.threeScene.attach(object);
    
    // Get world transform
    const worldPosition = object.position.clone();
    const worldQuaternion = object.quaternion.clone();

    // Reset position and rotation for accurate bounds calculation
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);
    object.updateMatrixWorld(true);

    // Calculate bounding box
    const boundingBox = new Box3().setFromObject(object);
    const size = new Vector3();
    boundingBox.getSize(size);
    const center = boundingBox.getCenter(new Vector3());

    // Apply size multiplier
    size.multiply(sizeMultiplier).multiplyScalar(0.5);
    if (size.y < 0.01) size.y = 0.01;

    // Create physics shape and body
    const shape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
    const body = new CANNON.Body({
      mass: type === "static" ? 0 : mass,
      type: type === "static" ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
      position: new CANNON.Vec3(
        worldPosition.x,
        worldPosition.y,
        worldPosition.z
      ),
      quaternion: new CANNON.Quaternion(
        worldQuaternion.x,
        worldQuaternion.y,
        worldQuaternion.z,
        worldQuaternion.w
      ),
    });

    // Set trigger properties if needed
    if (isSensor) {
      body.collisionResponse = false;
    }

    // Add shape with offset
    body.addShape(shape, new CANNON.Vec3(center.x, center.y, center.z));

    // Restore object to original parent and transform
    globals.threeScene.remove(object);
    if (originalParent) {

      originalParent.add(object);
      object.position.copy(originalPosition);
      object.quaternion.copy(originalQuaternion);
      object.scale.copy(originalScale);
    }

    // Add body to world if requested
    if (addToWorld) {
      this.world.addBody(body);
    }

    return body;
  }

  /**
   * Removes a physics body from the world
   * @param {string} id - ID of the body to remove
   */
  removeBody(id) {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(id);
    }
  }

  /**
   * Gets a physics body by its ID
   * @param {string} id - ID of the body to get
   * @returns {CANNON.Body|undefined} The physics body if found
   */
  getBody(id) {
    return this.bodies.get(id);
  }

  /**
   * Sets the world gravity
   * @param {Object} gravity - Gravity vector {x, y, z}
   */
  setGravity({ x, y, z }) {
    this.world.gravity.set(x, y, z);
  }

  /**
   * Clears all bodies from the physics world
   */
  clear() {
    this.bodies.forEach((body) => {
      this.world.removeBody(body);
    });
    this.bodies.clear();
  }
}
