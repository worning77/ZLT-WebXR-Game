import * as THREE from './libs/three/three.module.js';

import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';
import { CanvasUI } from './libs/CanvasUI.js';
import { LoadingBar } from './libs/LoadingBar.js';
import { Stats } from './libs/stats.module.js';
import {
  Constants as MotionControllerConstants,
  fetchProfile,
  MotionController,
} from './libs/three/jsm/motion-controllers.module.js';

const DEFAULT_PROFILES_PATH =
  'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

//import conponents

import { VRButton } from './VRButton.js';
import { Planes } from './planes.js';
import { LBlock } from './shapes/l-shape.js';
import { TBlock } from './shapes/t-shape.js';
import { ZBlock } from './shapes/z-shape.js';
import { Inputs } from './inputs.js';
import { Levels } from './level.js';

// import { LBlock, TBlock, ZBlock } from './shapes/'

const SkyTexture = function (width, height) {
  this.canvas;
  this.ctx;
  this.width = width;
  this.height = height;

  this.topColor = 'rgb(135,196,196)';
  this.bottomColor = 'rgb(255,152,158)';

  this.init = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'skyTexture';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    //document.body.appendChild(this.canvas);     // don't need to do this!
  };

  this.render = function () {
    // Create gradient
    const grd = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grd.addColorStop(0.8, this.topColor);
    grd.addColorStop(0.2, this.bottomColor);

    // Fill with gradient
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };
};

const background = function () {
  this.worldSize = 30;
  this.createSkySphere = function (texture) {
    texture = new THREE.CanvasTexture(texture);
    const skySphere_geom = new THREE.SphereGeometry(this.worldSize, 100, 100);
    const skySphere_mat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: texture,
      fog: true,
    });
    this.skySphere = new THREE.Mesh(skySphere_geom, skySphere_mat);
    this.skySphere.material.map.needsUpdate = true;
    return this.skySphere;
  };
};

class App {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    this.clock = new THREE.Clock();
    //camera setting:
    //perspectiveCamera(FOV(left-right degree), aspect ratio(view's width/height), near, far)
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    //move camera nearer along Z axis
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(-5, 0, -5);
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    //Scene setting: default background is white 0xfe53bb
    this.scene = new THREE.Scene();

    this.skyTexture = new SkyTexture(1024, 1024);
    this.skyTexture.init();
    this.skyTexture.render();
    this.background = new background();
    this.sky = this.background.createSkySphere(this.skyTexture.ctx.canvas);
    this.scene.add(this.sky);

    this.scene.fog = new THREE.Fog(0xdcff93, 30, 60);
    //Only have light can see the color of objects

    //add environment light (can't have shadows):
    //hemispherelight(Sky color, ground color, intensity)
    const environmentLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(environmentLight);

    //add direct light from a position.
    const light = new THREE.DirectionalLight(0xdcff93, 0.3);
    light.position.set(1, 10, 4);
    this.scene.add(light);

    //Renderer setting:
    //antialias is for vr headset, otherwise will have bad edges
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    this.mouseX = 0;
    this.mouseY = 0;

    //drag page control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 9;
    this.controls.maxDistance = 12;
    this.controls.keys = false;
    this.controls.target.set(0, 3, 0);
    this.controls.update();

    this.stats = new Stats();
    container.appendChild(this.stats.dom);

    //visuialize controllers
    this.raycaster = new THREE.Raycaster();
    this.raycasterHead = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();

    //** Init scene
    this.loadingBar = new LoadingBar();
    //Init planes
    this.planeXYG = new Planes().addXY();
    this.planeXY = this.planeXYG.children[0];
    this.planeZYG = new Planes().addZY();
    this.planeZY = this.planeZYG.children[0];
    this.planeXZG = new Planes().addXZ();
    this.planeXZ = this.planeXZG.children[0];
    this.coorGroup2 = new Planes().addCoor();

    // Init BLOCKS
    this.BLOCKS = [];
    this.LBLOCK = new LBlock().addToSpace();
    this.LBLOCK.position.set(0, 3.4, 0);
    this.LBLOCK.rotateY(Math.PI / 2);
    this.LBLOCK.scale.set(0.5, 0.5, 0.5);

    this.TBLOCK = new TBlock().addToSpace();
    this.TBLOCK.rotateX(Math.PI / 2);
    this.TBLOCK.position.set(0, -4, 0);
    this.TBLOCK.scale.set(0.5, 0.5, 0.5);

    this.ZBLOCK = new ZBlock().addToSpace();
    this.ZBLOCK.position.set(0, 3.6, 0);
    this.ZBLOCK.rotateZ(Math.PI / 2);
    this.ZBLOCK.scale.set(0.5, 0.5, 0.5);

    this.LSke = new LBlock().addSkeletonToSpace();
    this.TSke = new TBlock().addSkeletonToSpace();
    this.ZSke = new ZBlock().addSkeletonToSpace();

    this.gameOverCubes = [];
    this.gameOverCubes.push(
      this.LBLOCK.children[0],
      this.TBLOCK.children[0],
      this.ZBLOCK.children[0]
    );

    this.gameDefaultCubes = [];
    this.gameDefaultCubes.push(
      this.LSke.children[0].clone(),
      this.TSke.children[0].clone(),
      this.ZSke.children[0].clone(),
      this.LSke.children[0].clone(),
      this.TSke.children[0].clone(),
      this.ZSke.children[0].clone(),
      this.LSke.children[0].clone(),
      this.TSke.children[0].clone(),
      this.ZSke.children[0].clone()
    );

    this.coorGroup2.children[4].add(this.ZBLOCK);
    this.coorGroup2.children[5].add(this.LBLOCK);
    this.coorGroup2.children[6].add(this.TBLOCK);

    this.BLOCKS.push(this.LBLOCK, this.TBLOCK, this.ZBLOCK);

    //** levels
    this.levelShdaowsXY = [];
    this.levelShdaowsZY = [];
    this.receivedShadowsXY = [];
    this.receivedShadowsZY = [];

    this.finalGroup = new THREE.Group();
    this.textMesh = new THREE.Mesh();

    //** raycaster array
    this.allObjects = [];
    this.allObjects.push(this.planeXZ);

    // * move player
    this.dolly = new THREE.Group();
    this.cameraVector = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.origin = new THREE.Vector3();

    //** Init events
    this._onMouseMoves = [];
    this._onMouseDowns = [];
    this._onKeyDowns = [];
    this._onKeyUp = [];
    this._leftTurn = [];
    this._rightTurn = [];
    this.BlocksControls = new Inputs(this);

    this._addEventListeners();

    //** Init flags
    this.LSelected = false;
    this.TSelected = false;
    this.ZSelected = false;
    this.LMoved = false;
    this.TMoved = false;
    this.ZMoved = false;
    this.XYmatched = false;
    this.ZYmatched = false;
    this.levelPassed = false;
    this.level = 0;
    this.menuShow = true;

    //** Start
    this.textLoader();

    window.addEventListener('resize', this.resize.bind(this));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  resize() {
    //resize function
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  backMusicLoader() {
    this.listener1 = new THREE.AudioListener();
    this.camera.add(this.listener1);
    this.backSound = new THREE.Audio(this.listener1);
    this.scene.add(this.backSound);
    const audioLoader = new THREE.AudioLoader();
    const musicfile =
      'https://worning77.github.io/ZLT-WebXR-Game/assets/sounds/Else-Paris-128k.ogg';

    const self = this;
    audioLoader.load(musicfile, function (buffer) {
      self.backSound.setBuffer(buffer);
      self.backSound.setLoop(true);
      self.backSound.setVolume(0.2);
      self.backSound.play();
    });
  }

  levelUPSound() {
    this.listener2 = new THREE.AudioListener();
    this.camera.add(this.listener2);
    this.completed = new THREE.Audio(this.listener2);
    const audioLoader = new THREE.AudioLoader();
    const musicfile =
      'https://worning77.github.io/ZLT-WebXR-Game/assets/sounds/completed.mp3';

    const self = this;
    audioLoader.load(musicfile, function (buffer) {
      self.completed.setBuffer(buffer);
      self.completed.setVolume(0.4);
      self.completed.play();
    });
  }

  textLoader() {
    // init text
    const loader1 = new THREE.FontLoader();
    this.Title = [];
    const createTypo1 = (f) => {
      const word1 = 'Z';
      const word2 = 'L';
      const word3 = 'T';
      const word4 = 'start';
      this.words = new THREE.Group();
      const typoProperties1 = {
        font: f,
        size: 1,
        height: 0.3,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 1,
      };
      const text1 = new THREE.TextGeometry(word1, typoProperties1);
      const text2 = new THREE.TextGeometry(word2, typoProperties1);
      const text3 = new THREE.TextGeometry(word3, typoProperties1);
      const text4 = new THREE.TextGeometry(word4, typoProperties1);
      //text4.computeBoundingBox();
      const material = new THREE.MeshPhongMaterial({ color: 0xaa5b71 });
      const material2 = new THREE.MeshPhongMaterial({ color: 0xb7d28d });
      const material3 = new THREE.MeshPhongMaterial({ color: 0xe29e4b });
      const material4 = new THREE.MeshPhongMaterial({ color: 0xf55066 });
      const mesh1 = new THREE.Mesh(text1, material);
      const mesh2 = new THREE.Mesh(text2, material2);
      const mesh3 = new THREE.Mesh(text3, material3);
      const mesh4 = new THREE.Mesh(text4, material4);
      mesh1.position.set(-1.5, 2, -3);

      mesh2.position.set(0.5, 2, -3);
      mesh2.rotateY(-Math.PI / 4);

      mesh3.position.set(2, 2, -2.5);
      mesh3.rotateY(Math.PI / 4);
      this.words.add(mesh1, mesh2, mesh3);
      this.Enter = new THREE.Object3D();
      this.Enter.add(mesh4);
      this.Enter.position.set(-0.15, 0, -2.5);
      this.Enter.rotateX(-Math.PI / 5);
      this.Enter.scale.set(0.6, 0.6, 0.6);
      this.Enter.children[0].material.needsUpdate = true;
      this.Enter.name = 'Enter';

      this.startTitle = [];
      this.startTitle.push(this.words, this.Enter);

      this.scene.add(this.words, this.Enter);
      this.loadingBar.visible = false;
      this.menue();
      this.setupXR();
    };
    const self = this;
    loader1.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      createTypo1,
      function (xhr) {
        self.loadingBar.progress = xhr.loaded / xhr.total;
      }
    );

    //final words
    const loader2 = new THREE.FontLoader();
    const createTypo2 = (font) => {
      const word = 'congratulations';
      const typoProperties2 = {
        font: font,
        size: 120,
        height: 120 / 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 6,
        bevelOffset: 1,
        bevelSegments: 8,
      };
      const text = new THREE.TextGeometry(word, typoProperties2);
      const material = new THREE.MeshNormalMaterial();
      this.textMesh.geometry = text;
      this.textMesh.material = material;
      this.textMesh.position.x = 3 * -2;
      this.textMesh.position.z = 2 * -1;
      this.textMesh.scale.set(0.01, 0.01, 0.01);
    };
    loader2.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      createTypo2
    );

    // levels
    this.ShadowXY1 = new Levels().level1XY();
    this.ShadowZY1 = new Levels().level1ZY();
    this.ShadowXY2 = new Levels().level2XY();
    this.ShadowZY2 = new Levels().level2ZY();
    this.ShadowXY3 = new Levels().level3XY();
    this.ShadowZY3 = new Levels().level3ZY();
    this.ShadowXY4 = new Levels().level4XY();
    this.ShadowZY4 = new Levels().level4ZY();
    this.ShadowXY5 = new Levels().level5XY();
    this.ShadowZY5 = new Levels().level5ZY();
    this.ShadowXY6 = new Levels().level6XY();
    this.ShadowZY6 = new Levels().level6ZY();
    this.ShadowXY7 = new Levels().level7XY();
    this.ShadowZY7 = new Levels().level7ZY();
    this.ShadowXY8 = new Levels().level8XY();
    this.ShadowZY8 = new Levels().level8ZY();
    this.ShadowXY9 = new Levels().level9XY();
    this.ShadowZY9 = new Levels().level9ZY();
    this.ShadowXY10 = new Levels().level10XY();
    this.ShadowZY10 = new Levels().level10ZY();

    this.levelShdaowsXY.push(
      this.ShadowXY1,
      this.ShadowXY2,
      this.ShadowXY3,
      this.ShadowXY4,
      this.ShadowXY5,
      this.ShadowXY6,
      this.ShadowXY7,
      this.ShadowXY8,
      this.ShadowXY9,
      this.ShadowXY10
    );
    this.levelShdaowsZY.push(
      this.ShadowZY1,
      this.ShadowZY2,
      this.ShadowZY3,
      this.ShadowZY4,
      this.ShadowZY5,
      this.ShadowZY6,
      this.ShadowZY7,
      this.ShadowZY8,
      this.ShadowZY9,
      this.ShadowZY10
    );
  }

  menue() {
    this.radius = 0.08;

    //init ground
    const groundGeo = new THREE.CylinderBufferGeometry(7, 7, 0.4, 100);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0xf1ccb8,
      opacity: 0.5,
      transparent: true,
    });
    const outBoundGeo = new THREE.TorusGeometry(7.2, 0.2, 16, 100);
    const outMat = new THREE.MeshStandardMaterial({ color: 0x80ffff });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.receiveShadow = true;
    this.outBound = new THREE.Mesh(outBoundGeo, outMat);
    this.outBound.rotateX(Math.PI / 2);
    this.Ground = new THREE.Group();
    this.Ground.add(this.ground, this.outBound);

    this.Ground.position.y = -1.5;
    this.scene.add(this.Ground);

    //init floating
    function random(min, max) {
      return Math.random() * (max - min) + min;
    }
    for (let i = 0; i < this.gameDefaultCubes.length; i++) {
      const rotate = 2 * Math.PI;
      this.gameDefaultCubes[i].position.x = random(-6, 6);
      this.gameDefaultCubes[i].position.y = random(2, 10);
      this.gameDefaultCubes[i].position.z = random(-6, 6);
      this.gameDefaultCubes[i].rotation.x = Math.random() * rotate;
      this.gameDefaultCubes[i].rotation.y = Math.random() * rotate;
      this.gameDefaultCubes[i].rotation.z = Math.random() * rotate;
      let s = Math.abs(random(0.3, 0.9));
      this.gameDefaultCubes[i].scale.set(s, s, s);

      this.finalGroup.add(this.gameDefaultCubes[i]);
    }
    this.scene.add(this.finalGroup);

    //init ui introduction
    function CreatUIWeb() {
      const configWeb = {
        panelSize: { width: 7, height: 5 },
        height: 512,
        width: 717,
        opacity: 0.9,
        body: {
          type: 'text',
          fontFamily: 'Arial',
          fontSize: 40,
          padding: 40,
          backgroundColor: '#c17e61',
          fontColor: '#fff',
          borderRadius: 20,
        },
      };
      const uiWeb = new CanvasUI(
        {
          body:
            'Hey, welcome to ZLT! Let’s see how good are you at building blocks :) Controls: 1.click block in each axis to activate element. 2.move mouse and click to place block on the floor. 3.left and right arrow to rotate element. 4.hold shift and click a placed block to remove.',
        },
        configWeb
      );
      uiWeb.mesh.position.set(-3, 2, 0);
      uiWeb.mesh.rotateY(Math.PI / 2);
      return uiWeb.mesh;
    }
    this.Intro = CreatUIWeb();
    this.scene.add(this.Intro);

    function CreatUIVR() {
      const configVR = {
        panelSize: { width: 0.35, height: 0.5 },
        height: 512,
        width: 360,
        opacity: 0.7,
        body: {
          type: 'text',
          fontFamily: 'Arial',
          fontSize: 26,
          padding: 26,
          backgroundColor: '#c17e61',
          fontColor: '#fff',
          borderRadius: 10,
        },
      };
      const uiVR = new CanvasUI(
        {
          body:
            'Hey, welcome to ZLT! Let’s see how good are you at building blocks :) Controls: 1.left thumb stick to move around, you can even go higher. 2.trigger to select and place blocks. 3.hold squeeze and select blocks to delete when there’s no element on the floor. 4.right thumb stick to rotate selected element.',
        },
        configVR
      );
      uiVR.mesh.position.set(0.06, 0.09, 0);
      uiVR.mesh.rotateY(Math.PI / 20);
      return uiVR.mesh;
    }
    this.IntroSmall = CreatUIVR();
    this.IntroSmall.lookAt(this.camera.position);

    this.boundary = [];
    this.boundary.push(this.Ground);
  }

  removeMenu() {
    setTimeout(() => {
      this.scene.remove(this.words, this.finalGroup);
    }, 800);
    setTimeout(() => {
      this.scene.remove(this.Intro, this.Enter);
      if (app.renderer.xr.isPresenting)
        this.controllers.left.controller.remove(this.IntroSmall);
    }, 900);

    const OP = this.Enter.children[0].material.opacity;
    const tweenDisappear = new TWEEN.Tween(OP)
      .to({ opacity: 0 }, 900)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();

    const defultP1 = this.words.children[0].position;
    const defultP2 = this.words.children[1].position;
    const defultP3 = this.words.children[2].position;
    const tween1 = new TWEEN.Tween(defultP1)
      .to({ x: '+' + 5, y: '-' + 1, z: '-' + 1 }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();
    const tween2 = new TWEEN.Tween(defultP2)
      .to({ x: '-' + 2, y: '+' + 5, z: '-' + 1 }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();
    const tween3 = new TWEEN.Tween(defultP3)
      .to({ x: '-' + 4, y: '-' + 2, z: '+' + 7 }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();

    const camperaP = this.camera.position;
    const tweenCamera = new TWEEN.Tween(camperaP)
      .to({ x: '+' + 1, y: '+' + 1, z: '+' + 1 }, 900)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();
  }

  initScene() {
    this.removeMenu();
    this.backMusicLoader();
    this.Ground.children[0].material.opacity = 0.9;
    setTimeout(() => {
      this.scene.add(this.planeXYG);
      this.scene.add(this.planeZYG);
      this.scene.add(this.planeXZG);
      this.coorGroup2.position.set(-3.5, -0.1, -3.5);
      this.planeXZG.attach(this.coorGroup2);
    }, 950);

    this.boundary.push(this.planeXZG);
  }

  initBlocks(controller) {
    const blockElements = this.raycaster.intersectObjects(this.BLOCKS, true);
    if (blockElements.length > 0) {
      let selectBlock = blockElements[0];
      if (this.renderer.xr.isPresenting) {
        controller.children[0].scale.z = selectBlock.distance;
      }

      //** Init LBLOCK
      if (selectBlock.object.parent == this.BLOCKS[0].children[0]) {
        if (!this.LSelected) {
          this.LSelected = !this.LSelected;
          // reset all
          this.resetT();
          this.resetZ();
          //new stuff
          this.animateLforward();
          this.LBlockS = new LBlock().addSkeletonToSpace();
          this.LcurrentRotation = new THREE.Quaternion();
          this.LBlockS.getWorldQuaternion(this.LcurrentRotation);
          this.removedXYPieceL = [];
          this.LShadowXY = new LBlock().addShadowXY();
          this.LShadowXY.position.set(0, 3, -4);
          this.removedZYPieceL = [];
          this.LShadowZY = new LBlock().addShadowZY();
          this.removedZYPieceL.push(this.LShadowZY.children[0].children[1]);
          this.LShadowZY.children[0].remove(
            this.LShadowZY.children[0].children[1]
          );
          this.LShadowZY.position.set(-4, 3, 0);

          setTimeout(() => {
            this.scene.add(this.LBlockS);
            this.planeXY.attach(this.LShadowXY);
            this.planeZY.attach(this.LShadowZY);
          }, 500);
        } else {
          //reset
          this.resetL();
        }
        //** Init TBLOCK
      } else if (selectBlock.object.parent == this.BLOCKS[1].children[0]) {
        if (!this.TSelected) {
          this.TSelected = !this.TSelected;
          //reset all
          this.resetL();
          this.resetZ();
          // new stuff
          this.animateTforward();
          this.TBlockS = new TBlock().addSkeletonToSpace();
          this.TcurrentRotation = new THREE.Quaternion();
          this.TcurrentRotation1 = new THREE.Quaternion();
          this.TBlockS.getWorldQuaternion(this.TcurrentRotation);

          this.TShadowXY = new TBlock().addShadowXY();
          this.TShadowXY.position.set(0, 0, -4);

          this.TShadowZY = new TBlock().addShadowZY();
          this.removedZYPieceT = [];
          this.TShadowZY.position.set(-4, 3, 0);

          setTimeout(() => {
            this.scene.add(this.TBlockS);
            this.planeXY.attach(this.TShadowXY);
            this.planeZY.attach(this.TShadowZY);
          }, 500);
        } else {
          //reset
          this.resetT();
        }
        //** Init ZBLOCK
      } else if (selectBlock.object.parent == this.BLOCKS[2].children[0]) {
        if (!this.ZSelected) {
          this.ZSelected = !this.ZSelected;
          //reset all
          this.resetL();
          this.resetT();
          //new staff
          this.animateZforward();
          this.ZBlockS = new ZBlock().addSkeletonToSpace();
          this.ZcurrentRotation = new THREE.Quaternion();
          this.ZBlockS.getWorldQuaternion(this.ZcurrentRotation);

          this.ZShadowXY = new ZBlock().addShadowXY();
          this.ZShadowXY.position.set(0, 0, -4);
          this.removedXYPieceZ = [];

          this.ZShadowZY = new ZBlock().addShadowZY();
          this.ZShadowZY.position.set(-4, 0, 0);
          this.ZcurrentRotation1 = new THREE.Quaternion();

          setTimeout(() => {
            this.scene.add(this.ZBlockS);
            this.planeXY.attach(this.ZShadowXY);
            this.planeZY.attach(this.ZShadowZY);
          }, 500);
        } else {
          //reset
          this.resetZ();
        }
      } else {
        return;
      }
    }
  }

  levelMove() {
    if (this.XYmatched && this.ZYmatched) {
      this.levelPassed = true;
      this.level++;
    }
    //Init level one
    if (this.level === 0) {
      this.planeXYG.add(this.levelShdaowsXY[0]);
      this.planeZYG.add(this.levelShdaowsZY[0]);
    } else if (this.level !== this.levelShdaowsXY.length - 1) {
      if (this.levelPassed) {
        this.levelUPSound();
        //reset coordinate
        this.resetL();
        this.resetT();
        this.resetZ();

        //reset match logics
        this.XYmatched = false;
        this.ZYmatched = false;
        this.levelPassed = false;

        // clean received points
        this.receivedShadowsXY = [];
        this.receivedShadowsZY = [];

        //clean objects on the plane and array
        this.allObjects = [];
        this.allObjects.push(this.planeXZ);

        for (let i = this.planeXZG.children.length - 1; i > 2; i--) {
          this.planeXZG.remove(this.planeXZG.children[i]);
        }

        //clean current shadows
        this.planeXYG.remove(this.levelShdaowsXY[this.level - 1]);
        this.planeZYG.remove(this.levelShdaowsZY[this.level - 1]);

        //add new level
        const currentO = { opacity: 0.5 };
        this.levelShdaowsXY[this.level].children[0].material.color.setHex(
          0x00ffff
        );
        this.levelShdaowsZY[this.level].children[0].material.color.setHex(
          0x00ffff
        );
        const currentC = this.levelShdaowsXY[this.level].children[0].material
          .color;

        this.planeXYG.add(this.levelShdaowsXY[this.level]);
        //console.log(this.levelShdaowsXY[this.level]);
        this.planeZYG.add(this.levelShdaowsZY[this.level]);

        const tweenAppear = new TWEEN.Tween(currentO)
          .to({ opacity: 0.3 }, 4000)
          .easing(TWEEN.Easing.Elastic.InOut)
          .start();

        const tweenColor = new TWEEN.Tween(currentC)
          .to({ r: '+' + 0, g: '-' + 255, b: '-' + 255 }, 4000)
          .easing(TWEEN.Easing.Elastic.InOut)
          .start();

        //if (this.planeXZG.children.length == 3 ) {
        tweenAppear.onComplete(() => {
          this.levelShdaowsXY[this.level].children[0].material.opacity =
            currentO.opacity;
          this.levelShdaowsZY[this.level].children[0].material.opacity =
            currentO.opacity;
        });
        tweenColor.onUpdate(() => {
          this.levelShdaowsXY[this.level].children[0].material.color = currentC;
          this.levelShdaowsZY[this.level].children[0].material.color = currentC;
        });
        //}
      }
    } else if (this.level === this.levelShdaowsXY.length - 1) {
      //reset coordinate
      this.resetL();
      this.resetT();
      this.resetZ();

      //reset match logics
      this.XYmatched = false;
      this.ZYmatched = false;
      this.levelPassed = false;

      // clean received points
      this.receivedShadowsXY = [];
      this.receivedShadowsZY = [];

      //clean objects on the plane and array
      this.allObjects = [];
      this.allObjects.push(this.planeXZ);

      setTimeout(() => {
        for (let i = 3; i < this.planeXZG.children.length; i++) {
          this.planeXZG.remove(this.planeXZG.children[i]);
        }
        this.scene.remove(this.planeXYG, this.planeXZG, this.planeZYG);
      }, 500);

      this.gameOver();
    }
  }

  gameOver() {
    this.Ground.children[0].material.opacity = 0;
    this.scene.add(this.textMesh);
    const camperaP2 = this.camera.position;
    const tweenCamera = new TWEEN.Tween(camperaP2)
      .to({ x: '-' + 15, y: '+' + 2, z: '+' + 5 }, 900)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onComplete()
      .start();

    for (let i = 0; i < this.gameOverCubes.length; i++) {
      const dist = 20;
      const distDouble = dist * 2;
      const rotate = 2 * Math.PI;
      this.gameOverCubes[i].position.x = Math.random() * distDouble - dist + 5;
      this.gameOverCubes[i].position.y = Math.random() * distDouble - dist + 5;
      this.gameOverCubes[i].position.z = Math.random() * distDouble - dist + 3;
      this.gameOverCubes[i].rotation.x = Math.random() * rotate;
      this.gameOverCubes[i].rotation.y = Math.random() * rotate;
      this.gameOverCubes[i].rotation.z = Math.random() * rotate;
      //this.gameOverCubes[i].matrixAutoUpdate = false;

      this.finalGroup.add(this.gameOverCubes[i]);
    }

    setTimeout(() => {
      this.scene.add(this.finalGroup);
      this.scene.add(this.textMesh);
    }, 600);
  }

  StartMove(controller) {
    const intersect = this.raycaster.intersectObjects(this.startTitle, true);

    if (intersect.length > 0 && intersect[0].object.parent.name == 'Enter') {
      if (app.renderer.xr.isPresenting) {
        controller.children[0].scale.z = intersect[0].distance;
      }
      this.Enter.children[0].material.color.setHex(0x33ccff);
    } else {
      if (this.Enter.children[0] !== undefined)
        this.Enter.children[0].material.color.setHex(0xf55066);
    }
  }

  StartClick(controller) {
    const intersect = this.raycaster.intersectObjects(this.startTitle, true);
    if (intersect.length > 0 && intersect[0].object.parent.name == 'Enter') {
      if (app.renderer.xr.isPresenting) {
        controller.children[0].scale.z = intersect[0].distance;
      }
      this.menuShow = false;
      this.initScene();
    }
  }

  //using XR API in VRButton and call controllers
  setupXR() {
    this.renderer.xr.enabled = true;
    const button = new VRButton(this.renderer);

    const self = this;

    function onConnected(event) {
      const info = {};

      fetchProfile(event.data, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE).then(
        ({ profile, assetPath }) => {
          info.name = profile.profileId;
          info.targetRayMode = event.data.targetRayMode;

          Object.entries(profile.layouts).forEach(([key, layout]) => {
            const components = {};
            Object.values(layout.components).forEach((component) => {
              components[component.rootNodeName] = component.gamepadIndices;
            });
            info[key] = components;
          });
          self.getRight(info.right);
          self.getLeft(info.left);
          self.updateControllers(info);
        }
      );
    }

    const controller = this.renderer.xr.getController(1);

    controller.addEventListener('connected', onConnected);

    const modelFactory = new XRControllerModelFactory();

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    const line = new THREE.Line(geometry);
    line.scale.z = 0;

    this.controllers = {};
    this.controllers.right = this.buildController(0, line, modelFactory);
    this.controllers.left = this.buildController(1, line, modelFactory);
    this.controllers.left.controller.add(this.IntroSmall);

    this.dolly.position.set(0, 0, 0);
    this.dolly.name = 'player';
    this.dolly.add(this.camera);

    this.scene.add(this.dolly);
    this.emptyCam = new THREE.Object3D();
    this.camera.add(this.emptyCam);
  }
  getRight(components) {
    this.rightGamepad = components;
  }
  getLeft(components) {
    this.leftGamepad = components;
  }
  //build controllers
  buildController(index, line, modelFactory) {
    const controller = this.renderer.xr.getController(index);

    controller.userData.selectPressed = false;
    controller.userData.index = index;
    if (line) controller.add(line.clone());
    this.dolly.add(controller);

    let grip;

    if (modelFactory) {
      grip = this.renderer.xr.getControllerGrip(index);
      grip.add(modelFactory.createControllerModel(grip));
      this.dolly.add(grip);
    }

    return { controller, grip };
  }
  //receive and update controller events
  updateControllers(info) {
    const self = this;

    function onSelectStart() {
      this.userData.selectPressed = true;
    }

    function onSelectEnd() {
      this.children[0].scale.z = 0;
      this.userData.selectPressed = false;
    }

    function onSqueezeStart() {
      this.userData.squeezePressed = true;
    }

    function onSqueezeEnd() {
      this.userData.squeezePressed = false;
    }
    function onDisconnected() {
      const index = this.userData.index;
      //console.log(`Disconnected controller ${index}`);
      if (self.controllers) {
        const obj = index == 0 ? self.controllers.right : self.controllers.left;

        if (obj) {
          if (obj.controller) {
            const controller = obj.controller;
            while (controller.children.length > 0)
              controller.remove(controller.children[0]);
            self.scene.remove(controller);
          }
          if (obj.grip) self.scene.remove(obj.grip);
        }
      }
    }

    if (info.right !== undefined) {
      const right = this.renderer.xr.getController(0);

      let trigger = false,
        squeeze = false;

      Object.keys(info.right).forEach((key) => {
        if (key.indexOf('trigger') != -1) trigger = true;
        if (key.indexOf('squeeze') != -1) squeeze = true;
      });

      if (trigger) {
        right.addEventListener('selectstart', onSelectStart);
        right.addEventListener('selectend', onSelectEnd);
      }

      if (squeeze) {
        right.addEventListener('squeezestart', onSqueezeStart);
        right.addEventListener('squeezeend', onSqueezeEnd);
      }

      right.addEventListener('disconnected', onDisconnected);
    }

    if (info.left !== undefined) {
      const left = this.renderer.xr.getController(1);

      let trigger = false,
        squeeze = false;

      Object.keys(info.left).forEach((key) => {
        if (key.indexOf('trigger') != -1) trigger = true;
        if (key.indexOf('squeeze') != -1) squeeze = true;
      });

      if (trigger) {
        left.addEventListener('selectstart', onSelectStart);
        left.addEventListener('selectend', onSelectEnd);
      }

      if (squeeze) {
        left.addEventListener('squeezestart', onSqueezeStart);
        left.addEventListener('squeezeend', onSqueezeEnd);
      }

      left.addEventListener('disconnected', onDisconnected);
    }
  }
  movePlayer(dt) {
    const session = this.renderer.xr.getSession();
    //lefthand
    const inputSource = session.inputSources[1];

    if (inputSource && inputSource.gamepad && this.leftGamepad) {
      const gamepad = inputSource.gamepad;
      const xAxisIndex = this.leftGamepad.xr_standard_thumbstick.xAxis;
      const yAxisIndex = this.leftGamepad.xr_standard_thumbstick.yAxis;
      let rotateX = gamepad.axes[xAxisIndex].toFixed(1);
      let rotateY = gamepad.axes[yAxisIndex].toFixed(1);
      const limit = 0.5;
      const limitR = 0.1;
      const speed = 2;
      let pos = this.dolly.position.clone();
      pos.y += 1.5;

      const quaternion = this.dolly.quaternion.clone();
      this.emptyCam.getWorldQuaternion(this.rotation);
      this.dolly.quaternion.copy(this.rotation);
      this.dolly.getWorldDirection(this.cameraVector);
      this.cameraVector.negate();

      this.raycasterHead.set(pos, this.cameraVector);
      let blocked = false;

      let intersect = this.raycasterHead.intersectObjects(this.boundary, true);

      if (intersect.length > 0) {
        if (intersect[0].distance < limit) blocked = true;
      }
      if (!blocked) {
        if (rotateY > limitR || rotateY < -limitR)
          this.dolly.translateZ(dt * speed * rotateY);
        if (rotateX > limitR || rotateX < -limitR)
          this.dolly.translateX(dt * speed * rotateX);

        pos = this.dolly.getWorldPosition(this.origin);
      }

      //cast left
      this.cameraVector.set(-1, 0, 0);
      this.cameraVector.applyMatrix4(this.dolly.matrix);
      this.cameraVector.normalize();
      this.raycasterHead.set(pos, this.cameraVector);

      intersect = this.raycasterHead.intersectObjects(this.boundary, true);
      if (intersect.length > 0) {
        if (intersect[0].distance < limit)
          this.dolly.translateX(limit - intersect[0].distance);
      }

      //cast right
      this.cameraVector.set(1, 0, 0);
      this.cameraVector.applyMatrix4(this.dolly.matrix);
      this.cameraVector.normalize();
      this.raycasterHead.set(pos, this.cameraVector);

      intersect = this.raycasterHead.intersectObjects(this.boundary, true);
      if (intersect.length > 0) {
        if (intersect[0].distance < limit)
          this.dolly.translateX(intersect[0].distance - limit);
      }
      //cast down
      this.cameraVector.set(0, -1, 0);
      this.cameraVector.applyMatrix4(this.dolly.matrix);
      this.cameraVector.normalize();
      this.raycasterHead.set(pos, this.cameraVector);

      intersect = this.raycasterHead.intersectObjects(this.boundary, true);
      if (intersect.length > 0) {
        if (intersect[0].distance < limit)
          this.dolly.translateY(limit - intersect[0].distance);
      }

      this.dolly.quaternion.copy(quaternion);
    }
  }
  selectController(controller) {
    if (controller.userData.selectPressed) {
      controller.children[0].scale.z = 10;

      this.workingMatrix.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction
        .set(0, 0, -1)
        .applyMatrix4(this.workingMatrix);

      TWEEN.removeAll();

      if (this.menuShow) {
        this.StartClick(controller);
      } else {
        this.initBlocks(controller);

        this._onMouseDowns.forEach((fn) => {
          fn(controller);
        });
        this.levelMove();
      }
      controller.userData.selectPressed = false;
    }
  }
  moveController(controller) {
    controller.children[0].scale.z = 5;
    this.workingMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMatrix);

    if (!this.menuShow) {
      this._onMouseMoves.forEach((fn) => {
        fn(controller);
      });
    } else {
      this.StartMove(controller);
    }
  }
  rotateRightController() {
    const session = this.renderer.xr.getSession();
    //righthand
    const inputSource = session.inputSources[0];

    if (inputSource && inputSource.gamepad && this.rightGamepad) {
      const gamepad = inputSource.gamepad;
      const xAxisIndex = this.rightGamepad.xr_standard_thumbstick.xAxis;
      let rotate = gamepad.axes[xAxisIndex].toFixed(2);

      if (rotate === 0) return;
      if (rotate < 0) {
        this._leftTurn.forEach((fn) => {
          fn();
        });
      } else if (rotate > 0) {
        this._rightTurn.forEach((fn) => {
          fn();
        });
      }
    }
  }

  render() {
    this.stats.update();
    TWEEN.update();
    const dt = this.clock.getDelta();

    if (this.menuShow) {
      this.scene.add(this.finalGroup);
      const t = Date.now() * 0.001;
      const rx = Math.sin(t * 0.8) * 0.2;
      const ry = Math.cos(t * 0.3) * 0.9;
      const rz = Math.sin(t * 0.1) * 0.5;
      this.finalGroup.rotation.x = rx;
      this.finalGroup.rotation.y = ry;
      this.finalGroup.rotation.z = rz;
    }

    if (this.renderer.xr.isPresenting) {
      this.IntroSmall.visible = true;
      this.Intro.visible = false;

      const self = this;
      if (this.controllers) {
        Object.values(this.controllers).forEach((value) => {
          self.moveController(value.controller);
          self.selectController(value.controller);
        });
      }
      if (this.elapsedTime === undefined) this.elapsedTime = 0;
      this.elapsedTime += dt;
      if (this.elapsedTime > 0.2) {
        this.rotateRightController();
        this.elapsedTime = 0;
      }
      this.movePlayer(dt);
    }

    if (this.level === this.levelShdaowsXY.length - 1) {
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.005;
      this.camera.position.y +=
        (this.mouseY * -1 - this.camera.position.y) * 0.005;
      this.camera.lookAt(this.scene.position);
      const t = Date.now() * 0.001;
      const rx = Math.sin(t * 0.7) * 0.5;
      const ry = Math.cos(t * 0.3) * 0.5;
      const rz = Math.sin(t * 0.2) * 0.5;
      this.finalGroup.rotation.x = rx;
      this.finalGroup.rotation.y = ry;
      this.finalGroup.rotation.z = rz;
      this.textMesh.rotation.x = rx;
      this.textMesh.rotation.y = ry;
      this.textMesh.rotation.z = rx;
    }
    this.renderer.render(this.scene, this.camera);
  }

  _addEventListeners() {
    document.addEventListener(
      'mousemove',
      (event) => {
        event.preventDefault();
        if (!app.renderer.xr.isPresenting) {
          if (this.level !== 9) {
            this.mouse.set(
              (event.clientX / window.innerWidth) * 2 - 1,
              -(event.clientY / window.innerHeight) * 2 + 1
            );
            this.raycaster.setFromCamera(this.mouse, this.camera);
            if (this.menuShow) {
              this.StartMove();
            } else {
              this._onMouseMoves.forEach((fn) => {
                fn();
              });
            }
          } else {
            this.onMouseMoveF(event);
          }
        }
      },
      false
    );

    document.addEventListener(
      'mousedown',
      (event) => {
        event.preventDefault();
        if (!app.renderer.xr.isPresenting) {
          this.mouse.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
          );
          this.raycaster.setFromCamera(this.mouse, this.camera);
          TWEEN.removeAll();
          if (this.menuShow) {
            this.StartClick();
          } else {
            this.initBlocks();
            this._onMouseDowns.forEach((fn) => {
              fn();
            });
            this.levelMove();
          }
        }
      },
      false
    );

    document.addEventListener(
      'keydown',
      (event) => {
        event.preventDefault();
        this._onKeyDowns.forEach((fn) => {
          fn(event);
        });
      },
      false
    );
    document.addEventListener(
      'keyup',
      (event) => {
        event.preventDefault();
        this._onKeyUp.forEach((fn) => {
          fn(event);
        });
      },
      false
    );
  }

  coordinate(coordX, coordY) {
    this.mouseX = (coordX - this.windowHalfX) * 0.5;
    this.mouseY = (coordY - this.windowHalfY) * 0.5;
  }
  onMouseMoveF(event) {
    this.coordinate(event.clientX, event.clientY);
  }

  animateLforward() {
    this.coorGroup2.children[0].material.color.setHex(0x00a9fe);
    setTimeout(() => {
      this.coorGroup2.children[1].visible = true;
    }, 500);

    const defultRL = this.LBLOCK.rotation;
    const tweenRL1 = new TWEEN.Tween(defultRL)
      .to({ y: '+' + Math.PI }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();
    const tweenSL1 = new TWEEN.Tween(this.LBLOCK.scale)
      .to({ x: '+' + 0.1, y: '+' + 0.1, z: '+' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();

    const currentEmis = this.LBLOCK.children[0].children[0].material.emissive;

    const tweenColorL1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 0, g: '+' + 156, b: '+' + 224 }, 20000)
      .onComplete()
      .start();

    this.LMoved = true;
  }
  animateLbackward() {
    this.coorGroup2.children[0].material.color.setHex(0xffffff);
    setTimeout(() => {
      this.coorGroup2.children[1].visible = false;
    }, 500);

    const defultRL = this.LBLOCK.rotation;
    const tweenL2 = new TWEEN.Tween(this.LBLOCK.rotation)
      .to({ y: '-' + Math.PI }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const tweenSL2 = new TWEEN.Tween(this.LBLOCK.scale)
      .to({ x: '-' + 0.1, y: '-' + 0.1, z: '-' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const currentEmis = this.LBLOCK.children[0].children[0].material;
    //console.log(this.LBLOCK.children[0].children[0].material);
    const defaultEmis = currentEmis.emissive.set(0x000000);
    this.LMoved = false;
  }
  animateTforward() {
    this.coorGroup2.children[0].material.color.setHex(0xfc6e22);
    setTimeout(() => {
      this.coorGroup2.children[2].visible = true;
    }, 500);

    const defultRT = this.TBLOCK.rotation;
    const tweenRT1 = new TWEEN.Tween(defultRT)
      .to({ z: '+' + Math.PI }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();
    const tweenST1 = new TWEEN.Tween(this.TBLOCK.scale)
      .to({ x: '+' + 0.1, y: '+' + 0.1, z: '+' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.TBLOCK.children[0].children[0].material.emissive;

    const tweenColorT1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 252, g: '+' + 0, b: '+' + 0 }, 20000)
      .onUpdate()
      .start();

    this.TMoved = true;
  }
  animateTbackward() {
    this.coorGroup2.children[0].material.color.setHex(0xffffff);
    setTimeout(() => {
      this.coorGroup2.children[2].visible = false;
    }, 500);

    const defultRT = this.TBLOCK.rotation;
    const tweenRT2 = new TWEEN.Tween(defultRT)
      .to({ z: '-' + Math.PI }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const tweenST2 = new TWEEN.Tween(this.TBLOCK.scale)
      .to({ x: '-' + 0.1, y: '-' + 0.1, z: '-' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    this.TBLOCK.children[0].children[0].material.emissive.setHex(0x000000);
    this.TMoved = false;
  }
  animateZforward() {
    this.coorGroup2.children[0].material.color.setHex(0xb537f2);
    setTimeout(() => {
      this.coorGroup2.children[3].visible = true;
    }, 500);

    const defultRZ = this.ZBLOCK.rotation;
    const tweenRZ1 = new TWEEN.Tween(defultRZ)
      .to({ y: '-' + Math.PI }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();
    const tweenST1 = new TWEEN.Tween(this.ZBLOCK.scale)
      .to({ x: '+' + 0.1, y: '+' + 0.1, z: '+' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.ZBLOCK.children[0].children[0].material.emissive;

    const tweenColorZ1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 181, g: '+' + 0, b: '+' + 242 }, 20000)
      .onUpdate()
      .start();
    // this.ZBLOCK.children[0].children[0].material.emissive.setHex(0xb537f2);
    this.ZMoved = true;
  }
  animateZbackward() {
    this.coorGroup2.children[0].material.color.setHex(0xffffff);
    setTimeout(() => {
      this.coorGroup2.children[3].visible = false;
    }, 500);

    const defultRZ = this.ZBLOCK.rotation;
    const tweenRZ2 = new TWEEN.Tween(defultRZ)
      .to({ y: '+' + Math.PI }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const tweenSZ2 = new TWEEN.Tween(this.ZBLOCK.scale)
      .to({ x: '-' + 0.1, y: '-' + 0.1, z: '-' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.ZBLOCK.children[0].children[0].material.emissive;
    const defaultEmis = currentEmis.setHex(0x000000);
    this.ZMoved = false;
  }

  resetL() {
    this.LSelected = false;
    this.scene.remove(this.LBlockS);
    this.planeXY.remove(this.LShadowXY);
    this.planeZY.remove(this.LShadowZY);
    if (this.LMoved === true) {
      this.animateLbackward();
    }
  }
  resetT() {
    this.TSelected = false;
    this.scene.remove(this.TBlockS);
    this.planeXY.remove(this.TShadowXY);
    this.planeZY.remove(this.TShadowZY);
    if (this.TMoved === true) {
      this.animateTbackward();
    }
  }
  resetZ() {
    this.ZSelected = false;
    this.scene.remove(this.ZBlockS);
    this.planeXY.remove(this.ZShadowXY);
    this.planeZY.remove(this.ZShadowZY);
    if (this.ZMoved === true) {
      this.animateZbackward();
    }
  }

  onMouseMove(fn) {
    this._onMouseMoves.push(fn);
  }
  onMouseDown(fn) {
    this._onMouseDowns.push(fn);
  }
  onKeyDown(fn) {
    this._onKeyDowns.push(fn);
  }
  onKeyUp(fn) {
    this._onKeyUp.push(fn);
  }
  leftTurn(fn) {
    this._leftTurn.push(fn);
  }
  rightTurn(fn) {
    this._rightTurn.push(fn);
  }
}

export { App };
