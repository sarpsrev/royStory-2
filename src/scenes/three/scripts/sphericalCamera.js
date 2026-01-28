import globals from "../../../../globals";
import data from "../../../config/data";
import * as THREE from "three";

export default class SphericalCamera {
  constructor(followObject = null) {
    this.camera = globals.threeCamera;
    this.node = new THREE.Object3D();
    this.node.add(this.camera);
    this.followObject = followObject;
    globals.threeScene.add(this.node);

    this.camData = {
      radius: data.camRadius,
      theta: data.camTheta,
      phi: data.camPhi,
      fov: data.camFov,
      offsetX: data.camOffsetX,
      offsetY: data.camOffsetY,
      offsetZ: data.camOffsetZ,
    };

    this.spherical = new THREE.Spherical(
      this.camData.radius,
      this.camData.phi,
      this.camData.theta
    );
    this.offset = new THREE.Vector3(
      this.camData.offsetX,
      this.camData.offsetY,
      this.camData.offsetZ
    );

    this.camera.position.setFromSpherical(this.spherical);
    this.camera.lookAt(this.followObject?.position.clone());

    this.refPos = this.followObject?.position.clone();

    this.followObject.position.copy(this.refPos.clone().add(this.offset));

    this.camera.near = 2;
    this.camera.far = 10000000;
    this.camera.fov = data.camFov;
    this.camera.updateProjectionMatrix();

    this.start();
  }

  start() {
    globals.threeUpdateList.push(this);
  }

  update() {
    if (this.followObject) {
      this.node.position.copy(this.followObject.position);

      this.spherical.radius = data.camRadius;
      this.spherical.phi = data.camPhi;
      this.spherical.theta = data.camTheta;

      this.offset.x = data.camOffsetX;
      this.offset.y = data.camOffsetY;
      this.offset.z = data.camOffsetZ;

      this.camera.position.setFromSpherical(this.spherical);
      this.camera.lookAt(this.followObject?.position.clone().add(this.offset));
      
      this.camera.fov = data.camFov;

      this.camera.updateProjectionMatrix();
    }
  }
}
