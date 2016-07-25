/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  Message
} from 'phosphor-messaging';

import {
  ResizeMessage, Widget
} from 'phosphor-widget';

import * as d3 from 'd3';
import * as _ from 'lodash';
import * as _fp from 'lodash/fp';
import * as $ from 'jquery';

import { CodeMirrorWidget, DatGuiWidget, ThreeRendererWidget } from './widgets';
import { ThreePlaneTransformWidget } from './planeTransform';
import { FooBar } from './content';

import './index.css';

console.log("lodash/fp version:", _fp.VERSION);


/**
 * Create a placeholder content widget.
 */
function createContent(title: string): Widget {
  var widget = new Widget();
  widget.addClass('content');
  widget.addClass(title.toLowerCase());

  widget.title.text = title;
  widget.title.closable = true;

  return widget;
}


/* Create `Window` wrapper interface to access libraries, dock panel, and
 * widgets from interactive javascript prompt. */
interface MyWindow extends Window {
    libraries: any;
    panel: any;
    widgets: any;
}


declare var window: MyWindow;


/**
 * The main application entry point.
 */
function main(): void {
  var g1 = createContent('Green');

  var panel = new DockPanel();
  panel.id = 'main';

  var cmSource = new CodeMirrorWidget({
    mode: 'text/typescript',
    lineNumbers: true,
    tabSize: 2,
    keyMap: "vim"
  });
  cmSource.loadTarget('./entry.ts');
  cmSource.title.text = 'Source';

  var threeWidget = new ThreePlaneTransformWidget();
  threeWidget.title.text = 'Three renderer';
  threeWidget.title.closable = true;

  var guiWidget = new DatGuiWidget({autoPlace: false});
  var options = {state: true};
  guiWidget.gui.add(threeWidget.orbit, "enableRotate");
  guiWidget.title.text = 'UI options';
  guiWidget.title.closable = true;

  panel.insertLeft(cmSource);
  panel.insertRight(g1, cmSource);
  panel.insertRight(guiWidget, cmSource);
  panel.insertTabAfter(guiWidget, cmSource);
  panel.insertTabBefore(threeWidget, cmSource);

  panel.attach(document.body);

  window.onresize = () => { panel.update() };

/* Add `Window` references to local variables to access libraries, dock panel,
 * and widgets from interactive javascript prompt. */
  window.panel = panel;
  window.libraries = {
    d3: d3
  }
  window.widgets = {
    g1: g1,
    cmSource: cmSource,
    guiWidget: guiWidget,
    threeWidget: threeWidget
  }
  function render() {
    threeWidget.update();
    requestAnimationFrame(render);
  }
  render();
}

window.onload = main;
