import * as PIXI from 'pixi.js';
import data from '../../config/data';
import globals from '../../../globals';
import gsap from 'gsap';
import * as Particles from '@pixi/particle-emitter';
import Container2 from '../../config/Container2';
import AudioManager from '../../../engine/audio/AudioManager';
import { openStorePage } from '../../../engine';
import { ParticleContainer } from 'pixi.js';
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
    this.userMatchCount = 0;

    this.physicsDebugEnabled = globals.pixiGame.physicsDebugEnabled;
  }

  boardData = [];

  start() {
    this.setBoardData();
    this.createBoard();
    this.scheduleTutorialAfterDelay(2);
  }

  /**
   * Fade out the tutorial hand with animation
   */
  fadeTutorialOut() {
    if (!this.hand) return;

    // Kill any existing tutorial delayed call
    if (this.tutorialDelayedCall) {
      this.tutorialDelayedCall.kill();
      this.tutorialDelayedCall = null;
    }

    gsap.killTweensOf(this.hand);
    gsap.to(this.hand, {
      alpha: 0,
      duration: 0.3,
      onComplete: () => {
        if (this.hand) {
          this.parentObj.removeChild(this.hand);
          this.hand = null;
        }
      },
    });
  }

  /**
   * Schedule a new tutorial to appear after delay (if no match is made)
   * @param {number} delay - Delay in seconds before showing tutorial
   */
  scheduleTutorialAfterDelay(delay = 1) {
    // Kill any existing delayed call
    if (this.tutorialDelayedCall) {
      this.tutorialDelayedCall.kill();
    }

    this.tutorialDelayedCall = gsap.delayedCall(delay, () => {
      this.showDynamicTutorial();
    });
  }

  /**
   * Called when a match is made - fades out tutorial and schedules new one
   */
  onMatchMade() {
    this.fadeTutorialOut();
    this.scheduleTutorialAfterDelay(data.handRespawnTime);
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

        // Color mapping for tile asset names to hex colors
        const colorMap = {
          orange: '#FFA500',
          yellow: '#FFFF00',
          red: '#FF0000',
          purple: '#800080',
          blue: '#0000FF',
          green: '#00FF00',
          pink: '#FFC0CB',
          white: '#FFFFFF',
          black: '#000000',
          X: '#FF0000', // bomb color
        };

        let tileSprite = new PIXI.Sprite(TextureCache[this.boardData[j][i]]);
        tileSprite.anchor.set(0.5);

        let tileSpriteRatio =
          tileSize / Math.max(tileSprite.width, tileSprite.height);
        tileSprite.scale.set(tileSpriteRatio * data.tileScale);

        this.parentObj.addChild(tileSprite);
        tileSprite.x = tileBack.x;
        tileSprite.y = tileBack.y;
        tileSprite.typeIndex = this.boardData[j][i];
        tileSprite.color = colorMap[this.boardData[j][i]] || '#FFFFFF'; // Store hex color based on asset name

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
              AudioManager.playSFX('swipeSound');

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

    // Create border around the board
    //this.createBorder();
  }

  /**
   * Create border sprites around the board
   */
  createBorder() {
    const tileSize = 52;
    const borderSize = tileSize * 1.3; // Border sprite size

    // Calculate board bounds
    const boardLeft = this.xPos + -120;
    const boardRight = this.xPos + (-120 + (this.columns - 1) * tileSize);
    const boardTop = this.yPos + (460 - 580);
    const boardBottom = this.yPos + (460 - 580 + (this.rows - 1) * tileSize);

    // Helper to create a border sprite
    const createBorderSprite = (
      textureKey,
      x,
      y,
      width = borderSize,
      height = borderSize,
    ) => {
      const texture = TextureCache[textureKey];
      if (!texture) {
        console.warn(`Border texture not found: ${textureKey}`);
        return null;
      }
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.width = width;
      sprite.height = height;
      sprite.x = x;
      sprite.y = y;
      sprite.zIndex = 3.05; // Below tile backgrounds but visible
      sprite.eventMode = 'none';
      this.parentObj.addChild(sprite);
      return sprite;
    };

    // Top edge - use "down" texture (faces down toward board)
    // Skip first and last positions for corners
    for (let i = 1; i < this.columns - 1; i++) {
      const x = this.xPos + (-120 + i * tileSize);
      const y = boardTop - borderSize;
      createBorderSprite('down', x, y);
    }

    // Bottom edge - use "up" texture (faces up toward board)
    // Skip first and last positions for corners
    for (let i = 1; i < this.columns - 1; i++) {
      const x = this.xPos + (-120 + i * tileSize);
      const y = boardBottom + borderSize;
      createBorderSprite('up', x, y);
    }

    // Left edge - use "right" texture (faces right toward board)
    // Skip first and last positions for corners
    for (let j = 1; j < this.rows - 1; j++) {
      const x = boardLeft - borderSize;
      const y = this.yPos + (460 - 580 + j * tileSize);
      createBorderSprite('right', x, y);
    }

    // Right edge - use "left" texture (faces left toward board)
    // Skip first and last positions for corners
    for (let j = 1; j < this.rows - 1; j++) {
      const x = boardRight + borderSize;
      const y = this.yPos + (460 - 580 + j * tileSize);
      createBorderSprite('left', x, y);
    }

    // Corners - use corner textures facing toward the board (rotated 180 degrees)
    const cornerOffset = borderSize / 6;

    // Top-left corner
    const topLeftCorner = createBorderSprite(
      'lowerRight',
      boardLeft - cornerOffset,
      boardTop - cornerOffset,
    );
    if (topLeftCorner) topLeftCorner.rotation = Math.PI;

    // Top-right corner
    const topRightCorner = createBorderSprite(
      'lowerLeft',
      boardRight + cornerOffset,
      boardTop - cornerOffset,
    );
    if (topRightCorner) topRightCorner.rotation = Math.PI;

    // Bottom-left corner
    const bottomLeftCorner = createBorderSprite(
      'upperRight',
      boardLeft - cornerOffset,
      boardBottom + cornerOffset,
    );
    if (bottomLeftCorner) bottomLeftCorner.rotation = Math.PI;

    // Bottom-right corner
    const bottomRightCorner = createBorderSprite(
      'upperLeft',
      boardRight + cornerOffset,
      boardBottom + cornerOffset,
    );
    if (bottomRightCorner) bottomRightCorner.rotation = Math.PI;
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

          // Fade out tutorial and schedule new one after 1 second
          this.onMatchMade();

          this.matchedTiles.forEach((element) => {
            // matchedTile
            element.matched = true;
            console.log(element);
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

            //this.particle();
            this.particle2(element, element.tileSprite.color);

            AudioManager.playSFX('matchSound');
          });

          this.matchCountToMarketChecker();
        }
      });
    }
  }

  matchCountToMarketChecker() {
    if (data.xBoardMatchesToMarket > 0) {
      this.userMatchCount++;
      console.log(this.userMatchCount);
      if (this.userMatchCount >= data.xBoardMatchesToMarket) {
        openStorePage();
      }
    }
    if (data.xBoardMatchesToEndCard > 0) {
      this.userMatchCount++;
      console.log(this.userMatchCount);
      if (this.userMatchCount >= data.xBoardMatchesToEndCard) {
        globals.EventEmitter.emit('gameFinished', false);
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

  particle2(tileBack, color) {
    const innerSize = 11;
    const outerSize = 22;
    const maxScale = 0.3;
    const minScale = 0.15;
    const maxParticles = 8;
    const frequency = 0.0015;
    const lifetime = {
      min: 0.8,
      max: 0.8,
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
      emitterLifetime: 0.2,
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
                  value: 1,
                  time: 0.6,
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
            color: color,
          },
        },
        {
          type: 'moveAcceleration',
          config: {
            accel: {
              x: 0,
              y: 3000,
            },
            // maxSpeed: 1000,
            minStart: 400,
            maxStart: 400,
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
            type: 'torus',
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
          type: 'textureSingle',
          config: {
            texture: TextureCache['particle1'],
          },
        },
      ],
    });
    emitter.autoUpdate = true;
    emitter.emit = true;
    this.particleCont = cont;
    cont.emitter = emitter;
  }

  /**
   * Find all possible moves that would create a match-3
   * @returns {Array} Array of possible moves: { tile1: {i, j}, tile2: {i, j}, direction, matchCount }
   */
  findAllPossibleMoves() {
    const possibleMoves = [];

    const getTileType = (col, row) => {
      if (col < 0 || col >= this.columns || row < 0 || row >= this.rows)
        return null;
      const tile = this.tiles[col]?.[row];
      if (!tile || tile.matched) return null;
      return tile.tileSprite?.typeIndex || null;
    };

    // Check if swapping (col1,row1) with (col2,row2) creates a match
    const checkSwapCreatesMatch = (col1, row1, col2, row2) => {
      // Temporarily swap
      const type1 = getTileType(col1, row1);
      const type2 = getTileType(col2, row2);
      if (!type1 || !type2) return 0;

      // Create a virtual board state
      const getTypeAt = (c, r) => {
        if (c === col1 && r === row1) return type2;
        if (c === col2 && r === row2) return type1;
        return getTileType(c, r);
      };

      let matchCount = 0;

      // Check matches for position (col1, row1) after swap (now has type2)
      // Horizontal
      let hCount1 = 1;
      for (let c = col1 - 1; c >= 0 && getTypeAt(c, row1) === type2; c--)
        hCount1++;
      for (
        let c = col1 + 1;
        c < this.columns && getTypeAt(c, row1) === type2;
        c++
      )
        hCount1++;
      if (hCount1 >= 3) matchCount += hCount1;

      // Vertical
      let vCount1 = 1;
      for (let r = row1 - 1; r >= 0 && getTypeAt(col1, r) === type2; r--)
        vCount1++;
      for (let r = row1 + 1; r < this.rows && getTypeAt(col1, r) === type2; r++)
        vCount1++;
      if (vCount1 >= 3) matchCount += vCount1;

      // Check matches for position (col2, row2) after swap (now has type1)
      // Horizontal
      let hCount2 = 1;
      for (let c = col2 - 1; c >= 0 && getTypeAt(c, row2) === type1; c--)
        hCount2++;
      for (
        let c = col2 + 1;
        c < this.columns && getTypeAt(c, row2) === type1;
        c++
      )
        hCount2++;
      if (hCount2 >= 3) matchCount += hCount2;

      // Vertical
      let vCount2 = 1;
      for (let r = row2 - 1; r >= 0 && getTypeAt(col2, r) === type1; r--)
        vCount2++;
      for (let r = row2 + 1; r < this.rows && getTypeAt(col2, r) === type1; r++)
        vCount2++;
      if (vCount2 >= 3) matchCount += vCount2;

      return matchCount;
    };

    // Scan all tiles
    for (let col = 0; col < this.columns; col++) {
      for (let row = 0; row < this.rows; row++) {
        const tile = this.tiles[col]?.[row];
        if (!tile || tile.matched) continue;

        // Check swap right
        if (col < this.columns - 1) {
          const matchCount = checkSwapCreatesMatch(col, row, col + 1, row);
          if (matchCount > 0) {
            possibleMoves.push({
              tile1: { i: col, j: row },
              tile2: { i: col + 1, j: row },
              direction: 'right',
              matchCount,
              avgY: (this.tiles[col][row].y + this.tiles[col + 1][row].y) / 2,
            });
          }
        }

        // Check swap down
        if (row < this.rows - 1) {
          const matchCount = checkSwapCreatesMatch(col, row, col, row + 1);
          if (matchCount > 0) {
            possibleMoves.push({
              tile1: { i: col, j: row },
              tile2: { i: col, j: row + 1 },
              direction: 'down',
              matchCount,
              avgY: (this.tiles[col][row].y + this.tiles[col][row + 1].y) / 2,
            });
          }
        }
      }
    }

    return possibleMoves;
  }

  /**
   * Find the best move: closest to coin position AND with highest Y value (towards bottom)
   * @param {number} targetX - The X position of the coin
   * @param {number} targetY - The Y position of the coin
   * @returns {Object|null} The best move or null if no moves available
   */
  findBestMoveForCoins(targetX, targetY) {
    const possibleMoves = this.findAllPossibleMoves();

    if (possibleMoves.length === 0) {
      console.log('No possible moves found!');
      return null;
    }

    // Calculate average X and distance for each move
    possibleMoves.forEach((move) => {
      const tile1 = this.tiles[move.tile1.i][move.tile1.j];
      const tile2 = this.tiles[move.tile2.i][move.tile2.j];
      move.avgX = (tile1.x + tile2.x) / 2;
      move.distance = Math.sqrt(
        Math.pow(move.avgX - targetX, 2) + Math.pow(move.avgY - targetY, 2),
      );
    });

    // Sort: first by highest Y (closest to bottom/800), then by distance to coin
    // This prioritizes moves that open path downwards while still being near the coin
    possibleMoves.sort((a, b) => {
      // Primary: Higher Y value first (closer to bottom where coins go)
      if (b.avgY !== a.avgY) return b.avgY - a.avgY;
      // Secondary: Closer to coin position
      if (a.distance !== b.distance) return a.distance - b.distance;
      // Tertiary: More matches
      return b.matchCount - a.matchCount;
    });

    const bestMove = possibleMoves[0];
    console.log('Best move for coins:', bestMove);
    return bestMove;
  }

  /**
   * Find all tiles that are near/touching any coin
   * @param {number} proximityThreshold - How close a coin needs to be to a tile (default 80)
   * @returns {Set} Set of tile keys "col,row" that are near coins
   */
  findTilesNearCoins(proximityThreshold = 80) {
    const coins = globals.pixiGame?.level3Coins;
    const nearbyTiles = new Set();

    if (!coins || coins.length === 0) return nearbyTiles;

    for (const coin of coins) {
      for (let col = 0; col < this.columns; col++) {
        for (let row = 0; row < this.rows; row++) {
          const tile = this.tiles[col]?.[row];
          if (!tile || tile.matched) continue;

          const dx = coin.x - tile.x;
          const dy = coin.y - tile.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= proximityThreshold) {
            nearbyTiles.add(`${col},${row}`);
          }
        }
      }
    }

    return nearbyTiles;
  }

  /**
   * Find the best move: among tiles touching coins, pick the one with highest Y
   * @returns {Object|null} The best move or null if no moves available
   */
  findBestMoveNearCoins() {
    const possibleMoves = this.findAllPossibleMoves();

    if (possibleMoves.length === 0) {
      console.log('No possible moves found!');
      return null;
    }

    // Find tiles that are near coins
    const tilesNearCoins = this.findTilesNearCoins(80);
    console.log('Tiles near coins:', [...tilesNearCoins]);

    if (tilesNearCoins.size === 0) {
      console.log('No tiles near coins, falling back to highest Y move');
      // Fallback: just pick highest Y move
      possibleMoves.sort((a, b) => b.avgY - a.avgY);
      return possibleMoves[0];
    }

    // Filter moves to only include those involving tiles near coins
    const movesNearCoins = possibleMoves.filter((move) => {
      const tile1Key = `${move.tile1.i},${move.tile1.j}`;
      const tile2Key = `${move.tile2.i},${move.tile2.j}`;
      return tilesNearCoins.has(tile1Key) || tilesNearCoins.has(tile2Key);
    });

    console.log('Moves near coins:', movesNearCoins.length);

    if (movesNearCoins.length === 0) {
      console.log('No moves near coins, falling back to highest Y move');
      // Fallback: just pick highest Y move
      possibleMoves.sort((a, b) => b.avgY - a.avgY);
      return possibleMoves[0];
    }

    // Among moves near coins, pick the one with highest Y value
    movesNearCoins.sort((a, b) => {
      // Primary: Higher Y value first (closer to bottom)
      if (b.avgY !== a.avgY) return b.avgY - a.avgY;
      // Secondary: More matches
      return b.matchCount - a.matchCount;
    });

    const bestMove = movesNearCoins[0];
    console.log('Best move near coins:', bestMove);
    return bestMove;
  }

  /**
   * Show dynamic tutorial based on coin positions
   * Finds tiles near coins and shows the best move with highest Y among them
   */
  showDynamicTutorial() {
    const bestMove = this.findBestMoveNearCoins();
    if (!bestMove) return;

    // Hide existing tutorial
    this.hideSwapTutorial();

    const startTile = this.tiles[bestMove.tile1.i][bestMove.tile1.j];
    const endTile = this.tiles[bestMove.tile2.i][bestMove.tile2.j];

    this.hand = new PIXI.Sprite(TextureCache['hand']);
    this.hand.anchor.set(data.handAnchorX, data.handAnchorY);
    this.hand.scale.set(data.handScale || 0.5);
    this.hand.angle = data.handAngle || 0;
    this.parentObj.addChild(this.hand);
    this.hand.zIndex = 9;

    this.hand.x = startTile.x;
    this.hand.y = startTile.y;
    this.hand.alpha = 0;
    gsap.to(this.hand, {
      alpha: 1,
      duration: 0.2,
      onComplete: () => {
        gsap.to(this.hand, {
          x: endTile.x,
          y: endTile.y,
          ease: 'sine.inOut',
          duration: 1,
          repeat: -1,
        });
      },
    });
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
