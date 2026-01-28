import gsap from "gsap";
import { PixiPlugin } from "gsap/all";
import * as PIXI from "pixi.js";
import globals from "../globals";
import { insertAssets } from "../src/config/assets";
import data from "../src/config/data";
import PixiGame from "../src/scenes/pixi/PixiGame";
import ThreeGame from "../src/scenes/three/ThreeGame";
import "../styles.css";
import { assetLoader } from "./asset_loader";
import { RenderManager } from "./renderers/RenderManager";
import AudioManager from "./audio/AudioManager";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

let initialized = 0;

if (window.mraid) {
  if (mraid.getState() === "loading") {
    mraid.addEventListener("ready", onSdkReady);
  } else {
    onSdkReady();
  }
  function onSdkReady() {
    mraid.addEventListener("viewableChange", viewableChangeHandler);
    if (mraid.isViewable()) {
      listenMessage();
    }
  }
  function viewableChangeHandler(viewable) {
    if (viewable) {
      listenMessage();
    } else {
    }
  }

  window.mraid.addEventListener("sizeChange", onResize);
} else {
  document.addEventListener("DOMContentLoaded", listenMessage);
  window.addEventListener("resize", onResize);
}

async function listenMessage() {
  console.log("Listening for messages", process.env.NODE_ENV, data);
  if (process.env.NODE_ENV === "development") {
    // In development and export, use the imported data directly
    const { collectStorage } = await import("../storage");
    collectStorage(data);
    insertAssets(data);
    main();
  } else if (
    process.env.NODE_ENV === "export" ||
    (typeof __EXPORTED__ !== "undefined" && __EXPORTED__)
  ) {
    if (!initialized) {
      initialized = 1;
      insertAssets(data);
      main();
    }
  } else {
    window.addEventListener(
      "message",
      async (event) => {
        if (event.data.type === "data") {
          if (!initialized) {
            initialized = 1;
            console.log("Received Data:", event.data.content);
            overrideData(event.data.content);
            insertAssets(data);

            await main();
          }
          overrideData(event.data.content);
          console.log("Received Data:", event.data.content);
        }
      },
      false
    );
  }
}

function overrideData(newData) {
  if (newData) {
    for (const key in newData) {
      data[key] = newData[key];
    }

    regulateColorCodes();
  }
}

function regulateColorCodes() {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      if (typeof element === "string" && element.startsWith("#")) {
        data[key] = Number(element.replace("#", "0x"));
      }
    }
  }
}

async function initialize(resources) {
  const renderManager = new RenderManager(
    window.innerWidth,
    window.innerHeight
  );
  document.body.appendChild(renderManager.view);

  // Set up globals for backward compatibility
  globals.resources = resources;
  globals.pixiApp = renderManager.pixiApp;
  globals.pixiScene = renderManager.pixiScene;
  globals.renderManager = renderManager;
  globals.threeScene = renderManager.threeScene;
  globals.models = resources.models;

  //regulate color codes in data
  regulateColorCodes();

  console.log("Starting games with data:", data); // Debug log

  // Start both games
  const pixiGame = new PixiGame();
  const threeGame = new ThreeGame();

  pixiGame.start();
  threeGame?.start();

  gsap.ticker.add((time, delta) => {
    pixiGame.update(time, delta / 1000);
    threeGame?.update(time, delta / 1000);
    renderManager.update(delta / 1000);
  });

  console.log("Games initialized with scene:", globals.pixiScene);

  // renderManager.threeRenderer.resize(window.innerWidth, window.innerHeight);

  audioSetup();

  window.gameStart = () => {};
  window.gameClose = () => {
    AudioManager.stopBackgroundMusic();
    AudioManager.stopAllSFX();
  };

  globals.EventEmitter.on("gameFinished", () => {
    window.gameEnd && window.gameEnd();
  });
}

function audioSetup() {
  // Set up audio manager to handle background music and sound effects when the app is in the foreground or background
  globals.soundDisabled = false;
  globals.muted = false;

  AudioManager.unmuteSounds();
  AudioManager.playBackgroundMusic(true);

  if (window.mraid) {
    window.mraid.addEventListener("viewableChange", (viewable) => {
      if (!viewable) {
        AudioManager.muteSounds();
      }
    });

    window.mraid.addEventListener("audioVolumeChange", (volume_percentage) => {
      console.log("MRAID audio volume changed:", volume_percentage);

      if (volume_percentage === null || volume_percentage <= 10.0) {
        console.log(
          "Volume too low or undefined for audibility, muting sounds"
        );
        AudioManager.muteSounds();
        globals.soundDisabled = true;
        globals.muted = true;
      } else {
        globals.muted = false;
      }
    });
  } else {
    console.log(
      "MRAID not available - falling back to visibility change detection"
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        console.log("Document hidden, stopping audio");
        AudioManager.muteSounds();
        globals.soundDisabled = true;
      }
    });
  }

  document.addEventListener("pointerdown", () => {
    if (globals.soundDisabled && !globals.muted) {
      console.log("User interaction detected - enabling audio playback");
      globals.soundDisabled = false;
      AudioManager.unmuteSounds();
    }
  });

  globals.pixiScene.once("pointerdown", () => {
    globals.EventEmitter.emit("first_click");
  });
}

async function main() {
  try {
    const resources = await assetLoader.loadAll();
    await initialize(resources);
    window.gameReady && window.gameReady();

    console.log("Initialization complete");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

function onResize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  if (window.mraid) {
    let screenSize = window.mraid.getScreenSize();
    width = screenSize.width;
    height = screenSize.height;
  }
  if (globals.renderManager) {
    globals.renderManager.resize(width, height);
  }
}

export function openStorePage() {
  window.gameEnd && window.gameEnd();
  window.openMarket();
}

export function getDevicePlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "ios";
  } else if (/android/i.test(userAgent)) {
    console.log("The device is running Android.");
    return "android";
  } else {
    console.log("The platform is unknown.");
    return "unknown";
  }
}
