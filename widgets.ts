'use strict';

import {
  Message
} from 'phosphor-messaging';

import {
  ResizeMessage, Widget
} from 'phosphor-widget';

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
