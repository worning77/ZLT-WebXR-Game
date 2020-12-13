import * as THREE from '../libs/three/three.module.js';
import { BufferGeometryUtils } from '../libs/three/jsm/BufferGeometryUtils.js';

const Zshape = {
  color: 0xb537f2,
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
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
};

class ZBlock {
  constructor(x = 0, y = 0, z = 0) {
    this.color = Zshape.color;
    this.grid = Zshape.grid;
    this.xStart = x;
    this.yStart = y;
    this.zStart = z;
    this.zBlock = new THREE.Object3D();
    this.zShape = new THREE.Object3D();
    this.zPivot = new THREE.Group();
  }

  addSkeletonToSpace() {
    const cubes = [];
    const cubeLines = [];
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      opacity: 0.5,
      transparent: true,
    });

    const cubeOutlineGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const cubeOutlineMaterial = new THREE.LineBasicMaterial({
      linewidth: 2,
      color: 0xfdcbfc,
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
    const cubes1 = [];
    cubes1.push(cubes[0], cubes[1]);
    cubes.splice(0, 2);
    const blockGeometryPart2 = BufferGeometryUtils.mergeBufferGeometries(
      cubes,
      true
    );
    const blockGeometryPart1 = BufferGeometryUtils.mergeBufferGeometries(
      cubes1,
      true
    );
    const blockLineGeometry = BufferGeometryUtils.mergeBufferGeometries(
      cubeLines,
      true
    );
    //initial geo position
    blockGeometryPart1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, -1, 0)
    );
    blockGeometryPart2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, -2, 0)
    );

    blockGeometryPart1.computeBoundingBox();
    blockGeometryPart2.computeBoundingBox();
    this.zBlockPart1 = new THREE.Mesh(blockGeometryPart1, cubeMaterial);
    this.zBlockPart2 = new THREE.Mesh(blockGeometryPart2, cubeMaterial);

    const center1 = new THREE.Vector3();
    this.zBlockPart1.geometry.boundingBox.getCenter(center1);
    this.zBlockPart1.position.set(center1.x, center1.y + 0.5, center1.z);
    this.zBlockPart1.updateWorldMatrix;
    this.zBlockPart1.geometry.attributes.position.needsUpdate = true;

    const center2 = new THREE.Vector3();
    this.zBlockPart2.geometry.boundingBox.getCenter(center2);
    this.zBlockPart2.position.set(center2.x + 1, center2.y + 1.5, center2.z);
    this.zBlockPart2.updateWorldMatrix;
    this.zBlockPart2.geometry.attributes.position.needsUpdate = true;

    blockLineGeometry.computeBoundingBox();
    this.zBlockLine = new THREE.LineSegments(
      blockLineGeometry,
      cubeOutlineMaterial
    );
    const center3 = new THREE.Vector3();
    center3.x = this.zBlockPart1.position.x;
    center3.y = this.zBlockPart1.position.y - 1;
    center3.z = this.zBlockPart1.position.z;
    this.zBlockLine.position.copy(center3);
    this.zBlockLine.updateWorldMatrix;
    this.zBlockLine.geometry.attributes.position.needsUpdate = true;

    this.zBlock.add(this.zBlockPart1, this.zBlockPart2, this.zBlockLine);
    this.zBlock.updateWorldMatrix;
    this.zPivot.add(this.zBlock);
    return this.zPivot;
  }

  addToSpace() {
    const cubes = [];
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      opacity: 1,
      roughness: 0.7,
      metalness: 0.0,
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
    const cubes1 = [];
    cubes1.push(cubes[0], cubes[1]);
    cubes.splice(0, 2);
    const blockGeometryPart2 = BufferGeometryUtils.mergeBufferGeometries(
      cubes,
      true
    );
    const blockGeometryPart1 = BufferGeometryUtils.mergeBufferGeometries(
      cubes1,
      true
    );
    //initial geo position
    blockGeometryPart1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, -1, 0)
    );
    blockGeometryPart2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, -2, 0)
    );

    blockGeometryPart1.computeBoundingBox();
    blockGeometryPart2.computeBoundingBox();
    this.zBlockPart1 = new THREE.Mesh(blockGeometryPart1, cubeMaterial);
    this.zBlockPart2 = new THREE.Mesh(blockGeometryPart2, cubeMaterial);

    const center1 = new THREE.Vector3();
    this.zBlockPart1.geometry.boundingBox.getCenter(center1);
    // console.log(center1);
    this.zBlockPart1.position.set(center1.x, center1.y + 0.5, center1.z);
    this.zBlockPart1.updateWorldMatrix;
    this.zBlockPart1.geometry.attributes.position.needsUpdate = true;

    const center2 = new THREE.Vector3();
    this.zBlockPart2.geometry.boundingBox.getCenter(center2);

    this.zBlockPart2.position.set(center2.x + 1, center2.y + 1.5, center2.z);
    this.zBlockPart2.updateWorldMatrix;
    this.zBlockPart2.geometry.attributes.position.needsUpdate = true;

    this.zBlock.add(this.zBlockPart1, this.zBlockPart2);
    this.zBlock.updateWorldMatrix;
    this.zPivot.add(this.zBlock);
    this.zPivot.layers.enable(1);
    return this.zPivot;
  }

  addShadowXY() {
    const rectangleGeo = new THREE.PlaneBufferGeometry(2, 1);
    const square1Geo = new THREE.PlaneBufferGeometry(1, 1);
    const square2Geo = new THREE.PlaneBufferGeometry(1, 1);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });

    rectangleGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0, 0));
    rectangleGeo.computeBoundingBox();
    square1Geo.computeBoundingBox();
    square2Geo.computeBoundingBox();
    this.zShapePart1 = new THREE.Mesh(rectangleGeo, shadowMaterial);
    this.zShapePart2 = new THREE.Mesh(square1Geo, shadowMaterial);
    this.zShapePart3 = new THREE.Mesh(square2Geo, shadowMaterial);

    const center1 = new THREE.Vector3();
    this.zShapePart1.geometry.boundingBox.getCenter(center1);
    this.zShapePart1.position.set(center1.x - 0.5, center1.y, 0);
    this.zShapePart1.updateWorldMatrix;

    const center2 = new THREE.Vector3();
    this.zShapePart2.geometry.boundingBox.getCenter(center2);
    this.zShapePart2.position.set(center2.x + 1, center2.y + 1, 0);
    this.zShapePart2.updateWorldMatrix;

    const center3 = new THREE.Vector3();
    this.zShapePart3.geometry.boundingBox.getCenter(center3);
    this.zShapePart3.position.set(center2.x, center2.y - 1, 0);
    this.zShapePart3.updateWorldMatrix;

    this.zShape.add(this.zShapePart1, this.zShapePart2, this.zShapePart3);
    this.zShape.name = 'zshape';
    this.zShape.updateWorldMatrix();
    this.zPivot.add(this.zShape);
    return this.zPivot;
  }

  addShadowZY() {
    const rectangleGeo = new THREE.PlaneBufferGeometry(1, 3);
    rectangleGeo.rotateY(Math.PI / 2);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });
    rectangleGeo.computeBoundingBox();
    this.zShapePart1 = new THREE.Mesh(rectangleGeo, shadowMaterial);
    this.zShapePart1.updateWorldMatrix();
    this.zShapePart1.name = 'zshape';
    this.zPivot.add(this.zShapePart1);
    return this.zPivot;
  }
}
export { ZBlock };
