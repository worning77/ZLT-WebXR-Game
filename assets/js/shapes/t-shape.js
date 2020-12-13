import * as THREE from '../libs/three/three.module.js';
import { BufferGeometryUtils } from '../libs/three/jsm/BufferGeometryUtils.js';

const Tshape = {
  color: 0xf0b631,
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
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
};

class TBlock {
  constructor(x = 0, y = 0, z = 0) {
    this.color = Tshape.color;
    this.grid = Tshape.grid;
    this.xStart = x;
    this.yStart = y;
    this.zStart = z;
    this.tBlock = new THREE.Object3D();
    this.tShape = new THREE.Object3D();
    this.tPivot = new THREE.Group();
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
      color: 0xffe543,
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
    const blockGeometryPart2 = cubes[3].clone();
    cubes.splice(3, 1);
    const blockGeometryPart1 = BufferGeometryUtils.mergeBufferGeometries(
      cubes,
      true
    );
    const blockLineGeometry = BufferGeometryUtils.mergeBufferGeometries(
      cubeLines,
      true
    );
    //initial geo position
    blockGeometryPart1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, 0, 0)
    );
    blockGeometryPart2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, -1, 0)
    );

    blockGeometryPart1.computeBoundingBox();
    blockGeometryPart2.computeBoundingBox();
    this.tBlockPart1 = new THREE.Mesh(blockGeometryPart1, cubeMaterial);
    this.tBlockPart2 = new THREE.Mesh(blockGeometryPart2, cubeMaterial);

    const center1 = new THREE.Vector3();
    this.tBlockPart1.geometry.boundingBox.getCenter(center1);

    this.tBlockPart1.position.set(center1.x, center1.y, center1.z);
    this.tBlockPart1.rotateY(Math.PI / 2);
    this.tBlockPart1.updateWorldMatrix;
    this.tBlockPart1.geometry.attributes.position.needsUpdate = true;
    // console.log(this.lBlockPart1.position);

    const center2 = new THREE.Vector3();
    this.tBlockPart2.geometry.boundingBox.getCenter(center2);

    this.tBlockPart2.position.set(center2.x, center2.y + 1, center2.z);
    this.tBlockPart2.rotateY(Math.PI / 2);
    this.tBlockPart2.updateWorldMatrix;
    this.tBlockPart2.geometry.attributes.position.needsUpdate = true;
    // console.log(this.lBlockPart2.position);

    blockLineGeometry.computeBoundingBox();
    this.tBlockLine = new THREE.LineSegments(
      blockLineGeometry,
      cubeOutlineMaterial
    );
    this.tBlockLine.rotateY(Math.PI / 2);
    this.tBlockLine.position.set(center1.x, center1.y, center1.z + 1);
    this.tBlockLine.updateWorldMatrix;
    this.tBlockLine.geometry.attributes.position.needsUpdate = true;

    this.tBlock.add(this.tBlockPart1, this.tBlockPart2, this.tBlockLine);
    this.tBlock.updateWorldMatrix;

    this.tPivot.add(this.tBlock);
    return this.tPivot;
  }

  addToSpace() {
    const cubes = [];
    const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      opacity: 1,

      //metalness: 0.5,
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
    const blockGeometryPart2 = cubes[3].clone();
    cubes.splice(3, 1);
    const blockGeometryPart1 = BufferGeometryUtils.mergeBufferGeometries(
      cubes,
      true
    );
    //initial geo position
    blockGeometryPart1.normalizeNormals();
    blockGeometryPart2.normalizeNormals();

    blockGeometryPart1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, 0, 0)
    );
    blockGeometryPart2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-1, -1, 0)
    );
    blockGeometryPart1.computeBoundingBox();
    blockGeometryPart2.computeBoundingBox();
    this.tBlockPart1 = new THREE.Mesh(blockGeometryPart1, cubeMaterial);
    this.tBlockPart2 = new THREE.Mesh(blockGeometryPart2, cubeMaterial);

    const center1 = new THREE.Vector3();
    this.tBlockPart1.geometry.boundingBox.getCenter(center1);

    this.tBlockPart1.position.set(center1.x, center1.y, center1.z);
    this.tBlockPart1.rotateY(Math.PI / 2);
    this.tBlockPart1.updateWorldMatrix;
    this.tBlockPart1.geometry.attributes.position.needsUpdate = true;
    // console.log(this.lBlockPart1.position);

    const center2 = new THREE.Vector3();
    this.tBlockPart2.geometry.boundingBox.getCenter(center2);

    this.tBlockPart2.position.set(center2.x, center2.y + 1, center2.z);
    this.tBlockPart2.rotateY(Math.PI / 2);
    this.tBlockPart2.updateWorldMatrix;
    this.tBlockPart2.geometry.attributes.position.needsUpdate = true;

    this.tBlock.add(this.tBlockPart1, this.tBlockPart2);
    this.tBlock.updateWorldMatrix;
    this.tPivot.add(this.tBlock);
    return this.tPivot;
  }

  addShadowXY() {
    const Geo = new THREE.PlaneBufferGeometry(1, 2);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });
    Geo.computeBoundingBox();
    this.tShape1 = new THREE.Mesh(Geo, shadowMaterial);
    const center = new THREE.Vector3();
    this.tShape1.geometry.boundingBox.getCenter(center);
    this.tShape1.position.set(center.x, center.y + 0.5, 0);
    this.tShape1.name = 'tshape';

    this.tShape1.updateWorldMatrix();
    this.tPivot.add(this.tShape1);
    return this.tPivot;
  }

  addShadowZY() {
    const rectangleGeo = new THREE.PlaneBufferGeometry(3, 1);
    rectangleGeo.rotateY(Math.PI / 2);
    const squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    squareGeo.rotateY(Math.PI / 2);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });

    rectangleGeo.computeBoundingBox();
    squareGeo.computeBoundingBox();
    this.tShapePart1 = new THREE.Mesh(rectangleGeo, shadowMaterial);
    this.tShapePart2 = new THREE.Mesh(squareGeo, shadowMaterial);

    const center1 = new THREE.Vector3();
    this.tShapePart1.geometry.boundingBox.getCenter(center1);
    this.tShapePart1.position.set(0, center1.y - 3, center1.z);
    this.tShapePart1.updateWorldMatrix;

    const center2 = new THREE.Vector3();
    this.tShapePart2.geometry.boundingBox.getCenter(center2);
    this.tShapePart2.position.set(0, center2.y - 2, center2.z);
    this.tShapePart2.updateWorldMatrix;

    this.tShape.add(this.tShapePart1, this.tShapePart2);
    this.tShape.updateWorldMatrix();
    this.tShape.name = 'tshape';
    this.tPivot.add(this.tShape);
    return this.tPivot;
  }
}
export { TBlock };
