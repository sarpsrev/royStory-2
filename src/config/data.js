const data = window.gameData ?? {
  // # BACKGROUND
  // ## MAIN BACKGROUND CONFİNG
  bgSrc: null, // background image source
  flatBgColor: 0x718c5f,

  // # COIN CONFİNG
  // ## COIN SCALE
  coinScale: 0.4, // @slider: 0.4, 2, 0.01
  // ## COIN LINE COUNT
  coinLineCount: 20, // @slider: 1, 20, 1
  // ## COIN TARGET PERCENTAGE FOR WIN
  coinTargetPercentage: 50, // @slider: 0.1, 100, 1

  // # BOARD CONFING
  // ## BOARD LINES
  // board 3 config (0 to 2 tile types, X for bomb.)
  board3Row0: 'orange,yellow,orange,yellow,red,purple,orange,purple', // type:""
  board3Row1: 'yellow,blue,yellow,red,blue,orange,purple,orange', // type:""
  board3Row2: 'blue,orange,blue,red,orange,blue,orange,orange', // type:""
  board3Row3: 'purple,green,purple,green,yellow,green,yellow,yellow', // type:""
  board3Row4: 'red,purple,red,blue,orange,blue,orange,orange', // type:""
  board3Row5: 'green,red,green,yellow,red,yellow,red,red', // type:""
  board3Row6: 'blue,purple,blue,orange,purple,orange,purple,purple', // type:""
  board3Row7: 'purple,blue,purple,green,yellow,green,yellow,yellow', // type:""

  // # AUDİO CONFİNG
  // ## BACkGORUND MUSIC
  bgmSrc: null, // background music source
  bgmVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1

  // # FONTS
  // ## GENARAL FONT
  generalFontSrc: null, // general font source ("game-font")

  // # MARKET PARAMETERS
  // ## X CLICK TO MARKET
  marketRedirectOnXclicks: 0, // default: 0, min: 0, max: 50, step: 1 // 0 to disable
  // ## X RELEASE TO MARKET
  marketRedirectOnXreleases: 0, // default: 0, min: 0, max: 50, step: 1 // 0 to disable
  // ## X SECONDS TO MARKET
  marketRedirectAfterXseconds: 0, // default: 0, min: 0, max: 60, step: 1 // 0 to disable. Starts counting after first interaction
  // ## CLICK ANYWHERE TO MARKET
  clickAnywhereOnEndcardToRedirect: true,
  // ## Auto Redirect on ENDCARD
  autoRedirectOnEndcard: false,

  // ingame logo
  ingameLogoEnabled: false,
  ingameLogoSrc: null,
  ingameLogoPortraitPositionX: 0.5, // default: 0.5, min: 0, max: 1, step: 0.01
  ingameLogoPortraitPositionY: 0.12, // default: 0.12, min: 0, max: 1, step: 0.01
  ingameLogoPortraitScaleMultiplier: 1, // default: 1, min: 0.05, max: 5, step: 0.05
  ingameLogoLandscapePositionX: 0.17, // default: 0.5, min: 0, max: 1, step: 0.01
  ingameLogoLandscapePositionY: 0.15, // default: 0.9, min: 0, max: 1, step: 0.01
  ingameLogoLandscapeScaleMultiplier: 1.3, // default: 1, min: 0.05, max: 5, step: 0.05

  // ingame cta button
  inGameCtaButtonSrc: null,
  inGameCtaButtonEnabled: false,
  inGameCtaButtonPortraitPositionX: 0.5, // default: 0.5, min: 0, max: 1, step: 0.01
  inGameCtaButtonPortraitPositionY: 0.92, // default: 0.9, min: 0, max: 1, step: 0.01
  inGameCtaButtonPortraitScaleMultiplier: 1, // default: 1, min: 0.05, max: 5, step: 0.05
  inGameCtaButtonLandscapePositionX: 0.85, // default: 0.85, min: 0, max: 1, step: 0.01
  inGameCtaButtonLandscapePositionY: 0.16, // default: 0.9, min: 0, max: 1, step: 0.01
  inGameCtaButtonLandscapeScaleMultiplier: 1.5, // default: 1.5, min: 0.05, max: 5, step: 0.05
  inGameCtaButtonPulseEnabled: true,
  inGameCtaButtonText: 'PLAY NOW', // type "_" for new line
  inGameCtaButtonTextColor: '#ffffff',
  inGameCtaButtonTextStrokeThickness: 8, // default: 1, min: 0, max: 15, step: 1
  inGameCtaButtonTextStrokeColor: '#000000',
  inGameCtaButtonTextPosY: -20, // default: 0, min: -100, max: 100, step: 1

  // win-fail badges config
  badgesEnabled: true,
  customBadgesEnabled: false,
  customWinBadgeSrc: null,
  customLoseBadgeSrc: null,
  winBadgeColor: '#00ff00',
  loseBadgeColor: '#ff0000',
  winBadgeStrokeColor: '#000000',
  loseBadgeStrokeColor: '#000000',
  winBadgeText: 'CLEAR!', // type "_" to add a new line
  loseBadgeText: 'FAIL!', // type "_" to add a new line
  winBadgeTextColor: 0xffffff,
  loseBadgeTextColor: 0xffffff,
  winBadgeTextStrokeColor: 0x000000,
  loseBadgeTextStrokeColor: 0x000000,
  winBadgeTextStrokeThickness: 6, // default: 6, min: 0, max: 15, step: 1
  loseBadgeTextStrokeThickness: 6, // default: 6, min: 0, max: 15, step: 1
  badgeCustomFontSrc: null,
  badgeBackgroundColor: '#000000',
  badgeBackgroundOpacity: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1

  // endcard background config
  backgroundType: 0, // 0: color, 1: image
  endcardFlatBgColor: '#000000',
  endcardFlatBgOpacity: 0.8, // default: 0.5, min: 0, max: 1, step: 0.1
  endcardBgSrc: null, // background image source

  // endcard cta config
  winCtaText: 'PLAY NOW!', // type: "_" to enter a new line
  loseCtaText: 'TRY AGAIN!', // type: "_" to enter a new line
  endcardCtaTextColor: 0xffffff,
  endcardCtaTextStrokeColor: 0x000000,
  endcardCtaTextStrokeThickness: 12, // default: 10, min: 0, max: 15, step: 1
  endcardCtaTextScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1
  endcardCtaTextPosX: 0, // default: 0, min: -300, max: 300, step: 1
  endcardCtaTextPosY: -20, // default: 0, min: -300, max: 300, step: 1
  endcardCtaButtonSrc: null,
  endcardCtaButtonPosX: 0.5, // default: 0.5, min: 0, max: 1, step: 0.01
  endcardCtaButtonPosY: 0.78, // deafult: 0.78, min: 0, max: 1, step: 0.01
  endcardCtaButtonPortraitScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1
  endcardCtaButtonLandscapeScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1

  // endcard logo config
  customEndcardLogoSrc: null,
  endcardLogoPosX: 0.5, // default: 0.5, min: 0, max: 1, step: 0.01
  endcardLogoPosY: 0.45, // default: 0.35, min: 0, max: 1, step: 0.01
  endcardLogoPortraitScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1
  endcardLogoLandscapeScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1

  // endcard header text config
  endcardHeaderText: 'GAME NAME!', // type "_" for new line
  endcardHeaderTextColor: 0xffffff,
  endcardHeaderTextStrokeColor: 0x000000,
  endcardHeaderTextStrokeThickness: 8, // default: 0, min: 0, max: 15, step: 1
  endCardHeaderTextPosX: 0.5, // default: 0.5, min: 0, max: 1, step: 0.01
  endCardHeaderTextPosY: 0.2, // default: 0.2, min: 0, max: 1, step: 0.01
  endcardHeaderTextPortraitScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1
  endcardHeaderTextLandscapeScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1

  // endcard header logo config
  customEndcardHeaderLogoSrc: null,
  endcardHeaderLogoPosX: 0.5, // default: 0.5, min: 0, max: 1, step: 0.01
  endcardHeaderLogoPosY: 0.19, // default: 0.19, min: 0, max: 1, step: 0.01
  endcardHeaderLogoPortraitScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1
  endcardHeaderLogoLandscapeScale: 1, // default: 1, min: 0.1, max: 5, step: 0.1
};

export default data;
