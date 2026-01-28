import { BatchedParticleRenderer, QuarksLoader } from "three.quarks";
import { assetLoader } from "../asset_loader";
import * as THREE from "three";
import gsap from "gsap";
import globals from "../../globals";

export default class QuarksPool {
  constructor(threeScene) {
    this.threeScene = threeScene;
    this.batchSystem = new BatchedParticleRenderer();
    this.threeScene.add(this.batchSystem);
    this.quarksLoader = new QuarksLoader();
    this.quarksLoader.setCrossOrigin("");

    this.createPool();
  }

  effects = {};

  createPool() {
    let quarkDatas = assetLoader.quarksData;

    Object.keys(quarkDatas).forEach((key) => {
      let quarkData = quarkDatas[key];
      let speedMultiplier = quarkData.speedMultiplier || 1;
      console.log("quarkData:", quarkData);

      let pool = [];
      for (let i = 0; i < quarkData.poolCount; i++) {
        this.quarksLoader.parse(quarkData, (quark) => {
          this.threeScene.add(quark);
          quark.emitters = quark.children;

          quark.emitters.forEach((emitter) => {
            this.batchSystem.addSystem(emitter.system);

            if (quarkData.prewarm) {
              emitter.system.prewarm = true;
            }
          });

          pool.push(quark);
          quark.isBusy = false;

          quark.play = (pos) => {
            quark.position.copy(pos);

            quark.emitters.forEach((emitter) => {
              emitter.system.play();
            });

            quark.setBusyTemporarily();
            quark.keepEmitting();
          };

          quark.stop = () => {
            quark.emitters.forEach((emitter) => {
              emitter.system.stop();
            });
          };

          quark.pause = () => {
            quark.emitters.forEach((emitter) => {
              emitter.system.pause();
            });
          };

          quark.restart = (pos) => {
            quark.position.copy(pos);

            quark.emitters.forEach((emitter) => {
              emitter.system.restart();
            });

            quark.setBusyTemporarily();
            quark.keepEmitting();
          };

          quark.setBusyTemporarily = () => {
            quark.isBusy = true;
            gsap.delayedCall(3, () => {
              quark.isBusy = false;
              // send to the end of the pool
              pool.unshift(pool.pop());
            });
          };

          quark.stopEmitting = () => {
            quark.emitters.forEach((emitter) => {
              emitter.system.emissionOverTime.value = 0;
            });
          };

          quark.keepEmitting = () => {
            quark.emitters.forEach((emitter) => {
              if (emitter.system.emissionOverTime.oValue) {
                emitter.system.emissionOverTime.value = emitter.system.emissionOverTime.oValue;
              }
            });
          };

          quark.emitters.forEach((emitter) => {
            if (emitter.system.emissionOverTime) {
              emitter.system.emissionOverTime.oValue = emitter.system.emissionOverTime.value;
            }
          });

          quark.stop();
        });
      }
      this.effects[key] = pool;
    });
  }

  spawnQuarkAtPos(name, pos, scale = 1) {
    let quark = null;
    if (this.effects[name]) {
      for (let i = 0; i < this.effects[name].length; i++) {
        if (!this.effects[name][i].isBusy) {
          quark = this.effects[name][i];
          break;
        }
      }
    }

    if (quark) {
      quark.scale.set(scale, scale, scale);
      quark.restart(pos);
    }

    return quark;
  }

  attachQuarkToObj(
    name,
    obj,
    scale = 1,
    pos = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Euler(0, 0, 0)
  ) {
    let quark = this.effects[name].find((q) => !q.isBusy);
    if (quark) {
      quark.scale.set(scale, scale, scale);
      obj.add(quark);
      quark.restart(pos);
      quark.rotation.copy(rotation);
    }

    return quark;
  }

  spawnQuarkAndFollowObject(name, obj, scale = 1, rotation = new THREE.Euler(0, 0, 0)) {
    let quark = this.effects[name].find((q) => !q.isBusy);
    if (quark) {
      quark.scale.set(scale, scale, scale);
      quark.restart(obj.position);
      quark.rotation.copy(rotation);
      quark.targetObj = obj;
      quark.givenRot = rotation;
      this.followList.push(quark);
    }

    return quark;
  }

  followList = [];

  update(delta) {
    if (this.batchSystem) {
      this.batchSystem.update(delta);
    }

    if (this.followList.length > 0) {
      this.followList.forEach((quark) => {
        let targetObj = quark.targetObj;
        if (targetObj) {
          quark.position.copy(targetObj.getWorldPosition(new THREE.Vector3()));
          quark.rotation.copy(quark.targetObj.rotation);
          // add rotation quark.givenRot
          quark.rotation.x += quark.givenRot.x;
          quark.rotation.y += quark.givenRot.y;
          quark.rotation.z += quark.givenRot.z;
        }
      });
    }
  }
}
