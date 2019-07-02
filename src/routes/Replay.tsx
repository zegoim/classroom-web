import * as React from "react";
import * as PropTypes from "prop-types";
import * as ReactRouter from "react-router";
import { sdkToken, WhiteWebSdk } from "@root/components/HereWhite";
import { getSearchQuery } from "@root/common/getSearchQuery";
import Time from "@root/components/Time";
import { __IS_ELECTRON__ } from "@root/common/electron";
let search = getSearchQuery();

const whiteWebSdk = new WhiteWebSdk();
export interface DataProps {
  match?: any;
  location?: ReactRouter.RouteProps["location"];
  history?: ReactRouter.RouteChildrenProps["history"];
  staticContext?: any;
}

export interface ReplayState {
  autoPlay?: boolean;
}

export interface ReplayProps extends React.HTMLAttributes<HTMLDivElement>, DataProps {}

export class Replay extends React.Component<ReplayProps, ReplayState> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  state: ReplayState = {
    autoPlay: false
  };
  rootEl: HTMLDivElement;
  componentDidMount() {
    if (__IS_ELECTRON__) {
      window.onbeforeunload = e => {
        e.preventDefault();
        window._openDialog({
          content: "确定退出房间？",
          onConfirm: () => {
            this.props.history.push({ pathname: "/" });
            window.onbeforeunload = void 0;
          }
        });
        return false;
      };
    }
    this.replay();
  }

  time: Time;

  playing = false;
  replayTimer: any;
  replay = async () => {
    let search = getSearchQuery();
    if (!search.createAt) {
      return;
    }
    const beginTimestamp = Number(search.createAt) + 0 * 1000;
    const duration = Number(new Date()) - beginTimestamp;

    try {
      const player = await whiteWebSdk.replayRoom({
        room: search.uuid,
        beginTimestamp,
        duration
      } as any);
      if (!this.playing) {
        player.bindHtmlElement(this.rootEl);
        this.setState({
          autoPlay: true
        }, () => {
          player.seekToScheduleTime(0); // 从时间 0 开始
          player.play();
          this.time.start();
          console.error(player.beginTimestamp, +search.createAt);
        });
        this.playing = true;
      }
    } catch (e) {
      this.replayTimer = setTimeout(() => {
        this.replay();
        clearTimeout(this.replayTimer);
      }, 500);
    }
  }

  render() {
    search = getSearchQuery();
    const { autoPlay } = this.state;
    const {
      match,
      location,
      history,
      staticContext,
      ...attributes
    } = this.props;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "Replay",
      styles
    });

    return (
      <div {...attributes} {...classes.root}>
        <video
          {...classes.users}
          autoPlay={autoPlay}
          controls
        >
          <source src={search.replayUrl} type="video/mp4" />
        </video>
        <div {...classes.viewEl} ref={rootEl => this.rootEl = rootEl} />
        <Time ref={time => this.time = time} />
      </div>
    );
  }
}

function getStyles(Replay: Replay) {
  const {
    context: { theme },
    props: { style }
  } = Replay;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      height: "100vh",
      width: "100vw",
      alignItems: "center",
      flexDirection: "row",
      overflowY: "hidden",
      flexWrap: "nowrap",
      ...style
    }),
    users: prefixStyle({
      height: "100vh",
      zIndex: 3,
      width: `calc((100vh - ${window.menubarHeight}px) / 2)`
    }),
    viewEl: prefixStyle({
      display: "inline-block",
      width: `calc(100vw - (100vh - ${window.menubarHeight}px) / 2)`,
      height: "100vh",
      flex: "1 1 auto",
      background: "#fff"
    })
  };
}

export default Replay;
