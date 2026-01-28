import * as THREE from "three";

export default class TouchTransformer {
  constructor(camera) {
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.planeVector = new THREE.Vector3();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  }

  updateMousePosition(x, y) {
    this.mouse.x = (x / window.innerWidth) * 2 - 1;
    this.mouse.y = -(y / window.innerHeight) * 2 + 1;
  }

  getPlaneIntersection(moX, moY) {
    this.updateMousePosition(moX, moY);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.raycaster.ray.intersectPlane(this.plane, this.planeVector);

    return this.planeVector;
  }

  getIntersects(mouseX, mouseY, objects) {
    this.updateMousePosition(mouseX, mouseY);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(objects);
    return intersects;
  }

  get2DPosition(pos) {
    let tempV = pos.clone();
    this.camera.updateMatrixWorld();
    tempV.project(this.camera);
    // convert the normalized position to CSS coordinates
    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
    return { x, y };
  }
}
