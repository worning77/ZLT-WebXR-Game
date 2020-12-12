import * as THREE from './libs/three/three.module.js';

const level1 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
  ],
};
const level2 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
  ],
};
const level3 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
  ],
};

const level4 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
  ],
};

const level5 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1],
  ],
};

const level6 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0],
    [0, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0],
    [1, 1, 1, 0, 0, 0],
  ],
};

const level7 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0],
  ],
};

const level8 = {
  gridXY: [
    [0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0],
  ],
  gridZY: [
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
  ],
};

const level9 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1],
  ],
};
const level10 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1],
  ],
};

class Levels {
  constructor(x = 0, y = 0) {
    this.lvl1GridXY = level1.gridXY;
    this.lvl1GridZY = level1.gridZY;

    this.lvl2GridXY = level2.gridXY;
    this.lvl2GridZY = level2.gridZY;

    this.lvl3GridXY = level3.gridXY;
    this.lvl3GridZY = level3.gridZY;

    this.lvl4GridXY = level4.gridXY;
    this.lvl4GridZY = level4.gridZY;

    this.lvl5GridXY = level5.gridXY;
    this.lvl5GridZY = level5.gridZY;

    this.lvl6GridXY = level6.gridXY;
    this.lvl6GridZY = level6.gridZY;

    this.lvl7GridXY = level7.gridXY;
    this.lvl7GridZY = level7.gridZY;

    this.lvl8GridXY = level8.gridXY;
    this.lvl8GridZY = level8.gridZY;

    this.lvl9GridXY = level9.gridXY;
    this.lvl9GridZY = level9.gridZY;

    this.lvl10GridXY = level10.gridXY;
    this.lvl10GridZY = level10.gridZY;

    this.xStart = x;
    this.yStart = y;

    this.shape = new THREE.Shape();
    this.shape.moveTo(0, 0);
    this.shape.lineTo(0, 1);
    this.shape.lineTo(1, 1);
    this.shape.lineTo(1, 0);
    this.shape.lineTo(0, 0);

    this.extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    this.geometry = new THREE.ExtrudeBufferGeometry(
      this.shape,
      this.extrudeSettings
    );

    this.squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    this.shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
      //emissive: 0xffffff
    });
    this.groupXY = new THREE.Object3D();
    this.groupZY = new THREE.Object3D();
    this.centerXY = new THREE.Vector3();
    this.centerZY = new THREE.Vector3();
  }

  level1XY() {
    const group = this.readGridXY(this.lvl1GridXY).clone();
    return group;
  }
  level1ZY() {
    const group = this.readGridZY(this.lvl1GridZY).clone();
    return group;
  }
  level2XY() {
    const group = this.readGridXY(this.lvl2GridXY).clone();
    return group;
  }
  level2ZY() {
    const group = this.readGridZY(this.lvl2GridZY).clone();
    return group;
  }
  level3XY() {
    const group = this.readGridXY(this.lvl3GridXY).clone();
    return group;
  }
  level3ZY() {
    const group = this.readGridZY(this.lvl3GridZY).clone();
    return group;
  }
  level4XY() {
    const group = this.readGridXY(this.lvl4GridXY).clone();
    return group;
  }
  level4ZY() {
    const group = this.readGridZY(this.lvl4GridZY).clone();
    return group;
  }
  level5XY() {
    const group = this.readGridXY(this.lvl5GridXY).clone();
    return group;
  }
  level5ZY() {
    const group = this.readGridZY(this.lvl5GridZY).clone();
    return group;
  }
  level6XY() {
    const group = this.readGridXY(this.lvl6GridXY).clone();
    return group;
  }
  level6ZY() {
    const group = this.readGridZY(this.lvl6GridZY).clone();
    return group;
  }
  level7XY() {
    const group = this.readGridXY(this.lvl7GridXY).clone();
    return group;
  }
  level7ZY() {
    const group = this.readGridZY(this.lvl7GridZY).clone();
    return group;
  }
  level8XY() {
    const group = this.readGridXY(this.lvl8GridXY).clone();
    return group;
  }
  level8ZY() {
    const group = this.readGridZY(this.lvl8GridZY).clone();
    return group;
  }
  level9XY() {
    const group = this.readGridXY(this.lvl9GridXY).clone();
    return group;
  }
  level9ZY() {
    const group = this.readGridZY(this.lvl9GridZY).clone();
    return group;
  }
  level10XY() {
    const group = this.readGridXY(this.lvl10GridXY).clone();
    return group;
  }
  level10ZY() {
    const group = this.readGridZY(this.lvl10GridZY).clone();
    return group;
  }

  readGridXY(level) {
    const geo = this.geometry.clone();
    const shadowPiece = new THREE.Mesh(geo, this.shadowMaterial);

    for (let iY = level.length - 1; iY > -1; iY--) {
      for (let iX = 0; iX < level[iY].length; iX++) {
        if (level[iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + level.length - 1 - iY;
          this.shadowPiece = shadowPiece.clone();
          this.shadowPiece.geometry.computeBoundingBox();
          this.shadowPiece.geometry.boundingBox.getCenter(this.centerXY);
          this.centerXY.x = bX - 2.5;
          this.centerXY.y = bY + 0.5;
          this.centerXY.z = -4;
          this.centerXY.add(new THREE.Vector3(-0.5, -0.5, -0.04));
          this.shadowPiece.position.copy(this.centerXY);
          this.shadowPiece.updateWorldMatrix;
          this.groupXY.attach(this.shadowPiece);
          this.groupXY.updateWorldMatrix;
        }
      }
    }
    return this.groupXY;
  }

  readGridZY(level) {
    const geo = this.geometry.clone();
    const shadowPiece = new THREE.Mesh(geo, this.shadowMaterial);

    for (let iY = level.length - 1; iY > -1; iY--) {
      for (let iX = 0; iX < level[iY].length; iX++) {
        if (level[iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + level.length - 1 - iY;
          this.shadowPiece = shadowPiece.clone();
          this.shadowPiece.geometry.computeBoundingBox();
          this.shadowPiece.geometry.boundingBox.getCenter(this.centerZY);
          this.centerZY.x = -4;
          this.centerZY.y = bY + 0.5;
          this.centerZY.z = -bX + 2.5;

          this.centerZY.add(new THREE.Vector3(-0.04, -0.5, 0.5));

          this.shadowPiece.position.copy(this.centerZY);
          // console.log(this.shadowPiece);
          this.shadowPiece.rotateY(Math.PI / 2);
          // this.shadowPiece.geometry.attributes.position.needsUpdate = true;
          this.shadowPiece.updateWorldMatrix;
          this.groupZY.add(this.shadowPiece);
          this.groupZY.updateWorldMatrix;
        }
      }
    }
    return this.groupZY;
  }
}
export { Levels };
