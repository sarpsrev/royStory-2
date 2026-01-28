import * as THREE from "three";

export default class SpriteText extends THREE.Object3D {
  constructor(color) {
    super();
    this.color = color;
    this.createCanvas();

    this.setText("");

    this.sprite = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), this.material);
    // this.sprite.rotateX(-Math.PI / 2);
    this.sprite.scale.setScalar(1);
    this.sprite.renderOrder = 100;
    this.add(this.sprite);
    this.renderOrder = this.sprite.renderOrder;
    this.visible = true;
  }

  setVisible(val) {
    this.visible = val;
  }

  setTarget(targetObj) {
    this.targetObj = targetObj;
  }

  update(delta) {
    if (!this.targetObj) return;
  }

  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 600;
    this.canvas.height = 600;
    this.context = this.canvas.getContext("2d");
    this.context.font = "128px game-font";
    this.context.fillStyle = this.color;
    this.context.strokeStyle = "#000000";
    this.context.lineWidth = 12;

    this.context.textAlign = "center";

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.needsUpdate = true;
    this.texture.colorSpace = THREE.SRGBColorSpace;
	// this.texture.flipY = false;


    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      //alphaTest: 0.5,
      //depthTest: false,
      //depthWrite: false,
      //blending: THREE.AdditiveBlending,
    });
  }

  setText(_text) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.strokeText(
      _text,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.context.fillText(_text, this.canvas.width / 2, this.canvas.height / 2);

    this.texture.needsUpdate = true;
  }
}
