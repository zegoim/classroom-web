import * as React from "react";
import * as PropTypes from "prop-types";
import * as ReactRouter from "react-router";
import * as hash from "crypto-js";

import PureView from "@root/components/PureView";
import HereWhite from "@root/components/HereWhite";
import Time from "@root/components/Time";
import * as api from "@root/common/api";
import getSearchQuery from "@root/common/getSearchQuery";
import { LiveRoom } from "@root/common/LiveRoom";
import { zegoConfig } from "../../../config";
const { appId, signKey } = zegoConfig;
import { __IS_ELECTRON__ } from "@root/common/electron";
const liveRoom = new LiveRoom({ appId, signKey } as any);

export interface DataProps {
  match?: any;
  location?: ReactRouter.RouteProps["location"];
  history?: ReactRouter.RouteChildrenProps["history"];
  staticContext?: any;
}
let search = getSearchQuery();

export interface RoomProps extends React.HTMLAttributes<HTMLDivElement>, DataProps {}
export interface RoomState {
  uuid?: string;
  streamList: any[];
  createAt?: number;
  replayUrl?: string;
}

export class Room extends React.Component<RoomProps, RoomState> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  localView: PureView;
  remoteView: PureView;
  time: Time;
  state: RoomState = {
    streamList: []
  };
  hereWhite: HereWhite;
  firstRemoteStreamId: string;
  async componentDidMount() {
    search = getSearchQuery();
    if (__IS_ELECTRON__) {
      window.onbeforeunload = e => {
        e.preventDefault();
        window._openDialog({
          content: "确定退出房间？",
          onConfirm: () => {
            history.go(-1);
            window.onbeforeunload = void 0;
          }
        });
        return false;
      };
    }

    liveRoom.initSDK();
    liveRoom.handleStreamsChange = (streamList) => {
      this.setState({ streamList });
      this.firstRemoteStreamId = streamList[0] ? streamList[0].stream_id : "";
      if (this.firstRemoteStreamId) {
        liveRoom.playStream({ viewEl: this.remoteView.viewEl as HTMLCanvasElement, streamId: this.firstRemoteStreamId });
      }
    };
    const res = await liveRoom.loginRoom({ roomId: search.roomId });
    await api.updateRoom({ roomId: liveRoom.roomId, teacherId: liveRoom.userId });
    await liveRoom.startPreview({ viewEl: this.localView.viewEl as HTMLCanvasElement });
    // 流名字必须带 teacher 前缀，录制视频需要
    const streamId = `teacher-${hash.MD5(liveRoom.roomId).toString()}-${liveRoom.userId}`;
    liveRoom.publishStream(streamId);
    // const recordRes = await api.startRecord({ appId: liveRoom.appId, roomId: liveRoom.roomId, signature: liveRoom.signKey.join(",") });
    // if (recordRes.status === 200) {
    //   // this.time.start();
    //   const data: any = await recordRes.json();
    //   const timestamp = Number(new Date());
    //   const serverTimestamp = data.start_time * 1000;
    //   console.error({ timestamp, serverTimestamp });
    //   const replayUrl = api.recordUrl + data.url;
    //   api.updateRoom({ roomId: liveRoom.roomId, replayUrl, createAt: serverTimestamp });
    //   this.setState({ replayUrl, createAt: serverTimestamp });
    // }
  }

  async componentWillUnmount() {
    liveRoom.handleStreamsChange = void 0;
    if (!search.uuid) {
      // api.deleteRoom({
      //   roomId: search.roomId
      // });
      // this.hereWhite.closeRoom();
    }
    api.updateRoom({
      roomId: liveRoom.roomId,
      teacherId: ""
    });

    liveRoom.stopPreview();
    liveRoom.logoutRoom();
    // const recordRes = await api.stopRecord({ appId: liveRoom.appId, roomId: liveRoom.roomId, signature: liveRoom.signKey.join(",") });
  }

  render() {
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
      className: "Room",
      styles
    });
    const { streamList } = this.state;
    const search = getSearchQuery();

    return (
      <div {...attributes} {...classes.root}>
        <div {...classes.users}>
          <div {...classes.viewEl}>
            <PureView
              {...classes.viewEl}
              ref={PureView => this.localView = PureView}
            />
          </div>
          <div {...classes.viewEl}>
            <PureView
              {...classes.viewEl}
              style={{ borderTop: `2px solid ${theme.accent}` }}
              ref={PureView => this.remoteView = PureView}
            />
          </div>
        </div>
        <HereWhite
          style={{ width: "100%" }}
          ref={hereWhite => this.hereWhite = hereWhite}
          uuid={search.roomId}
          roomToken={search.roomToken}
          onCreateRoom={async (whiteScreen) => {
            this.time.start();
            this.state.uuid = whiteScreen.uuid;
            await api.updateRoom({
              roomId: search.roomId,
              whiteScreen: {
                uuid: whiteScreen.uuid,
                roomToken: whiteScreen.roomToken
              }
            });
            history.replace({ pathname: "/Room", search: `?roomId=${search.roomId}&uuid=${whiteScreen.uuid}&roomToken=${whiteScreen.roomToken}&createAt=${this.state.createAt || search.createAt}` });
          }}
          onReplay={() => {
            history.push({ pathname: "/Replay", search: `?roomId=${search.roomId}&uuid=${this.state.uuid || search.uuid}&createAt=${this.state.createAt || search.createAt}&replayUrl=${encodeURIComponent(this.state.replayUrl || search.replayUrl)}` });
          }}
        />
        <Time ref={time => this.time = time} />
      </div>
    );
  }
}

function getStyles(Room: Room) {
  const {
    context: { theme },
    props: { style }
  } = Room;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100vw",
      height: `calc(100vh - ${window.menubarHeight}px)`,
      overflow: "hidden",
      ...style
    }),
    users: prefixStyle({
      overflow: "hidden",
      flex: "0 0 auto",
      display: "flex",
      flexDirection: "column",
      zIndex: 3,
      width: `calc((100vh - ${window.menubarHeight}px) / 2)`
    }),
    viewEl: prefixStyle({
      objectFit: "cover",
      flex: "0 0 auto",
      width: `calc((100vh - ${window.menubarHeight}px - 1px) / 2)`,
      height: `calc((100vh - ${window.menubarHeight}px - 1px) / 2)`,
      background: "#222"
    })
  };
}

export default Room;
