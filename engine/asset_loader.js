import * as PIXI from 'pixi.js';
import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import assets from '../src/config/assets';
import globals from '../globals';
import AudioManager from './audio/AudioManager';
import {
  SkeletonJson,
  AtlasAttachmentLoader,
  TextureAtlas,
} from '@pixi-spine/all-4.1';
import { settings } from '../settings';
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';

class AssetLoader {
  constructor() {
    this.models = {};
    this.textures = {};
    if (settings.threeEnabled) {
      this.gltfLoader = new GLTFLoader();
      this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      this.textureLoader = new THREE.TextureLoader();
    }

    this.quarksData = {};
  }

  async loadQuarksData() {
    // get JSON URLs from assets.quarks
    // store them in this.quarksData

    for (const quark of assets.quarks) {
      const response = await JSON.parse(quark.src);
      const poolCount = quark.poolCount || 5;
      response.poolCount = poolCount;
      // this.quarksData.push({ name: quark.name, quarkData: response });
      this.quarksData[quark.name] = response;
    }
    // console.log("Quark data loaded successfully:", this.quarksData);
  }

  async loadPixiAssets() {
    return new Promise((resolve, reject) => {
      const loader = new PIXI.Loader();
      assets.pixi.forEach((asset) => {
        loader.add(asset.name, asset.src);
      });

      loader.load((loader, resources) => {
        if (Object.keys(resources).length === assets.pixi.length) {
          resolve(resources);
        } else {
          reject(new Error('Pixi asset loading failed'));
        }
      });
    });
  }

  async loadSpine() {
    const spines = assets.spine;
    const promises = spines.map(async (spine) => {
      return new Promise((resolve, reject) => {
        // Load the image first
        const imageLoader = new PIXI.Loader();
        imageLoader.add(spine.name, spine.image);

        imageLoader.load((loader, resources) => {
          try {
            const texture = resources[spine.name].texture;
            PIXI.utils.TextureCache[spine.name] = texture;

            // Get the raw atlas and json data
            const atlasData = spine.atlas.default || spine.atlas;
            const jsonData = spine.src.default || spine.src;

            const spineAtlas = new TextureAtlas(atlasData, (line, callback) => {
              callback(texture.baseTexture);
            });

            const spineAtlasLoader = new AtlasAttachmentLoader(spineAtlas);
            const spineJsonParser = new SkeletonJson(spineAtlasLoader);
            const spineData = spineJsonParser.readSkeletonData(jsonData);

            texture.spineData = spineData;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    await Promise.all(promises);
  }

  async loadGLTF(assetSrc) {
    return new Promise((resolve, reject) => {
      // console.log("Loading GLB from source");

      // Handle both base64 and URL formats
      let url = assetSrc;
      if (typeof url !== 'string') {
        // console.warn("Asset source is not a string, might be a webpack module");
        url = assetSrc.default || assetSrc;
      }

      // If it's a base64 data URL, we need to handle it properly
      if (url.startsWith('data:application/octet-stream;base64,')) {
        const base64Data = url.split(',')[1];
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        this.gltfLoader.parse(
          bytes.buffer,
          '',
          (gltf) => {
            // console.log("GLB loaded successfully from base64");
            resolve(gltf);
          },
          (error) => {
            // console.error("Error parsing GLB from base64:", error);
            reject(error);
          },
        );
      } else {
        // Handle regular URLs
        this.gltfLoader.load(
          url,
          (gltf) => {
            // console.log("GLB loaded successfully from URL");
            resolve(gltf);
          },
          (progress) => {
            // console.log(
            //   "Loading model:",
            //   (progress.loaded / progress.total) * 100 + "%"
            // );
          },
          (error) => {
            // console.error("Error loading model:", error);
            reject(error);
          },
        );
      }
    });
  }

  async loadThreeAssets() {
    try {
      globals.cloneModel = (modelName) => {
        const model = this.models[modelName];
        if (!model) {
          console.warn('Model not found:', modelName);
          return null;
        }

        const clonedScene = SkeletonUtils.clone(model.gltf.scene);
        clonedScene.name = modelName;

        if (model.animations && Object.keys(model.animations).length > 0) {
          const clonedMixer = new THREE.AnimationMixer(clonedScene);
          clonedScene.animations = {};
          clonedScene.mixer = clonedMixer;
          clonedScene.actions = {};

          // Clone each animation
          Object.entries(model.animations).forEach(([name, clip]) => {
            clonedScene.animations[name] = clip;
            clonedScene.actions[name] = clonedMixer.clipAction(clip);
          });
        }

        return clonedScene;
      };

      globals.cloneAnimation = (model1Name, model2Name) => {
        const model1 = this.models[model1Name];
        const model2 = this.models[model2Name];

        if (!model1 || !model2) {
          console.warn('Model not found:', model1Name, model2Name);
          return null;
        }

        if (!model1.animations || Object.keys(model1.animations).length === 0) {
          console.warn('No animations found for model:', model1Name);
          return null;
        }

        model2.actions = {};
        model2.animations = Object.assign({}, model1.animations);
        model2.mixer = new THREE.AnimationMixer(model2.scene);
        Object.entries(model1.animations).forEach(([name, clip]) => {
          model2.actions[name] = model2.mixer.clipAction(clip, model2.scene);
        });

        return null;
      };

      globals.cloneTexture = (
        textureName,
        config = {
          flipY: false,
          sRGB: true,
        },
      ) => {
        const texture = this.textures[textureName];
        if (!texture) {
          // console.warn("Texture not found:", textureName);
          return null;
        }
        const clonedTexture = texture.clone();
        clonedTexture.flipY = config.flipY;
        config.sRGB && (clonedTexture.colorSpace = THREE.SRGBColorSpace);

        return clonedTexture;
      };

      const loadPromises = assets.three.map(async (asset) => {
        const gltf = await this.loadGLTF(asset.src);
        this.models[asset.name] = {
          gltf,
          scene: gltf.scene,
          animations: {},
          mixer: null,
          actions: {},
        };

        if (gltf.animations?.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          this.models[asset.name].mixer = mixer;

          gltf.animations.forEach((clip) => {
            this.models[asset.name].animations[clip.name] = clip;
            this.models[asset.name].actions[clip.name] = mixer.clipAction(clip);
          });
        }

        // this.centerAndScaleModel(gltf.scene);
        return gltf;
      });

      await Promise.all(loadPromises);
      // console.log("All Three.js models loaded successfully");
    } catch (error) {
      // console.error("Error loading Three.js assets:", error);
      throw error;
    }
  }

  centerAndScaleModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    scene.scale.multiplyScalar(scale);
  }

  async loadThreeTextures() {
    try {
      if (!assets.three_textures || !assets.three_textures.length) {
        // console.log("No Three.js textures to load");
        return;
      }

      const loadPromises = assets.three_textures.map(async (asset) => {
        return new Promise((resolve, reject) => {
          this.textureLoader.load(
            asset.src,
            (texture) => {
              // console.log(`Texture loaded successfully: ${asset.name}`);
              this.textures[asset.name] = texture;
              resolve(texture);
            },
            undefined,
            (error) => {
              // console.error(`Error loading texture ${asset.name}:`, error);
              reject(error);
            },
          );
        });
      });

      await Promise.all(loadPromises);
      // console.log("All Three.js textures loaded successfully");
    } catch (error) {
      // console.error("Error loading Three.js textures:", error);
      throw error;
    }
  }

  async loadFonts() {
    try {
      const fontPromises = assets.fonts.map(async (font) => {
        const fontFace = new FontFace(font.name, `url(${font.src})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        // console.log(`Font loaded successfully: ${font.name}`);
      });

      await Promise.all(fontPromises);
      // console.log("All fonts loaded successfully");
    } catch (error) {
      // console.error("Error loading fonts:", error);
      throw error;
    }
  }

  async loadAll() {
    try {
      // console.log("Starting asset loading process");
      const [pixiResources] = await Promise.all([
        this.loadPixiAssets(),
        this.loadFonts(),
      ]);
      await this.loadSpine();

      // console.log("Pixi assets loaded successfully");
      if (settings.threeEnabled) {
        await this.loadThreeTextures();
        await this.loadThreeAssets();
      }
      await this.loadQuarksData();

      // Load audio assets
      if (assets.audio) {
        AudioManager.init(assets.audio);
      }

      return {
        pixiResources,
        threeAssets: assets.three,
        threeTextures: this.textures,
        models: this.models,
      };
    } catch (error) {
      // console.error("Error loading assets:", error);
      throw error;
    }
  }
}

export const assetLoader = new AssetLoader();
