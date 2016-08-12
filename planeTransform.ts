'use strict';

import {
  ResizeMessage
} from 'phosphor-widget';

import {
  PerspectiveCameraParameters, ThreeRendererWidget
} from './widgets';

import {d3_ext} from './d3';
import * as THREE from 'three';
import * as d3 from 'd3';
import {Promise} from 'es6-promise';

// import {Navigator} from 'mediastream';

export class ThreePlaneTransformWidget extends ThreeRendererWidget {
  
  constructor(rendererSettings: THREE.WebGLRendererParameters = {},
              cameraSettings: PerspectiveCameraParameters = {}, 
              i: number) {
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
    //for the control points 
    this.control_handles_element = <SVGSVGElement><any>document.createElement('svg');
    $(this.control_handles_element).css({position: "absolute"});

    // Create orbit controls to zoom, pan, etc.  Start at center of SVG
    // drawing.
    this._orbit = new THREE.OrbitControls(this.camera,
                                          this.renderer.domElement);
    this._orbit.reset();
    this.createShape(i);
  }
  

  protected createShape(i: number) {
    // Creates the handles for transforming the plane
    // this.pointsUI =
    //         d3.controlPointsUI()(d3.select(this.control_handles_element)
    //                              .selectAll('circle')
    //                            .data(this.controlPoints)).radius(10);
    
    // Plane GEOMETRY
    var width = 500, height = 500;
    this.video = document.createElement("video");
    this.geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);

    var n  = <any>navigator;

    var vidList = ["1bf5a589dc451d3be57121b4805c566a494d2c0364202dfbc734d6df5882ca9c",
          "7da1f3593bbc75ef77bc6c51c9f31d0b83503fb7cd80c974f08c5d5a4dcc271b",
          "gCD3rm6YLmDsaPm/cfxDkTcvpLgiedWjolaDUtECnQ8=",
          "g+sUcCvvui0fZtO1pQS5vcFcR1+hq8iU9Ezt1M2OKN0="];
    // var constraints = {
    //    video: {
    //     optional: [{ sourceId: vidList[2] }]
    //    }
    // }

    //Attaching stream to video and add video to scene
    //n.getUserMedia = n.webkitGetUserMedia || n.mozGetUserMedia;

    n.webkitGetUserMedia({video:true},(stream) => {
            this.video.src = URL.createObjectURL(stream);
            console.log(this.video.src);
            this.initVideo();
        }, function(error){
        console.log("Failed to get a stream due to", error);
    }); 
  }

  public update(){
     if( this.video.readyState === this.video.HAVE_ENOUGH_DATA ){
       this.videoTexture.needsUpdate = true;
     }
     this.renderer.render(this.scene, this.camera);

  }

  protected initVideo() {
    //add video texture
    this.videoTexture = new THREE.Texture(this.video);
    this.videoTexture.minFilter = THREE.NearestFilter;
    this.videoTexture.magFilter = THREE.NearestFilter;
    
    var customUniforms = {
        uSampler: {
        type: "t",
        value: this.videoTexture
        },
    };

    var vertexShader = `
    varying vec4 textureCoord;
    attribute float diagonalRatio;
    void main() {
        textureCoord = vec4(uv.xy, 0.0, 1.0);
        //textureCoord.w = diagonalRatio;
        textureCoord.w = 1.0;//remove this when time comes
        textureCoord.xy *= textureCoord.w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

    var fragmentShader = `
    uniform sampler2D uSampler;
    varying vec4 textureCoord;
    void main() {
        gl_FragColor = texture2D(uSampler, textureCoord.xy/textureCoord.w);
    }`;

    var customMaterial = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        side: THREE.DoubleSide,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    this.mesh = new THREE.Mesh(this.geometry, customMaterial);
    this.scene.add(this.mesh);

    // var diagonalRatios = this.calculateDiagonalRatios();
    // if(diagonalRatios){
    //     for (var i = 0; i < 4; i++) {
    //         this.geometry.attributes.diagonalRatio.array[i] = diagonalRatios[i];
    //     }
    // }
    // this.pointsUI.on("changed", (d) => this.onControlPointChange(d));
}

  public geometry: THREE.PlaneBufferGeometry;
  public mesh: THREE.Mesh;
  public videoTexture: THREE.Texture;
  public video: HTMLVideoElement;

  public material: THREE.MeshBasicMaterial;

  private _anchorsSvg: SVGSVGElement;
  private control_handles_element: SVGSVGElement;
  private _orbit: THREE.OrbitControls;

  private pointsUI: any; //TODO change this later
  private controlPoints: any;

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
