const assets = {
  pixi: [
    // {
    //   name: "mainImg",
    //   src: require("@assets/2d/adidas/adidas.jpg"),
    //   type: "image",
    // },
    {
      name: 'ground',
      src: require('@assets/2d/mapParts/ground.png'),
      type: 'image',
    },
    {
      name: 'up',
      src: require('@assets/2d/mapParts/up.png'),
      type: 'image',
    },
    {
      name: 'side',
      src: require('@assets/2d/mapParts/side.png'),
      type: 'image',
    },
    {
      name: 'upWall',
      src: require('@assets/2d/mapParts/upWall.jpg'),
      type: 'image',
    },
    {
      name: 'topBottomSide',
      src: require('@assets/2d/mapParts/topBottomSide.png'),
      type: 'image',
    },
    {
      name: 'coin',
      src: require('@assets/2d/coin.png'),
      type: 'image',
    },
    {
      name: 'tileBack',
      src: require('@assets/2d/chips/tile.png'),
      type: 'image',
    },

    {
      name: 'tile0',
      src: require('@assets/2d/chips/chip1.png'),
      type: 'image',
    },
    {
      name: 'tile1',
      src: require('@assets/2d/chips/chip2.png'),
      type: 'image',
    },
    {
      name: 'tile2',
      src: require('@assets/2d/chips/chip2.png'),
      type: 'image',
    },
    {
      name: 'blue',
      src: require('@assets/2d/tiles/blue.png'),
      type: 'image',
    },
    {
      name: 'green',
      src: require('@assets/2d/tiles/green.png'),
      type: 'image',
    },
    {
      name: 'orange',
      src: require('@assets/2d/tiles/orange.png'),
      type: 'image',
    },
    {
      name: 'purple',
      src: require('@assets/2d/tiles/purple.png'),
      type: 'image',
    },
    {
      name: 'red',
      src: require('@assets/2d/tiles/red.png'),
      type: 'image',
    },
    {
      name: 'yellow',
      src: require('@assets/2d/tiles/yellow.png'),
      type: 'image',
    },
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

  if (data.bgSrc) {
    assets.pixi.push({
      name: 'bg',
      src: data.bgSrc,
      type: 'image',
    });
  }
}

export default assets;
