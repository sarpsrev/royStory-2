import * as PIXI from 'pixi.js';
import globals from '../../../globals';
import gsap from 'gsap';
import { openStorePage } from '../../../engine';
import data from '../../config/data';
import Container2 from '../../config/Container2';

const TextureCache = PIXI.utils.TextureCache;
let pixiScene;

export default class Endcard {
  constructor(didWon = false) {
    this.didWon = didWon;
    console.log('Endcard constructor');
    pixiScene = globals.pixiScene;
    this.init();

    globals.pixiUpdateList.push(this);
  }

  init() {
    if (globals.topBanner) {
      globals.topBanner.visible = false;
    }

    console.log('Endcard start');
    this.addBackground();
    // this.addLogo();
    this.addHeaderLogo();
    // this.addButton();
    //this.addText();

    if (data.autoRedirectOnEndcard) {
      gsap.delayedCall(1, () => {
        openStorePage();
      });
    }

    if (data.clickAnywhereOnEndcardToRedirect) {
      pixiScene.interactive = true;
      pixiScene.buttonMode = true;
      pixiScene.on('pointerdown', () => {
        openStorePage();
      });
    }
  }

  addButton() {
    let cont = new Container2({ width: 300, height: 80 });
    pixiScene.addChild(cont);

    cont.zIndex = 3;

    let button = new PIXI.Sprite.from(TextureCache['endcardCtaButton']);
    button.anchor.set(0.5);

    button.interactive = true;
    button.on('pointerdown', () => {
      openStorePage();
    });

    cont.addChild(button);

    cont.resize = (w, h) => {
      cont.scale.set(
        Math.min((w * 0.4) / 300, (h * 0.08) / 80) *
          data.endcardCtaButtonPortraitScale,
      );
      cont.x = w * data.endcardCtaButtonPosX;
      cont.y = h * data.endcardCtaButtonPosY;

      if (w > h) {
        cont.scale.set(
          Math.min((w * 0.4) / 300, (h * 0.08) / 80) *
            data.endcardCtaButtonLandscapeScale,
        );
      }
    };
    cont.resize(window.innerWidth, window.innerHeight);

    this.ctaButton = cont;

    let txt = data.winCtaText;

    if (!this.didWon) {
      txt = data.loseCtaText;
    }

    txt = txt.split('_').join('\n');

    const text = new PIXI.Text(txt, {
      fontFamily: 'game-font',
      fontSize: 64,
      fill: data.endcardCtaTextColor,
      align: 'center',
      stroke: data.endcardCtaTextStrokeColor,
      strokeThickness: data.endcardCtaTextStrokeThickness,
      lineJoin: 'round',
    });
    text.anchor.set(0.5);
    button.addChild(text);

    this.ctaText = text;

    text.updateProps = () => {
      text.style.fill = data.endcardCtaTextColor;
      text.style.stroke = data.endcardCtaTextStrokeColor;
      text.style.strokeThickness = data.endcardCtaTextStrokeThickness;
      text.scale.set(data.endcardCtaTextScale * 1);

      if (this.didWon) {
        text.text = data.winCtaText.split('_').join('\n');
      } else {
        text.text = data.loseCtaText.split('_').join('\n');
      }

      text.x = data.endcardCtaTextPosX;
      text.y = data.endcardCtaTextPosY;
    };

    text.x = data.endcardCtaTextPosX;
    text.y = data.endcardCtaTextPosY;

    text.scale.set(data.endcardCtaTextScale * 1);

    //animate button
    gsap.fromTo(
      button,
      { pixi: { scale: 0 } },
      {
        pixi: { scale: 1 },
        duration: 0.6,
        ease: 'sine.out',
        onComplete: () => {
          gsap.to(button, {
            pixi: { scale: 1.1 },
            duration: 1,
            // ease: "power1.in",
            repeat: -1,
            yoyo: true,
          });
        },
      },
    );

    this.ctaButtonDynamicParamNames = [
      'endcardCtaButtonPosX',
      'endcardCtaButtonPosY',
      'endcardCtaButtonPortraitScale',
      'endcardCtaButtonLandscapeScale',
    ];

    this.ctaTextDynamicParamNames = [
      'endcardCtaTextColor',
      'endcardCtaTextStrokeColor',
      'endcardCtaTextStrokeThickness',
      'endcardCtaTextScale',
      'winCtaText',
      'loseCtaText',
      'endcardCtaTextPosX',
      'endcardCtaTextPosY',
    ];

    this.ctaButtonDynamicValues = [];
    this.ctaTextDynamicValues = [];

    for (let i = 0; i < this.ctaButtonDynamicParamNames.length; i++) {
      this.ctaButtonDynamicValues.push(
        data[this.ctaButtonDynamicParamNames[i]],
      );
    }

    for (let i = 0; i < this.ctaTextDynamicParamNames.length; i++) {
      this.ctaTextDynamicValues.push(data[this.ctaTextDynamicParamNames[i]]);
    }
  }

  addLogo() {
    if (!data.customEndcardLogoSrc) return;

    const cont = new PIXI.Container();
    pixiScene.addChild(cont);

    cont.zIndex = 3;

    const logo = PIXI.Sprite.from(TextureCache['endcardLogo']);
    logo.anchor.set(0.5);

    cont.width = cont.iWidth = logo.width;
    cont.width = cont.iHeight = logo.height;
    cont.addChild(logo);

    cont.resize = (w, h) => {
      cont.scale.set(
        Math.min((w * 0.5) / cont.iWidth, (h * 0.1) / cont.iHeight) *
          data.endcardLogoPortraitScale *
          2.6,
      );
      cont.x = w * data.endcardLogoPosX;
      cont.y = h * data.endcardLogoPosY;

      if (w > h) {
        cont.scale.set(
          Math.min((w * 0.5) / cont.iWidth, (h * 0.1) / cont.iHeight) *
            data.endcardLogoLandscapeScale *
            2.6,
        );
      }
    };
    cont.resize(window.innerWidth, window.innerHeight);

    this.logoCont = cont;

    //animate logo
    gsap.fromTo(
      logo,
      { pixi: { scale: 0 } },
      { pixi: { scale: 1 }, duration: 0.8, ease: 'back.out(1.3)' },
    );

    this.logoContDynamicParamNames = [
      'endcardLogoPosX',
      'endcardLogoPosY',
      'endcardLogoPortraitScale',
      'endcardLogoLandscapeScale',
    ];

    this.logoDynamicValues = [];

    for (let i = 0; i < this.logoContDynamicParamNames.length; i++) {
      this.logoDynamicValues.push(data[this.logoContDynamicParamNames[i]]);
    }
  }
  addText() {
    this.endcardHeaderDynamicParamNames = [
      'endcardHeaderText',
      'endcardHeaderTextColor',
      'endcardHeaderTextStrokeColor',
      'endcardHeaderTextStrokeThickness',
      'endcardHeaderTextPortraitScale',
      'endcardHeaderTextLandscapeScale',
      'endCardHeaderTextPosX',
      'endCardHeaderTextPosY',
    ];

    this.endcardHeaderDynamicValues = [];

    for (let i = 0; i < this.endcardHeaderDynamicParamNames.length; i++) {
      this.endcardHeaderDynamicValues.push(
        data[this.endcardHeaderDynamicParamNames[i]],
      );
    }

    this.headerParent = new Container2({ width: 300, height: 80 });

    this.headerParent.zIndex = 3;

    this.headerParent.resize = (w, h) => {
      this.headerParent.scale.set(
        Math.min(w / 300, h / 80) * data.endcardHeaderTextPortraitScale * 1.3,
      );
      this.headerParent.x = w * data.endCardHeaderTextPosX;
      this.headerParent.y = h * data.endCardHeaderTextPosY;

      if (w > h) {
        this.headerParent.scale.set(
          Math.min(w / 300, h / 80) *
            data.endcardHeaderTextLandscapeScale *
            0.6,
        );
      }
    };

    this.headerParent.resize(window.innerWidth, window.innerHeight);

    this.headerText = new PIXI.Text(
      data.endcardHeaderText.split('_').join('\n'),
      {
        fontFamily: 'game-font',
        fontSize: data.endcardHeaderTextFontSize,
        fill: data.endcardHeaderTextColor,
        align: 'center',
        stroke: data.endcardHeaderTextStrokeColor,
        strokeThickness: data.endcardHeaderTextStrokeThickness,
        lineJoin: 'round',
      },
    );
    this.headerText.anchor.set(0.5);
    this.headerText.x = 0;
    this.headerText.y = 0;

    this.headerParent.addChild(this.headerText);
    pixiScene.addChild(this.headerParent);

    this.headerText.updateProps = () => {
      this.headerText.text = data.endcardHeaderText.split('_').join('\n');
      this.headerText.style.fill = data.endcardHeaderTextColor;
      this.headerText.style.stroke = data.endcardHeaderTextStrokeColor;
      this.headerText.style.strokeThickness =
        data.endcardHeaderTextStrokeThickness;
      this.headerParent.resize(window.innerWidth, window.innerHeight);
    };

    this.headerText.scale.set(0.001);

    gsap.to(this.headerText.scale, {
      x: 0.4,
      y: 0.4,
      duration: 0.8,
      ease: 'back.out(1.3)',
    });
  }

  addHeaderLogo() {
    if (!data.customEndcardHeaderLogoSrc) return;

    const cont = new PIXI.Container();
    pixiScene.addChild(cont);

    cont.zIndex = 3;

    const logo = PIXI.Sprite.from(TextureCache['endcardHeaderLogo']);
    logo.anchor.set(0.5);

    cont.width = cont.iWidth = logo.width;
    cont.width = cont.iHeight = logo.height;
    cont.addChild(logo);

    cont.resize = (w, h) => {
      cont.scale.set(
        Math.min((w * 0.5) / cont.iWidth, (h * 0.1) / cont.iHeight) *
          data.endcardHeaderLogoPortraitScale *
          3.3,
      );
      cont.x = w * data.endcardHeaderLogoPosX;
      cont.y = h * data.endcardHeaderLogoPosY;

      if (w > h) {
        cont.scale.set(
          Math.min((w * 0.5) / cont.iWidth, (h * 0.1) / cont.iHeight) *
            data.endcardHeaderLogoLandscapeScale *
            3.3,
        );
      }
    };
    cont.resize(window.innerWidth, window.innerHeight);

    this.headerLogoCont = cont;

    const maintext = new PIXI.Text(
      data.endcardHeaderText.split('_').join('\n'),
      {
        fontFamily: 'game-font',
        fontSize: data.endcardHeaderTextFontSize,
        fill: data.endcardHeaderTextColor,
        align: 'center',
        stroke: data.endcardHeaderTextStrokeColor,
        strokeThickness: data.endcardHeaderTextStrokeThickness,
        lineJoin: 'round',
      },
    );

    maintext.text = data.endcardHeaderText.split('_').join('\n');

    maintext.anchor.set(0.5);
    maintext.x = data.endcardHeaderTextPosX;
    maintext.y = data.endcardHeaderTextPosY;
    logo.addChild(maintext);

    // Store reference for dynamic updates
    this.headerMainText = maintext;
    this.headerMainText.updateProps = () => {
      this.headerMainText.text = data.endcardHeaderText.split('_').join('\n');
      this.headerMainText.style.fontSize = data.endcardHeaderTextFontSize;
      this.headerMainText.style.fill = data.endcardHeaderTextColor;
      this.headerMainText.style.stroke = data.endcardHeaderTextStrokeColor;
      this.headerMainText.style.strokeThickness =
        data.endcardHeaderTextStrokeThickness;
      this.headerMainText.x = data.endcardHeaderTextPosX;
      this.headerMainText.y = data.endcardHeaderTextPosY;
    };

    const ecButton = PIXI.Sprite.from(TextureCache['endcardCtaButton']);
    ecButton.anchor.set(0.5);
    ecButton.x = data.endcardButtonPosX;
    ecButton.y = data.endcardButtonPosY;
    ecButton.scale.set(data.endcardButtonScale);
    gsap.to(ecButton, {
      pixi: { scale: data.endcardButtonScale * 1.07 },
      duration: 0.8,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    });
    logo.addChild(ecButton);

    // Store reference for dynamic updates
    this.endcardButton = ecButton;
    this.endcardButton.updateProps = () => {
      this.endcardButton.x = data.endcardButtonPosX;
      this.endcardButton.y = data.endcardButtonPosY;
      this.endcardButton.scale.set(data.endcardButtonScale);
    };

    const buttonText = new PIXI.Text(
      data.endcardButtonText.split('_').join('\n'),
      {
        fontFamily: 'game-font',
        fontSize: data.endcardButtonTextFontSize,
        fill: data.endcardButtonTextColor,
        align: 'center',
        stroke: data.endcardButtonTextStrokeColor,
        strokeThickness: data.endcardButtonTextStrokeThickness,
        lineJoin: 'round',
      },
    );

    buttonText.anchor.set(0.5);
    buttonText.x = data.endcardButtonTextPosX;
    buttonText.y = data.endcardButtonTextPosY;

    ecButton.addChild(buttonText);

    // Store reference for dynamic updates
    this.endcardButtonText = buttonText;
    this.endcardButtonText.updateProps = () => {
      this.endcardButtonText.text = data.endcardButtonText
        .split('_')
        .join('\n');
      this.endcardButtonText.style.fontSize = data.endcardButtonTextFontSize;
      this.endcardButtonText.style.fill = data.endcardButtonTextColor;
      this.endcardButtonText.style.stroke = data.endcardButtonTextStrokeColor;
      this.endcardButtonText.style.strokeThickness =
        data.endcardButtonTextStrokeThickness;
      this.endcardButtonText.x = data.endcardButtonTextPosX;
      this.endcardButtonText.y = data.endcardButtonTextPosY;
    };

    //animate logo
    gsap.fromTo(
      logo,
      { pixi: { scale: 0 } },
      { pixi: { scale: 1 }, duration: 0.8, ease: 'back.out(1.3)' },
    );

    this.headerLogoDynamicParamNames = [
      'endcardHeaderLogoPosX',
      'endcardHeaderLogoPosY',
      'endcardHeaderLogoPortraitScale',
      'endcardHeaderLogoLandscapeScale',
    ];

    this.headerLogoDynamicValues = [];

    for (let i = 0; i < this.headerLogoDynamicParamNames.length; i++) {
      this.headerLogoDynamicValues.push(
        data[this.headerLogoDynamicParamNames[i]],
      );
    }

    // Dynamic tracking for header text
    this.headerMainTextDynamicParamNames = [
      'endcardHeaderText',
      'endcardHeaderTextFontSize',
      'endcardHeaderTextColor',
      'endcardHeaderTextStrokeColor',
      'endcardHeaderTextStrokeThickness',
      'endcardHeaderTextPosX',
      'endcardHeaderTextPosY',
    ];
    this.headerMainTextDynamicValues = [];
    for (let i = 0; i < this.headerMainTextDynamicParamNames.length; i++) {
      this.headerMainTextDynamicValues.push(
        data[this.headerMainTextDynamicParamNames[i]],
      );
    }

    // Dynamic tracking for endcard button
    this.endcardButtonDynamicParamNames = [
      'endcardButtonPosX',
      'endcardButtonPosY',
      'endcardButtonScale',
    ];
    this.endcardButtonDynamicValues = [];
    for (let i = 0; i < this.endcardButtonDynamicParamNames.length; i++) {
      this.endcardButtonDynamicValues.push(
        data[this.endcardButtonDynamicParamNames[i]],
      );
    }

    // Dynamic tracking for button text
    this.endcardButtonTextDynamicParamNames = [
      'endcardButtonText',
      'endcardButtonTextFontSize',
      'endcardButtonTextColor',
      'endcardButtonTextStrokeColor',
      'endcardButtonTextStrokeThickness',
      'endcardButtonTextPosX',
      'endcardButtonTextPosY',
    ];
    this.endcardButtonTextDynamicValues = [];
    for (let i = 0; i < this.endcardButtonTextDynamicParamNames.length; i++) {
      this.endcardButtonTextDynamicValues.push(
        data[this.endcardButtonTextDynamicParamNames[i]],
      );
    }
  }

  addBackground() {
    if (data.backgroundType == 0) {
      const background = new PIXI.Graphics();

      background.zIndex = 2;

      background.beginFill(0xffffff);
      background.drawRect(0, 0, window.innerWidth, window.innerHeight);
      background.endFill();
      background.alpha = 0;
      background.tint = data.endcardFlatBgColor;

      background.resize = (w, h) => {
        background.scale.set(500);
        background.position.set(0, 0);
      };
      background.resize(window.innerWidth, window.innerHeight);

      pixiScene.addChild(background);

      //animate background
      gsap.fromTo(
        background,
        { pixi: { alpha: 0 } },
        {
          pixi: {
            alpha: data.endcardFlatBgOpacity,
          },
          duration: 0.4,
          onComplete: () => {
            this.backgroundDynamicValues = [];
            this.backgroundDynamicParamNames = [
              'endcardFlatBgColor',
              'endcardFlatBgOpacity',
            ];
            for (let i = 0; i < this.backgroundDynamicParamNames.length; i++) {
              this.backgroundDynamicValues.push(
                data[this.backgroundDynamicParamNames[i]],
              );
            }
            this.background = background;
            this.background.updateProps = () => {
              this.background.tint = data.endcardFlatBgColor;
              this.background.alpha = data.endcardFlatBgOpacity;
            };
          },
        },
      );
    } else {
      const background = PIXI.Sprite.from(TextureCache['endcardBg']);

      background.zIndex = 2;
      background.anchor.set(0.5);
      background.iWidth = background.width;
      background.iHeight = background.height;
      background.resize = (w, h) => {
        background.x = w * 0.5;
        background.y = h * 0.5;
        background.scale.set(
          Math.max(w / background.iWidth, h / background.iHeight),
        );
      };
      background.resize(window.innerWidth, window.innerHeight);

      pixiScene.addChild(background);

      background.alpha = 0;

      gsap.to(background, {
        alpha: 1,
        duration: 0.4,
        onComplete: () => {},
      });
    }
  }

  update(time, delta) {
    if (this.ctaButtonDynamicValues) {
      for (let i = 0; i < this.ctaButtonDynamicValues.length; i++) {
        let oldVal = this.ctaButtonDynamicValues[i];
        let newVal = data[this.ctaButtonDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.ctaButtonDynamicValues[i] = newVal;
          this.ctaButton.resize(window.innerWidth, window.innerHeight);
        }
      }
    }

    if (this.ctaTextDynamicValues) {
      for (let i = 0; i < this.ctaTextDynamicValues.length; i++) {
        let oldVal = this.ctaTextDynamicValues[i];
        let newVal = data[this.ctaTextDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.ctaTextDynamicValues[i] = newVal;
          this.ctaText.updateProps();
        }
      }
    }

    if (this.logoDynamicValues) {
      for (let i = 0; i < this.logoDynamicValues.length; i++) {
        let oldVal = this.logoDynamicValues[i];
        let newVal = data[this.logoContDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.logoDynamicValues[i] = newVal;
          this.logoCont.resize(window.innerWidth, window.innerHeight);
        }
      }
    }

    if (this.headerLogoDynamicValues) {
      for (let i = 0; i < this.headerLogoDynamicValues.length; i++) {
        let oldVal = this.headerLogoDynamicValues[i];
        let newVal = data[this.headerLogoDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.headerLogoDynamicValues[i] = newVal;
          this.headerLogoCont.resize(window.innerWidth, window.innerHeight);
        }
      }
    }

    // Dynamic update for header main text
    if (this.headerMainTextDynamicValues) {
      for (let i = 0; i < this.headerMainTextDynamicValues.length; i++) {
        let oldVal = this.headerMainTextDynamicValues[i];
        let newVal = data[this.headerMainTextDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.headerMainTextDynamicValues[i] = newVal;
          this.headerMainText.updateProps();
        }
      }
    }

    // Dynamic update for endcard button
    if (this.endcardButtonDynamicValues) {
      for (let i = 0; i < this.endcardButtonDynamicValues.length; i++) {
        let oldVal = this.endcardButtonDynamicValues[i];
        let newVal = data[this.endcardButtonDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.endcardButtonDynamicValues[i] = newVal;
          this.endcardButton.updateProps();
        }
      }
    }

    // Dynamic update for endcard button text
    if (this.endcardButtonTextDynamicValues) {
      for (let i = 0; i < this.endcardButtonTextDynamicValues.length; i++) {
        let oldVal = this.endcardButtonTextDynamicValues[i];
        let newVal = data[this.endcardButtonTextDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.endcardButtonTextDynamicValues[i] = newVal;
          this.endcardButtonText.updateProps();
        }
      }
    }

    if (this.endcardHeaderDynamicValues) {
      for (let i = 0; i < this.endcardHeaderDynamicValues.length; i++) {
        let oldVal = this.endcardHeaderDynamicValues[i];
        let newVal = data[this.endcardHeaderDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.endcardHeaderDynamicValues[i] = newVal;
          this.headerText.updateProps();
          this.headerParent.resize(window.innerWidth, window.innerHeight);
        }
      }
    }

    if (this.background) {
      for (let i = 0; i < this.backgroundDynamicValues.length; i++) {
        let oldVal = this.backgroundDynamicValues[i];
        let newVal = data[this.backgroundDynamicParamNames[i]];

        if (oldVal != newVal) {
          this.backgroundDynamicValues[i] = newVal;
          this.background.updateProps();
        }
      }
    }
  }
}
