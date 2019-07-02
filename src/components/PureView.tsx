import * as React from "react";
import { __IS_ELECTRON__ } from "@root/common/electron";



export interface DataProps {}
interface Attributes { [key: string]: any; }

export interface PureViewProps extends DataProps, Attributes {}

export class PureView extends React.PureComponent<PureViewProps> {
  viewEl: HTMLCanvasElement | HTMLVideoElement;
  render() {

    const { ...attributes } = this.props;
    return (__IS_ELECTRON__ ? (
      <canvas {...attributes} ref={canvasEl => this.viewEl = canvasEl}>
        PureView
      </canvas>
    ) : (
      <video {...attributes} autoPlay ref={videoEl => this.viewEl = videoEl}>
        PureView
      </video>
    ));
  }
}

export default PureView;
