const data = window.gameData ?? {
  // # AUDİO CONFİNG
  // ## BACkGORUND MUSIC
  bgmSrc: null, // background music source
  bgmVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1
  // ## LOSE SOUND
  loseSoundSrc: null, // lose sound source
  loseSoundVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1
  // ## WIN SOUND
  winSoundSrc: null, // win sound source
  winSoundVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1
  // ## SWIPE SOUND
  swipeSoundSrc: null, // swipe sound source
  swipeSoundVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1
  // ## MATCH SOUND
  matchSoundSrc: null, // match sound source
  matchSoundVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1
  // ## ROY BG
  royBgSrc: null, // roy bg image source
  royBgVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1
  // ## PUSH  SOUND
  pushSoundSrc: null, // push sound source
  pushSoundVolume: 0.5, // default: 0.5, min: 0, max: 1, step: 0.1

  // # HAND CONFİNG
  handSrc: null, // hand image source
  handScale: 0.3, // @slider: 0.1, 2, 0.01
  handAngle: -10, // @slider: -360, 360, 1
  handRespawnTime: 3, // @slider: 0.1, 10, 0.01

  // ## MAIN BACKGROUND CONFİNG
  bgSrcVertical: null, // background image source
  bgSrcHorizontal: null, // background image source
  flatBgColor: 0x718c5f,

  // # GAMEPLAY CONFİNG
  gameDuration: 30, // @slider: 10, 120, 1

  // # COLLIDER CONFİNG
  debugPhysics: false,
  // ## CHARACTER COLLIDER PARAMETERS
  characterColliderXPosition: 50, // @slider: -500, 500, 1
  characterColliderYPosition: -60, // @slider: -500, 500, 1
  characterColliderWidth: 200, // @slider: 1, 500, 1
  characterColliderHeight: 100, // @slider: 1, 500, 1
  characterColliderAngle: -30, // @slider: -360, 360, 1
  // ## LEFT WALL COLIDER PARAMETERS
  leftWallColiderXPosition: -250, // @slider: -1000, 1000, 1
  leftWallColiderYPosition: 0, // @slider: -1000, 1000, 1
  leftWallColiderWidth: 70, // @slider: 1, 5000, 1
  leftWallColiderHeight: 5000, // @slider: 1, 5000, 1
  leftWallColiderAngle: 0, // @slider: 0, 360, 1
  // ## RIGHT WALL COLIDER PARAMETERS
  rightWallColiderXPosition: 250, // @slider: -1000, 1000, 1
  rightWallColiderYPosition: 0, // @slider: -1000, 1000, 1
  rightWallColiderWidth: 80, // @slider: 1, 5000, 1
  rightWallColiderHeight: 5000, // @slider: 1, 5000, 1
  rightWallColiderAngle: 0, // @slider: 0, 360, 1
  // ## DOWN SIDE MAIN COLIDER PARAMETERS
  downSideMainColliderXPosition: -70, // @slider: -1000, 1000, 1
  downSideMainColliderYPosition: 30, // @slider: -1000, 1000, 1
  downSideMainColliderWidth: 300, // @slider: 1, 5000, 1
  downSideMainColliderHeight: 50, // @slider: 1, 5000, 1
  downSideMainColliderAngle: 0, // @slider: 0, 360, 1
  // ## DOWN SIDE HOLE COLIDER PARAMETERS
  downsideHoleColliderXPosition: -65, // @slider: -1000, 1000, 1
  downsideHoleColliderYPosition: 10, // @slider: -1000, 1000, 1
  downsideHoleColliderWidth: 30, // @slider: 1, 5000, 1
  downsideHoleColliderHeight: 300, // @slider: 1, 5000, 1
  downsideHoleColliderAngle: -30, // @slider: -360, 360, 1
  // ## UP SIDE MAIN COLIDER PARAMETERS
  upSideMainColliderXPosition: -70, // @slider: -1000, 1000, 1
  upSideMainColliderYPosition: -1700, // @slider: -2000, 1000, 1
  upSideMainColliderWidth: 300, // @slider: 1, 5000, 1
  upSideMainColliderHeight: 3000, // @slider: 1, 5000, 1
  upSideMainColliderAngle: 0, // @slider: -360, 360, 1
  // ## UP SIDE HOLE COLIDER PARAMETERS
  upSideHoleColliderXPosition: -75, // @slider: -1000, 1000, 1
  upSideHoleColliderYPosition: -170, // @slider: -1000, 1000, 1
  upSideHoleColliderWidth: 30, // @slider: 1, 5000, 1
  upSideHoleColliderHeight: 300, // @slider: 1, 5000, 1
  upSideHoleColliderAngle: -30, // @slider: -360, 360, 1

  // # MAP ASSET CONFİNG
  // ## SHIELD CONFİNG
  shieldSrc: null, // shield image source
  shieldPositionX: 460, // @slider: -1000, 1000, 1
  shieldPositionY: -550, // @slider: -1000, 1000, 1
  shieldScale: 4.5, // @slider: 0.1, 10, 0.01
  shieldAngle: -10, // @slider: -360, 360, 1
  // ## THORNS CONFİNG
  thornsSrc: null, // thorns image source
  thornsPositionX: -201, // @slider: -1000, 1000, 1
  thornsPositionY: -66, // @slider: -1000, 1000, 1
  thornsScale: 0.75, // @slider: 0.1, 2, 0.01
  thornsAngle: 20, // @slider: -360, 360, 1
  // ## GROUND
  groundSrc: null, // ground image source
  groundPositionX: -65, // @slider: -1000, 1000, 1
  groundPositionY: 10, // @slider: -1000, 1000, 1
  groundScale: 0.45, // @slider: 0.1, 2, 0.01
  groundAngle: 0, // @slider: -360, 360, 1
  // ## UP
  upBlockSrc: null, // up image source
  upPositionX: -65, // @slider: -1000, 1000, 1
  upPositionY: -305, // @slider: -1000, 1000, 1
  upScale: 0.45, // @slider: 0.1, 2, 0.01
  upAngle: 0, // @slider: -360, 360, 1
  // ## SIDE
  sideSrc: null, // side image source
  sideLeftPositionX: -250, // @slider: -1000, 1000, 1
  sideLeftPositionY: 0, // @slider: -1000, 1000, 1
  sideLeftScale: 0.5, // @slider: 0.1, 2, 0.01
  sideLeftAngle: 0, // @slider: -360, 360, 1
  sideRightPositionX: 250, // @slider: -1000, 1000, 1
  sideRightPositionY: 0, // @slider: -1000, 1000, 1
  sideRightScale: 0.5, // @slider: 0.1, 2, 0.01
  sideRightAngle: 0, // @slider: -360, 360, 1
  // ## UP WALL
  upWallSrc: null, // up wall image source
  upWallPositionX: 0, // @slider: -1000, 1000, 1
  upWallPositionY: -670, // @slider: -1000, 1000, 1
  upWallScale: 0.8, // @slider: 0.1, 2, 0.01
  upWallAngle: 0, // @slider: -360, 360, 1
  // ## TOP BOTTOM SIDE
  topBottomSideSrc: null, // top bottom side image source
  topBottomSidePositionX: 0, // @slider: -1000, 1000, 1
  topBottomSidePositionY: -480, // @slider: -1000, 1000, 1
  topBottomSideScale: 1, // @slider: 0.1, 2, 0.01
  topBottomSideAngle: 0, // @slider: -360, 360, 1
  // ## DOWN BOTTOM SIDE
  downBottomSideSrc: null, // down bottom side image source
  downBottomSidePositionX: 0, // @slider: -1000, 1000, 1
  downBottomSidePositionY: 500, // @slider: -1000, 1000, 1
  downBottomSideScale: 1, // @slider: 0.1, 2, 0.01
  downBottomSideAngle: 0, // @slider: -360, 360, 1

  // # COIN CONFİNG
  // ## COIN SCALE
  coinSrc: null, // coin image source
  coinScale: 0.4, // @slider: 0.4, 0.7, 0.01
  // ## COIN LINE COUNT
  coinLineCount: 20, // @slider: 1, 20, 1
  // ## COIN TARGET PERCENTAGE FOR WIN
  coinTargetPercentage: 50, // @slider: 0.1, 100, 1

  // # BOARD CONFING
  // ## BOARD LINES
  board3Row0: 'orange,yellow,orange,yellow,red,purple,orange,purple', // type:""
  board3Row1: 'yellow,blue,yellow,red,blue,orange,purple,orange', // type:""
  board3Row2: 'blue,orange,blue,red,orange,blue,orange,orange', // type:""
  board3Row3: 'purple,green,purple,green,yellow,green,yellow,yellow', // type:""
  board3Row4: 'red,purple,red,blue,orange,blue,orange,orange', // type:""
  board3Row5: 'green,red,green,yellow,red,yellow,red,red', // type:""
  board3Row6: 'blue,purple,blue,orange,purple,orange,purple,purple', // type:""
  board3Row7: 'purple,blue,purple,green,yellow,green,yellow,yellow', // type:""

  // # TİLE ASSETS
  tileBackSrc: null, // tile back source
  tileScale: 0.95, // @slider: 0.1, 2, 0.01
  blueSrc: null, // blue tile source
  orangeSrc: null, // orange tile source
  yellowSrc: null, // yellow tile source
  greenSrc: null, // green tile source
  redSrc: null, // red tile source
  purpleSrc: null, // purple tile source

  // # FONTS
  // ## GENARAL FONT
  generalFontSrc: null, // general font source ("game-font")

  // # MARKET PARAMETERS
  // ## X MATCH TO MARKET
  xBoardMatchesToMarket: 0, // @slider: 0, 50, 1
  // ## X MATCH TO END CARD
  xBoardMatchesToEndCard: 0, // @slider: 0, 50, 1
  // ## X CLICK TO MARKET
  marketRedirectOnXclicks: 0, // @slider: 0, 50, 1
  // ## X CLICK TO END CARD
  clickOnXclicksToEndCard: 0, // @slider: 0, 50, 1
  // ## X RELEASE TO MARKET
  marketRedirectOnXreleases: 0, // @slider: 0, 50, 1
  // ## X RELEASE TO END CARD
  releaseOnXreleasesToEndCard: 0, // @slider: 0, 50, 1
  // ## X SECONDS TO MARKET
  marketRedirectAfterXseconds: 0, // @slider: 0, 60, 1
  // ## X SECONDS TO END CARD
  secondsOnXsecondsToEndCard: 0, // @slider: 0, 60, 1
  // ## CLICK ANYWHERE TO MARKET
  clickAnywhereOnEndcardToRedirect: true,
  // ## Auto Redirect on ENDCARD
  autoRedirectOnEndcard: false,

  // # LOGO/CTA BUTTON CONFIG
  // ## INGAME LOGO
  ingameLogoEnabled: false,
  ingameLogoSrc: null, // ingame logo source
  ingameLogoPortraitPositionX: 0.8, // @slider: 0, 1, 0.01
  ingameLogoPortraitPositionY: 0.94, // @slider: 0, 1, 0.01
  ingameLogoPortraitScaleMultiplier: 0.6, // @slider: 0.05, 5, 0.05
  ingameLogoLandscapePositionX: 0.17, // @slider: 0, 1, 0.01
  ingameLogoLandscapePositionY: 0.85, // @slider: 0, 1, 0.01
  ingameLogoLandscapeScaleMultiplier: 0.9, // @slider: 0.05, 5, 0.05

  // ## INGAME CTA BUTTON
  inGameCtaButtonSrc: null, // ingame cta button source
  inGameCtaButtonEnabled: false,
  inGameCtaButtonPortraitPositionX: 0.2, // @slider: 0, 1, 0.01
  inGameCtaButtonPortraitPositionY: 0.96, // @slider: 0, 1, 0.01
  inGameCtaButtonPortraitScaleMultiplier: 0.7, // @slider: 0.05, 5, 0.05
  inGameCtaButtonLandscapePositionX: 0.85, // @slider: 0, 1, 0.01
  inGameCtaButtonLandscapePositionY: 0.89, // @slider: 0, 1, 0.01
  inGameCtaButtonLandscapeScaleMultiplier: 1.3, // @slider: 0.05, 5, 0.05
  inGameCtaButtonPulseEnabled: true,
  inGameCtaButtonText: 'PLAY NOW', // type ""
  inGameCtaButtonTextColor: '#ffffff',
  inGameCtaButtonTextStrokeThickness: 8, // @slider: 0, 15, 1
  inGameCtaButtonTextStrokeColor: '#000000',
  inGameCtaButtonTextPosY: 0, // @slider: -100, 100, 1

  // # win-fail badges config
  badgesEnabled: true,
  customBadgesEnabled: true,
  customWinBadgeSrc: null, // custom win badge source
  customLoseBadgeSrc: null, // custom lose badge source
  winBadgeColor: '#00ff00',
  loseBadgeColor: '#ff0000',
  winBadgeStrokeColor: '#000000',
  loseBadgeStrokeColor: '#000000',
  winBadgeText: 'CLEAR!', // type "_" to add a new line
  loseBadgeText: 'FAIL!', // type "_" to add a new line
  badgeTextFontSize: 60, // @slider: 0, 150, 1
  winBadgeTextColor: 0xffffff,
  loseBadgeTextColor: 0xffffff,
  winBadgeTextStrokeColor: 0x000000,
  loseBadgeTextStrokeColor: 0x000000,
  winBadgeTextStrokeThickness: 6, // @slider: 0, 15, 1
  loseBadgeTextStrokeThickness: 6, // @slider: 0, 15, 1
  badgeCustomFontSrc: null, // custom badge font source
  badgeBackgroundColor: '#000000',
  badgeBackgroundOpacity: 0.5, // @slider: 0, 1, 0.1

  // # ENDCARD CONFIG
  // ## endcard background config
  backgroundType: 1, // 0: color, 1: image
  endcardFlatBgColor: '#000000',
  endcardFlatBgOpacity: 0.8, // @slider: 0, 1, 0.1
  endcardBgSrc: null, // endcard background image source

  // ## endcard header logo config
  customEndcardHeaderLogoSrc: null,
  endcardHeaderLogoPosX: 0.5, // @slider: 0, 1, 0.01
  endcardHeaderLogoPosY: 0.5, // @slider: 0, 1, 0.01
  endcardHeaderLogoPortraitScale: 1.8, // @slider: 0.1, 5, 0.1
  endcardHeaderLogoLandscapeScale: 2, // @slider: 0.1, 5, 0.1

  // ## endcard header text config
  endcardHeaderText: 'PLAY MORE_IN_ROY_STORY!', // type "_" for new line
  endcardHeaderTextFontSize: 80, // @slider: 0, 100, 1
  endcardHeaderTextColor: 0xffffff, // endcard header text color
  endcardHeaderTextStrokeColor: 0x000000, // endcard header text stroke color
  endcardHeaderTextStrokeThickness: 8, // @slider: 0, 15, 1
  endcardHeaderTextPosY: 100, // @slider: -500, 500, 1
  endcardHeaderTextPosX: 0, // @slider: -500, 500, 1

  // ## endcard button config
  endcardButtonText: 'PLAY NOW!', // type "_" to enter a new line
  endcardButtonTextColor: 0xffffff, // endcard button text color
  endcardButtonTextFontSize: 60, // @slider: 0, 100, 1
  endcardButtonTextStrokeColor: 0x000000, // endcard button text stroke color
  endcardButtonTextStrokeThickness: 8, // @slider: 0, 15, 1
  endcardButtonTextPosY: 0, // @slider: -900, 900, 1
  endcardButtonTextPosX: 0, // @slider: -900, 900, 1
  endcardCtaButtonSrc: null,
  endcardButtonPosX: 0, // @slider: -500, 500, 1
  endcardButtonPosY: 475, // @slider: -500, 500, 1
  endcardButtonScale: 0.7, // @slider: 0.1, 5, 0.1
};

export default data;
