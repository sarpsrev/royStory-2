import gsap from "gsap";
import * as PIXI from "pixi.js";
import globals from "../../../../globals";
import data from "../../../config/data";

let pixiScene = null;

export default class TopBanner {
  constructor() {
    pixiScene = globals.pixiScene;

    globals.pixiUpdateList.push(this);

    let banner = new PIXI.Graphics();
    banner.beginFill(data.topBannerBgColor, data.topBannerBgOpacity);
    banner.drawRoundedRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight * data.topBannerHeight,
      data.topBannerCornerRadius
    );
    banner.endFill();
    if (data.topBannerAlignment == "top") {
      banner.y = 0 + data.topBannerDistanceFromEdge * window.innerHeight;
    } else {
      banner.y =
        window.innerHeight -
        window.innerHeight * data.topBannerHeight -
        data.topBannerDistanceFromEdge * window.innerHeight;
    }

    this.topBanner = banner;
    pixiScene.addChild(banner);

    if (data.showTopBannerAfterFirstMove) {
      this.topBanner.alpha = 0;
      this.topBanner.shown = false;
    }

    let text = new PIXI.Text(data.topBannerText.split("_").join("\n"), {
      fontFamily: "topBannerTextFont",
      fontSize: 64,
      fill: data.topBannerTextColor,
      align: "center",
      stroke: data.topBannerTextStrokeColor,
      strokeThickness: data.topBannerTextStrokeThickness,
    });
    text.anchor.set(0.5);
    text.y = data.topBannerTextPosition * this.topBanner.height;
    text.x = this.topBanner.width * 0.5;
    this.topBanner.addChild(text);
    text.iWidth = text.width;
    text.iHeight = text.height;
    text.scale.set(
      data.topBannerTextScale *
        Math.min((window.innerWidth / text.iWidth) * 0.8, (window.innerHeight / text.iHeight) * 0.8)
    );

    banner.resize = (w, h) => {
      banner.clear();
      banner.beginFill(data.topBannerBgColor, data.topBannerBgOpacity);
      if (w < h) {
        banner.drawRoundedRect(
          0,
          0,
          w,
          h * data.topBannerHeightPortrait,
          data.topBannerCornerRadius
        );
      } else {
        banner.drawRoundedRect(
          0,
          0,
          w,
          h * data.topBannerHeightLandscape,
          data.topBannerCornerRadius
        );
      }
      banner.endFill();

      banner.visible = data.topBannerVisible;

      if (w < h) {
        if (data.topBannerAlignment == "top") {
          banner.y = 0 + data.topBannerDistanceFromEdge * h;
        } else {
          banner.y = h - h * data.topBannerHeightPortrait - data.topBannerDistanceFromEdge * h;
        }

        text.x = w * 0.5;
        text.y = data.topBannerTextPosition * h * data.topBannerHeightPortrait;
        text.scale.set(
          data.topBannerTextScale *
            Math.min(
              (w / text.iWidth) * 0.8,
              (h / text.iHeight) * 0.8 * data.topBannerHeightPortrait
            )
        );
      } else {
        if (data.topBannerAlignment == "top") {
          banner.y = 0 + data.topBannerDistanceFromEdge * h;
        } else {
          banner.y = h - h * data.topBannerHeightLandscape - data.topBannerDistanceFromEdge * h;
        }

        text.x = w * 0.5;
        text.y = data.topBannerTextPosition * h * data.topBannerHeightLandscape;
        text.scale.set(
          data.topBannerTextScale *
            Math.min(
              (w / text.iWidth) * 0.8,
              (h / text.iHeight) * 0.8 * data.topBannerHeightLandscape
            )
        );
      }
    };
    banner.resize(window.innerWidth, window.innerHeight);

    this.topBannerDynamicParamNames = [
      "topBannerBgColor",
      "topBannerBgOpacity",
      "topBannerHeightPortrait",
      "topBannerHeightLandscape",
      "topBannerCornerRadius",
      "topBannerText",
      "topBannerTextColor",
      "topBannerTextStrokeColor",
      "topBannerTextStrokeThickness",
      "topBannerTextPosition",
      "topBannerTextScale",
      "topBannerTextFontSrc",
      "topBannerDistanceFromEdge",
      "topBannerVisible",
      "topBannerAlignment",
    ];

    this.topBannerDynamicParamValues = [];

    for (let i = 0; i < this.topBannerDynamicParamNames.length; i++) {
      let paramName = this.topBannerDynamicParamNames[i];
      let value = data[paramName];
      this.topBannerDynamicParamValues.push(value);
    }

    this.topBanner.updateProps = () => {
      this.topBanner.clear();
      this.topBanner.beginFill(data.topBannerBgColor, data.topBannerBgOpacity);
      if (window.innerWidth < window.innerHeight) {
        this.topBanner.drawRoundedRect(
          0,
          0,
          window.innerWidth,
          window.innerHeight * data.topBannerHeightPortrait,
          data.topBannerCornerRadius
        );
      } else {
        this.topBanner.drawRoundedRect(
          0,
          0,
          window.innerWidth,
          window.innerHeight * data.topBannerHeightLandscape,
          data.topBannerCornerRadius
        );
      }
      this.topBanner.endFill();

      this.topBanner.visible = data.topBannerVisible;

      if (window.innerWidth < window.innerHeight) {
        if (data.topBannerAlignment == "top") {
          this.topBanner.y = 0 + window.innerHeight * data.topBannerDistanceFromEdge;
        } else {
          this.topBanner.y =
            window.innerHeight -
            window.innerHeight * data.topBannerHeightPortrait -
            data.topBannerDistanceFromEdge * window.innerHeight;
        }

        text.text = data.topBannerText.split("_").join("\n");
        text.style.fill = data.topBannerTextColor;
        text.style.stroke = data.topBannerTextStrokeColor;
        text.style.strokeThickness = data.topBannerTextStrokeThickness;
        text.style.fontFamily = "topBannerTextFont";
        text.scale.set(
          data.topBannerTextScale *
            Math.min(
              (window.innerWidth / text.iWidth) * 0.8,
              (window.innerHeight / text.iHeight) * 0.8 * data.topBannerHeightPortrait
            )
        );
      } else {
        if (data.topBannerAlignment == "top") {
          this.topBanner.y = 0 + window.innerHeight * data.topBannerDistanceFromEdge;
        } else {
          this.topBanner.y =
            window.innerHeight -
            window.innerHeight * data.topBannerHeightLandscape -
            data.topBannerDistanceFromEdge * window.innerHeight;
        }

        text.text = data.topBannerText.split("_").join("\n");
        text.style.fill = data.topBannerTextColor;
        text.style.stroke = data.topBannerTextStrokeColor;
        text.style.strokeThickness = data.topBannerTextStrokeThickness;
        text.style.fontFamily = "topBannerTextFont";
        text.scale.set(
          data.topBannerTextScale *
            Math.min(
              (window.innerWidth / text.iWidth) * 0.8,
              (window.innerHeight / text.iHeight) * 0.8 * data.topBannerHeightLandscape
            )
        );
      }

      this.topBanner.resize(window.innerWidth, window.innerHeight);
    };
    this.topBanner.updateProps();

    globals.topBanner = this.topBanner;

    pixiScene.once("pointerdown", () => {
      if (!this.topBanner.shown && data.showTopBannerAfterFirstMove) {
        this.topBanner.shown = true;
        gsap.to(this.topBanner, {
          alpha: 1,
          duration: 0.25,
          onComplete: () => {
            this.topBanner.updateProps();
          },
        });
      }
    });
  }

  update(time, delta) {
    for (let i = 0; i < this.topBannerDynamicParamValues.length; i++) {
      let oldVal = this.topBannerDynamicParamValues[i];
      let newVal = data[this.topBannerDynamicParamNames[i]];
      if (oldVal != newVal) {
        this.topBannerDynamicParamValues[i] = newVal;
        this.topBanner.updateProps();
      }
    }
  }
}
