import * as React from "react";
import * as PropTypes from "prop-types";
import * as ReactRouter from "react-router";
import * as faker from "faker/locale/en";
import TextBox from "react-uwp/TextBox";
import Button from "react-uwp/Button";
import Time from "@root/components/Time";
import RoomCard, { DataProps as RoomCardProps } from "./RoomCard";
import * as api from "@root/common/api";

export interface DataProps {
  match?: any;
  location?: ReactRouter.RouteProps["location"];
  history?: ReactRouter.RouteChildrenProps["history"];
  staticContext?: any;
}
function genArray<T>(schema, min = 0, max): T[] {
  max = max || min;
  return Array.from({ length: faker.random.number({ min, max }) }).map(() => Object.keys(schema).reduce((entity, key) => {
    entity[key] = schema[key]();
    return entity;
  }, {})) as any;
}
export interface HomeProps extends React.HTMLAttributes<HTMLDivElement>, DataProps {}
export interface HomeState {
  rooms?: RoomCardProps[];
  showCreateRoom?: boolean;
  roomId?: string;
  roomName?: string;
}

export class Home extends React.Component<HomeProps, HomeState> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  state: HomeState = {
    rooms: []
  };
  time: Time;

  async componentDidMount() {
    this.time.start();
    this.setState({
      rooms: await api.getRooms()
    });
  }

  handleCreateRoom = (e?: any) => {
    this.setState({ showCreateRoom: true });
  }

  toggleShowCreateRoom = (showCreateRoom?: any) => {
    if (typeof showCreateRoom === "boolean") {
      if (showCreateRoom !== this.state.showCreateRoom) {
        this.setState({ showCreateRoom });
      }
    } else {
      this.setState((prevState, prevProps) => ({
        showCreateRoom: !prevState.showCreateRoom
      }));
    }
  }

  render() {
    const {
      match,
      location,
      history,
      staticContext,
      ...attributes
    } = this.props;
    const { rooms, showCreateRoom, roomId } = this.state;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "Home",
      styles
    });

    return (
      <div {...attributes} {...classes.root}>
        <Time ref={time => this.time = time} />
        <h5>课堂列表：</h5>
        <div {...classes.rooms}>
          {rooms.length === 0
            ? (<div>
              暂无课堂
            </div>)
            : (rooms.map((room: any, index) => {
              const { roomId, roomName, roomIcon } = room;
              const hadTeacher = Boolean(room.teacherId);
              return <RoomCard
                style={{ margin: 20 }}
                {...{ roomId, roomName, roomIcon, hadTeacher }}
                key={index}
                onClick={e => {
                  history.push({ pathname: "/Replay", search: `?roomId=${room.roomId}&replayUrl=${room.replayUrl}&roomName=${room.roomName}&createAt=${room.createAt}${room.whiteScreen ? `&uuid=${room.whiteScreen.uuid}&roomToken=${room.whiteScreen.roomToken}` : ""}` });
                }}
              />;
            }))
          }
        </div>
        <Button
          onClick={() => {
            window._openDialog({
              content: <TextBox
                placeholder="课堂名字"
                style={{ width: "100%" }}
                key={`${showCreateRoom}`}
                onChangeValue={e => {
                  this.state.roomName = e;
                }}
              />,
              onConfirm: async () => {
                this.toggleShowCreateRoom(false);
                const { roomName } = this.state;
                if (roomName) {
                  const roomId = faker.random.uuid();
                  this.state.roomId = roomId;
                  await api.createRoom({
                    roomId,
                    roomName
                  });
                  history.push({ pathname: "/Room", search: `?roomId=${roomId}&roomName=${roomName}` });
                }
              },
              onCancel: () => {
                this.state.roomId = "";
                this.state.roomName = "";
                this.toggleShowCreateRoom(false);
              }
            });
          }}
          {...classes.btn}
        >
          创建课堂
        </Button>
      </div>
    );
  }
}

function getStyles(Home: Home) {
  const {
    context: { theme },
    props: { style }
  } = Home;
  const { prefixStyle } = theme;

  return {
    root: prefixStyle({
      display: "flex",
      flexDirection: "column",
      fontSize: 22,
      height: `calc(100vh - ${window.menubarHeight}px)`,
      padding: "20px 40px",
      ...style
    }),
    btn: prefixStyle({
      background: theme.accent,
      color: "#fff",
      position: "fixed",
      left: 0,
      bottom: 20,
      marginLeft: `calc((100% - 320px) / 2)`,
      width: 320,
      height: 40
    }),
    rooms: prefixStyle({
      width: "100%",
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      padding: "20px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    })
  };
}

export default Home;
