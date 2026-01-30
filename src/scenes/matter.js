import Matter from 'matter-js';
import globals from '../../globals';
import data from '../config/data';

let engine, world;

var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  Common = Matter.Common,
  Runner = Matter.Runner;

class matterPhysics {
  constructor(gravity = { x: 0, y: 1.3 }, meterToPixel = 20) {
    // provide concave decomposition support library
    // Common.setDecomp(require("poly-decomp"));
    globals.decomp = require('poly-decomp');
    Common.setDecomp(globals.decomp);

    engine = Matter.Engine.create({
      gravity: { x: gravity.x, y: gravity.y },
      positionIterations: 10, // ÇOK fazla iterasyon - tunneling önleme
      velocityIterations: 10, // ÇOK fazla iterasyon - hassas çarpışma
      constraintIterations: 10, // Daha fazla constraint iterasyonu
    });
    world = engine.world;

    this.Matter = Matter;

    this.engine = engine;
    this.world = engine.world;

    this.meterToPixel = meterToPixel;

    this.eventList = [];

    globals.matterPhysics = this;

    let opacity = '0.5';
    if (data.debugPhysics) {
      opacity = '0.5';
    } else {
      opacity = '0';
    }

    // Debug Canvas - Fizik objelerini görmek için
    this.debugCanvas = document.createElement('canvas');
    this.debugCanvas.width = window.innerWidth;
    this.debugCanvas.height = window.innerHeight;
    this.debugCanvas.style.position = 'absolute';
    this.debugCanvas.style.top = '0';
    this.debugCanvas.style.left = '0';
    this.debugCanvas.style.pointerEvents = 'none';
    this.debugCanvas.style.zIndex = '10000';
    this.debugCanvas.style.opacity = opacity; // Saydam - Pixi'yi de görmek için
    document.body.appendChild(this.debugCanvas);

    // Debug Render
    this.debugRender = Matter.Render.create({
      canvas: this.debugCanvas,
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: true,
        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true,
        background: 'transparent',
      },
    });
    // Manuel render yapacağız, otomatik render'ı başlatmıyoruz

    // Resize handler
    window.addEventListener('resize', () => {
      this.debugCanvas.width = window.innerWidth;
      this.debugCanvas.height = window.innerHeight;
      this.debugRender.options.width = window.innerWidth;
      this.debugRender.options.height = window.innerHeight;
      this.debugRender.bounds.max.x = window.innerWidth;
      this.debugRender.bounds.max.y = window.innerHeight;
      // Mevcut playground transform değerlerini koru
      const { x, y, scaleX, scaleY } = this.playgroundTransform;
      this.updateDebugTransform(x, y, scaleX, scaleY);
    });

    // this.enableDebugDraw();

    // this.Matter.Runner.isFixed = true;
    // console.log("this.matter.runner: ", this.Matter.Runner);

    // Playground transform bilgileri
    this.playgroundTransform = {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    };
  }

  // Playground transformasyonlarını güncelle
  updateDebugTransform(x = 0, y = 0, scaleX = 1, scaleY = 1) {
    this.playgroundTransform = { x, y, scaleX, scaleY };

    // Debugger'ın bounds'unu playground'a göre ayarla
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Playground'un tersine çevrilmiş transformasyonunu hesapla
    // Debugger'ın göstermesi gereken fizik dünyası alanını belirle
    const invScale = 1 / scaleX;

    this.debugRender.bounds.min.x = -x * invScale;
    this.debugRender.bounds.min.y = -y * invScale;
    this.debugRender.bounds.max.x = (w - x) * invScale;
    this.debugRender.bounds.max.y = (h - y) * invScale;

    // Canvas context'ini scale et
    this.debugRender.context.setTransform(scaleX, 0, 0, scaleY, x, y);
  }

  // Constraint helpers
  createConstraint(options) {
    const constraint = this.Matter.Constraint.create(options);
    this.addConstraint(constraint);
    return constraint;
  }

  addConstraint(constraint) {
    this.Matter.World.add(this.world, constraint);
  }

  removeConstraint(constraint) {
    this.Matter.World.remove(this.world, constraint);
  }

  currentLength(constraint) {
    return this.Matter.Constraint.currentLength(constraint);
  }

  pointAWorld(constraint) {
    return this.Matter.Constraint.pointAWorld(constraint);
  }

  pointBWorld(constraint) {
    return this.Matter.Constraint.pointBWorld(constraint);
  }

  init() {}

  addToWorld(objects) {
    World.add(this.world, objects);
  }

  removeBody(body) {
    //World.remove(engine.world, body);
    Matter.Composite.remove(this.world, body);
  }

  setGravity(x, y) {
    this.world.gravity.x = x || 0;
    this.world.gravity.y = y || 0;
  }

  rectangle(x, y, width, height, data) {
    var body = Bodies.rectangle(x, y, width, height, data);
    World.add(this.world, body);
    return body;
  }

  circle(x, y, radius, data) {
    var body = Bodies.circle(x, y, radius, data);
    World.add(this.world, body);
    return body;
  }

  polygon(x, y, polygon, data) {
    console.log('x, y, polygon, data: ', x, y, polygon, data);
    var body = Bodies.fromVertices(x, y, polygon, data, false, 0.0001, 0.0001);
    console.log('Body: ', body);
    World.add(this.world, body);
    return body;
  }

  trapezoid(x, y, width, height, slope, data) {
    var body = Bodies.trapezoid(x, y, width, height, slope, data);
    World.add(this.world, body);
    return body;
  }

  update(delta) {
    // Clamp delta to prevent physics corruption from large time steps
    // This prevents issues when app is minimized/restored or during resize
    // Delta is expected in seconds (from gsap ticker: delta / 1000)
    const MAX_DELTA_SECONDS = 0.1; // Maximum 100ms per frame (10 FPS minimum)
    const clampedDelta = Math.min(delta || 0.016, MAX_DELTA_SECONDS);

    // Matter.js Engine.update expects delta in milliseconds
    Engine.update(this.engine, clampedDelta * 1000);

    // Manuel debug render - playground transformasyonlarıyla
    if (this.debugRender && this.debugCanvas) {
      const ctx = this.debugRender.context;

      // Canvas'ı temizle
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);

      // Playground transformasyonlarını uygula
      const { x, y, scaleX, scaleY } = this.playgroundTransform;
      ctx.setTransform(scaleX, 0, 0, scaleY, x, y);

      // Matter.js renderını çiz
      Matter.Render.world(this.debugRender);
    }
  }

  removeAllEvents() {
    for (let event of this.eventList) {
      Events.off(this.engine, event.name, event.callback);
    }

    this.eventList = [];
  }

  listenCollisionStart(callback) {
    Events.on(this.engine, 'collisionStart', callback);

    this.eventList.push({
      name: 'collisionStart',
      callback,
    });
  }

  listenCollisionActive(callback) {
    Events.on(this.engine, 'collisionActive', callback);

    this.eventList.push({
      name: 'collisionStart',
      callback,
    });
  }

  enableDebugDraw(scale = 1, offsetx = 0, offsety = 0) {
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.zIndex = 99;
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    (function render() {
      var bodies = Matter.Composite.allBodies(engine.world);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (var i = 0; i < bodies.length; i += 1) {
        var vertices = bodies[i].vertices;
        var x = (vertices[0].x + offsetx) * scale;
        var y = (vertices[0].y + offsety) * scale;
        ctx.moveTo(x, y);

        for (var j = 1; j < vertices.length; j += 1) {
          var x = (vertices[j].x + offsetx) * scale;
          var y = (vertices[j].y + offsety) * scale;
          ctx.lineTo(x, y);
        }
        var x = (vertices[0].x + offsetx) * scale;
        var y = (vertices[0].y + offsety) * scale;
        ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      window.requestAnimationFrame(render);
    })();
  }

  enableDebugDraw3D(offsetx = 0, offsety = 0) {
    let bodies = Matter.Composite.allBodies(engine.world);
    let scale = 1 / this.meterToPixel;

    offsetx *= scale;
    offsety *= scale;

    for (var i = 0; i < bodies.length; i += 1) {
      let body = bodies[i];
      var shape = new THREE.Shape();
      var vertices = body.vertices;
      var x = vertices[0].x * scale + offsetx;
      var y = vertices[0].y * scale + offsety;
      shape.moveTo(x, y);

      for (var j = 1; j < vertices.length; j += 1) {
        var x = vertices[j].x * scale + offsetx;
        var y = vertices[j].y * scale + offsety;
        shape.lineTo(x, y);
      }
      var x = vertices[0].x * scale + offsetx;
      var y = vertices[0].y * scale + offsety;
      shape.lineTo(x, y);

      var geometry = new THREE.ShapeGeometry(shape);
      var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
      });
      var debugMesh = new THREE.Mesh(geometry, material);

      debugMesh.rotation.x = Math.PI / 2;
      main.scene.add(debugMesh);

      if (body.mesh) {
        debugMesh.position.y = body.mesh.position.y;
      }

      body.debugMesh = debugMesh;
    }

    /*
        if(doUpdate){
            (function update() {
                var bodies = Matter.Composite.allBodies(engine.world);

                for(let body of bodies){
                    let debugMesh = body.debugMesh;
                    
                    debugMesh.position.x = body.position.x*scale;

                    //debugMesh.position.z = body.position.y*scale;

                }
    
                window.requestAnimationFrame(update);
            })();
        }
        */
  }

  ///helper function for collision detection
  getObjectPair(bodyA, bodyB, label, label2) {
    var b, b2;

    if (bodyA.label == label && bodyB.label == label2) {
      b = bodyA;
      b2 = bodyB;
    } else if (bodyA.label == label2 && bodyB.label == label) {
      b = bodyB;
      b2 = bodyA;
    }

    if (b && b2) {
      return { b, b2 };
    }
  }
}

export default matterPhysics;
