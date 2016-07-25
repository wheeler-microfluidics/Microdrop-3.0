'use strict';

import {
  ResizeMessage
} from 'phosphor-widget';

import {
  PerspectiveCameraParameters, ThreeRendererWidget
} from './widgets';

import * as THREE from 'three';


export class ThreePlaneTransformWidget extends ThreeRendererWidget {
  constructor(rendererSettings: THREE.WebGLRendererParameters = {},
              cameraSettings: PerspectiveCameraParameters = {}) {
    super(rendererSettings, cameraSettings);

    this.displayHandles = true;
    this.prevDisplayHandles = true;
    this.updatePos = true;

    // Cannot cast result of `createElement` (which is `HTMLElement`)
    // directly to `SVGSVGElement`.  See [here][1].
    //
    // [1]: http://stackoverflow.com/questions/13669404/typescript-problems-with-type-system
    this._anchorsSvg = <SVGSVGElement><any>document.createElement('svg');
    $(this._anchorsSvg).css({position: "absolute"});

    // Create orbit controls to zoom, pan, etc.  Start at center of SVG
    // drawing.
    this._orbit = new THREE.OrbitControls(this.camera,
                                          this.renderer.domElement);
    this._orbit.reset();

    this.createShape();
  }

  protected createShape() {
    /*
     * TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
     * TODO Draw a demo shape.
     * TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
     */
    this.geometry = new THREE.BoxGeometry(200, 200, 200);

    for (var i = 0; i < this.geometry.faces.length; i += 2) {
      var hex = Math.random() * 0xffffff;
      this.geometry.faces[i].color.setHex(hex);
      this.geometry.faces[i + 1].color.setHex(hex);
    }

    this.material = new THREE.MeshBasicMaterial({vertexColors:
                                                 THREE.FaceColors,
                                                 overdraw: 0.5});

    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.y = 150;
    this.scene.add(this.cube);
    this.camera.position.y = 150;
    this.camera.position.z = 500;
  }

  public cube: THREE.Mesh;
  public geometry: THREE.BoxGeometry;
  public material: THREE.MeshBasicMaterial;

  private _anchorsSvg: SVGSVGElement;
  private _orbit: THREE.OrbitControls;

  public displayHandles: Boolean;
  public prevDisplayHandles: Boolean;
  public updatePos: Boolean;

  get anchorsSvg(): SVGSVGElement { return this._anchorsSvg; }
  get orbit(): THREE.OrbitControls { return this._orbit; }

  protected onResize(msg: ResizeMessage): void {
    super.onResize(msg);
    if (msg.width >= 0 || msg.height >= 0) {
      $(this.anchorsSvg).height(msg.height);
      $(this.anchorsSvg).width(msg.width);
    }
  }
}
