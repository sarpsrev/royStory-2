function collectStorage(data) {
  data.bgmSrc = storage.bgms.items.default.src;
  data.loseSoundSrc = storage.loseSounds.items.default.src;
  data.winSoundSrc = storage.winSounds.items.default.src;

  data.generalFontSrc = storage.fonts.items.defaultFont.src;
  data.topBannerTextFontSrc = storage.fonts.items.topBannerFont.src;

  data.inGameCtaButtonSrc = storage.buttons.items.default.src;
  data.ingameLogoSrc = storage.logos.items.default.src;

  data.customWinBadgeSrc = storage.winBadges.items.default.src;
  data.customLoseBadgeSrc = storage.loseBadges.items.default.src;
  data.badgeCustomFontSrc = storage.fonts.items.badgeFont.src;

  data.endcardBgSrc = storage.backgrounds.items.default.src;
  data.endcardCtaButtonSrc = storage.buttons.items.default.src;
  data.customEndcardLogoSrc = storage.logos.items.default.src;
  data.customEndcardHeaderLogoSrc = storage.logos.items.headerLogo.src;
  data.bgSrc = storage.backgrounds.items.default.src;
}

const storage = {
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
        src: null,
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
        label: 'Endcard CTA Button',
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
        src: null,
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
        src: null,
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
      default: {
        label: 'Endcard Background',
        description: 'Background to be displayed on the endcard.',
        aiDescription: 'background to be displayed on the endcard',
        src: require('./assets/2d/mapParts/bgWall.jpg'),
        type: 'image',
        previewIcon: 'base64-preview-primary',
      },
    },
  },
};

module.exports = { collectStorage, storage };
