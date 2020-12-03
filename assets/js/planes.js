import * as THREE from './libs/three/three.module.js';
import { SpotLightVolumetricMaterial } from './libs/SpotLightVolumetricMaterial.js';

class Planes {
  constructor() {
    this.planeGroup = new THREE.Group();
    this.spotLight = new THREE.Group();
  }

  addXY() {
    const planeGeomXY = new THREE.PlaneBufferGeometry(6, 6);
    const planeXY = new THREE.Mesh(
      planeGeomXY,
      new THREE.MeshBasicMaterial({
        color: 0xb8f1cc,
        opacity: 0.8,
        transparent: true,
      })
    );
    planeXY.position.set(0, 3, -4);
    this.planeGroup.add(planeXY);
    return this.planeGroup;
  }

  addZY() {
    const planeGeomZY = new THREE.PlaneBufferGeometry(6, 6);
    const planeZY = new THREE.Mesh(
      planeGeomZY,
      new THREE.MeshBasicMaterial({
        color: 0xb8f1cc,
        opacity: 0.8,
        transparent: true,
      })
    );
    planeZY.rotateY(Math.PI / 2);
    planeZY.position.x = -4;
    planeZY.position.y = 3;
    this.planeGroup.add(planeZY);
    return this.planeGroup;
  }

  addXZ() {
    const gridHelperXZ = new THREE.GridHelper(6, 6, 0xaa5b71, 0xae716e);
    const planeGeomXZ = new THREE.PlaneBufferGeometry(6, 6);
    planeGeomXZ.rotateX(-Math.PI / 2);
    planeGeomXZ.normalizeNormals();

    const planeXZ = new THREE.Mesh(
      planeGeomXZ,
      new THREE.MeshBasicMaterial({
        color: 0xd9b8f1,
        transparent: true,
        opacity: 1,
      })
    );
    planeXZ.name = "plane";
    this.planeGroup.add(planeXZ, gridHelperXZ);
    return this.planeGroup;
  }

  addCoor() {
    this.spotLightL = this.spotLight.clone();
    this.spotLightT = this.spotLight.clone();
    this.spotLightZ = this.spotLight.clone();

    const lightGeo = new THREE.CylinderBufferGeometry(0.12, 0.25, 6.5, 32, true);

    const Lmaterial = new SpotLightVolumetricMaterial(
      new THREE.Color(0x00a9fe)
    );
    const Tmaterial = new SpotLightVolumetricMaterial(
      new THREE.Color(0xfecf45)
    );
    const Zmaterial = new SpotLightVolumetricMaterial(
      new THREE.Color(0xb537f2)
    );

    const lightL = new THREE.SpotLight(0x00a9fe, 1, 5, Math.PI / 15, 0.3);
    lightL.position.set(0, 5.5, 0);
    lightL.target.position.set(0, 5.8, 0);

    const lightT = new THREE.SpotLight(0xfecf45, 1, 5, Math.PI / 15, 0.3);
    lightT.position.set(0, 0, 7);
    lightT.target.position.set(0, 0, 7.3);

    const lightZ = new THREE.SpotLight(0xb537f2, 1, 5, Math.PI / 15, 0.3);
    lightZ.position.set(7, 0, 0);
    lightZ.target.position.set(7.3, 0, 0);


    const coneL = new THREE.Mesh(lightGeo,Lmaterial);
    coneL.translateY(-2.2);
    lightL.add(coneL);

    const coneT = new THREE.Mesh(lightGeo, Tmaterial);
    coneT.rotateX(Math.PI/2)
     coneT.scale.set(1, 1.076, 1);
    coneT.translateY(-3.5);
    lightT.add(coneT);

    const coneZ = new THREE.Mesh(lightGeo, Zmaterial);
    coneZ.rotateZ(-Math.PI / 2);
    coneZ.scale.set(1,1.076,1)
    coneZ.translateY(-3.5);
    lightZ.add(coneZ);

    this.spotLightL.add(lightL);
    this.spotLightL.visible = false;

    this.spotLightT.add(lightT);
    this.spotLightT.visible = false;

    this.spotLightZ.add(lightZ);
    this.spotLightZ.visible = false;

    const Cygeometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 7, 32);
    const CygeometryY = new THREE.CylinderBufferGeometry(0.1, 0.1, 6.5, 32);

    const materialX = new THREE.MeshStandardMaterial({
      color: 0xef5464,

      opacity: 0.3,
      transparent: true,
    });
    const materialZ = new THREE.MeshStandardMaterial({
      color: 0xef5464,

      opacity: 0.3,
      transparent: true,
    });
    const materialY = new THREE.MeshStandardMaterial({
      color: 0xef5464,
      //emissive: 0x00a9fe,
      opacity: 0.3,
      transparent: true,
    });

    const centerGeometry = new THREE.SphereBufferGeometry(0.2, 32, 32);
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      //emissive: 0xffffff,
      opacity: 1,
    });
    this.alixX = new THREE.Mesh(Cygeometry, materialX);
    this.alixX.rotateZ(-Math.PI / 2);
    this.alixX.position.set(3.5, 0, 0);
    this.alixY = new THREE.Mesh(CygeometryY, materialY);
    this.alixY.position.set(0, 3.25, 0);
    this.alixZ = new THREE.Mesh(Cygeometry, materialZ);
    this.alixZ.rotateX(-Math.PI / 2);
    this.alixZ.position.set(0, 0, 3.5);
    this.center = new THREE.Mesh(centerGeometry, centerMaterial);


    this.coorGroup = new THREE.Object3D();
    this.coorGroup.add(this.center);
    this.coorGroup.add(this.spotLightL, this.spotLightT, this.spotLightZ);
    this.coorGroup.add(this.alixX, this.alixY, this.alixZ);
    return this.coorGroup;
  }


}
export { Planes };
