import * as THREE from './libs/three/three.module.js';
import { LBlock } from './shapes/l-shape.js';
import { TBlock } from './shapes/t-shape.js';
import { ZBlock } from './shapes/z-shape.js';

class Inputs {
  constructor(app) {
    app.onMouseMove((controller) => {
      TWEEN.remove(this.flash);
      this.moveL(app, controller);
      this.moveT(app, controller);
      this.moveZ(app, controller);
      this._onMoveDelete(app, controller);
    });

    app.onMouseDown((controller) => {
      this._onMouseDownL(app, controller);
      this._onMouseDownT(app, controller);
      this._onMouseDownZ(app, controller);
      this._onMouseDelete(app, controller);
    });

    app.onKeyDown((event) => {
      TWEEN.remove(this.flash);
      this._onKeyDownL(event);
      this._onKeyDownT(event);
      this._onKeyDownZ(event);
      this._onKeyDOWN(event);
    });

    app.onKeyUp((event) => {
      this._onKeyUP(event);
    });

    app.leftTurn(() => {
      TWEEN.remove(this.flash);
      this._leftTurn();
    });

    app.rightTurn(() => {
      TWEEN.remove(this.flash);
      this._rightTurn();
    });

    this.Point = new THREE.Vector3();
    this.shadowCenterPoint = new THREE.Vector3();
    this.shadowGroup = new THREE.Group();
    this.LrightColor = 0x00a9fe;
    this.TrightColor = 0xfc6e22;
    this.ZrightColor = 0xb537f2;
    this.wrongColor = 0xff0000;
    this.isShiftDown = false;
    this.squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    this.shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
      emissive: 0x000000,
    });
    this.shadowPiece = new THREE.Mesh(this.squareGeo, this.shadowMaterial);
    this.newMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 1,
      transparent: false,
      side: THREE.DoubleSide,
      emissive: 0x8af7e4,
    });

    this.current = { opacity: 0.4 };

    this.flash = new TWEEN.Tween(this.current)
      .to({ opacity: 0.05 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .repeat(Infinity)
      .yoyo(true)
      .start();
  }

  deleteCheckXY(array, ShadowXY) {
    for (let i = 0; i < ShadowXY.children.length; i++) {
      const levelPt = ShadowXY.children[i].position;
      const material = this.shadowMaterial.clone();
      if (array.length === 0) {
        ShadowXY.children[i].material = material;
      } else {
        if (ShadowXY.children[i].material.opacity == 1) {
          for (let j = 0; j < array.length; j++) {
            let levelPts = new THREE.Vector2(levelPt.x + 0.5, levelPt.y + 0.5);
            let receivedPts = new THREE.Vector2(array[j].x, array[j].y);
            if (levelPts.equals(receivedPts)) {
              break;
            }
            if (!levelPts.equals(receivedPts) && j === array.length - 1) {
              ShadowXY.children[i].material = material;
            }
          }
        }
      }
    }
  }
  deleteCheckZY(array, ShadowZY) {
    for (let i = 0; i < ShadowZY.children.length; i++) {
      const levelPt = ShadowZY.children[i].position;
      const material = this.shadowMaterial.clone();
      if (array.length === 0) {
        ShadowZY.children[i].material = material;
      } else {
        if (ShadowZY.children[i].material.opacity == 1) {
          for (let j = 0; j < array.length; j++) {
            let levelPts = new THREE.Vector2(levelPt.z - 0.5, levelPt.y + 0.5);
            let receivedPts = new THREE.Vector2(-array[j].x, array[j].y);
            if (levelPts.equals(receivedPts)) {
              break;
            }
            if (!levelPts.equals(receivedPts) && j === array.length - 1) {
              ShadowZY.children[i].material = material;
            }
          }
        }
      }
    }
  }

  matchCheckXY(array, ShadowXY) {
    let n = 0;
    for (let i = 0; i < ShadowXY.children.length; i++) {
      const levelPt = ShadowXY.children[i].position;
      const matchedMaterial = this.newMaterial.clone();
      for (let j = 0; j < array.length; j++) {
        let levelPts = new THREE.Vector2(levelPt.x + 0.5, levelPt.y + 0.5);
        let receivedPts = new THREE.Vector2(array[j].x, array[j].y);
        if (
          levelPts.equals(receivedPts) &&
          ShadowXY.children[i].material.opacity !== 1
        ) {
          ShadowXY.children[i].material = matchedMaterial;
        }
      }

      if (ShadowXY.children[i].material.opacity === 1) {
        n++;
        console.log(n, ShadowXY.children.length, array.length);
        if (
          n === ShadowXY.children.length &&
          ShadowXY.children.length === array.length
        ) {
          app.XYmatched = true;
          console.log(app.XYmatched);
        }
      }
    }
  }

  matchCheckZY(array, ShadowZY) {
    let n = 0;
    for (let i = 0; i < ShadowZY.children.length; i++) {
      const levelPt = ShadowZY.children[i].position;
      const matchedMaterial = this.newMaterial.clone();
      for (let j = 0; j < array.length; j++) {
        let levelPts = new THREE.Vector2(levelPt.z - 0.5, levelPt.y + 0.5);
        let receivedPts = new THREE.Vector2(-array[j].x, array[j].y);
        if (
          levelPts.equals(receivedPts) &&
          ShadowZY.children[i].material.opacity !== 1
        ) {
          ShadowZY.children[i].material = matchedMaterial;
        }
      }
      if (ShadowZY.children[i].material.opacity === 1) {
        n++;
        console.log(n, ShadowZY.children.length, array.length);
        if (
          n === ShadowZY.children.length &&
          ShadowZY.children.length === array.length
        ) {
          app.ZYmatched = true;
          console.log(app.ZYmatched);
        }
      }
    }
  }

  cleanPoints(array) {
    let changedReceived = [...array];
    console.log(changedReceived);
    let renewed = [];
    for (let i = 0; i < changedReceived.length; i++) {
      if (changedReceived[i] !== '[]') {
        renewed.push(changedReceived[i]);
      }
    }
    let ShadowPts = [...renewed.flat()];
    let newShadowPts = [];
    console.log(ShadowPts);
    for (let i = 0; i < ShadowPts.length; i++) {
      for (let j = i + 1; j < ShadowPts.length; j++) {
        if (ShadowPts[i].equals(ShadowPts[j])) {
          break;
        }
        if (!ShadowPts[i].equals(ShadowPts[j]) && j === ShadowPts.length - 1) {
          newShadowPts.push(ShadowPts[i]);
        }
      }
      if (i === ShadowPts.length - 1) {
        newShadowPts.push(ShadowPts[i]);
      }
    }
    console.log(newShadowPts);
    return newShadowPts;
  }

  checkCollision(currentBlock, object2) {
    let collision = true;
    if (object2.name !== 'empty') {
      for (let Ci = 0; Ci < 2; Ci++) {
        let box1 = new THREE.Box3()
          .setFromObject(currentBlock.children[Ci])
          .expandByScalar(-0.9);
        for (let Pi = 0; Pi < 2; Pi++) {
          let box2 = new THREE.Box3().setFromObject(
            object2.children[0].children[Pi]
          );
          if (box1.intersectsBox(box2)) {
            return collision;
          }
        }
      }
    }
    return !collision;
  }

  checkShadowL(shadowXY, shadowZY) {
    let pointXY1M = this.Point.clone();
    let pointXY2M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointZY2M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();

    app.LBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    app.LBlockS.children[0].children[1].getWorldPosition(pointCurent2);

    //XY plane shadow trasnform
    pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
    pointXY1M.y = pointCurent1.y;
    pointXY1M.z = 0;
    pointXY2M.x = parseFloat(pointCurent2.x.toFixed(1));
    pointXY2M.y = pointCurent2.y;
    pointXY2M.z = 0;

    if (pointXY1M.x !== pointXY2M.x) {
      if (app.removedXYPieceL.length > 0) {
        pointXY2M.z = pointXY2M.z - 4;
        app.removedXYPieceL[0].position.copy(pointXY2M);
        shadowXY.children[0].attach(app.removedXYPieceL[0]);
        app.removedXYPieceL = [];
      }
    } else {
      if (app.removedXYPieceL.length === 0) {
        app.removedXYPieceL.push(shadowXY.children[0].children[1]);
        shadowXY.children[0].remove(shadowXY.children[0].children[1]);
      }
    }
    //ZY plane shadow trasnform
    pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
    pointZY1M.y = pointCurent1.y;
    pointZY1M.z = 0;
    pointZY2M.x = parseFloat(-pointCurent2.z.toFixed(1));
    pointZY2M.y = pointCurent2.y;
    pointZY2M.z = 0;

    if (pointZY1M.x !== pointZY2M.x) {
      if (app.removedZYPieceL.length > 0) {
        pointZY2M.x = -4;
        pointZY2M.z = pointCurent2.z;
        app.removedZYPieceL[0].position.copy(pointZY2M);
        shadowZY.children[0].attach(app.removedZYPieceL[0]);
        app.removedZYPieceL = [];
      }
    } else {
      if (app.removedZYPieceL.length === 0) {
        app.removedZYPieceL.push(shadowZY.children[0].children[1]);
        shadowZY.children[0].remove(shadowZY.children[0].children[1]);
      }
    }

    if (
      Math.abs(pointCurent2.x) > 3 ||
      Math.abs(pointCurent2.z) > 3 ||
      pointCurent1.y + 2 > 6
    ) {
      app.LBlockS.children[0].children[0].material.color.setHex(
        this.wrongColor
      );
    }

    if (
      app.LBlockS.children[0].children[1].material.color.getHex() ===
      this.wrongColor
    ) {
      TWEEN.add(this.flash);
      this.flash.onUpdate(() => {
        app.LBlockS.children[0].children[0].material.opacity = this.current.opacity;
        shadowXY.children[0].children[0].material.opacity = this.current.opacity;
        shadowZY.children[0].children[0].material.opacity = this.current.opacity;
      });
    }
  }

  checkShadowT(shadowXY, shadowZY) {
    let pointZY1M = this.Point.clone();
    let pointZY2M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();

    app.TBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    app.TBlockS.children[0].children[1].getWorldPosition(pointCurent2);

    //ZY plane shadow trasnform
    pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
    pointZY1M.y = parseFloat(pointCurent1.y.toFixed(1));
    pointZY1M.z = 0;
    pointZY2M.x = parseFloat(-pointCurent2.z.toFixed(1));
    pointZY2M.y = parseFloat(pointCurent2.y.toFixed(1));
    pointZY2M.z = 0;

    if (pointZY1M.y !== pointZY2M.y) {
      if (app.removedZYPieceT.length > 0) {
        pointZY2M.x = -4;
        pointZY2M.z = pointCurent2.z;
        app.removedZYPieceT[0].position.copy(pointZY2M);
        shadowZY.children[0].attach(app.removedZYPieceT[0]);
        app.removedZYPieceT = [];
      }
    } else {
      if (app.removedZYPieceT.length === 0) {
        app.removedZYPieceT.push(shadowZY.children[0].children[1]);
        shadowZY.children[0].remove(shadowZY.children[0].children[1]);
      }
    }
    if (
      Math.abs(pointCurent1.z) > 2 ||
      pointCurent1.y > 6 ||
      pointCurent2.y > 6 ||
      Math.abs(pointCurent2.x) > 3
    ) {
      app.TBlockS.children[0].children[0].material.color.setHex(
        this.wrongColor
      );
      app.TBlockS.children[0].children[1].material.color.setHex(
        this.wrongColor
      );
    }

    if (
      app.TBlockS.children[0].children[1].material.color.getHex() ==
      this.wrongColor
    ) {
      TWEEN.add(this.flash);
      this.flash.onUpdate(() => {
        app.TBlockS.children[0].children[0].material.opacity = this.current.opacity;
        shadowXY.children[0].material.opacity = this.current.opacity;
        shadowZY.children[0].children[0].material.opacity = this.current.opacity;
      });
    }
  }
  checkShadowZ(shadowXY, shadowZY) {
    let pointXY1M = this.Point.clone();
    let pointXY2M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();

    app.ZBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    app.ZBlockS.children[0].children[1].getWorldPosition(pointCurent2);

    //XY plane shadow trasnform
    pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
    pointXY1M.y = parseFloat(pointCurent1.y.toFixed(1));
    pointXY1M.z = -4;
    pointXY2M.x = pointCurent2.x.toFixed(1);
    pointXY2M.y = pointCurent2.y.toFixed(1);
    pointXY2M.z = -4;

    if (pointXY1M.y == pointXY2M.y) {
      if (app.removedXYPieceZ.length === 0) {
        app.removedXYPieceZ.push(shadowXY.children[0].children[1]);
        app.removedXYPieceZ.push(shadowXY.children[0].children[2]);

        shadowXY.children[0].remove(shadowXY.children[0].children[2]);
        shadowXY.children[0].remove(shadowXY.children[0].children[1]);
      }
    } else {
      if (pointXY1M.y < pointXY2M.y) {
        if (app.removedXYPieceZ.length > 0) {
          app.removedXYPieceZ[0].position.copy(pointXY2M);
          app.removedXYPieceZ[1].position.set(
            pointXY1M.x,
            pointXY1M.y - 1,
            pointXY2M.z
          );
          shadowXY.children[0].attach(app.removedXYPieceZ[0]);
          shadowXY.children[0].attach(app.removedXYPieceZ[1]);
          app.removedXYPieceZ = [];
        }
      } else if (pointXY1M.y > pointXY2M.y) {
        if (app.removedXYPieceZ.length > 0) {
          app.removedXYPieceZ[0].position.copy(pointXY2M);
          app.removedXYPieceZ[1].position.set(
            pointXY1M.x,
            pointCurent1.y + 1,
            pointXY2M.z
          );
          shadowXY.children[0].attach(app.removedXYPieceZ[0]);
          shadowXY.children[0].attach(app.removedXYPieceZ[1]);
          app.removedXYPieceZ = [];
        }
      }
    }

    if (
      Math.abs(pointCurent2.x) > 3 ||
      Math.abs(pointCurent1.x) > 3 ||
      pointCurent1.y > 6 ||
      pointCurent2.y > 6 ||
      Math.abs(pointCurent1.z) > 3 ||
      Math.abs(pointCurent2.z) > 3
    ) {
      app.ZBlockS.children[0].children[0].material.color.setHex(
        this.wrongColor
      );
    }
    if (pointXY1M.y == pointXY2M.y && pointCurent1.z > 2) {
      app.ZBlockS.children[0].children[0].material.color.setHex(
        this.wrongColor
      );
    }

    if (
      app.ZBlockS.children[0].children[1].material.color.getHex() ==
      this.wrongColor
    ) {
      TWEEN.add(this.flash);
      this.flash.onUpdate(() => {
        app.ZBlockS.children[0].children[0].material.opacity = this.current.opacity;
        shadowZY.children[0].material.opacity = this.current.opacity;
        shadowXY.children[0].children[0].material.opacity = this.current.opacity;
      });
    }
  }

  moveL(app, controller) {
    let pointXY1M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();

    const intersects = app.raycaster.intersectObjects(app.allObjects, true);
    if (app.LSelected) {
      if (intersects.length > 0) {
        app.LBlockS.children[0].children[0].material.needsUpdate = true;
        app.LBlockS.children[0].children[0].material.color.setHex(
          this.LrightColor
        );
        app.LBlockS.children[0].children[0].material.opacity = 0.4;

        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        if (app.renderer.xr.isPresenting) {
          controller.children[0].scale.z = intersect.distance;
        }

        app.LBlockS.position.copy(intersect.point);
        app.LBlockS.position.floor().addScalar(0.5);
        app.LBlockS.updateMatrixWorld();
        //check valid or not, change color
        for (let i = 0; i < app.allObjects.length; i++) {
          if (app.allObjects[i].name == 'plane') {
            continue;
          }
          if (this.checkCollision(app.LBlockS.children[0], app.allObjects[i])) {
            app.LBlockS.children[0].children[0].material.color.setHex(
              this.wrongColor
            );
            app.LBlockS.children[0].children[1].material.color.setHex(
              this.wrongColor
            );
          }
        }
        this.checkShadowL(app.LShadowXY, app.LShadowZY);

        app.LBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        app.LBlockS.children[0].children[1].getWorldPosition(pointCurent2);
        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y;
        pointXY1M.z = 0;

        pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;

        app.LShadowXY.position.copy(pointXY1M);
        app.LShadowZY.position.copy(pointZY1M);
      }
    }
  }
  moveT(app, controller) {
    let pointXY1M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);
    if (app.TSelected) {
      if (intersects.length > 0) {
        app.TBlockS.children[0].children[0].material.needsUpdate = true;
        app.TBlockS.children[0].children[0].material.color.setHex(
          this.TrightColor
        );
        app.TBlockS.children[0].children[0].material.opacity = 0.4;

        app.TBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        app.TBlockS.children[0].children[1].getWorldPosition(pointCurent2);

        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        if (app.renderer.xr.isPresenting) {
          controller.children[0].scale.z = intersect.distance;
        }
        if (
          parseFloat(pointCurent1.y.toFixed(1)) >
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          app.TBlockS.position.set(
            intersect.point.x,
            intersect.point.y + 1,
            intersect.point.z
          );
        } else {
          app.TBlockS.position.copy(intersect.point);
        }
        app.TBlockS.position.floor().addScalar(0.5);
        app.TBlockS.updateMatrixWorld();

        for (let i = 0; i < app.allObjects.length; i++) {
          if (app.allObjects[i].name == 'plane') {
            continue;
          }
          if (this.checkCollision(app.TBlockS.children[0], app.allObjects[i])) {
            app.TBlockS.children[0].children[0].material.color.setHex(
              this.wrongColor
            );
            app.TBlockS.children[0].children[1].material.color.setHex(
              this.wrongColor
            );
          }
        }
        this.checkShadowT(app.TShadowXY, app.TShadowZY);

        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y - 3;
        pointXY1M.z = 0;

        pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;

        app.TShadowXY.position.copy(pointXY1M);
        app.TShadowZY.position.copy(pointZY1M);
      }
    }
  }
  moveZ(app, controller) {
    let pointXY1M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();

    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.ZSelected) {
      if (intersects.length > 0) {
        app.ZBlockS.children[0].children[0].material.needsUpdate = true;
        app.ZBlockS.children[0].children[0].material.color.setHex(
          this.ZrightColor
        );
        app.ZBlockS.children[0].children[0].material.opacity = 0.4;

        app.ZBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        app.ZBlockS.children[0].children[1].getWorldPosition(pointCurent2);

        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        if (app.renderer.xr.isPresenting) {
          controller.children[0].scale.z = intersect.distance;
        }
        if (
          parseFloat(pointCurent1.y.toFixed(1)) <
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          app.ZBlockS.position.set(
            intersect.point.x,
            intersect.point.y + 1,
            intersect.point.z
          );
        } else if (
          parseFloat(pointCurent1.y.toFixed(1)) >
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          if (intersect.point.y > 0) {
            app.ZBlockS.position.copy(intersect.point);
          } else if (intersect.point.y == 0) {
            app.ZBlockS.position.set(
              intersect.point.x,
              intersect.point.y + 1,
              intersect.point.z
            );
          }
        } else if (
          parseFloat(pointCurent1.y.toFixed(1)) ==
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          app.ZBlockS.position.copy(intersect.point);
        }
        app.ZBlockS.position.floor().addScalar(0.5);
        app.ZBlockS.updateMatrixWorld();

        for (let i = 0; i < app.allObjects.length; i++) {
          if (app.allObjects[i].name == 'plane') {
            continue;
          }
          if (this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])) {
            app.ZBlockS.children[0].children[0].material.color.setHex(
              this.wrongColor
            );
            app.ZBlockS.children[0].children[1].material.color.setHex(
              this.wrongColor
            );
          }
        }

        this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);

        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y - 3;
        pointXY1M.z = 0;

        pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y - 3;
        pointZY1M.z = 0;

        app.ZShadowXY.position.copy(pointXY1M);
        app.ZShadowZY.position.copy(pointZY1M);
      }
    }
  }

  _onMouseDownL(app, controller) {
    let pointXY1M = this.Point.clone();
    let pointXY2M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointZY2M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();
    let point1 = this.shadowCenterPoint.clone();
    let point2 = this.shadowCenterPoint.clone();
    let point3 = this.shadowCenterPoint.clone();
    let point4 = this.shadowCenterPoint.clone();
    let point11 = this.shadowCenterPoint.clone();
    let point22 = this.shadowCenterPoint.clone();
    let point33 = this.shadowCenterPoint.clone();
    let point44 = this.shadowCenterPoint.clone();
    let temArray1 = [];
    let temArray2 = [];

    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (
      app.LSelected &&
      this.isShiftDown === false

    ) {
      app.LBlockC = new LBlock().addToSpace();
      app.LBlockC.setRotationFromQuaternion(app.LcurrentRotation);
      app.LBlockC.updateMatrixWorld();

      this.centerXY = this.Point.clone();
      this.centerZY = this.Point.clone();
      app.LShadowCXY = this.shadowGroup.clone();
      app.LShadowCZY = this.shadowGroup.clone();

      if (intersects.length > 0) {
        if (
          app.LBlockS.children[0].children[0].material.color.getHex() ==
          this.wrongColor
        ) {
          return;
        } else {
          const intersect = intersects[0];
          intersect.point.y = Math.floor(Math.abs(intersect.point.y));
          if (app.renderer.xr.isPresenting) {
            controller.children[0].scale.z = intersect.distance;
          }

          app.LBlockC.position.copy(intersect.point);
          app.LBlockC.position.floor().addScalar(0.5);
          app.LBlockC.updateMatrixWorld();

          app.LBlockC.children[0].children[0].getWorldPosition(pointCurent1);
          app.LBlockC.children[0].children[1].getWorldPosition(pointCurent2);

          //** XY plane shadow trasnform
          pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
          pointXY1M.y = pointCurent1.y;
          pointXY1M.z = 0;
          pointXY2M.x = parseFloat(pointCurent2.x.toFixed(1));

          point1.x = pointXY1M.x;
          point1.y = pointXY1M.y;
          point1.z = -4;
          point2.x = pointXY1M.x;
          point2.y = pointXY1M.y + 1;
          point2.z = -4;
          point3.x = pointXY1M.x;
          point3.y = pointXY1M.y + 2;
          point3.z = -4;
          point4.x = pointXY2M.x;
          point4.y = pointXY1M.y;
          point4.z = -4;

          if (pointXY1M.x == pointXY2M.x) {
            temArray1.push(point1, point2, point3);
          } else {
            temArray1.push(point1, point2, point3, point4);
          }
          app.receivedShadowsXY.push(temArray1);

          //XY shadow
          for (let i = 0; i < temArray1.length; i++) {
            const shadowPiece = this.shadowPiece.clone();
            shadowPiece.geometry.computeBoundingBox();
            shadowPiece.geometry.boundingBox.getCenter(this.centerXY);
            this.centerXY.copy(temArray1[i]);
            shadowPiece.position.copy(this.centerXY);
            app.LShadowCXY.attach(shadowPiece);
          }

          //** ZY plane shadow trasnform
          pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
          pointZY1M.y = pointCurent1.y;
          pointZY1M.z = 0;
          pointZY2M.x = -pointCurent2.z.toFixed(1);

          point11.x = pointZY1M.x;
          point11.y = pointZY1M.y;
          point11.z = -4;
          point22.x = pointZY1M.x;
          point22.y = pointZY1M.y + 1;
          point22.z = -4;
          point33.x = pointZY1M.x;
          point33.y = pointZY1M.y + 2;
          point33.z = -4;
          point44.x = pointZY2M.x;
          point44.y = pointZY1M.y;
          point44.z = -4;

          if (pointZY1M.x == pointZY2M.x) {
            temArray2.push(point11, point22, point33);
          } else {
            temArray2.push(point11, point22, point33, point44);
          }
          app.receivedShadowsZY.push(temArray2);

          //ZY shadow
          for (let i = 0; i < temArray2.length; i++) {
            const shadowPiece = this.shadowPiece.clone();
            shadowPiece.geometry.computeBoundingBox();
            shadowPiece.geometry.boundingBox.getCenter(this.centerZY);
            this.centerZY.copy(temArray2[i]);
            shadowPiece.position.copy(this.centerZY);
            app.LShadowCZY.attach(shadowPiece);
          }
          app.LShadowCZY.rotateY(Math.PI / 2);

          app.gameOverCubes.push(app.LBlockC.children[0]);

          app.LBlockC.attach(app.LShadowCXY);
          app.LBlockC.attach(app.LShadowCZY);
          app.LBlockC.layers.enable(1);
          app.planeXZG.add(app.LBlockC);
          app.allObjects.push(app.LBlockC);
          temArray1 = [];
          temArray2 = [];

          this.matchCheckXY(
            this.cleanPoints(app.receivedShadowsXY),
            app.levelShdaowsXY[app.level]
          );
          this.matchCheckZY(
            this.cleanPoints(app.receivedShadowsZY),
            app.levelShdaowsZY[app.level]
          );
        }
      }
    } else {
      return;
    }
  }

  _onMouseDownT(app, controller) {
    let pointXY1M = this.Point.clone();
    let pointXY2M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointZY2M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();
    let point1 = this.shadowCenterPoint.clone();
    let point2 = this.shadowCenterPoint.clone();
    let point11 = this.shadowCenterPoint.clone();
    let point22 = this.shadowCenterPoint.clone();
    let point33 = this.shadowCenterPoint.clone();
    let point44 = this.shadowCenterPoint.clone();
    let temArray1 = [];
    let temArray2 = [];

    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.TSelected && this.isShiftDown === false) {
      app.TBlockC = new TBlock().addToSpace();
      app.TBlockC.setRotationFromQuaternion(app.TcurrentRotation);
      app.TBlockC.updateMatrixWorld();

      this.centerXY = this.Point.clone();
      this.centerZY = this.Point.clone();
      app.TShadowCXY = this.shadowGroup.clone();
      app.TShadowCZY = this.shadowGroup.clone();

      app.TBlockS.children[0].children[0].getWorldPosition(pointCurent1);
      app.TBlockS.children[0].children[1].getWorldPosition(pointCurent2);

      if (intersects.length > 0) {
        if (
          app.TBlockS.children[0].children[0].material.color.getHex() ==
          this.wrongColor
        ) {
          return;
        } else {
          const intersect = intersects[0];
          intersect.point.y = Math.floor(Math.abs(intersect.point.y));
          if (app.renderer.xr.isPresenting) {
            controller.children[0].scale.z = intersect.distance;
          }
          if (
            parseFloat(pointCurent1.y.toFixed(1)) >
            parseFloat(pointCurent2.y.toFixed(1))
          ) {
            app.TBlockC.position.set(
              intersect.point.x,
              intersect.point.y + 1,
              intersect.point.z
            );
          } else {
            app.TBlockC.position.copy(intersect.point);
          }
          app.TBlockC.position.floor().addScalar(0.5);
          app.TBlockC.updateMatrixWorld();

          app.TBlockC.children[0].children[0].getWorldPosition(pointCurent1);
          app.TBlockC.children[0].children[1].getWorldPosition(pointCurent2);

          //** XY plane shadow trasnform
          pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
          pointXY1M.y = parseFloat(pointCurent1.y.toFixed(1));
          pointXY1M.z = 0;
          pointXY2M.x = parseFloat(pointCurent2.x.toFixed(1));
          pointXY2M.y = parseFloat(pointCurent2.y.toFixed(1));
          pointXY2M.z = 0;

          point1.x = pointXY1M.x;
          point1.y = pointXY1M.y;
          point1.z = -4;
          point2.x = pointXY2M.x;
          point2.y = pointXY2M.y;
          point2.z = -4;
          temArray1.push(point1, point2);
          app.receivedShadowsXY.push(temArray1);
          console.log(temArray1);

          //XY shadow
          for (let i = 0; i < temArray1.length; i++) {
            const shadowPiece = this.shadowPiece.clone();
            shadowPiece.geometry.computeBoundingBox();
            shadowPiece.geometry.boundingBox.getCenter(this.centerXY);
            this.centerXY.copy(temArray1[i]);
            shadowPiece.position.copy(this.centerXY);
            app.TShadowCXY.attach(shadowPiece);
          }

          //** ZY plane shadow transform
          pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
          pointZY1M.y = parseFloat(pointCurent1.y.toFixed(1));
          pointZY1M.z = 0;
          pointZY2M.x = parseFloat(-pointCurent2.z.toFixed(1));
          pointZY2M.y = parseFloat(pointCurent2.y.toFixed(1));
          pointZY2M.z = 0;
          if (
            parseFloat(pointCurent2.y.toFixed(1)) ==
            parseFloat(pointCurent1.y.toFixed(1))
          ) {
            point11.x = pointZY1M.x;
            point11.y = pointZY1M.y;
            point11.z = -4;
            point22.x = pointZY1M.x - 1;
            point22.y = pointZY1M.y;
            point22.z = -4;
            point33.x = pointZY1M.x + 1;
            point33.y = pointZY1M.y;
            point33.z = -4;
            temArray2.push(point11, point22, point33);
            app.receivedShadowsZY.push(temArray2);
          } else {
            point11.x = pointZY1M.x;
            point11.y = pointZY1M.y;
            point11.z = -4;
            point22.x = pointZY1M.x - 1;
            point22.y = pointZY1M.y;
            point22.z = -4;
            point33.x = pointZY1M.x + 1;
            point33.y = pointZY1M.y;
            point33.z = -4;
            point44.x = pointZY2M.x;
            point44.y = pointZY2M.y;
            point44.z = -4;
            temArray2.push(point11, point22, point33, point44);
            app.receivedShadowsZY.push(temArray2);
          }

          //ZY shadow
          for (let i = 0; i < temArray2.length; i++) {
            const shadowPiece = this.shadowPiece.clone();
            shadowPiece.geometry.computeBoundingBox();
            shadowPiece.geometry.boundingBox.getCenter(this.centerZY);
            this.centerZY.copy(temArray2[i]);
            shadowPiece.position.copy(this.centerZY);
            app.TShadowCZY.attach(shadowPiece);
          }
          app.TShadowCZY.rotateY(Math.PI / 2);

          app.gameOverCubes.push(app.TBlockC.children[0]);

          app.TBlockC.attach(app.TShadowCXY);
          app.TBlockC.attach(app.TShadowCZY);
          app.TBlockC.layers.enable(1);
          app.planeXZG.add(app.TBlockC);
          app.allObjects.push(app.TBlockC);
          temArray1 = [];
          temArray2 = [];

          //receive 打开、 去重 ==> new shadowpoints
          this.matchCheckXY(
            this.cleanPoints(app.receivedShadowsXY),
            app.levelShdaowsXY[app.level]
          );
          this.matchCheckZY(
            this.cleanPoints(app.receivedShadowsZY),
            app.levelShdaowsZY[app.level]
          );
        }
      }
    } else {
      return;
    }
  }

  _onMouseDownZ(app, controller) {
    let pointXY1M = this.Point.clone();
    let pointXY2M = this.Point.clone();
    let pointZY1M = this.Point.clone();
    let pointCurent1 = this.Point.clone();
    let pointCurent2 = this.Point.clone();
    let point1 = this.shadowCenterPoint.clone();
    let point2 = this.shadowCenterPoint.clone();
    let point3 = this.shadowCenterPoint.clone();
    let point4 = this.shadowCenterPoint.clone();
    let point11 = this.shadowCenterPoint.clone();
    let point22 = this.shadowCenterPoint.clone();
    let point33 = this.shadowCenterPoint.clone();

    let temArray1 = [];
    let temArray2 = [];

    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.ZSelected && this.isShiftDown === false) {
      app.ZBlockC = new ZBlock().addToSpace();
      app.ZBlockC.setRotationFromQuaternion(app.ZcurrentRotation);
      app.ZBlockC.updateMatrixWorld();

      this.centerXY = this.Point.clone();
      this.centerZY = this.Point.clone();
      app.ZShadowCXY = this.shadowGroup.clone();
      app.ZShadowCZY = this.shadowGroup.clone();

      app.ZBlockS.children[0].children[0].getWorldPosition(pointCurent1);
      app.ZBlockS.children[0].children[1].getWorldPosition(pointCurent2);

      if (intersects.length > 0) {
        if (
          app.ZBlockS.children[0].children[0].material.color.getHex() ==
          this.wrongColor
        ) {
          return;
        } else {
          const intersect = intersects[0];
          intersect.point.y = Math.floor(Math.abs(intersect.point.y));
          if (app.renderer.xr.isPresenting) {
            controller.children[0].scale.z = intersect.distance;
          }
          if (
            parseFloat(pointCurent1.y.toFixed(1)) <
            parseFloat(pointCurent2.y.toFixed(1))
          ) {
            app.ZBlockC.position.set(
              intersect.point.x,
              intersect.point.y + 1,
              intersect.point.z
            );
          } else if (
            parseFloat(pointCurent1.y.toFixed(1)) >
            parseFloat(pointCurent2.y.toFixed(1))
          ) {
            if (intersect.point.y > 0) {
              app.ZBlockC.position.copy(intersect.point);
            } else if (intersect.point.y == 0) {
              app.ZBlockC.position.set(
                intersect.point.x,
                intersect.point.y + 1,
                intersect.point.z
              );
            }
          } else if (
            parseFloat(pointCurent1.y.toFixed(1)) ==
            parseFloat(pointCurent2.y.toFixed(1))
          ) {
            app.ZBlockC.position.copy(intersect.point);
          }
          app.ZBlockC.position.floor().addScalar(0.5);
          app.ZBlockC.updateMatrixWorld();

          app.ZBlockC.children[0].children[0].getWorldPosition(pointCurent1);
          app.ZBlockC.children[0].children[1].getWorldPosition(pointCurent2);

          //XY plane shadow trasnform
          pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
          pointXY1M.y = parseFloat(pointCurent1.y.toFixed(1) - 3);
          pointXY1M.z = 0;
          pointXY2M.x = parseFloat(pointCurent2.x.toFixed(1));
          pointXY2M.y = parseFloat(pointCurent2.y.toFixed(1) - 3);
          pointXY2M.z = 0;

          if (pointXY1M.y < pointXY2M.y) {
            app.ZShadowCXY.position.copy(pointXY1M);
            point1.x = pointXY1M.x;
            point1.y = pointXY1M.y + 3;
            point1.z = -4;
            point2.x = pointXY1M.x;
            point2.y = pointXY1M.y + 2;
            point2.z = -4;
            point3.x = pointXY1M.x + 1;
            point3.y = pointXY1M.y + 3;
            point3.z = -4;
            point4.x = pointXY2M.x;
            point4.y = pointXY2M.y + 3;
            point4.z = -4;
            temArray1.push(point1, point2, point3, point4);
            app.receivedShadowsXY.push(temArray1);
          }
          if (pointXY1M.y === pointXY2M.y) {
            point1.x = pointXY1M.x;
            point1.y = pointXY1M.y + 3;
            point1.z = -4;
            point2.x = pointXY1M.x + 1;
            point2.y = pointXY1M.y + 3;
            point2.z = -4;
            temArray1.push(point1, point2);
            app.receivedShadowsXY.push(temArray1);
          }
          if (pointXY1M.y > pointXY2M.y) {
            point1.x = pointXY1M.x;
            point1.y = pointXY1M.y + 3;
            point1.z = -4;
            point2.x = pointXY1M.x;
            point2.y = pointXY1M.y + 4;
            point2.z = -4;
            point3.x = pointXY1M.x + 1;
            point3.y = pointXY1M.y + 3;
            point3.z = -4;
            point4.x = pointXY2M.x;
            point4.y = pointXY2M.y + 3;
            point4.z = -4;
            temArray1.push(point1, point2, point3, point4);
            app.receivedShadowsXY.push(temArray1);
          }
          //XY shadow
          for (let i = 0; i < temArray1.length; i++) {
            const shadowPiece = this.shadowPiece.clone();
            shadowPiece.geometry.computeBoundingBox();
            shadowPiece.geometry.boundingBox.getCenter(this.centerXY);
            this.centerXY.copy(temArray1[i]);
            shadowPiece.position.copy(this.centerXY);
            app.ZShadowCXY.attach(shadowPiece);
          }

          //ZY plane shadow trasnform
          pointZY1M.x = -pointCurent1.z;
          pointZY1M.y = pointCurent1.y - 3;
          pointZY1M.z = 0;

          if (Math.abs(app.ZcurrentRotation1.x.toFixed(1)) == 0.7) {
            point11.x = pointZY1M.x;
            point11.y = pointZY1M.y + 3;
            point11.z = -4;
            point22.x = pointZY1M.x - 1;
            point22.y = pointZY1M.y + 3;
            point22.z = -4;
            point33.x = pointZY1M.x + 1;
            point33.y = pointZY1M.y + 3;
            point33.z = -4;
            temArray2.push(point11, point22, point33);
            app.receivedShadowsZY.push(temArray2);
          } else {
            point11.x = pointZY1M.x;
            point11.y = pointZY1M.y + 3;
            point11.z = -4;
            point22.x = pointZY1M.x;
            point22.y = pointZY1M.y + 2;
            point22.z = -4;
            point33.x = pointZY1M.x;
            point33.y = pointZY1M.y + 4;
            point33.z = -4;
            temArray2.push(point11, point22, point33);
            app.receivedShadowsZY.push(temArray2);
          }
          //ZY shadow
          for (let i = 0; i < temArray2.length; i++) {
            const shadowPiece = this.shadowPiece.clone();
            shadowPiece.geometry.computeBoundingBox();
            shadowPiece.geometry.boundingBox.getCenter(this.centerZY);
            this.centerZY.copy(temArray2[i]);
            shadowPiece.position.copy(this.centerZY);
            app.ZShadowCZY.attach(shadowPiece);
          }
          app.ZShadowCZY.rotateY(Math.PI / 2);

          app.gameOverCubes.push(app.ZBlockC.children[0]);

          app.ZBlockC.attach(app.ZShadowCXY);
          app.ZBlockC.attach(app.ZShadowCZY);
          app.ZBlockC.layers.enable(1);
          app.planeXZG.add(app.ZBlockC);
          app.allObjects.push(app.ZBlockC);
          temArray1 = [];
          temArray2 = [];

          //receive 打开、 去重 ==> new shadowpoints
          this.matchCheckXY(
            this.cleanPoints(app.receivedShadowsXY),
            app.levelShdaowsXY[app.level]
          );
          this.matchCheckZY(
            this.cleanPoints(app.receivedShadowsZY),
            app.levelShdaowsZY[app.level]
          );
        }
      }
    } else {
      return;
    }
  }

  _leftTurn(){
    if(app.LSelected){
      app.LBlockS.children[0].children[0].material.color.setHex(
        this.LrightColor
      );
      app.LBlockS.children[0].children[0].material.opacity = 0.4;
      app.LBlockS.rotateY(-Math.PI / 2);
      app.LBlockS.updateMatrixWorld();
      this.checkShadowL(app.LShadowXY, app.LShadowZY);
      app.LBlockS.getWorldQuaternion(app.LcurrentRotation);
      //check valid or not, change color
      for (let i = 0; i < app.allObjects.length; i++) {
        if (app.allObjects[i].name == 'plane') {
          //dont test against the plane, other blocks are object3D
          continue;
        }
        if (this.checkCollision(app.LBlockS.children[0], app.allObjects[i])) {
          app.LBlockS.children[0].material.color.setHex(this.wrongColor);
        }
      }

    } else if(app.TSelected){
      app.TBlockS.children[0].children[0].material.color.setHex(
        this.TrightColor
      );
      app.TBlockS.children[0].children[0].material.opacity = 0.4;
      app.TBlockS.rotateZ(-Math.PI / 2);
      app.TShadowXY.rotateZ(-Math.PI / 2);
      app.TBlockS.updateMatrixWorld();
      app.TShadowXY.updateMatrixWorld();
      app.TShadowXY.getWorldQuaternion(app.TcurrentRotation1);
      this.checkShadowT(app.TShadowXY, app.TShadowZY);
      app.TBlockS.getWorldQuaternion(app.TcurrentRotation);

      for (let i = 0; i < app.allObjects.length; i++) {
        if (app.allObjects[i].name == 'plane') {
          //dont test against the plane, other blocks are object3D
          continue;
        }
        if (this.checkCollision(app.TBlockS.children[0], app.allObjects[i])) {
          app.TBlockS.children[0].material.color.setHex(this.wrongColor);
        }
      }

    } else if(app.ZSelected){
      app.ZBlockS.children[0].children[0].material.color.setHex(
        this.ZrightColor
      );
      app.ZBlockS.children[0].children[0].material.opacity = 0.4;
      app.ZBlockS.rotateX(-Math.PI / 2);
      app.ZShadowZY.rotateX(-Math.PI / 2);
      app.ZBlockS.updateMatrixWorld();
      app.ZShadowZY.updateMatrixWorld();
      app.ZShadowZY.getWorldQuaternion(app.ZcurrentRotation1);
      this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);
      app.ZBlockS.getWorldQuaternion(app.ZcurrentRotation);

      for (let i = 0; i < app.allObjects.length; i++) {
        if (app.allObjects[i].name == 'plane') {
          continue;
        }
        if (this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])) {
          app.ZBlockS.children[0].material.color.setHex(this.wrongColor);
        }
      }


    }
    else return
  }
  _rightTurn(){
    if (app.LSelected) {
      app.LBlockS.children[0].children[0].material.color.setHex(
        this.LrightColor
      );
      app.LBlockS.children[0].children[0].material.opacity = 0.4;
      app.LBlockS.rotateY(Math.PI / 2);
      app.LBlockS.updateMatrixWorld();
      this.checkShadowL(app.LShadowXY, app.LShadowZY);
      app.LBlockS.getWorldQuaternion(app.LcurrentRotation);
      //check valid or not, change color
      for (let i = 0; i < app.allObjects.length; i++) {
        if (app.allObjects[i].name == 'plane') {
          //dont test against the plane, other blocks are object3D
          continue;
        }
        if (this.checkCollision(app.LBlockS.children[0], app.allObjects[i])) {
          app.LBlockS.children[0].material.color.setHex(this.wrongColor);
        }
      }
    } else if(app.TSelected) {
      app.TBlockS.children[0].children[0].material.color.setHex(
        this.TrightColor
      );
      app.TBlockS.children[0].children[0].material.opacity = 0.4;
      app.TBlockS.rotateZ(Math.PI / 2);
      app.TShadowXY.rotateZ(Math.PI / 2);
      app.TBlockS.updateMatrixWorld();
      app.TShadowXY.updateMatrixWorld();
      app.TShadowXY.getWorldQuaternion(app.TcurrentRotation1);
      this.checkShadowT(app.TShadowXY, app.TShadowZY);
      app.TBlockS.getWorldQuaternion(app.TcurrentRotation);

      for (let i = 0; i < app.allObjects.length; i++) {
        if (app.allObjects[i].name == 'plane') {
          //dont test against the plane, other blocks are object3D
          continue;
        }
        if (this.checkCollision(app.TBlockS.children[0], app.allObjects[i])) {
          app.TBlockS.children[0].material.color.setHex(this.wrongColor);
        }
      }
    } else if(app.ZSelected) {
      app.ZBlockS.children[0].children[0].material.color.setHex(
        this.ZrightColor
      );
      app.ZBlockS.children[0].children[0].material.opacity = 0.4;
      app.ZBlockS.rotateX(Math.PI / 2);
      app.ZShadowZY.rotateX(Math.PI / 2);
      app.ZBlockS.updateMatrixWorld();
      app.ZShadowZY.updateMatrixWorld();
      app.ZShadowZY.getWorldQuaternion(app.ZcurrentRotation1);
      this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);
      app.ZBlockS.getWorldQuaternion(app.ZcurrentRotation);

      for (let i = 0; i < app.allObjects.length; i++) {
        if (app.allObjects[i].name == 'plane') {
          continue;
        }
        if (this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])) {
          app.ZBlockS.children[0].material.color.setHex(this.wrongColor);
        }
      }
    } else return;

  }



  _onKeyDownL(event) {
    if (app.LSelected) {
      app.LBlockS.children[0].children[0].material.needsUpdate = true;
      app.LBlockS.children[0].children[1].material.needsUpdate = true;
      app.LBlockS.children[0].children[0].material.color.setHex(
        this.LrightColor
      );
      app.LBlockS.children[0].children[0].material.opacity = 0.4;
      switch (event.key) {
        case 'ArrowLeft':
          app.LBlockS.rotateY(-Math.PI / 2);
          app.LBlockS.updateMatrixWorld();
          this.checkShadowL(app.LShadowXY, app.LShadowZY);
          app.LBlockS.getWorldQuaternion(app.LcurrentRotation);
          //check valid or not, change color
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].name == 'plane') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.LBlockS.children[0], app.allObjects[i])
            ) {
              app.LBlockS.children[0].children[0].material.color.setHex(this.wrongColor);
            }
          }

          break;
        case 'ArrowRight':
          app.LBlockS.rotateY(Math.PI / 2);
          app.LBlockS.updateMatrixWorld();
          this.checkShadowL(app.LShadowXY, app.LShadowZY);
          //check valid or not, change color
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].name == 'plane') {
              continue;
            }
            if (
              this.checkCollision(app.LBlockS.children[0], app.allObjects[i])
            ) {
              app.LBlockS.children[0].children[0].material.color.setHex(this.wrongColor);
            }
          }
          app.LBlockS.getWorldQuaternion(app.LcurrentRotation);
          break;
      }
    }
  }

  _onKeyDownT(event) {
    if (app.TSelected) {
      app.TBlockS.children[0].children[0].material.color.setHex(
        this.TrightColor
      );
      app.TBlockS.children[0].children[0].material.opacity = 0.4;

      switch (event.key) {
        case 'ArrowLeft':
          app.TBlockS.rotateZ(-Math.PI / 2);
          app.TShadowXY.rotateZ(-Math.PI / 2);
          app.TBlockS.updateMatrixWorld();
          app.TShadowXY.updateMatrixWorld();
          app.TShadowXY.getWorldQuaternion(app.TcurrentRotation1);
          this.checkShadowT(app.TShadowXY, app.TShadowZY);
          app.TBlockS.getWorldQuaternion(app.TcurrentRotation);

          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].name == 'plane') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.TBlockS.children[0], app.allObjects[i])
            ) {
              app.TBlockS.children[0].children[0].material.color.setHex(this.wrongColor);
            }
          }
          break;
        case 'ArrowRight':
          app.TBlockS.rotateZ(Math.PI / 2);
          app.TShadowXY.rotateZ(Math.PI / 2);
          app.TBlockS.updateMatrixWorld();
          app.TShadowXY.getWorldQuaternion(app.TcurrentRotation1);
          this.checkShadowT(app.TShadowXY, app.TShadowZY);
          app.TBlockS.getWorldQuaternion(app.TcurrentRotation);
          //check valid or not, change color
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].name == 'plane') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.TBlockS.children[0], app.allObjects[i])
            ) {
              app.TBlockS.children[0].children[0].material.color.setHex(this.wrongColor);
            }
          }
          break;
      }
    }
  }

  _onKeyDownZ(event) {
    if (app.ZSelected) {
      app.ZBlockS.children[0].children[0].material.color.setHex(
        this.ZrightColor
      );
      app.ZBlockS.children[0].children[0].material.opacity = 0.4;

      switch (event.key) {
        case 'ArrowLeft':
          app.ZBlockS.rotateX(-Math.PI / 2);
          app.ZShadowZY.rotateX(-Math.PI / 2);
          app.ZBlockS.updateMatrixWorld();
          app.ZShadowZY.updateMatrixWorld();
          app.ZShadowZY.getWorldQuaternion(app.ZcurrentRotation1);
          this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);
          app.ZBlockS.getWorldQuaternion(app.ZcurrentRotation);

          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].name == 'plane') {
              continue;
            }
            if (
              this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])
            ) {
              app.ZBlockS.children[0].children[0].material.color.setHex(this.wrongColor);
            }
          }
          break;
        case 'ArrowRight':
          app.ZBlockS.rotateX(Math.PI / 2);
          app.ZShadowZY.rotateX(Math.PI / 2);
          app.ZShadowZY.updateMatrixWorld();
          app.ZShadowZY.getWorldQuaternion(app.ZcurrentRotation1);
          app.ZBlockS.updateMatrixWorld();
          this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);
          app.ZBlockS.getWorldQuaternion(app.ZcurrentRotation);
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].name == 'plane') {
              continue;
            }
            if (
              this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])
            ) {
              app.ZBlockS.children[0].children[0].material.color.setHex(this.wrongColor);
            }
          }
          break;
      }
    }
  }
  _onMouseDelete(app, controller) {
    this.empty = new THREE.Mesh();
    this.empty.position.set(0, -0.5, 0);
    this.empty.scale.set(0, 0, 0);
    this.empty.layers.disable(1);
    this.empty.visible = false;
    this.empty.name = 'empty';

    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (app.renderer.xr.isPresenting) {
        controller.children[0].scale.z = intersect.distance;

        if (
          controller.userData.squeezePressed &&
          intersect.object.name !== 'plane'
        ) {

          for (let i = 1; i < app.allObjects.length; i++) {
            if (
              app.allObjects[i].name !== 'empty' &&
              intersect.object.parent.id == app.allObjects[i].children[0].id
            ) {
              console.log('delete');
              console.log(intersect.object.parent.parent);
              app.planeXZG.remove(intersect.object.parent.parent);
              app.allObjects.splice(i, 1, this.empty);
              app.receivedShadowsXY.splice(i - 1, 1, '[]');
              app.receivedShadowsZY.splice(i - 1, 1, '[]');

              this.deleteCheckXY(
                this.cleanPoints(app.receivedShadowsXY),
                app.levelShdaowsXY[app.level]
              );
              this.deleteCheckZY(
                this.cleanPoints(app.receivedShadowsZY),
                app.levelShdaowsZY[app.level]
              );
            }
          }
        }
      } else {
        if (this.isShiftDown && intersect.object.name !== 'plane') {
          for (let i = 1; i < app.allObjects.length; i++) {
            if (
              app.allObjects[i].name !== 'empty' &&
              intersect.object.parent.id == app.allObjects[i].children[0].id
            ) {
              app.planeXZG.remove(intersect.object.parent.parent);
              app.allObjects.splice(i, 1, this.empty);
              app.receivedShadowsXY.splice(i - 1, 1, '[]');
              app.receivedShadowsZY.splice(i - 1, 1, '[]');

              this.deleteCheckXY(
                this.cleanPoints(app.receivedShadowsXY),
                app.levelShdaowsXY[app.level]
              );
              this.deleteCheckZY(
                this.cleanPoints(app.receivedShadowsZY),
                app.levelShdaowsZY[app.level]
              );
            }
          }
        }
      }
    }
  }

  _onMoveDelete(app, controller) {
    if (app.level === 2) {
      const intersects = app.raycaster.intersectObjects(
        app.gameOverCubes,
      );
      if (intersects.length > 0) {
        const intersect = intersects[0];
        console.log(intersect.object);
        console.log(app.finalGroup);
        if (app.renderer.xr.isPresenting) {
          controller.children[0].scale.z = intersect.distance + 3;
          if (controller.userData.squeezePressed) {
            console.log(controller.userData.squeezePressed);
            app.finalGroup.remove(intersect.object.parent);
            console.log('removed');
            app.gameOverCubes.splice(
              app.gameOverCubes.indexOf(intersect.object.parent),
              1
            );
          }
        }
      }
    }
  }

  _onKeyDOWN(event) {
    switch (event.keyCode) {
      case 16:
        this.isShiftDown = true;
        break;
    }
  }
  _onKeyUP(event) {
    switch (event.keyCode) {
      case 16:
        this.isShiftDown = false;
        break;
    }
  }
}
export { Inputs };
