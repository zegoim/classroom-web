import * as React from "react";
import * as PropTypes from "prop-types";
import { stringify } from "query-string";
import { WhiteWebSdk } from "white-react-sdk";
import Icon from "react-uwp/Icon";
import Tooltip from "react-uwp/Tooltip";
import ColorPicker from "react-uwp/ColorPicker";
import Slider from "react-uwp/Slider";
import * as color from "tinycolor2";
import { hereWhiteToken } from "../../config";

export { WhiteWebSdk };

export interface DataProps {
  uuid?: string;
  roomToken?: string;
  onCreateRoom?: (param?: { uuid?: string; roomToken?: string; }) => void;
  onJoinRoom?: (param?: { room?: any; }) => void;
  onFirstAction?: () => void;
  toolBarPosition?: "top" | "bottom" | "left" | "right";
  onReplay?: () => void;
}

import { getSearchQuery } from "@root/common/getSearchQuery";

export interface HereWhiteProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export interface HereWhiteState {
  room?: any;
  applianceName?: Appliance;
  strokeColor?: string;
  selectorRadius?: number;
  strokeWidth?: number;
  textSize?: number;
  firstAction?: boolean;
  uuid?: string;
}
export type Appliance  = "selector" | "pencil" | "eraser" | "text" | "rectangle" | "ellipse";
export { hereWhiteToken };
const apiUrl = "https://cloudcapiv4.herewhite.com";
const appliances = [
  { title: "选择", appliance: "selector", icon: "MultiSelectLegacyMirrored" },
  { title: "铅笔", appliance: "pencil", icon: "Edit" },
  { title: "橡皮", appliance: "eraser", icon: "ClearAllInk" },
  { title: "文字", appliance: "text", icon: "Font" },
  { title: "矩形", appliance: "rectangle", icon: "Checkbox" },
  { title: "圆形", appliance: "ellipse", icon: "CircleRing" }
];

export class HereWhite extends React.Component<HereWhiteProps, HereWhiteState> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  state: HereWhiteState = {
    room: null,
    applianceName: "pencil",
    strokeColor: this.context.theme.accent,
    selectorRadius: 4,
    strokeWidth: 1,
    textSize: 16
  };
  static defaultProps: HereWhiteProps = {
    toolBarPosition: "right"
  };

  scriptEl = document.createElement("script");
  linkEl = document.createElement("link");

  handleWindowResize = () => {
    if (this.state.room) {
      this.state.room.refreshViewSize();
    }
  }

  componentDidMount() {
    const { uuid, roomToken } = getSearchQuery();
    if (uuid) {
      this.joinRoom({ uuid, roomToken });
    } else {
      this.createAndJoinRoom();
    }

    window.addEventListener("resize", this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  }

  getHereWhiteTimer: any = null;
  whiteEl: HTMLDivElement;
  createAndJoinRoom = async () => {
    clearTimeout(this.getHereWhiteTimer);

    const url = `${apiUrl}/room?token=${hereWhiteToken}`;
    const requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Test Room",
        limit: 100,
        mode: "persistent"
      })
    };

    fetch(url, requestInit)
      .then((response) => {
        if (response.status !== 200) {
            throw new Error(`create room failed with status code ${response.status} : ${response.statusText}`);
        }
        return response.json();
      })
      .then(async (json: any) => {
        const { roomToken, room } = json.msg;
        const { uuid } = room;
        const { onCreateRoom, onJoinRoom } = this.props;
        if (onCreateRoom) {
          console.log("is create room");
          onCreateRoom({ uuid, roomToken });
        }
        let roomRes = await this.joinRoom({ uuid, roomToken });
        if (onJoinRoom) {
          console.log("is join room");
          onJoinRoom({ room: roomRes });
        }
      });
  }

  joinRoom = async (param: { uuid: string; roomToken?: string; }) => {
    let roomToken = param.roomToken;
    if (!roomToken) {
      console.log("not found roomToken");
      const query = stringify({ uuid: param.uuid || getSearchQuery().uuid, token: hereWhiteToken });
      const url = `${apiUrl}/room/join?${query}`;
      const response = await fetch(url, {
          method: "POST",
          headers: {
              "content-type": "application/json"
          }
      });
      if (response.status !== 200) {
          throw new Error(`get room token failed with status code ${response.status} : ${response.statusText}`);
      }
      const json: any = await response.json();
      roomToken = json.msg.roomToken;
    }

    const whiteWebSdk: WhiteWebSdk = new WhiteWebSdk();
    console.log("whiteWebSdk join room.");
    console.log({
      uuid: param.uuid,
      roomToken
    });
    return whiteWebSdk.joinRoom({
      uuid: param.uuid,
      roomToken
    }).then((room) => {
      console.log("room is :", room);
      this.setState({ room });
      const { strokeColor, selectorRadius, strokeWidth, textSize } = this.state;
      const rgb = color(strokeColor).toRgb();
      room.setMemberState({
        strokeColor: [rgb.r, rgb.g, rgb.b],
        strokeWidth,
        textSize
      });
      room.bindHtmlElement(this.whiteEl);

      return room;
    }).catch(e => {
      console.error(e);
    });
  }

  setMemberState = (appliance: Appliance) => {
    this.state.room.setMemberState({ currentApplianceName: appliance });
  }

  /**
    清除当前屏幕内容
    @param retainPpt 是否保留 ppt
  */
  cleanCurrentScene = (retainPpt = true) => {
    this.state.room.cleanCurrentScene(retainPpt);
  }

  closeRoom = () => {
    return fetch(`https://cloudcapiv4.herewhite.com//room/close?token=${hereWhiteToken}`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uuid: this.state.room.uuid })
    });
  }

  render() {
    const { uuid, onCreateRoom, roomToken, toolBarPosition, onReplay, onFirstAction, ...attributes } = this.props;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "HereWhite",
      styles
    });
    const { room, applianceName, strokeWidth, strokeColor, firstAction } = this.state;

    return (
      <div
        {...attributes}
        {...classes.root}
      >
        <div
          {...classes.white}
          onClick={() => {
            if (!this.state.firstAction) {
              this.state.firstAction = true;
              if (onFirstAction) onFirstAction();
            }
          }}
          ref={whiteEl => this.whiteEl = whiteEl}
        />
        <div {...classes.toolbar}>
          <div {...classes.toolbarContent}>

            <ColorPicker
              size={160}
              defaultColor={strokeColor}
              style={{
                position: "fixed",
                right: 24,
                top: 24 + window.menubarHeight,
                background: "none",
                pointerEvents: "all"
              }}
              onChangedColor={currColor => {
                const rgb = color(currColor).toRgb();
                room.setMemberState({
                  strokeColor: [rgb.r, rgb.g, rgb.b]
                });
              }}
            />

            <div {...classes.toolbarIcons}>
              {appliances.map((item, index) => {
                return (
                  <Tooltip horizontalPosition="left" verticalPosition="center" key={index} content={item.title}>
                    <Icon
                      size={20}
                      style={{
                        ...styles.toolbarItem,
                        background: item.appliance === applianceName ? theme.accent : theme.chromeLow,
                        color: item.appliance === applianceName ? "#fff" : theme.baseHigh
                      }}
                      onClick={() => {
                        this.setState({
                          applianceName: item.appliance as any
                        });
                        this.setMemberState(item.appliance as any);
                      }}
                      hoverStyle={styles.toolbarItem["&:hover"]}
                      children={item.icon}
                    />
                  </Tooltip>
                );
              })}
              <Tooltip horizontalPosition="left" verticalPosition="center" content="回放">
                <Icon
                  size={20}
                  style={{
                    ...styles.toolbarItem
                  }}
                  onClick={onReplay}
                  hoverStyle={styles.toolbarItem["&:hover"]}
                  children="PlayLegacy"
                />
              </Tooltip>
            </div>

            <Slider
              style={{
                width: 80,
                marginTop: 10,
                pointerEvents: "all"
              }}
              showValueInfo
              initValue={strokeWidth}
              minValue={1}
              maxValue={12}
              onChangeValue={value => {
                room.setMemberState({
                  strokeWidth: value
                });
                this.setState({ strokeWidth: value });
              }}
              customControllerStyle={{
                background: strokeColor
              }}
              unit="px"
            />

          </div>
        </div>
      </div>
    );
  }
}

function getStyles(HereWhite: HereWhite) {
  const {
    context: { theme },
    props: { style },
    state: { applianceName }
  } = HereWhite;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      position: "relative",
      zIndex: 0,
      ...style
    }),
    white: prefixStyle({
      width: "100%",
      height: "100%"
    }),
    toolbar: prefixStyle({
      position: "absolute",
      right: 0,
      marginRight: 36,
      height: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      zIndex: 999,
      top: 0,
      pointerEvents: "none"
    }),
    toolbarContent: prefixStyle({
      width: 140,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between"
    }),
    toolbarIcons: prefixStyle({
      display: "flex",
      flexDirection: "column"
    }),
    toolbarItem: prefixStyle({
      pointerEvents: "all",
      cursor: "pointer",
      width: 48,
      height: 48,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "center",
      background: theme.chromeLow,
      "&:hover": {
        cursor: "pointer",
        background: theme.listAccentLow
      }
    })
  };
}

export default HereWhite;
