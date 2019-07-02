import * as React from "react";
import * as PropTypes from "prop-types";
import animalEmojis from "@root/common/emojis";

export interface DataProps {
  roomIcon?: any;
  roomName?: string;
  roomId?: string | number;
  disabled?: boolean;
  hadTeacher?: boolean;

  whiteScreen?: any;
  createAt?: number;
}

export interface RoomCardProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export class RoomCard extends React.Component<RoomCardProps> {
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };

  render() {
    const {
      roomId,
      roomName,
      disabled,
      roomIcon,
      whiteScreen,
      createAt,
      hadTeacher,
      ...attributes
    } = this.props;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "RoomCard",
      styles
    });

    return (
      <div
        {...attributes}
        {...classes.root}
      >
        <div {...classes.roomIcon}>{roomIcon || animalEmojis[Number(roomId.toString().charCodeAt(0)) % animalEmojis.length]}</div>
        <p style={{ fontSize: 12 }}>{roomId}</p>
        <p>{hadTeacher ? "" : "历史"}课堂：{roomName}</p>
      </div>
    );
  }
}

function getStyles(RoomCard: RoomCard) {
  const {
    context: { theme },
    props: { disabled, style, hadTeacher }
  } = RoomCard;
  const { prefixStyle } = theme;
  const roomIconSize = 48;
  const roomIconLineSize = 2;

  return {
    root: prefixStyle({
      position: "relative",
      cursor: disabled ? "default" : "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      flex: "0 0 auto",
      border: `1px solid ${theme.listLow}`,
      padding: "12px 24px",
      width: 240,
      height: 120,
      fontSize: 16,
      borderRadius: 2,
      transition: "transform .25s 0s ease-in-out",

      transform: "scale(1)",
      color: "#222",
      opacity: disabled ? 0.75 : 1,
      background: disabled ? "#f9f9f9" : "#fff",
      ...(hadTeacher ? {
        color: "#fff",
        background: theme.listAccentMedium
      } : {}),
      "&:hover": disabled ? void 0 : prefixStyle({
        zIndex: 9,
        transform: "scale(1.05)",
        color: "#fff",
        background: theme.accent
      }),
      ...style
    }),
    roomIcon: prefixStyle({
      textAlign: "center",
      position: "absolute",
      right: -roomIconSize / 4,
      top: -roomIconSize / 4,
      fontSize: roomIconSize / 2,
      lineHeight: `${roomIconSize - roomIconLineSize * 2}px`,
      width: roomIconSize,
      height: roomIconSize,
      borderRadius: roomIconSize / 2,
      background: "#ffca00",
      border: `${roomIconLineSize}px solid #000`,
      opacity: disabled ? 0.5 : 1
    })
  };
}

export default RoomCard;
