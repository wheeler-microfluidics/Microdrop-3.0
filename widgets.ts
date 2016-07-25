'use strict';

import {
  Message
} from 'phosphor-messaging';

import {
  ResizeMessage, Widget
} from 'phosphor-widget';

import * as THREE from 'three';


export interface PerspectiveCameraParameters {
    /**
     * @param fov Camera frustum vertical field of view. Default value is 50.
     * @param aspect Camera frustum aspect ratio. Default value is 1.
     * @param near Camera frustum near plane. Default value is 0.1.
     * @param far Camera frustum far plane. Default value is 2000.
     */
    fov?: number,
    aspect?: number,
    near?: number,
    far?: number
}


/**
 * A widget which hosts a CodeMirror editor.
 */
export class CodeMirrorWidget extends Widget {
  constructor(config?: CodeMirror.EditorConfiguration) {
    super();
    this.addClass('CodeMirrorWidget');
    this._editor = CodeMirror(this.node, config);
  }

  get editor(): CodeMirror.Editor {
    return this._editor;
  }

  loadTarget(target: string): void {
    var doc = this._editor.getDoc();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', target);
    xhr.onreadystatechange = () => doc.setValue(xhr.responseText);
    xhr.send();
  }

  protected onAfterAttach(msg: Message): void {
    this._editor.refresh();
  }

  protected onResize(msg: ResizeMessage): void {
    if (msg.width < 0 || msg.height < 0) {
      this._editor.refresh();
    } else {
      this._editor.setSize(msg.width, msg.height);
    }
  }

  private _editor: CodeMirror.Editor;
}


/**
 * A widget which hosts a dat.GUI.
 */
export class DatGuiWidget extends Widget {
  constructor(config?: dat.GUIParams) {
    super();
    this.addClass('DatGuiWidget');
    this._gui = new dat.GUI(config);
    this.node.appendChild(this._gui.domElement);
  }

  get gui(): dat.GUI {
    return this._gui;
  }

  protected onAfterAttach(msg: Message): void {}

  protected onResize(msg: ResizeMessage): void {
    if (msg.width >= 0) {
      // Resize `dat.GUI` element to fill width of `Widget`.
      $(this.node).find("div").width(null).attr("style", null);
      // Hide close button, since widget position, etc. is managed as a
      // phosphor widget.
      $(".close-button").hide();
    }
  }

  private _gui: dat.GUI;
}


/**
 * A widget which hosts a `three.js` WebGL renderer.
 */
export class ThreeRendererWidget extends Widget {
  constructor(rendererSettings: THREE.WebGLRendererParameters = {},
              cameraSettings: PerspectiveCameraParameters = {}) {
    super();
    this.addClass('ThreeRendererWidget');
    this._scene = new THREE.Scene();
    this._canvas = document.createElement('canvas');
    $(this._canvas).css({position: "absolute"});
    rendererSettings.canvas = this._canvas;
    this._renderer = new THREE.WebGLRenderer(rendererSettings);
    this._camera = new THREE.PerspectiveCamera(cameraSettings.fov,
                                               cameraSettings.aspect,
                                               cameraSettings.near,
                                               cameraSettings.far);
    this._scene.add(this._camera);
    this._renderer.render(this._scene, this._camera);
    this.node.appendChild(this._canvas);
  }

  get camera(): THREE.PerspectiveCamera { return this._camera; }
  get canvas(): HTMLCanvasElement { return this._canvas; }
  get renderer(): THREE.WebGLRenderer { return this._renderer; }
  get scene(): THREE.Scene { return this._scene; }

  update() {
    this.renderer.render(this.scene, this.camera);
  }

  protected onAfterAttach(msg: Message): void {}

  protected onResize(msg: ResizeMessage): void {
    if (msg.width >= 0 || msg.height >= 0) {
      $(this.canvas).height(msg.height);
      $(this.canvas).width(msg.width);

      this.renderer.setSize(msg.width, msg.height);

      this.camera.position.z = msg.width;
      this.camera.aspect = msg.width / msg.height;
      this.camera.updateProjectionMatrix();
    }
  }

  private _scene: THREE.Scene;
  private _canvas: HTMLCanvasElement;
  private _renderer: THREE.WebGLRenderer;
  private _camera: THREE.PerspectiveCamera;
}
