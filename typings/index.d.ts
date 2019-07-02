type GetElectron = () => typeof Electron;;
declare var getElectron: GetElectron;

interface Window {
  mozRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  msRequestAnimationFrame: (callback: FrameRequestCallback) => number;
  mozCancelAnimationFrame(handle: number): void;
  
  require: NodeRequire;
  getElectron: GetElectron;

  _openDialog: (config?: { content?: any; onConfirm?: () => void; onCancel?: () => void; }) => void;

  [key: string]: any;
}

interface HTMLElement {
  attachEvent: (type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean) => void;
}

interface StyleSheet {
  cssRules: CSSRuleList;
}
interface ObjectConstructor {
  assign(target: any, ...sources: any[]): any;
  observe(beingObserved: any, callback: (update: any) => any) : void;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
