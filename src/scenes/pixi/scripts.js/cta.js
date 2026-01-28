import gsap from "gsap";
import * as PIXI from "pixi.js";
import globals from "../../../../globals";
import data from "../../../config/data";
import { openStorePage } from "../../../../engine";

let pixiScene = null;

const TextureCache = PIXI.utils.TextureCache;

export default class Cta {
  constructor() {
    pixiScene = globals.pixiScene;

    globals.pixiUpdateList.push(this);

    const cont = new PIXI.Container();
    pixiScene.addChild(cont);

    const button = new PIXI.Sprite(TextureCache["ingameCtaButton"]);
    button.anchor.set(0.5);
    button.interactive = true;
    button.buttonMode = true;
    button.on("pointerdown", () => {
      openStorePage();
    });

    if (data.inGameCtaButtonPulseEnabled) {
      gsap.to(button, {
        pixi: { scale: 0.95 },
        duration: 0.8,
        repeat: -1,
        yoyo: true,
      });
    }

    cont.addChild(button);
    cont.iWidth = button.width;
    cont.iHeight = button.height;

    cont.resize = (w, h) => {
      cont.scale.set(
        data.inGameCtaButtonPortraitScaleMultiplier *
          Math.min((w * 0.4) / cont.iWidth, (h * 0.1) / cont.iHeight)
      );
      // cont.y = h - cont.height * 0.75;
      // cont.x = w - cont.width * 0.55;
      cont.x = w * data.inGameCtaButtonPortraitPositionX;
      cont.y = h * data.inGameCtaButtonPortraitPositionY;

      if (w > h) {
        cont.scale.set(
          data.inGameCtaButtonLandscapeScaleMultiplier *
            Math.min((w * 0.11) / cont.iWidth, (h * 0.22) / cont.iHeight)
        );

        // cont.y = h - cont.height * 0.75;
        // cont.x = w - cont.width * 0.8;
        cont.x = w * data.inGameCtaButtonLandscapePositionX;
        cont.y = h * data.inGameCtaButtonLandscapePositionY;
      }

      cont.visible = data.inGameCtaButtonEnabled;

      this.ctaText.updateProps();

      // cont.scale.set(cont.scale.x * data.inGameCtaButtonScaleMultiplier);
    };

    this.ingameCtaButton = cont;
    this.ingameCtaButtonDynamicParamNames = [
      "inGameCtaButtonEnabled",
      "inGameCtaButtonPortraitPositionX",
      "inGameCtaButtonPortraitPositionY",
      "inGameCtaButtonPortraitScaleMultiplier",
      "inGameCtaButtonLandscapePositionX",
      "inGameCtaButtonLandscapePositionY",
      "inGameCtaButtonLandscapeScaleMultiplier",
      "inGameCtaButtonTextPosY",
      "inGameCtaButtonText",
      "inGameCtaButtonTextColor",
      "inGameCtaButtonTextStrokeThickness",
      "inGameCtaButtonTextStrokeColor",
    ];

    this.ingameCtaButtonDynamicParamValues = [];

    for (let i = 0; i < this.ingameCtaButtonDynamicParamNames.length; i++) {
      let paramName = this.ingameCtaButtonDynamicParamNames[i];
      let value = data[paramName];
      this.ingameCtaButtonDynamicParamValues.push(value);
    }

    let textData = data.inGameCtaButtonText;
    textData = textData.split("_").join("\n");
    let text = new PIXI.Text(textData, {
      fontFamily: "game-font",
      fontSize: 32,
      fill: data.inGameCtaButtonTextColor,
      align: "center",
      stroke: data.inGameCtaButtonTextStrokeColor,
      strokeThickness: data.inGameCtaButtonTextStrokeThickness,
      lineJoin: "round",
    });
    text.anchor.set(0.5);
    button.addChild(text);

    text.y = data.inGameCtaButtonTextPosY;

    text.scale.set(
      Math.min(
        (cont.iWidth * 0.7) / text.width,
        (cont.iHeight * 0.8) / text.height
      )
    );

    this.cta = cont;

    this.ctaText = text;
    this.ctaText.updateProps = () => {
      let textData = data.inGameCtaButtonText;
      textData = textData.split("_").join("\n");

      this.ctaText.text = textData;

      this.ctaText.style.fill = data.inGameCtaButtonTextColor;
      this.ctaText.style.strokeThickness =
        data.inGameCtaButtonTextStrokeThickness;
      this.ctaText.style.stroke = data.inGameCtaButtonTextStrokeColor;
      this.ctaText.y = data.inGameCtaButtonTextPosY;
    };

    cont.resize(window.innerWidth, window.innerHeight);

    this.hideCta = () => {
      gsap.to(cont, {
        alpha: 0,
        duration: 0.2,
      });
    };
  }

  update(time, delta) {
    for (let i = 0; i < this.ingameCtaButtonDynamicParamValues.length; i++) {
      let oldVal = this.ingameCtaButtonDynamicParamValues[i];
      let newVal = data[this.ingameCtaButtonDynamicParamNames[i]];
      if (oldVal != newVal) {
        this.ingameCtaButtonDynamicParamValues[i] = newVal;
        this.ingameCtaButton.resize(window.innerWidth, window.innerHeight);
      }
    }
  }
}
