import * as PIXI from 'pixi.js';
import data from '../../config/data';
import globals from '../../../globals';
import gsap from 'gsap';
import * as Particles from '@pixi/particle-emitter';
import Container2 from '../../config/Container2';
import AudioManager from '../../../engine/audio/AudioManager';
import { openStorePage } from '../../../engine';
import { Spine } from '@pixi-spine/all-4.1';
// import {
//   EXPLOSION_SCALE,
//   EXPLOSION_SPEED,
//   EXPLOSION_DELAY,
// } from "../../config/constants";

const TextureCache = PIXI.utils.TextureCache;

export default class MatchBoard {
  constructor(
    parentObj,
    xPos = 0,
    yPos = 580,
    boardIndex = 0,
    rows = 7,
    columns = 7,
  ) {
    this.parentObj = parentObj;
    this.xPos = xPos;
    this.yPos = yPos;
    this.boardIndex = boardIndex;
    this.rows = rows;
    this.columns = columns;

    this.start();

    this.physicsDebugEnabled = globals.pixiGame.physicsDebugEnabled;
  }

  boardData = [];

  start() {
    this.setBoardData();
    this.createBoard();
  }

  setBoardData() {
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
      let rowDataStr = data['board' + this.boardIndex + 'Row' + rowIndex];
      let rowDataArr = rowDataStr.split(',').map((item) => item.trim());
      this.boardData[rowIndex] = rowDataArr;
    }
  }

  createBoard() {
    const tileSize = 52;

    let bgColors = [];
    bgColors.push(data.tileBgColor1);
    bgColors.push(data.tileBgColor2);

    this.tiles = [];

    this.mouseFirstPos = null;
    this.selectedTile = null;
    this.swapTile = null;

    for (let i = 0; i < this.columns; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.rows; j++) {
        // let tileBack = new PIXI.Graphics();
        // tileBack.beginFill(bgColors[(i + j) % bgColors.length]);
        // tileBack.drawRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize);
        // tileBack.endFill();
        let tileBack = new PIXI.Sprite(TextureCache['tileBack']);
        // every 2 tiles, use tileBack2
        // if ((i + j) % 2 == 0) {
        //   tileBack = new PIXI.Sprite(TextureCache['tileBack2']);
        // }
        tileBack.anchor.set(0.5);
        tileBack.scale.set((0.25 * tileSize) / 60);
        tileBack.zIndex = 3.1; // Above groundMap3 (3) but below water elements (3.5)
        this.parentObj.addChild(tileBack);
        tileBack.x = this.xPos + (-120 + i * tileSize);
        tileBack.y = this.yPos + (460 - 580 + j * tileSize); // 490 was originally with y=580 base
        this.tiles[i][j] = tileBack;

        tileBack.i = i;
        tileBack.j = j;

        let tileSprite = new PIXI.Sprite(TextureCache[this.boardData[j][i]]);
        tileSprite.anchor.set(0.5);

        let tileSpriteRatio =
          tileSize / Math.max(tileSprite.width, tileSprite.height);
        tileSprite.scale.set(tileSpriteRatio * 1);

        this.parentObj.addChild(tileSprite);
        tileSprite.x = tileBack.x;
        tileSprite.y = tileBack.y;
        tileSprite.typeIndex = this.boardData[j][i];

        tileBack.tileSprite = tileSprite;
        tileSprite.zIndex = 3.2; // Above tile backgrounds

        tileBack.body = globals.pixiGame.matter.rectangle(
          tileBack.x,
          tileBack.y,
          tileSize,
          tileSize,
          {
            isStatic: true,
            label: 'tile-' + i + '-' + j,
          },
        );

        tileBack.interactive = true;

        tileBack.on('pointerdown', (e) => {
          if (globals.loadingScreenPresent) return;
          // Unmute audio on first interaction
          if (globals.pixiGame.unmuteAudioOnFirstInteraction) {
            globals.pixiGame.unmuteAudioOnFirstInteraction();
          }

          // Check if waiting to go to endcard after level 1 tap
          if (globals.pixiGame.waitingForTapToEndcard && false) {
            globals.pixiGame.waitingForTapToEndcard = false;
            globals.EventEmitter.emit('gameFinished', true, true); // skip badge
            return;
          }

          if (globals.bombTutorialOnGoing) return;
          if (
            globals.pixiGame.currentLevel + 1 >= data.lastLevelIs &&
            data.lastLevelIsFake
          ) {
            return;
          }

          if (globals.pixiGame.currentLevel + 1 < this.boardIndex) return;
          // if (globals.pixiGame.lastCreatedSnake.isInitialFastMovement) return;
          if (globals.pixiGame.isPlayerMoving) return;
          if (this.selectedTile) return;
          if (this.swapTile) return;
          if (this.isSwapping) return;
          // if (!globals.pixiGame.secondSnake) return;
          if (globals.gameFinished) return;

          console.log('Tile clicked:', i, j);

          this.selectedTile = tileBack;
          this.mouseFirstPos = e.data.getLocalPosition(this.parentObj);

          if (tileBack.tileSprite.isBomb && !tileBack.tileSprite.exploded) {
            // Bomb clicked

            this.bombExplosion();

            this.hideSwapTutorial();
          }

          if (this.selectedTile && this.selectedTile.matched) {
            this.selectedTile = null;
            this.swapTile = null;

            return;
          }

          this.lastClickLedToSwap = false;
        });

        tileBack.on('pointermove', (e) => {
          if (globals.loadingScreenPresent) return;
          // check if the mouse moved towards a direction (> 10 pixels)
          if (this.isSwapping) return;
          // if (!globals.pixiGame.secondSnake) return;
          if (globals.gameFinished) return;
          if (this.selectedTile && !this.swapTile) {
            let mousePos = e.data.getLocalPosition(this.parentObj);
            let deltaX = mousePos.x - this.mouseFirstPos.x;
            let deltaY = mousePos.y - this.mouseFirstPos.y;
            if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
              let direction = null;
              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
              } else {
                direction = deltaY > 0 ? 'down' : 'up';
              }

              console.log('Detected swipe direction:', direction);

              // find the tile to swap with
              let indexI = this.selectedTile.i;
              let indexJ = this.selectedTile.j;
              if (direction === 'right' && indexI < this.columns) {
                indexI = indexI + 1;
              } else if (direction === 'left' && indexI > 0) {
                indexI = indexI - 1;
              } else if (direction === 'down' && indexJ < this.rows) {
                indexJ = indexJ + 1;
              } else if (direction === 'up' && indexJ > 0) {
                indexJ = indexJ - 1;
              }

              if (
                indexI !== this.selectedTile.i ||
                indexJ !== this.selectedTile.j
              ) {
                this.swapTile = this.tiles[indexI][indexJ];

                if (this.swapTile && this.swapTile.matched) {
                  this.selectedTile = null;
                  this.swapTile = null;
                  return;
                }

                this.performSwap();
              }
            }
          }
        });

        globals.pixiScene.on('pointerup', () => {
          if (globals.loadingScreenPresent) return;
          if (this.lastClickLedToSwap) return;
          if (this.selectedTile) this.selectedTile = null;
          if (this.swapTile) this.swapTile = null;
        });
      }
    }
  }
  lastClickLedToSwap = false;

  firstSwapMade = false;
  isSwapping = false;
  performSwap() {
    this.lastClickLedToSwap = true;
    this.hideSwapTutorial();

    if (this.selectedTile && this.swapTile) {
      this.isSwapping = true;

      AudioManager.playSFX('tileMoveSound');
      AudioManager.playSFX('swipeSound');

      if (!this.firstSwapMade) {
        this.firstSwapMade = true;

        //globals.pixiGame.firstSwapMade();
      }

      // swap positions of their tileSprites
      let selectedTileSprite = this.selectedTile.tileSprite;
      let swapTileSprite = this.swapTile.tileSprite;
      gsap.to(selectedTileSprite, {
        x: this.swapTile.x,
        y: this.swapTile.y,
        duration: 0.18,
        onComplete: () => {
          this.swapTile.tileSprite = selectedTileSprite;
        },
      });
      gsap.to(swapTileSprite, {
        x: this.selectedTile.x,
        y: this.selectedTile.y,
        duration: 0.18,
        onComplete: () => {
          this.selectedTile.tileSprite = swapTileSprite;
        },
      });

      gsap.delayedCall(0.21, () => {
        // check matches

        let matchFound = false;
        this.matchedTiles = [];

        // Helper to add tile to matchedTiles and tint
        const addMatchedTile = (tile) => {
          if (!this.matchedTiles.includes(tile)) {
            this.matchedTiles.push(tile);
          }
        };

        const getTile = (col, row) => {
          if (!this.tiles[col]) return null;
          return this.tiles[col][row] || null;
        };

        const flushHorizontalRun = (rowIndex, endCol, runLength) => {
          if (runLength < 3 || endCol < 0) return;
          const startCol = endCol - runLength + 1;
          if (startCol < 0) return;
          for (let col = startCol; col <= endCol; col++) {
            const tile = getTile(col, rowIndex);
            if (!tile || tile.matched) return;
          }
          matchFound = true;
          for (let col = startCol; col <= endCol; col++) {
            addMatchedTile(getTile(col, rowIndex));
          }
        };

        const flushVerticalRun = (colIndex, endRow, runLength) => {
          if (runLength < 3 || endRow < 0) return;
          const startRow = endRow - runLength + 1;
          if (startRow < 0) return;
          for (let row = startRow; row <= endRow; row++) {
            const tile = getTile(colIndex, row);
            if (!tile || tile.matched) return;
          }
          matchFound = true;
          for (let row = startRow; row <= endRow; row++) {
            addMatchedTile(getTile(colIndex, row));
          }
        };

        // Horizontal match-3+ (ignore matched tiles)
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
          const firstTile = getTile(0, rowIndex);
          let count = firstTile && !firstTile.matched ? 1 : 0;
          for (let colIndex = 1; colIndex < this.columns; colIndex++) {
            const prevTile = getTile(colIndex - 1, rowIndex);
            const currTile = getTile(colIndex, rowIndex);
            const canCompare =
              prevTile && currTile && !prevTile.matched && !currTile.matched;
            if (
              canCompare &&
              prevTile.tileSprite.typeIndex === currTile.tileSprite.typeIndex
            ) {
              count++;
            } else {
              flushHorizontalRun(rowIndex, colIndex - 1, count);
              count = currTile && !currTile.matched ? 1 : 0;
            }
          }
          if (this.columns > 0) {
            flushHorizontalRun(rowIndex, this.columns - 1, count);
          }
        }

        // Vertical match-3+ (ignore matched tiles)
        for (let colIndex = 0; colIndex < this.columns; colIndex++) {
          const firstTile = getTile(colIndex, 0);
          let count = firstTile && !firstTile.matched ? 1 : 0;
          for (let rowIndex = 1; rowIndex < this.rows; rowIndex++) {
            const prevTile = getTile(colIndex, rowIndex - 1);
            const currTile = getTile(colIndex, rowIndex);
            const canCompare =
              prevTile && currTile && !prevTile.matched && !currTile.matched;
            if (
              canCompare &&
              prevTile.tileSprite.typeIndex === currTile.tileSprite.typeIndex
            ) {
              count++;
            } else {
              flushVerticalRun(colIndex, rowIndex - 1, count);
              count = currTile && !currTile.matched ? 1 : 0;
            }
          }
          if (this.rows > 0) {
            flushVerticalRun(colIndex, this.rows - 1, count);
          }
        }

        // 2x2 square match (ignore matched tiles) - DISABLED
        // for (let i = 0; i < this.columns - 1; i++) {
        //   for (let j = 0; j < this.rows - 1; j++) {
        //     let t0Tile = this.tiles[i][j];
        //     let t1Tile = this.tiles[i + 1][j];
        //     let t2Tile = this.tiles[i][j + 1];
        //     let t3Tile = this.tiles[i + 1][j + 1];
        //     if (
        //       t0Tile.matched ||
        //       t1Tile.matched ||
        //       t2Tile.matched ||
        //       t3Tile.matched
        //     )
        //       continue;
        //     let t0 = t0Tile.tileSprite.typeIndex;
        //     let t1 = t1Tile.tileSprite.typeIndex;
        //     let t2 = t2Tile.tileSprite.typeIndex;
        //     let t3 = t3Tile.tileSprite.typeIndex;
        //     if (t0 === t1 && t0 === t2 && t0 === t3) {
        //       matchFound = true;
        //       addMatchedTile(t0Tile);
        //       addMatchedTile(t1Tile);
        //       addMatchedTile(t2Tile);
        //       addMatchedTile(t3Tile);
        //     }
        //   }
        // }

        this.swapCountToMarketChecker();

        // if no matches found, swap back
        if (
          this.swapTile.tileSprite.isBomb ||
          this.selectedTile.tileSprite.isBomb
        ) {
          // explosion
          this.bombExplosion();
        } else if (!matchFound) {
          AudioManager.playSFX('swipeSound');

          gsap.to(selectedTileSprite, {
            x: this.selectedTile.x,
            y: this.selectedTile.y,
            duration: 0.18,
            onComplete: () => {
              this.selectedTile.tileSprite = selectedTileSprite;
            },
          });
          gsap.to(swapTileSprite, {
            x: this.swapTile.x,
            y: this.swapTile.y,
            duration: 0.18,
            onComplete: () => {
              this.swapTile.tileSprite = swapTileSprite;
            },
          });

          gsap.delayedCall(0.21, () => {
            this.isSwapping = false;
            this.selectedTile = null;
            this.swapTile = null;
          });
        } else {
          this.isSwapping = false;
          this.selectedTile = null;
          this.swapTile = null;

          AudioManager.playSFX('tileMatchSound');

          this.matchedTiles.forEach((element) => {
            // matchedTile
            element.matched = true;

            gsap.to(element.tileSprite.scale, {
              x: 0,
              y: 0,
              duration: 0.18,
              ease: 'back.in',
            });

            gsap.to(element, {
              alpha: 0,
              duration: 0.18,
              onComplete: () => {},
            });

            // element.body.isSensor = true;
            globals.pixiGame.matter.removeBody(element.body);
            element.body = null;

            // this.particle2(element);
          });

          this.matchCountToMarketChecker();
        }
      });
    }
  }

  matchCountToMarketChecker() {
    // Hide speech bubble on first match
    if (globals.pixiGame && globals.pixiGame.hideSpeechBubble) {
      globals.pixiGame.hideSpeechBubble();
    }

    if (data.xBoardMatchesToMarket > 0) {
      globals.matchedCount++;

      if (globals.matchedCount >= data.xBoardMatchesToMarket) {
        openStorePage();
      }
    }

    // Check if we should go to endcard after X matches in level 2
    if (data.goToEndcardAfterXMatchesInLevel2 > 0 && this.boardIndex === 2) {
      if (!this.level2MatchCount) this.level2MatchCount = 0;
      this.level2MatchCount++;

      if (this.level2MatchCount >= data.goToEndcardAfterXMatchesInLevel2) {
        openStorePage();
        globals.EventEmitter.emit('gameFinished', true, false); // skip badge
      }
    }

    // Check if we should go to endcard after X matches in level 3
    if (data.goToEndcardAfterXMatchesInLevel3 > 0 && this.boardIndex === 3) {
      if (!this.level3MatchCount) this.level3MatchCount = 0;
      this.level3MatchCount++;

      if (this.level3MatchCount >= data.goToEndcardAfterXMatchesInLevel3) {
        openStorePage();
        globals.EventEmitter.emit('gameFinished', true);
      }
    }
  }

  swapCountToMarketChecker() {
    if (data.xBoardSwapsToMarket > 0) {
      globals.swapCount++;
      if (globals.swapCount >= data.xBoardSwapsToMarket) {
        openStorePage();
      }
    }
  }

  particle2(tileBack) {
    const innerSize = 8;
    const outerSize = 14;
    const maxScale = 0.15;
    const minScale = 0.1;
    const maxParticles = 8;
    const frequency = 0.0015;
    const lifetime = {
      min: 1,
      max: 1,
    };
    const parent = globals.pixiScene;
    const cont = new PIXI.Container();
    cont.scale.set(0.7);
    parent.addChild(cont);

    let wp = tileBack.toGlobal(new PIXI.Point(0, 0));
    cont.position.set(wp.x, wp.y);
    // cont.position.set(this.x, this.y);

    const emitter = new Particles.Emitter(cont, {
      lifetime: lifetime,
      frequency: frequency,
      spawnChance: 1,
      particlesPerWave: 1,
      emitterLifetime: 0.6,
      maxParticles: maxParticles,
      pos: {
        x: 0,
        y: 0,
      },
      addAtBack: true,
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                {
                  value: 1,
                  time: 0,
                },
                {
                  value: 0,
                  time: 0.8,
                },
                {
                  value: 0,
                  time: 1,
                },
              ],
            },
          },
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                {
                  value: minScale,
                  time: 0,
                },
                {
                  value: maxScale,
                  time: 1,
                },
              ],
            },
          },
        },
        {
          type: 'colorStatic',
          config: {
            // from 0xffffff to #ffffff format (data.tileBreakParticleColor)
            color: PIXI.utils.hex2string(data.tileBreakParticlesColor),
          },
        },
        {
          type: 'moveAcceleration',
          config: {
            accel: {
              x: 0,
              y: 600,
            },
            // maxSpeed: 1000,
            minStart: 250,
            maxStart: 250,
            rotate: true,
          },
        },
        {
          type: 'rotationStatic',
          config: {
            min: 250,
            max: 290,
          },
        },
        {
          type: 'spawnShape',
          config: {
            type: 'circle',
            data: {
              x: -innerSize * 0.5,
              y: 0,
              radius: outerSize,
              innerRadius: innerSize,
              affectRotation: false,
            },
          },
        },
        {
          type: 'textureRandom',
          config: {
            textures: [TextureCache['particle1'], TextureCache['particle2']],
          },
        },
      ],
    });
    emitter.autoUpdate = true;
    emitter.emit = true;
    this.particleCont = cont;
    cont.emitter = emitter;
  }

  update(delta) {}

  showTutorial(isClick) {
    if (isClick) {
      this.showClickTutorial();
    } else {
      this.showSwapTutorial();
    }
  }

  showClickTutorial() {
    if (!data['Level' + this.boardIndex + 'TutorialEnabled']) return;
    let targetTileRowCol = {
      // Level1TutorialHandTargetClickTileRow
      i: data['Level' + this.boardIndex + 'TutorialHandTargetClickTileRow'] - 1,
      j: data['Level' + this.boardIndex + 'TutorialHandTargetClickTileCol'] - 1,
    };

    let targetTile = this.tiles[targetTileRowCol.j][targetTileRowCol.i];

    this.hand = new PIXI.Sprite(TextureCache['hand']);
    this.hand.anchor.set(data.handAnchorX, data.handAnchorY);
    this.hand.scale.set(data['Level' + this.boardIndex + 'HandScale'] * 0.5);
    this.parentObj.addChild(this.hand);
    this.hand.zIndex = 9;

    this.hand.x = targetTile.x;
    this.hand.y = targetTile.y;

    gsap.to(this.hand.scale, {
      x: this.hand.scale.x * 0.9,
      y: this.hand.scale.y * 0.9,
      ease: 'sine.inOut',
      duration: 1,
      yoyo: true,
      repeat: -1,
    });

    this.showTutorialText();
  }

  hideClickTutorial() {
    if (!data['Level' + this.boardIndex + 'TutorialEnabled']) return;
    if (!this.hand) return;

    if (this.hand) {
      this.parentObj.removeChild(this.hand);
      this.hand = null;
    }

    this.hideTutorialText();
  }

  showSwapTutorial() {
    if (!data['Level' + this.boardIndex + 'TutorialEnabled']) return;
    let startTileRowCol = {
      // Level1TutorialHandTargetSwipeTile1Row
      i:
        data['Level' + this.boardIndex + 'TutorialHandTargetSwipeTile1Row'] - 1,
      j:
        data['Level' + this.boardIndex + 'TutorialHandTargetSwipeTile1Col'] - 1,
    };
    let endTileRowCol = {
      i:
        data['Level' + this.boardIndex + 'TutorialHandTargetSwipeTile2Row'] - 1,
      j:
        data['Level' + this.boardIndex + 'TutorialHandTargetSwipeTile2Col'] - 1,
    };

    let startTile = this.tiles[startTileRowCol.j][startTileRowCol.i];
    let endTile = this.tiles[endTileRowCol.j][endTileRowCol.i];

    this.hand = new PIXI.Sprite(TextureCache['hand']);
    this.hand.anchor.set(data.handAnchorX, data.handAnchorY);
    this.hand.scale.set(data['Level' + this.boardIndex + 'HandScale'] * 0.5);
    this.parentObj.addChild(this.hand);
    this.hand.zIndex = 9;

    this.hand.x = startTile.x;
    this.hand.y = startTile.y;

    gsap.to(this.hand, {
      x: endTile.x,
      y: endTile.y,
      ease: 'sine.inOut',
      duration: 1,
      // yoyo: true,
      repeat: -1,
    });

    this.showTutorialText();
  }

  hideSwapTutorial() {
    if (!data['Level' + this.boardIndex + 'TutorialEnabled']) return;
    if (!this.hand) return;

    if (this.hand) {
      this.parentObj.removeChild(this.hand);
      this.hand = null;
    }

    this.hideTutorialText();
  }

  showTutorialText() {
    if (this.tutorialText) return;
    if (!data['Level' + this.boardIndex + 'TutorialEnabled']) return;

    let textString = data['Level' + this.boardIndex + 'TutorialText']
      .split('_')
      .join('\n');
    let textColor = data['Level' + this.boardIndex + 'TutorialTextColor'];
    let textStrokeColor =
      data['Level' + this.boardIndex + 'TutorialTextStrokeColor'];
    let textStrokeThickness =
      data['Level' + this.boardIndex + 'TutorialTextStrokeThickness'];
    let textParent = new Container2({ width: 300, height: 100 });
    globals.pixiScene.addChild(textParent);
    textParent.resize = (w, h) => {
      textParent.x = w * data['Level' + this.boardIndex + 'TutorialTextPosX'];
      textParent.y = h * data['Level' + this.boardIndex + 'TutorialTextPosY'];

      textParent.scale.set(
        Math.min((w / 300) * 0.7, (h / 100) * 0.12) *
          data['Level' + this.boardIndex + 'TutorialTextScale'],
      );

      if (w > h) {
        textParent.scale.set(
          Math.min((w / 300) * 0.55, (h / 100) * 0.11) *
            data['Level' + this.boardIndex + 'TutorialTextScale'],
        );
      }
    };
    textParent.resize(window.innerWidth, window.innerHeight);

    this.tutorialText = new PIXI.Text(textString, {
      fill: textColor,
      stroke: textStrokeColor,
      strokeThickness: textStrokeThickness,
      fontFamily: 'game-font',
      fontSize: 36,
      align: 'center',
      lineJoin: 'round',
    });
    this.tutorialText.anchor.set(0.5);
    textParent.addChild(this.tutorialText);

    gsap.to(this.tutorialText.scale, {
      x: 0.9,
      y: 0.9,
      ease: 'sine.inOut',
      duration: 1,
      yoyo: true,
      repeat: -1,
    });
  }

  hideTutorialText() {
    if (!this.tutorialText) return;
    this.tutorialText.parent.removeChild(this.tutorialText);
    this.tutorialText = null;
  }

  hideBoardAndDeactivateCollidersAndInputs() {
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        let tileBack = this.tiles[i][j];
        if (!tileBack) continue;
        tileBack.interactive = false;
        tileBack.visible = false;
        tileBack.tileSprite.visible = false;
        if (tileBack.body) {
          globals.pixiGame.matter.removeBody(tileBack.body);
          tileBack.body = null;
        }
      }
    }
  }
}
