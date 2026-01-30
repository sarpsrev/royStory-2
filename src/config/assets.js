const assets = {
  pixi: [
    {
      name: 'particle1',
      src: require('@assets/2d/particles/particle1.png'),
      type: 'image',
    },
    {
      name: 'particle2',
      src: require('@assets/2d/particles/particle2.png'),
      type: 'image',
    },

    // {
    //   name: 'tileBack',
    //   src: require('@assets/2d/chips/tile.png'),
    //   type: 'image',
    // },

    // {
    //   name: 'tile0',
    //   src: require('@assets/2d/chips/chip1.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'tile1',
    //   src: require('@assets/2d/chips/chip2.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'tile2',
    //   src: require('@assets/2d/chips/chip2.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'blue',
    //   src: require('@assets/2d/tiles/blue.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'green',
    //   src: require('@assets/2d/tiles/green.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'orange',
    //   src: require('@assets/2d/tiles/orange.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'purple',
    //   src: require('@assets/2d/tiles/purple.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'red',
    //   src: require('@assets/2d/tiles/red.png'),
    //   type: 'image',
    // },
    // {
    //   name: 'yellow',
    //   src: require('@assets/2d/tiles/yellow.png'),
    //   type: 'image',
    // },
  ],
  spine: [
    {
      name: 'Roy',
      type: 'spine',
      src: require('@assets/spine/Roy/Roy.json'),
      atlas: require('@assets/spine/Roy/Roy.atlas'),
      image: require('@assets/spine/Roy/Roy.png'),
    },
    {
      name: 'Basket',
      type: 'spine',
      src: require('@assets/spine/Basket_Spine/basket.json'),
      atlas: require('@assets/spine/Basket_Spine/basket.atlas'),
      image: require('@assets/spine/Basket_Spine/basket.png'),
    },
  ],
  three: [],
  three_textures: [],
  audio: {},
  quarks: [
    // {
    //   name: "explosion",
    //   src: require("@assets/quarks/Explosion.json"),
    //   poolCount: 5,
    // },
  ],
  fonts: [
    // {
    //   name: "game-font",
    //   src: require("@assets/fonts/game-font.woff2"),
    //   type: "font",
    // },
  ],
};

export function insertAssets(data) {
  if (data.bgmSrc) {
    assets.audio.bgm = {
      src: data.bgmSrc,
      loop: true,
      volume: data.bgmVolume,
    };
  }

  if (data.swipeSoundSrc) {
    assets.audio.swipeSound = {
      src: data.swipeSoundSrc,
      loop: false,
      volume: data.swipeSoundVolume,
    };
  }

  if (data.matchSoundSrc) {
    assets.audio.matchSound = {
      src: data.matchSoundSrc,
      loop: false,
      volume: data.matchSoundVolume,
    };
  }

  if (data.royBgSrc) {
    assets.audio.royBg = {
      src: data.royBgSrc,
      loop: true,
      volume: data.royBgVolume,
    };
  }

  if (data.pushSoundSrc) {
    assets.audio.pushSound = {
      src: data.pushSoundSrc,
      loop: false,
      volume: data.pushSoundVolume,
    };
  }

  if (data.coinSrc) {
    assets.pixi.push({
      name: 'coin',
      src: data.coinSrc,
      type: 'image',
    });
  }

  if (data.loseSoundSrc) {
    assets.audio.loseSound = {
      src: data.loseSoundSrc,
      loop: false,
      volume: data.loseSoundVolume,
    };
  }

  if (data.winSoundSrc) {
    assets.audio.winSound = {
      src: data.winSoundSrc,
      loop: false,
      volume: data.winSoundVolume,
    };
  }

  if (data.generalFontSrc) {
    assets.fonts.push({
      name: 'game-font',
      src: data.generalFontSrc,
      type: 'font',
    });
  }

  if (data.topBannerTextFontSrc) {
    assets.fonts.push({
      name: 'topBannerTextFont',
      src: data.topBannerTextFontSrc,
      type: 'font',
    });
  }

  if (data.inGameCtaButtonSrc) {
    assets.pixi.push({
      name: 'ingameCtaButton',
      src: data.inGameCtaButtonSrc,
      type: 'image',
    });
  }

  if (data.ingameLogoSrc) {
    assets.pixi.push({
      name: 'appicon',
      src: data.ingameLogoSrc,
      type: 'image',
    });
  }

  if (data.customWinBadgeSrc) {
    assets.pixi.push({
      name: 'customWinBadge',
      src: data.customWinBadgeSrc,
      type: 'image',
    });
  }

  if (data.customLoseBadgeSrc) {
    assets.pixi.push({
      name: 'customLoseBadge',
      src: data.customLoseBadgeSrc,
      type: 'image',
    });
  }

  if (data.endcardCtaButtonSrc) {
    assets.pixi.push({
      name: 'endcardCtaButton',
      src: data.endcardCtaButtonSrc,
      type: 'image',
    });
  }

  if (data.customEndcardLogoSrc) {
    assets.pixi.push({
      name: 'endcardLogo',
      src: data.customEndcardLogoSrc,
      type: 'image',
    });
  }

  if (data.customEndcardHeaderLogoSrc) {
    assets.pixi.push({
      name: 'endcardHeaderLogo',
      src: data.customEndcardHeaderLogoSrc,
      type: 'image',
    });
  }

  if (data.badgeCustomFontSrc) {
    assets.fonts.push({
      name: 'badgeCustomFont',
      src: data.badgeCustomFontSrc,
      type: 'font',
    });
  }

  if (data.endcardBgSrc) {
    assets.pixi.push({
      name: 'endcardBg',
      src: data.endcardBgSrc,
      type: 'image',
    });
  }

  if (data.bgSrcVertical) {
    assets.pixi.push({
      name: 'bgVertical',
      src: data.bgSrcVertical,
      type: 'image',
    });
  }

  if (data.bgSrcHorizontal) {
    assets.pixi.push({
      name: 'bgHorizontal',
      src: data.bgSrcHorizontal,
      type: 'image',
    });
  }

  if (data.groundSrc) {
    assets.pixi.push({
      name: 'ground',
      src: data.groundSrc,
      type: 'image',
    });
  }

  if (data.upBlockSrc) {
    assets.pixi.push({
      name: 'upBlock',
      src: data.upBlockSrc,
      type: 'image',
    });
  }

  if (data.sideSrc) {
    assets.pixi.push({
      name: 'side',
      src: data.sideSrc,
      type: 'image',
    });
  }

  if (data.upWallSrc) {
    assets.pixi.push({
      name: 'upWall',
      src: data.upWallSrc,
      type: 'image',
    });
  }

  if (data.topBottomSideSrc) {
    assets.pixi.push({
      name: 'topBottomSide',
      src: data.topBottomSideSrc,
      type: 'image',
    });
  }

  if (data.shieldSrc) {
    assets.pixi.push({
      name: 'shield',
      src: data.shieldSrc,
      type: 'image',
    });
  }

  if (data.thornsSrc) {
    assets.pixi.push({
      name: 'thorns',
      src: data.thornsSrc,
      type: 'image',
    });
  }

  if (data.blueSrc) {
    assets.pixi.push({
      name: 'blue',
      src: data.blueSrc,
      type: 'image',
    });
  }

  if (data.orangeSrc) {
    assets.pixi.push({
      name: 'orange',
      src: data.orangeSrc,
      type: 'image',
    });
  }

  if (data.yellowSrc) {
    assets.pixi.push({
      name: 'yellow',
      src: data.yellowSrc,
      type: 'image',
    });
  }

  if (data.greenSrc) {
    assets.pixi.push({
      name: 'green',
      src: data.greenSrc,
      type: 'image',
    });
  }

  if (data.redSrc) {
    assets.pixi.push({
      name: 'red',
      src: data.redSrc,
      type: 'image',
    });
  }

  if (data.purpleSrc) {
    assets.pixi.push({
      name: 'purple',
      src: data.purpleSrc,
      type: 'image',
    });
  }

  if (data.tileBackSrc) {
    assets.pixi.push({
      name: 'tileBack',
      src: data.tileBackSrc,
      type: 'image',
    });
  }

  if (data.handSrc) {
    assets.pixi.push({
      name: 'hand',
      src: data.handSrc,
      type: 'image',
    });
  }

  if (data.downSrc) {
    assets.pixi.push({
      name: 'down',
      src: data.downSrc,
      type: 'image',
    });
  }

  if (data.leftSrc) {
    assets.pixi.push({
      name: 'left',
      src: data.leftSrc,
      type: 'image',
    });
  }

  if (data.lowerLeftSrc) {
    assets.pixi.push({
      name: 'lowerLeft',
      src: data.lowerLeftSrc,
      type: 'image',
    });
  }

  if (data.lowerRightSrc) {
    assets.pixi.push({
      name: 'lowerRight',
      src: data.lowerRightSrc,
      type: 'image',
    });
  }

  if (data.rightSrc) {
    assets.pixi.push({
      name: 'right',
      src: data.rightSrc,
      type: 'image',
    });
  }

  if (data.upperLeftSrc) {
    assets.pixi.push({
      name: 'upperLeft',
      src: data.upperLeftSrc,
      type: 'image',
    });
  }

  if (data.upperRightSrc) {
    assets.pixi.push({
      name: 'upperRight',
      src: data.upperRightSrc,
      type: 'image',
    });
  }
}

export default assets;
