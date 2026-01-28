import gsap from 'gsap';
import * as PIXI from 'pixi.js';
import { getDevicePlatform, openStorePage } from '../../../engine';
import globals from '../../../globals';
import Endcard from './Endcard';
import { Spine } from '@pixi-spine/all-4.1';
import data from '../../config/data';
import AudioManager from '../../../engine/audio/AudioManager';
import TopBanner from './scripts.js/topBanner';
import Cta from './scripts.js/cta';
import Logo from './scripts.js/logo';
import Container2 from '../../config/Container2';
import matterPhysics from '../matter';
import Matter from 'matter-js';
import CoinConfigDatas from './coinConfigDatas';
import MatchBoard from './matchBoard';

// Coin configuration constants
const LEVEL3_COIN_SCALE = 0.4;

let pixiScene = null;
let pixiApp = null;

const TextureCache = PIXI.utils.TextureCache;

export default class PixiGame {
  constructor() {
    console.log('Game constructor');

    pixiScene = globals.pixiScene;
    pixiApp = globals.pixiApp;

    this.text = null;

    globals.pixiUpdateList = [];
    globals.pixiGame = this;

    // Physics debug toggle
    this.physicsDebugEnabled = false;
    this.coinCollectedCount = 0;
    this.isLunging = false;
    this.isGameFinished = false;
  }

  start() {
    console.log('Game start pixi');
    this.addBackground();

    // Setup physics and playground first
    this.matterSetup();
    this.createPlayground();

    //
    // this.addHeaderText();
    //  this.addTopBanner();
    //  this.addCta();
    //   this.addLogo();
    // this.setMarketRedirectionClicks();

    // Setup coins
    this.coinConfigData = new CoinConfigDatas();
    gsap.delayedCall(1, () => {
      // this.addLevel3Coins();
      // this.map3placement();
    });
    //this.placeLevel3Colliders();
    this.addLevel3Coins();
    this.map3placement();
    this.placeWallColliders();
    this.addCharacter(0, -21);
    this.setCharacterAnimation('idle', true);
    this.startCharacterMovement(-150, 21, 30);

    // example usage:
    // globals.EventEmitter.emit("gameFinished", true); // true for win, false for lose
    globals.EventEmitter.on('gameFinished', (isWin = true) => {
      if (globals.gameFinished) return;
      globals.gameFinished = true;

      this.cta.hideCta();
      this.logo.hideLogo();

      let delay = 0.5;
      if (data.badgesEnabled) {
        delay = 1.5;
        this.createBadge(isWin);
      }

      if (isWin) {
        AudioManager.playSFX('winSound');
      } else {
        AudioManager.playSFX('loseSound');
      }

      gsap.delayedCall(delay, () => {
        if (this.badgeBackground) {
          gsap.to(this.badgeBackground, {
            alpha: 0,
            duration: 0.25,
            ease: 'sine.inOut',
          });
        }

        new Endcard(isWin);
      });

      gsap.delayedCall(delay + 2, () => {
        AudioManager.stopAllSFX();
        AudioManager.stopBackgroundMusic(true);
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'c') {
        globals.EventEmitter.emit('gameFinished', true);
      }
      if (event.key === 'v') {
        globals.EventEmitter.emit('gameFinished', false);
      }
      if (event.key === 'l') {
        this.characterLunge();
      }
    });
  }

  addTopBanner() {
    new TopBanner();
  }

  addCta() {
    this.cta = new Cta();
  }

  addLogo() {
    this.logo = new Logo();
  }

  marketRedirectClicks = 0;
  marketRedirectReleases = 0;
  setMarketRedirectionClicks() {
    pixiScene.on('pointerdown', (e) => {
      if (data.marketRedirectOnXclicks != 0) {
        this.marketRedirectClicks++;

        if (this.marketRedirectClicks >= data.marketRedirectOnXclicks) {
          openStorePage();
        }
      }
    });

    pixiScene.on('pointerup', (e) => {
      if (data.marketRedirectOnXreleases != 0) {
        this.marketRedirectReleases++;

        if (this.marketRedirectReleases >= data.marketRedirectOnXreleases) {
          openStorePage();
        }
      }
    });
  }

  addBackground() {
    let key = 'bg';
    let background;

    if (data.bgSrc) {
      background = PIXI.Sprite.from(TextureCache[key]);
    } else {
      background = new PIXI.Graphics();
      const drawBackground = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        background.clear();
        background.beginFill(data.flatBgColor);
        background.drawRect(0, 0, w, h);
        background.endFill();
      };

      drawBackground();
    }

    pixiScene.addChild(background);

    background.iWidth = background.width;
    background.iHeight = background.height;

    background.resize = (w, h) => {
      background.width = w;
      background.height = h;
    };
    background.resize(window.innerWidth, window.innerHeight);
  }

  createBadge(isWin) {
    let badgeColor = isWin ? data.winBadgeColor : data.loseBadgeColor;
    let badgeStrokeColor = isWin
      ? data.winBadgeStrokeColor
      : data.loseBadgeStrokeColor;
    let badgeText = isWin ? data.winBadgeText : data.loseBadgeText;
    let badgeTextColor = isWin
      ? data.winBadgeTextColor
      : data.loseBadgeTextColor;
    let badgeTextStrokeColor = isWin
      ? data.winBadgeTextStrokeColor
      : data.loseBadgeTextStrokeColor;
    let badgeStrokeThickness = isWin
      ? data.winBadgeTextStrokeThickness
      : data.loseBadgeTextStrokeThickness;

    badgeColor = badgeColor;
    badgeText = badgeText.split('_').join('\n');

    let badgeParent = new Container2();
    pixiScene.addChild(badgeParent);

    badgeParent.resize = (w, h) => {
      badgeParent.x = w / 2;
      badgeParent.y = h / 2;

      badgeParent.scale.set(Math.min((w / 300) * 0.5, (h / 300) * 0.5));
    };

    badgeParent.resize(window.innerWidth, window.innerHeight);

    let badgeBackground = new PIXI.Graphics();
    badgeBackground.beginFill(0xffffff, 1);
    badgeBackground.drawRect(
      -window.innerWidth * 10,
      -window.innerHeight * 10,
      window.innerWidth * 20,
      window.innerHeight * 20,
    );
    badgeBackground.endFill();
    badgeParent.addChild(badgeBackground);
    badgeBackground.alpha = 0;
    badgeBackground.tint = data.badgeBackgroundColor;
    gsap.to(badgeBackground, {
      alpha: data.badgeBackgroundOpacity,
      duration: 0.5,
      ease: 'sine.inOut',
    });
    this.badgeBackground = badgeBackground;

    if (!data.customBadgesEnabled) {
      let badgeBgStroke = new PIXI.Graphics();
      badgeBgStroke.beginFill(badgeStrokeColor);
      badgeBgStroke.drawCircle(0, 0, 205);
      badgeBgStroke.endFill();
      badgeParent.addChild(badgeBgStroke);

      const badge = new PIXI.Graphics();
      badge.beginFill(badgeColor);
      badge.drawCircle(0, 0, 200);
      badge.endFill();

      badgeBgStroke.addChild(badge);

      const style = new PIXI.TextStyle({
        fontFamily: 'badgeCustomFont',
        fontSize: 85,
        fill: badgeTextColor,
        strokeThickness: badgeStrokeThickness,
        stroke: badgeTextStrokeColor,
        wordWrap: false,
        align: 'center',
        lineJoin: 'round',
      });

      const text = new PIXI.Text(badgeText, style);
      text.anchor.set(0.5);

      badge.addChild(text);

      badgeBgStroke.alpha = 0;
      badgeBgStroke.scale.set(5);
      badgeBgStroke.angle = -50;
      gsap.to(badgeBgStroke, {
        alpha: 1,
        duration: 0.5,
        angle: 0,
      });

      gsap.to(badgeBgStroke.scale, {
        x: 1,
        y: 1,
        duration: 0.5,
        ease: 'sine.out',
        onComplete: () => {
          gsap.to(badgeBgStroke, {
            alpha: 0,
            duration: 0.25,
            delay: 0.8,
          });
        },
      });
    } else {
      const badge = new PIXI.Sprite(
        isWin
          ? TextureCache['customWinBadge']
          : TextureCache['customLoseBadge'],
      );

      badge.anchor.set(0.5);
      badgeParent.addChild(badge);
      badge.scale.set(0.5);
      badge.alpha = 0;
      gsap.to(badge, {
        alpha: 1,
        duration: 0.5,
      });
      gsap.to(badge.scale, {
        x: 1,
        y: 1,
        duration: 0.5,
        ease: 'sine.out',
        onComplete: () => {
          gsap.to(badge, {
            alpha: 0,
            duration: 0.25,
            delay: 0.8,
          });
        },
      });
    }
  }

  // ============ PHYSICS & PLAYGROUND SETUP ============

  matterSetup() {
    this.matter = new matterPhysics();
  }

  createPlayground() {
    this.playground = new PIXI.Container({ width: 400, height: 500 });
    pixiScene.addChild(this.playground);

    this.playground.resize = (w, h) => {
      this.playground.x = w * 0.5;

      // Calculate scale first
      let scale = Math.min((w / 400) * 0.7, (h / 500) * 0.5);

      if (w > h) {
        scale = Math.min((w / 400) * 0.9, (h / 500) * 0.55);
      }

      this.playground.scale.set(scale);

      // Position so bottom edge is 10% above screen bottom
      // Bottom edge position = playground.y + (250 * scale)
      // We want: playground.y + (250 * scale) = h * 0.9
      // So: playground.y = h * 0.9 - (250 * scale)
      const playgroundHalfHeight = 230; // Half of playground logical height (500/2)
      this.playground.y = h * 0.7 - playgroundHalfHeight * scale;
      if (w > h) {
        this.playground.y = h * 0.71 - playgroundHalfHeight * scale;
      }

      // Matter.js debugger'ına playground transformasyonlarını bildir
      if (this.matter && this.matter.updateDebugTransform) {
        this.matter.updateDebugTransform(
          this.playground.x,
          this.playground.y,
          this.playground.scale.x,
          this.playground.scale.y,
        );
      }
    };
    this.playground.resize(window.innerWidth, window.innerHeight);
    this.playground.sortableChildren = true;

    this.moveablePlayground = new PIXI.Container({ width: 400, height: 500 });
    this.playground.addChild(this.moveablePlayground);
    this.moveablePlayground.y = 0;
    this.moveablePlayground.x = 0;
    this.moveablePlayground.sortableChildren = true;
  }
  addWallCollider() {}

  matchBoards = [];
  addMatchBoard(xPos = 0, yPos = 580, boardIndex = 0, rows = 7, columns = 7) {
    let matchBoard = new MatchBoard(
      this.moveablePlayground,
      xPos,
      yPos,
      boardIndex,
      rows,
      columns,
    );

    return matchBoard;
  }

  map3placement() {
    this.map3elements = [];
    let textureNames = [
      'ground',
      'up',
      'side',
      'side',
      'upWall',
      'topBottomSide',
      'topBottomSide',
    ];
    let xPositions = [-210, -210, -285, 210, -400, -525, -525];
    let yPositions = [-30, -450, -450, -450, -850, -480, 500];
    let scale = [0.45, 0.45, 0.5, 0.5, 0.8, 1, 1];
    let renderOrder = [0, 0, 0, 0, 4, 5, 5];

    for (let i = 0; i < textureNames.length; i++) {
      let element = new PIXI.Sprite(TextureCache[textureNames[i]]);
      element.x = xPositions[i];
      element.y = yPositions[i];
      element.scale.set(scale[i]);
      element.zIndex = renderOrder[i];
      this.moveablePlayground.addChild(element);
      this.map3elements.push(element);
    }

    if (this.currentMatchBoard) {
      this.currentMatchBoard.hideBoardAndDeactivateCollidersAndInputs();
    }

    this.currentMatchBoard = this.addMatchBoard(-60, 200, 3, 8, 8);

    // Add new environmental elements for level 3
    //  this.addLevel3Environment();
  }

  // ============ COIN METHODS ============

  addLevel3Coins() {
    let coinConfigData = this.coinConfigData.level3Coins;

    this.level3Coins = [];
    this.updatePhysicsBodiesLvl3 = false;

    // Milestone tracking
    this.milestones = [140, 245, 350];
    this.milestoneReached = [false, false, false];
    let rowCount = data.coinLineCount;
    for (let i = 0; i < coinConfigData.length; i++) {
      let coinData = coinConfigData[i];

      // Sadece row değeri coinLineCount'a eşit veya küçük olan coinleri oluştur
      if (coinData.row > rowCount) continue;

      let coin = new PIXI.Sprite(TextureCache['coin']);
      this.moveablePlayground.addChild(coin);
      coin.position.set(coinData.position.x, coinData.position.y);
      coin.anchor.set(0.5);
      coin.scale.set(LEVEL3_COIN_SCALE);
      coin.zIndex = 4;
      coin.body = this.matter.circle(
        coinData.position.x,
        coinData.position.y,
        40 * LEVEL3_COIN_SCALE,
        {
          isStatic: false,
          collisionFilter: {
            category: 0x0004, // Category for level 3 coins
            mask: 0x0001 | 0x0004, // Collide with default category AND other coins
          },
        },
      );
      this.level3Coins.push(coin);
    }

    this.maxCoin3Count = this.level3Coins.length;

    this.updatePhysicsBodiesLvl3 = true;
  }

  /**
   * Create a dynamic coin at a specific position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} textureNum - Texture number (1-5 for gold1-gold5)
   * @returns {PIXI.Sprite} The created coin sprite with physics body
   */
  createDynamicCoin(x, y, textureNum = 1) {
    let coin = new PIXI.Sprite(TextureCache['coin']);
    this.moveablePlayground.addChild(coin);
    coin.position.set(x, y);
    coin.anchor.set(0.5);
    coin.scale.set(LEVEL3_COIN_SCALE);
    coin.zIndex = 4;

    coin.body = this.matter.circle(x, y, 35 * LEVEL3_COIN_SCALE, {
      isStatic: false,
      collisionFilter: {
        category: 0x0004,
        mask: 0x0001 | 0x0004,
      },
    });

    this.level3Coins.push(coin);
    return coin;
  }

  /**
   * Remove a coin and its physics body
   * @param {PIXI.Sprite} coin - The coin to remove
   */
  removeCoin(coin) {
    if (coin.body) {
      this.matter.removeBody(coin.body);
    }
    this.moveablePlayground.removeChild(coin);
    this.level3Coins = this.level3Coins.filter((c) => c !== coin);
    this.coinCollectedCount++;
    // Toplam coin sayısının yüzdesini hesapla (maxCoin3Count orijinal sayıyı tutuyor)
    const targetCount = this.maxCoin3Count * (data.coinTargetPercentage / 100);
    if (this.coinCollectedCount >= targetCount && !this.isGameFinished) {
      this.isGameFinished = true;
      this.setCharacterAnimation('win');
      this.pauseCharacterMovement();

      console.log(
        'Coin target reached! (' +
          this.coinCollectedCount +
          '/' +
          this.maxCoin3Count +
          ')',
      );
    }
  }

  findMinY(coins) {
    if (!coins || coins.length === 0) return 0;

    let maxY = coins[0].position.y;
    for (let i = 1; i < coins.length; i++) {
      if (coins[i].position.y > maxY) {
        maxY = coins[i].position.y;
      }
    }
    // console.log('maxY', maxY);

    // Milestone kontrolü
    for (let i = 0; i < this.milestones.length; i++) {
      if (maxY > this.milestones[i] && !this.milestoneReached[i]) {
        this.milestoneReached[i] = true;
        console.log(`Milestone ${i + 1} geçildi: ${this.milestones[i]}`);
        this.characterLunge();
      }
    }

    return maxY;
  }
  // ============ COLLIDERS ============

  /**
   * Add a static wall collider using Matter.js
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} scaleX - Width of the collider
   * @param {number} scaleY - Height of the collider
   * @param {number} rotation - Rotation in radians
   * @returns {object} The collider graphics object with physics body
   */
  addWallCollider(x, y, scaleX, scaleY, rotation = 0) {
    let collider = new PIXI.Graphics();
    collider.beginFill(0xff0000, 0.5);
    collider.drawRect(-scaleX * 0.5, -scaleY * 0.5, scaleX, scaleY);
    collider.endFill();

    this.moveablePlayground.addChild(collider);
    collider.zIndex = 10;
    collider.x = x;
    collider.y = y;
    collider.rotation = rotation;
    collider.visible = this.physicsDebugEnabled;

    collider.body = this.matter.rectangle(x, y, scaleX, scaleY, {
      isStatic: true,
      angle: rotation,
      collisionFilter: {
        category: 0x0001,
        mask: 0xffff,
      },
    });

    return collider;
  }

  addCharacter(x, y) {
    let gameObject;
    gameObject = new Spine(TextureCache['Roy'].spineData);
    gameObject.scale.set(0.15);
    this.moveablePlayground.addChild(gameObject);
    gameObject.x = x;
    gameObject.y = y;
    gameObject.zIndex = 50;

    // Add child collider that follows the character
    this.addCharacterCollider(gameObject, 20, -60, 200, 100, -30);

    this.character = gameObject;
    return gameObject;
  }

  /**
   * Set character animation
   * Available animations: 'idle', 'backPush', 'dead', 'frontPush', 'win'
   * @param {string} animationName - Name of the animation to play
   * @param {boolean} loop - Whether to loop the animation (default: true)
   * @param {number} trackIndex - Animation track index (default: 3)
   */
  setCharacterAnimation(animationName, loop = true, trackIndex = 3) {
    if (!this.character) {
      console.warn('Character not initialized');
      return;
    }

    const validAnimations = ['idle', 'backPush', 'dead', 'frontPush', 'win'];

    if (!validAnimations.includes(animationName)) {
      console.warn(
        `Invalid animation name: ${animationName}. Valid animations: ${validAnimations.join(', ')}`,
      );
      return;
    }

    this.character.state.setAnimation(trackIndex, animationName, loop);
    return this.character;
  }

  /**
   * Start character movement using GSAP timeline
   * Moves character from current position by deltaX and deltaY over duration
   * @param {number} deltaX - Total X movement (relative change)
   * @param {number} deltaY - Total Y movement (relative change)
   * @param {number} duration - Duration in seconds
   */
  startCharacterMovement(deltaX = -150, deltaY = 0, duration = 10) {
    if (!this.character) return;

    // Store movement data for resume functionality
    this.characterMovementData = {
      startX: this.character.x,
      startY: this.character.y,
      targetX: this.character.x + deltaX,
      targetY: this.character.y + deltaY,
      totalDeltaX: deltaX,
      totalDeltaY: deltaY,
      totalDuration: duration,
      isPaused: false,
    };

    // Create and start the timeline
    this._createCharacterTimeline();

    return this.characterTimeline;
  }

  /**
   * Internal method to create/recreate the character movement timeline
   */
  _createCharacterTimeline() {
    if (!this.character || !this.characterMovementData) return;

    const data = this.characterMovementData;

    // Calculate remaining distance from current position
    const remainingX = data.targetX - this.character.x;
    const remainingY = data.targetY - this.character.y;

    // Calculate remaining duration based on remaining distance ratio
    const totalDistance = Math.sqrt(
      data.totalDeltaX ** 2 + data.totalDeltaY ** 2,
    );
    const remainingDistance = Math.sqrt(remainingX ** 2 + remainingY ** 2);
    const remainingDuration =
      totalDistance > 0
        ? (remainingDistance / totalDistance) * data.totalDuration
        : 0;

    // Kill existing timeline if any
    if (this.characterTimeline) {
      this.characterTimeline.kill();
    }

    // Create new timeline
    this.characterTimeline = gsap.timeline();

    // Add movement tween
    this.characterTimeline.to(this.character, {
      x: data.targetX,
      y: data.targetY,
      duration: remainingDuration,
      ease: 'none',
      onComplete: () => {
        console.log('Character movement completed');
      },
    });
  }

  /**
   * Pause the character movement timeline
   */
  pauseCharacterMovement() {
    if (this.characterTimeline) {
      this.characterTimeline.pause();
      if (this.characterMovementData) {
        this.characterMovementData.isPaused = true;
      }
    }
  }

  /**
   * Resume the character movement from current position
   * Recreates timeline to continue from new position after lunge
   */
  resumeCharacterMovement() {
    if (this.characterMovementData) {
      this.characterMovementData.isPaused = false;
      // Recreate timeline from current position
      this._createCharacterTimeline();
    }
  }

  /**
   * Perform a lunge/attack move - moves character forward quickly
   * @param {number} lungeX - X distance to lunge
   * @param {number} lungeY - Y distance to lunge
   * @param {number} duration - Lunge duration in seconds
   * @param {function} onComplete - Callback when lunge completes
   */
  characterLunge(
    lungeX = 20,
    lungeY = -1.8,
    duration = 1.25,
    onComplete = null,
  ) {
    if (!this.character) return;

    // Prevent multiple lunges at the same time
    if (this.isLunging) return;
    this.isLunging = true;

    // Pause main movement first
    this.pauseCharacterMovement();
    this.setCharacterAnimation('frontPush', false);

    // Create lunge tween
    this.lungeTween = gsap.to(this.character, {
      x: this.character.x + lungeX,
      y: this.character.y + lungeY,
      duration: duration,
      onComplete: () => {
        console.log('Lunge completed');
        this.isLunging = false;
        if (onComplete) onComplete();
        this.resumeCharacterMovement();
        this.setCharacterAnimation('idle', true);
      },
    });

    return this.lungeTween;
  }

  /**
   * Stop and kill the character movement timeline
   */
  stopCharacterMovement() {
    if (this.characterTimeline) {
      this.characterTimeline.kill();
      this.characterTimeline = null;
    }
    if (this.lungeTween) {
      this.lungeTween.kill();
      this.lungeTween = null;
    }
    this.characterMovementData = null;
  }

  /**
   * Add a collider that follows a character (kinematic body)
   * @param {object} parent - Parent object (character) to follow
   * @param {number} offsetX - X offset relative to parent
   * @param {number} offsetY - Y offset relative to parent
   * @param {number} width - Width of the collider
   * @param {number} height - Height of the collider
   * @param {number} rotation - Rotation in radians
   * @returns {object} The collider graphics object with physics body
   */
  addCharacterCollider(parent, offsetX, offsetY, width, height, rotation = 0) {
    // Create visual debug graphics as child of parent
    let colliderGraphics = new PIXI.Graphics();
    colliderGraphics.beginFill(0x00ff00, 0.3);
    colliderGraphics.drawRect(-width * 0.5, -height * 0.5, width, height);
    colliderGraphics.endFill();
    colliderGraphics.x = offsetX;
    colliderGraphics.y = offsetY;
    colliderGraphics.rotation = rotation;
    colliderGraphics.visible = this.physicsDebugEnabled;
    parent.addChild(colliderGraphics);

    // Calculate initial world position
    const worldX = parent.x + offsetX;
    const worldY = parent.y + offsetY;

    // Create Matter.js body (kinematic - static but can be moved)
    let body = this.matter.rectangle(worldX, worldY, width, height, {
      isStatic: true,
      angle: rotation,
      collisionFilter: {
        category: 0x0001,
        mask: 0xffff,
      },
    });

    // Store reference for update
    colliderGraphics.body = body;
    colliderGraphics.offsetX = offsetX;
    colliderGraphics.offsetY = offsetY;
    colliderGraphics.parentRef = parent;

    // Add to character colliders list for updating
    if (!this.characterColliders) {
      this.characterColliders = [];
    }
    this.characterColliders.push(colliderGraphics);

    return colliderGraphics;
  }

  placeWallColliders() {
    this.wallColliders = [];
    this.addWallCollider(250, 0, 80, 5000, 0);
    this.addWallCollider(-250, 0, 70, 5000, 0);
    // this.addWallCollider(-180, 50, 100, 100, 0);
    this.addWallCollider(-95, 20, 300, 40, 0);

    this.addWallCollider(-95, 10, 30, 300, -30);

    this.addWallCollider(-70, -1700, 300, 3000, 0);
    this.addWallCollider(-75, -170, 30, 300, -30);
  }

  placeLevel3Colliders() {
    this.map3colliders = [];

    // Bottom collider
    let bottomCollider = new PIXI.Graphics();
    bottomCollider.beginFill(0xff0000, 0.5);
    let width0 = 1000;
    let height0 = 50;
    bottomCollider.drawRect(-width0 * 0.5, -height0 * 0.5, width0, height0);
    bottomCollider.endFill();
    this.moveablePlayground.addChild(bottomCollider);
    bottomCollider.zIndex = 10;
    bottomCollider.x = 0;
    bottomCollider.y = 310;
    bottomCollider.visible = this.physicsDebugEnabled;
    bottomCollider.body = this.matter.rectangle(
      bottomCollider.x,
      bottomCollider.y,
      width0,
      height0,
      {
        isStatic: true,
        collisionFilter: {
          category: 0x0002,
          mask: 0x0001,
        },
      },
    );
    this.map3colliders.push(bottomCollider);

    // Right wall collider
    let rightCollider = new PIXI.Graphics();
    rightCollider.beginFill(0xff0000, 0.5);
    let width1 = 10;
    let height1 = 800;
    rightCollider.drawRect(-width1 * 0.5, -height1 * 0.5, width1, height1);
    rightCollider.endFill();
    this.moveablePlayground.addChild(rightCollider);
    rightCollider.zIndex = 10;
    rightCollider.x = 250;
    rightCollider.y = 0;
    rightCollider.visible = this.physicsDebugEnabled;
    rightCollider.body = this.matter.rectangle(
      rightCollider.x,
      rightCollider.y,
      width1,
      height1,
      { isStatic: true },
    );
    this.map3colliders.push(rightCollider);

    // Left wall collider
    let leftCollider = new PIXI.Graphics();
    leftCollider.beginFill(0xff0000, 0.5);
    let width2 = 10;
    let height2 = 800;
    leftCollider.drawRect(-width2 * 0.5, -height2 * 0.5, width2, height2);
    leftCollider.endFill();
    this.moveablePlayground.addChild(leftCollider);
    leftCollider.zIndex = 10;
    leftCollider.x = -250;
    leftCollider.y = 0;
    leftCollider.visible = this.physicsDebugEnabled;
    leftCollider.body = this.matter.rectangle(
      leftCollider.x,
      leftCollider.y,
      width2,
      height2,
      { isStatic: true },
    );
    this.map3colliders.push(leftCollider);
  }

  // ============ UPDATE LOOP ============

  update(time, delta) {
    globals.pixiUpdateList.forEach((obj) => obj.update(time, delta));

    // Update physics engine
    if (this.matter) {
      this.matter.update(delta);
    }

    // Update character colliders - sync Matter.js bodies to follow character
    if (this.characterColliders) {
      this.characterColliders.forEach((collider) => {
        if (!collider.body || !collider.parentRef) return;

        // Calculate world position based on parent position + offset
        const worldX = collider.parentRef.x + collider.offsetX;
        const worldY = collider.parentRef.y + collider.offsetY;

        // Update Matter.js body position
        Matter.Body.setPosition(collider.body, { x: worldX, y: worldY });
      });
    }

    // Update level 3 coins - sync physics bodies to visuals
    if (this.level3Coins && this.updatePhysicsBodiesLvl3) {
      this.level3Coins.forEach((coin) => {
        if (!coin.body) return;

        coin.x = coin.body.position.x;
        coin.y = coin.body.position.y;
        coin.rotation = coin.body.angle;

        // Remove coins that fall below y = 400
        if (coin.y > 600) {
          this.removeCoin(coin);
        }
      });
    }
    this.findMinY(this.level3Coins);
  }
}
