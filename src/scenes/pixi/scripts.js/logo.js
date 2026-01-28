import gsap from "gsap";
import * as PIXI from "pixi.js";
import globals from "../../../../globals";
import data from "../../../config/data";

let pixiScene = null;

const TextureCache = PIXI.utils.TextureCache;

export default class Logo {
  constructor() {
    pixiScene = globals.pixiScene;

    globals.pixiUpdateList.push(this);

    const logo = new PIXI.Sprite(TextureCache["appicon"]);
    logo.anchor.set(0.5);

    logo.iWidth = logo.width;
    logo.iHeight = logo.height;

    logo.resize = (w, h) => {
      logo.scale.set(
        data.ingameLogoPortraitScaleMultiplier *
          Math.min((w * 0.35) / logo.iWidth, (h * 0.18) / logo.iHeight)
      );
      // logo.y = h - logo.height * 0.75;
      // logo.x = logo.width * 0.9;
      logo.x = w * data.ingameLogoPortraitPositionX;
      logo.y = h * data.ingameLogoPortraitPositionY;

      if (w > h) {
        logo.scale.set(
          data.ingameLogoLandscapeScaleMultiplier *
            Math.min((w * 0.4) / logo.iWidth, (h * 0.23) / logo.iHeight)
        );
        // logo.y = h - logo.height * 0.8;
        // logo.x = logo.width * 1.1;
        logo.x = w * data.ingameLogoLandscapePositionX;
        logo.y = h * data.ingameLogoLandscapePositionY;
      }

      logo.visible = data.ingameLogoEnabled;
    };
    logo.resize(window.innerWidth, window.innerHeight);

    this.ingameLogo = logo;
    this.ingameLogoDynamicParamNames = [
      "ingameLogoEnabled",
      "ingameLogoPortraitPositionX",
      "ingameLogoPortraitPositionY",
      "ingameLogoPortraitScaleMultiplier",
      "ingameLogoLandscapePositionX",
      "ingameLogoLandscapePositionY",
      "ingameLogoLandscapeScaleMultiplier",
    ];

    this.ingameLogoDynamicParamValues = [];

    for (let i = 0; i < this.ingameLogoDynamicParamNames.length; i++) {
      let paramName = this.ingameLogoDynamicParamNames[i];
      let value = data[paramName];
      this.ingameLogoDynamicParamValues.push(value);
    }

    pixiScene.addChild(logo);

    this.logo = logo;

    this.hideLogo = () => {
      gsap.to(logo, {
        alpha: 0,
        duration: 0.2,
      });
    };
  }

  update(time, delta) {
    for (let i = 0; i < this.ingameLogoDynamicParamNames.length; i++) {
      let oldVal = this.ingameLogoDynamicParamValues[i];
      let newVal = data[this.ingameLogoDynamicParamNames[i]];
      if (oldVal != newVal) {
        this.ingameLogoDynamicParamValues[i] = newVal;
        this.ingameLogo.resize(window.innerWidth, window.innerHeight);
      }
    }
  }
}
