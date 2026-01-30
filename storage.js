function collectStorage(data) {
  data.bgmSrc = storage.bgms.items.default.src;
  data.loseSoundSrc = storage.loseSounds.items.default.src;
  data.winSoundSrc = storage.winSounds.items.default.src;
  data.swipeSoundSrc = storage.swipeSounds.items.default.src;
  data.matchSoundSrc = storage.matchSounds.items.default.src;
  data.royBgSrc = storage.royBgs.items.default.src;
  data.pushSoundSrc = storage.pushSounds.items.default.src;

  data.generalFontSrc = storage.fonts.items.defaultFont.src;
  data.topBannerTextFontSrc = storage.fonts.items.topBannerFont.src;

  data.inGameCtaButtonSrc = storage.buttons.items.default.src;
  data.ingameLogoSrc = storage.logos.items.default.src;

  data.customWinBadgeSrc = storage.winBadges.items.default.src;
  data.customLoseBadgeSrc = storage.loseBadges.items.default.src;
  data.badgeCustomFontSrc = storage.fonts.items.badgeFont.src;

  data.endcardBgSrc = storage.backgrounds.items.endcardBackground.src;
  data.endcardCtaButtonSrc = storage.buttons.items.default.src;
  data.customEndcardLogoSrc = storage.logos.items.default.src;
  data.customEndcardHeaderLogoSrc = storage.logos.items.headerLogo.src;
  data.bgSrcVertical = storage.backgrounds.items.vertical.src;
  data.bgSrcHorizontal = storage.backgrounds.items.horizontal.src;
  data.groundSrc = storage.mapAssets.items.ground.src;
  data.upBlockSrc = storage.mapAssets.items.up.src;
  data.sideSrc = storage.mapAssets.items.side.src;
  data.upWallSrc = storage.mapAssets.items.upWall.src;
  data.topBottomSideSrc = storage.mapAssets.items.topBottomSide.src;
  data.thornsSrc = storage.mapAssets.items.thorns.src;
  data.shieldSrc = storage.mapAssets.items.shield.src;
  data.blueSrc = storage.tileAssets.items.blue.src;
  data.greenSrc = storage.tileAssets.items.green.src;
  data.orangeSrc = storage.tileAssets.items.orange.src;
  data.purpleSrc = storage.tileAssets.items.purple.src;
  data.redSrc = storage.tileAssets.items.red.src;
  data.yellowSrc = storage.tileAssets.items.yellow.src;
  data.tileBackSrc = storage.tileAssets.items.tileBack.src;
  data.handSrc = storage.handAssets.items.hand.src;
  data.coinSrc = storage.coinAssets.items.coin.src;
}

const storage = {
  // boardBorders: {
  //   label: 'Board Borders',
  //   description: 'Uploaded Board Borders for the game.',
  //   aiDescription: 'a collection of Board Borders for the game',
  //   items: {
  //     down: {
  //       label: 'Down',
  //       description: 'The Down Border Asset for the game.',
  //       aiDescription: 'Down Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/Down.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     left: {
  //       label: 'Left',
  //       description: 'The Left Border Asset for the game.',
  //       aiDescription: 'Left Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/Left.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     lowerLeft: {
  //       label: 'Lower Left',
  //       description: 'The Lower Left Border Asset for the game.',
  //       aiDescription: 'Lower Left Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/LowerLeftL.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     lowerRight: {
  //       label: 'Lower Right',
  //       description: 'The Lower Right Border Asset for the game.',
  //       aiDescription: 'Lower Right Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/LowerRightL.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     right: {
  //       label: 'Right',
  //       description: 'The Right Border Asset for the game.',
  //       aiDescription: 'Right Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/right.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     up: {
  //       label: 'Up',
  //       description: 'The Up Border Asset for the game.',
  //       aiDescription: 'Up Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/up.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     upperLeft: {
  //       label: 'Upper Left',
  //       description: 'The Upper Left Border Asset for the game.',
  //       aiDescription: 'Upper Left Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/UpperLeftL.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //     upperRight: {
  //       label: 'Upper Right',
  //       description: 'The Upper Right Border Asset for the game.',
  //       aiDescription: 'Upper Right Border Asset used in game',
  //       src: require('./assets/2d/boardBorders/UpperRightL.png'),
  //       type: 'image',
  //       previewIcon: 'base64-preview-primary',
  //     },
  //   },
  // },
  handAssets: {
    label: 'Hand Assets',
    description: 'Uploaded Hand Assets for the game.',
    aiDescription: 'a collection of Hand Assets for the game',
    items: {
      hand: {
        label: 'Hand',
        description: 'The Hand Asset for the game.',
        aiDescription: 'Hand Asset used in game',
        src: require('./assets/2d/hand.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  coinAssets: {
    label: 'Coin Assets',
    description: 'Uploaded Coin Assets for the game.',
    aiDescription: 'a collection of Coin Assets for the game',
    items: {
      coin: {
        label: 'Coin',
        description: 'The Coin Asset for the game.',
        aiDescription: 'Coin Asset used in game',
        src: require('./assets/2d/coin.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  tileAssets: {
    label: 'Tile Assets',
    description: 'Uploaded Tile Assets for the game.',
    aiDescription: 'a collection of Tile Assets for the game',
    items: {
      blue: {
        label: 'Blue',
        description: 'The Blue Asset for the game.',
        aiDescription: 'Blue Asset used in game',
        src: require('./assets/2d/tiles/blue.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      green: {
        label: 'Green',
        description: 'The Green Asset for the game.',
        aiDescription: 'Green Asset used in game',
        src: require('./assets/2d/tiles/green.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      orange: {
        label: 'Orange',
        description: 'The Orange Asset for the game.',
        aiDescription: 'Orange Asset used in game',
        src: require('./assets/2d/tiles/orange.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      purple: {
        label: 'Purple',
        description: 'The Purple Asset for the game.',
        aiDescription: 'Purple Asset used in game',
        src: require('./assets/2d/tiles/purple.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      red: {
        label: 'Red',
        description: 'The Red Asset for the game.',
        aiDescription: 'Red Asset used in game',
        src: require('./assets/2d/tiles/red.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      yellow: {
        label: 'Yellow',
        description: 'The Yellow Asset for the game.',
        aiDescription: 'Yellow Asset used in game',
        src: require('./assets/2d/tiles/yellow.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      tileBack: {
        label: 'Tile Back',
        description: 'The Tile Back Asset for the game.',
        aiDescription: 'Tile Back Asset used in game',
        src: require('./assets/2d/chips/tile.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  mapAssets: {
    label: 'Map Assets',
    description: 'Uploaded Map Assets for the game.',
    aiDescription: 'a collection of Map Assets for the game',
    items: {
      ground: {
        label: 'Ground',
        description: 'The Ground Asset for the game.',
        aiDescription: 'Ground Asset used in game',
        src: require('./assets/2d/mapParts/ground.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      up: {
        label: 'Up',
        description: 'The Up Asset for the game.',
        aiDescription: 'Up Asset used in game',
        src: require('./assets/2d/mapParts/up.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      side: {
        label: 'Side',
        description: 'The Side Asset for the game.',
        aiDescription: 'Side Asset used in game',
        src: require('./assets/2d/mapParts/side.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      upWall: {
        label: 'Up Wall',
        description: 'The Up Wall Asset for the game.',
        aiDescription: 'Up Wall Asset used in game',
        src: require('./assets/2d/mapParts/upWall.jpg'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      topBottomSide: {
        label: 'Top Bottom Side',
        description: 'The Top Bottom Side Asset for the game.',
        aiDescription: 'Top Bottom Side Asset used in game',
        src: require('./assets/2d/mapParts/topBottomSide.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      shield: {
        label: 'Shield',
        description: 'The Shield Asset for the game.',
        aiDescription: 'Shield Asset used in game',
        src: require('./assets/2d/mapParts/shield.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      thorns: {
        label: 'Thorns',
        description: 'The Thorns Asset for the game.',
        aiDescription: 'Thorns Asset used in game',
        src: require('./assets/2d/mapParts/thorn.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  bgms: {
    label: 'Background Music',
    description: 'Uploaded Background Music for the game.',
    aiDescription: 'a collection of Background Music for branding',
    items: {
      default: {
        label: 'Default',
        description: 'The Background Music for the game.',
        aiDescription: 'Background Music used in game',
        src: require('./assets/audio/bgm.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  loseSounds: {
    label: 'Lose Sounds',
    description: 'Uploaded Lose Sounds for the game.',
    aiDescription: 'a collection of Lose Sounds for game effects',
    items: {
      default: {
        label: 'Default',
        description: 'The Lose Sound for the game.',
        aiDescription: 'Lose Sound used in game',
        src: require('./assets/audio/lose_sound.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  winSounds: {
    label: 'Win Sounds',
    description: 'Uploaded Win Sounds for the game.',
    aiDescription: 'a collection of Win Sounds for game effects',
    items: {
      default: {
        label: 'Default',
        description: 'The Win Sound for the game.',
        aiDescription: 'Win Sound used in game',
        src: require('./assets/audio/win_sound.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  swipeSounds: {
    label: 'Swipe Sounds',
    description: 'Uploaded Swipe Sounds for the game.',
    aiDescription: 'a collection of Swipe Sounds for game effects',
    items: {
      default: {
        label: 'Default',
        description: 'The Swipe Sound for the game.',
        aiDescription: 'Swipe Sound used in game',
        src: require('./assets/audio/swipe_sound.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  matchSounds: {
    label: 'Match Sounds',
    description: 'Uploaded Match Sounds for the game.',
    aiDescription: 'a collection of Match Sounds for game effects',
    items: {
      default: {
        label: 'Default',
        description: 'The Match Sound for the game.',
        aiDescription: 'Match Sound used in game',
        src: require('./assets/audio/match_sound.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  royBgs: {
    label: 'Roy Bgs',
    description: 'Uploaded Roy Bgs for the game.',
    aiDescription: 'a collection of Roy Bgs for game effects',
    items: {
      default: {
        label: 'Default',
        description: 'The Roy Bg for the game.',
        aiDescription: 'Roy Bg used in game',
        src: require('./assets/audio/royBg.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  pushSounds: {
    label: 'Push Sounds',
    description: 'Uploaded Push Sounds for the game.',
    aiDescription: 'a collection of Push Sounds for game effects',
    items: {
      default: {
        label: 'Default',
        description: 'The Push Sound for the game.',
        aiDescription: 'Push Sound used in game',
        src: require('./assets/audio/push.mp3'),
        type: 'audio',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  fonts: {
    label: 'Fonts',
    description: 'Uploaded fonts for the game.',
    aiDescription: 'a collection of fonts for the game',
    items: {
      defaultFont: {
        label: 'General Font',
        description: 'Font for the general text',
        aiDescription: 'a font for the general text',
        src: require('./assets/fonts/game-font.woff2'),
        type: 'font',
        previewIcon: 'base64-preview-primary',
      },
      topBannerFont: {
        label: 'Top Banner Font',
        description: 'Font for the top banner text',
        aiDescription: 'a font for the top banner text',
        src: require('./assets/fonts/LilitaOne-Regular.woff2'),
        type: 'font',
        previewIcon: 'base64-preview-primary',
      },
      badgeFont: {
        label: 'Badge Text Font',
        description: 'Font for the Badge Text',
        aiDescription: 'a font for the Badge Text',
        src: require('./assets/fonts/LuckiestGuy-Regular.woff2'),
        type: 'font',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  logos: {
    label: 'Logos',
    description: 'Uploaded logos for the game.',
    aiDescription: 'a collection of logos for the game',
    items: {
      default: {
        label: 'Endcard Logo',
        description: 'Logo to be displayed on the endcard.',
        aiDescription: 'logo to be displayed on the endcard',
        src: require('./assets/2d/logo_here.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      headerLogo: {
        label: 'Header Logo',
        description: 'Logo to be displayed on the header.',
        aiDescription: 'logo to be displayed on the header',
        src: require('./assets/2d/ecCard.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  buttons: {
    label: 'Buttons',
    description: 'Uploaded buttons for the game.',
    aiDescription: 'a collection of buttons for the game',
    items: {
      default: {
        label: ' Button',
        description: 'Button to be displayed on the endcard.',
        aiDescription: 'button to be displayed on the endcard',
        src: require('./assets/2d/cta.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  winBadges: {
    label: 'Win Badges',
    description: 'Uploaded custom win badges for the game.',
    aiDescription: 'a collection of custom win badges for the game',
    items: {
      default: {
        label: 'Default Win Badge',
        description: 'The default win badge used in the game.',
        aiDescription: 'default win badge used in game',
        src: require('./assets/2d/winBadge.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  loseBadges: {
    label: 'Lose Badges',
    description: 'Uploaded custom lose badges for the game.',
    aiDescription: 'a collection of custom lose badges for the game',
    items: {
      default: {
        label: 'Default Lose Badge',
        description: 'The default lose badge used in the game.',
        aiDescription: 'default lose badge used in game',
        src: require('./assets/2d/loseBadge.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
  backgrounds: {
    label: 'Backgrounds',
    description: 'Uploaded backgrounds for the game.',
    aiDescription: 'a collection of backgrounds for the game',
    items: {
      vertical: {
        label: 'Endcard Background',
        description: 'Background to be displayed on the endcard.',
        aiDescription: 'background to be displayed on the endcard',
        src: require('./assets/2d/bgWallVerticall.jpg'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      horizontal: {
        label: 'Endcard Background',
        description: 'Background to be displayed on the endcard.',
        aiDescription: 'background to be displayed on the endcard',
        src: require('./assets/2d/bgWallHorizontal.jpg'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
      endcardBackground: {
        label: 'Endcard Background',
        description: 'Background to be displayed on the endcard.',
        aiDescription: 'background to be displayed on the endcard',
        src: require('./assets/2d/ecBG.png'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
};

module.exports = { collectStorage, storage };
