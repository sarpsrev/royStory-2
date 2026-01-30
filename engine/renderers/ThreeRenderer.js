import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import globals from '../../globals';
import { assetLoader } from '../asset_loader';
import data from '../../src/config/data';
import QuarksPool from '../utils/QuarksPool';

export class ThreeRenderer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.scene = new THREE.Scene();
    // Set clear color to transparent (important for CSS background to show through)
    // bgOption: 0 = image (null for CSS background), 1 = flat color
    const hasBgImage = data.bgSrcVertical || data.bgSrcHorizontal;
    this.scene.background = hasBgImage
      ? null
      : new THREE.Color(data.flatBgColor);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    globals.threeCamera = this.camera;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // This is crucial for CSS background to show through
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    // //this.renderer.toneMapping = THREE.NeutralToneMapping;
    // this.renderer.toneMappingExposure = 0.8;

    // Enable shadows
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set renderer to be behind Pixi canvas and make it non-interactive
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.zIndex = '0';
    this.renderer.domElement.style.pointerEvents = 'none'; // Disable pointer events
    this.renderer.domElement.style.userSelect = 'none'; // Prevent text selection
    this.renderer.domElement.style.touchAction = 'none'; // Disable touch actions
    this.renderer.domElement.style.backgroundSize = 'cover';
    this.renderer.domElement.style.backgroundPosition = 'center';

    // Set initial background based on orientation
    this.updateBackground(width, height);

    // // Basic light setup with shadows
    // const ambientLight = new THREE.AmbientLight(
    //   data.ambientLightColor,
    //   data.ambientLightIntensity,
    // );
    // const hemisphereLight = new THREE.HemisphereLight(
    //   data.hemisphereLightSkyColor,
    //   data.hemisphereLightGroundColor,
    //   data.hemisphereLightIntensity,
    // );
    // const directionalLight = new THREE.DirectionalLight(
    //   data.directionalLightColor,
    //   data.directionalLightIntensity,
    // );

    // directionalLight.position.set(
    //   data.directionalLightPositionX,
    //   data.directionalLightPositionY,
    //   data.directionalLightPositionZ,
    // );

    // // Target'ı merkeze ayarla ve 90 derece döndür (yukarıdan aşağıya baksın)
    // directionalLight.target.position.set(0, 0, 0);
    // this.scene.add(directionalLight.target);

    // directionalLight.castShadow = true;

    // // // Configure shadow properties
    // // Configure shadow properties
    // directionalLight.shadow.mapSize.width = 2048;
    // directionalLight.shadow.mapSize.height = 2048;
    // directionalLight.shadow.camera.near = 0.5;
    // directionalLight.shadow.camera.far = 500;
    // directionalLight.shadow.camera.left = -100;
    // directionalLight.shadow.camera.right = 100;
    // directionalLight.shadow.camera.top = 100;
    // directionalLight.shadow.camera.bottom = -100;
    // directionalLight.shadow.bias = -0.0001;
    // globals.directionalLight = directionalLight;
    // //Add helper to visualize shadow camera (uncomment for debugging)
    // // const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // // this.scene.add(helper);

    // this.scene.add(hemisphereLight, directionalLight, ambientLight);

    // globals.directionalLight = directionalLight;
    // globals.ambientLight = ambientLight;
    // globals.hemisphereLight = hemisphereLight;

    // Dinamik güncelleme parametreleri - Light config
    this.lightDynamicParamNames = [
      'ambientLightColor',
      'ambientLightIntensity',
      'hemisphereLightSkyColor',
      'hemisphereLightGroundColor',
      'hemisphereLightIntensity',
      'directionalLightColor',
      'directionalLightIntensity',
      'directionalLightPositionX',
      'directionalLightPositionY',
      'directionalLightPositionZ',
    ];

    this.lightDynamicParamValues = [];

    for (let i = 0; i < this.lightDynamicParamNames.length; i++) {
      let paramName = this.lightDynamicParamNames[i];
      let value = data[paramName];
      this.lightDynamicParamValues.push(value);
    }

    // Position camera
    this.camera.position.z = 5;

    // Initialize loader and models
    this.gltfLoader = new GLTFLoader();
    this.models = {};

    // Create the quarks pool
    globals.quarksPool = new QuarksPool(this.scene);
  }

  get view() {
    return this.renderer.domElement;
  }

  updateBackground(width, height) {
    // Determine if landscape or portrait
    const isLandscape = width > height;

    // Select appropriate background based on orientation
    let bgSrc = null;
    if (isLandscape && data.bgSrcHorizontal) {
      bgSrc = data.bgSrcHorizontal;
    } else if (!isLandscape && data.bgSrcVertical) {
      bgSrc = data.bgSrcVertical;
    }

    console.log('updateBackground:', {
      isLandscape,
      bgSrc,
      vertical: data.bgSrcVertical,
      horizontal: data.bgSrcHorizontal,
    });

    // Apply background image if available
    if (bgSrc) {
      this.renderer.domElement.style.backgroundImage = `url(${bgSrc})`;
      // Set scene background to null so CSS background shows through
      this.scene.background = null;
    } else {
      this.renderer.domElement.style.backgroundImage = 'none';
      // Use flat color if no background image
      this.scene.background = new THREE.Color(data.flatBgColor);
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // Update background based on orientation
    this.updateBackground(width, height);

    if (width > height) {
      console.log('landscape');
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
    } else {
      console.log('portrait');
      this.camera.fov = 70;
      this.camera.updateProjectionMatrix();
    }
  }

  update(delta) {
    // Update any animations or model movements here
    for (const modelName in this.models) {
      const model = this.models[modelName];
      if (model.mixer) {
        model.mixer.update(delta);
      }
    }
    this.renderer.render(this.scene, this.camera);

    if (globals.quarksPool && globals.quarksPool.update) {
      globals.quarksPool.update(delta);
    }
  }
}
