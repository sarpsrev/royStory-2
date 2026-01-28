import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class CannonDebugger {
    constructor(scene, world, options = {}) {
        this.scene = scene;
        this.world = world;

        this.options = {
            color: 0x00ff00,
            scale: 1,
            ...options
        };

        this.meshes = [];
        this.material = new THREE.MeshBasicMaterial({
            color: this.options.color,
            wireframe: true
        });

        this._tmpVec0 = new CANNON.Vec3();
        this._tmpVec1 = new CANNON.Vec3();
        this._tmpVec2 = new CANNON.Vec3();
        this._tmpQuat0 = new CANNON.Quaternion();
    }

    update() {
        // Remove old meshes
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.meshes.length = 0;

        // Add new meshes
        this.world.bodies.forEach(body => {
            body.shapes.forEach((shape, shapeIndex) => {
                const mesh = this._createMesh(shape);
                if (mesh) {
                    // Get world position
                    const pos = body.interpolatedPosition;
                    const quat = body.interpolatedQuaternion;
                    
                    mesh.position.set(pos.x, pos.y, pos.z);
                    mesh.quaternion.set(quat.x, quat.y, quat.z, quat.w);

                    if (shape.offset) {
                        mesh.position.x += shape.offset.x;
                        mesh.position.y += shape.offset.y;
                        mesh.position.z += shape.offset.z;
                    }

                    if (shape.orientation) {
                        mesh.quaternion.multiply(
                            new THREE.Quaternion(
                                shape.orientation.x,
                                shape.orientation.y,
                                shape.orientation.z,
                                shape.orientation.w
                            )
                        );
                    }

                    this.scene.add(mesh);
                    this.meshes.push(mesh);
                }
            });
        });
    }

    _createMesh(shape) {
        let geometry;
        let mesh;

        switch (shape.type) {
            case CANNON.Shape.types.BOX:
                geometry = new THREE.BoxGeometry(
                    shape.halfExtents.x * 2 * this.options.scale,
                    shape.halfExtents.y * 2 * this.options.scale,
                    shape.halfExtents.z * 2 * this.options.scale
                );
                mesh = new THREE.Mesh(geometry, this.material);
                break;

            case CANNON.Shape.types.SPHERE:
                geometry = new THREE.SphereGeometry(
                    shape.radius * this.options.scale,
                    16, 16
                );
                mesh = new THREE.Mesh(geometry, this.material);
                break;

            case CANNON.Shape.types.PLANE:
                geometry = new THREE.PlaneGeometry(
                    10 * this.options.scale,
                    10 * this.options.scale,
                    10,
                    10
                );
                mesh = new THREE.Mesh(geometry, this.material);
                break;

            default:
                return null;
        }

        return mesh;
    }

    destroy() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
            if (mesh.material) {
                mesh.material.dispose();
            }
        });
        this.meshes.length = 0;
    }
} 