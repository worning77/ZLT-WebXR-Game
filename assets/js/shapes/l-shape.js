import * as THREE from '../libs/three/three.module.js';
import { BufferGeometryUtils } from '../libs/three/jsm/BufferGeometryUtils.js';

const Lshape = {
  color: 0x00a9fe,
  size: 3,
  height: 3,
  width: 3,
  depth: 3,
  grid: [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
};

class LBlock {
  constructor(x = 0, y = 0, z = 0) {
    this.color = Lshape.color;
    this.grid = Lshape.grid;
    this.xStart = x;
    this.yStart = y;
    this.zStart = z;
    this.lBlock = new THREE.Object3D();
    this.lShape = new THREE.Object3D();
    this.lPivot = new THREE.Group();
  }

  addSkeletonToSpace() {
    const cubes = [];
    const cubeLines = [];
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      opacity: 0.2,
      transparent: true,
    });

    const cubeOutlineGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const cubeOutlineMaterial = new THREE.LineBasicMaterial({
      linewidth: 2,
      color: 0x86f9e7,
    });

    let i = 0;
    for (let iY = 0; iY < this.grid[1].length; iY++) {
      for (let iX = 0; iX < this.grid[1][iY].length; iX++) {
        if (this.grid[1][iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + iY;
          let bZ = 0;
          i++;
          const geo = cubeGeometry.clone();
          const line = cubeOutlineGeometry.clone();
          geo.applyMatrix4(new THREE.Matrix4().makeTranslation(bX, bY, bZ));
          line.applyMatrix4(new THREE.Matrix4().makeTranslation(bX, bY, bZ));
          cubes.push(geo);
          cubeLines.push(line);
        }
      }
    }
    const blockGeometryPart2 = cubes[0].clone();
    cubes.splice(0, 1);
    const blockGeometryPart1 = BufferGeometryUtils.mergeBufferGeometries(
      cubes,
      true
    );
    const blockLineGeometry = BufferGeometryUtils.mergeBufferGeometries(
      cubeLines,
      true
    );

    blockGeometryPart1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, 0, 0)
    );
    blockGeometryPart2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, 0)
    );
    //initial geo position
    blockGeometryPart1.computeBoundingBox();
    blockGeometryPart2.computeBoundingBox();
    this.lBlockPart1 = new THREE.Mesh(blockGeometryPart1, cubeMaterial);
    this.lBlockPart2 = new THREE.Mesh(blockGeometryPart2, cubeMaterial);

    const center1 = new THREE.Vector3();
    this.lBlockPart1.geometry.boundingBox.getCenter(center1);
    this.lBlockPart1.position.set(center1.x, center1.y - 1, center1.z);
    this.lBlockPart1.updateWorldMatrix;
    this.lBlockPart1.geometry.attributes.position.needsUpdate = true;
    //console.log(this.lBlockPart1.position);

    const center2 = new THREE.Vector3();
    this.lBlockPart2.geometry.boundingBox.getCenter(center2);
    this.lBlockPart2.position.set(center2.x - 1, center2.y, center2.z);
    this.lBlockPart2.updateWorldMatrix;
    this.lBlockPart2.geometry.attributes.position.needsUpdate = true;
    //console.log(this.lBlockPart2.position);

    blockLineGeometry.computeBoundingBox();
    this.lBlockLine = new THREE.LineSegments(
      blockLineGeometry,
      cubeOutlineMaterial
    );
    this.lBlockLine.position.copy(this.lBlockPart2.position);
    this.lBlockLine.updateWorldMatrix;
    this.lBlockLine.geometry.attributes.position.needsUpdate = true;

    this.lBlock.add(this.lBlockPart1, this.lBlockPart2, this.lBlockLine);
    this.lBlock.updateWorldMatrix;
    this.lPivot.add(this.lBlock);
    return this.lPivot;
  }

  addToSpace() {
    const cubes = [];
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.7,
      metalness: 0.0,
      opacity: 1,
    });

    let i = 0;
    for (let iY = 0; iY < this.grid[1].length; iY++) {
      for (let iX = 0; iX < this.grid[1][iY].length; iX++) {
        if (this.grid[1][iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + iY;
          let bZ = 0;
          i++;
          const geo = cubeGeometry.clone();
          geo.applyMatrix4(new THREE.Matrix4().makeTranslation(bX, bY, bZ));
          cubes.push(geo);
        }
      }
    }
    const blockGeometryPart2 = cubes[0].clone();
    cubes.splice(0, 1);
    const blockGeometryPart1 = BufferGeometryUtils.mergeBufferGeometries(
      cubes,
      true
    );
    blockGeometryPart1.normalizeNormals();
    blockGeometryPart2.normalizeNormals();

    blockGeometryPart1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, 0, 0)
    );
    blockGeometryPart2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, 0)
    );
    //initial geo position
    blockGeometryPart1.computeBoundingBox();
    blockGeometryPart2.computeBoundingBox();
    this.lBlockPart1 = new THREE.Mesh(blockGeometryPart1, cubeMaterial);
    this.lBlockPart2 = new THREE.Mesh(blockGeometryPart2, cubeMaterial);

    const center1 = new THREE.Vector3();
    this.lBlockPart1.geometry.boundingBox.getCenter(center1);
    this.lBlockPart1.position.set(center1.x, center1.y - 1, center1.z);
    this.lBlockPart1.updateWorldMatrix;
    this.lBlockPart1.geometry.attributes.position.needsUpdate = true;

    const center2 = new THREE.Vector3();
    this.lBlockPart2.geometry.boundingBox.getCenter(center2);
    this.lBlockPart2.position.set(center2.x - 1, center2.y, center2.z);
    this.lBlockPart2.updateWorldMatrix;
    this.lBlockPart2.geometry.attributes.position.needsUpdate = true;

    this.lBlock.add(this.lBlockPart1, this.lBlockPart2);
    this.lBlock.updateWorldMatrix;
    this.lPivot.add(this.lBlock);
    return this.lPivot;
  }

  addShadowXY() {
    const rectangleGeo = new THREE.PlaneBufferGeometry(1, 3);
    const squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });

    rectangleGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1, 0));
    rectangleGeo.computeBoundingBox();
    squareGeo.computeBoundingBox();
    this.lShapePart1 = new THREE.Mesh(rectangleGeo, shadowMaterial);
    this.lShapePart2 = new THREE.Mesh(squareGeo, shadowMaterial);

    const center1 = new THREE.Vector3();
    this.lShapePart1.geometry.boundingBox.getCenter(center1);
    this.lShapePart1.position.set(center1.x, center1.y - 4, 0);
    this.lShapePart1.updateWorldMatrix;

    const center2 = new THREE.Vector3();
    this.lShapePart2.geometry.boundingBox.getCenter(center2);
    this.lShapePart2.position.set(center2.x - 1, center2.y - 3, 0);
    this.lShapePart2.updateWorldMatrix;

    this.lShape.add(this.lShapePart1, this.lShapePart2);
    this.lShape.name = "lshape";
    this.lShape.updateWorldMatrix();
    this.lPivot.add(this.lShape);
    return this.lPivot;
  }

  addShadowZY() {
    const rectangleGeo = new THREE.PlaneBufferGeometry(1, 3);
    rectangleGeo.rotateY(Math.PI / 2);
    const squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    squareGeo.rotateY(Math.PI / 2);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });

    rectangleGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1, 0));
    rectangleGeo.computeBoundingBox();
    squareGeo.computeBoundingBox();
    this.lShapePart1 = new THREE.Mesh(rectangleGeo, shadowMaterial);
    this.lShapePart2 = new THREE.Mesh(squareGeo, shadowMaterial);

    const center1 = new THREE.Vector3();
    this.lShapePart1.geometry.boundingBox.getCenter(center1);
    this.lShapePart1.position.set(0, center1.y - 4, center1.z);
    this.lShapePart1.updateWorldMatrix;

    const center2 = new THREE.Vector3();
    this.lShapePart2.geometry.boundingBox.getCenter(center2);
    this.lShapePart2.position.set(0, center2.y - 3, center2.z + 1);
    this.lShapePart2.updateWorldMatrix;

    this.lShape.add(this.lShapePart1, this.lShapePart2);
    this.lShape.updateWorldMatrix();
    this.lShape.name = 'lshape';
    this.lPivot.add(this.lShape);
    return this.lPivot;
  }
}
export { LBlock };
