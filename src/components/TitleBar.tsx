import * as React from "react";
import * as PropTypes from "prop-types";
import IconButton from "react-uwp/IconButton";
import RenderToBody from "react-uwp/RenderToBody";

export interface DataProps {
  /**
   * Set Menu Height
   */
  titleBarHeight?: number;
  title?: string;
  icon?: any;
  controlledMaximized?: boolean;
  menuContents?: any;
  focusedBackgroundColor?: string;
  blurBackground?: string;
  iconColor?: string;
  iconFocusedColor?: string;
}

export interface TitleBarState {
  isMaximized?: boolean;
  isFocused?: boolean;
}

export interface TitleBarProps extends DataProps, React.HTMLAttributes<HTMLDivElement> {}

export class TitleBar extends React.Component<TitleBarProps, TitleBarState> {
  electron = window.require("electron");
  currWin = this.electron.remote.getCurrentWindow();
  static contextTypes = { theme: PropTypes.object };
  context: { theme: ReactUWP.ThemeType };
  isControlled = this.props.controlledMaximized !== void 0;
  state: TitleBarState = {
    isMaximized: this.isControlled ? this.props.controlledMaximized : this.currWin.isMaximized(),
    isFocused: this.currWin.isFocused()
  };
  static defaultProps: TitleBarProps = {
    iconColor: "#fff",
    iconFocusedColor: "#666",
    titleBarHeight: 30
  };

  componentDidMount() {
    this.currWin.addListener("maximize", this.handleMaximize);
    this.currWin.addListener("unmaximize", this.handleRestore);
    this.currWin.addListener("restore", this.handleRestore);
    this.currWin.addListener("focus", this.handleFocus);
    this.currWin.addListener("blur", this.handleBlur);
  }

  componentWillUnmount() {
    this.currWin.removeListener("maximize", this.handleMaximize);
    this.currWin.removeListener("unmaximize", this.handleRestore);
    this.currWin.removeListener("restore", this.handleRestore);
    this.currWin.removeListener("focus", this.handleFocus);
    this.currWin.removeListener("blur", this.handleBlur);
  }

  getTitleBarHeight = () => this.props.titleBarHeight;

  handleFocus = () => this.setState({ isFocused: true });

  handleBlur = () => this.setState({ isFocused: false });

  handleMaximize = () => {
    this.setState({ isMaximized: true });
  }

  handleRestore = () => {
    this.setState({ isMaximized: false });
  }

  minimize = () => this.currWin.minimize();

  toggleMaximize = (toMaximize?: any) => {
    const isMaximized = this.isControlled ? this.state.isMaximized : this.currWin.isMaximized();
    if (isMaximized) {
      this.currWin.unmaximize();
    } else {
      this.currWin.maximize();
    }
    this.setState((prevState) => ({ ...prevState, isMaximized: !isMaximized }));
  }

  closeWin = () => {
    this.currWin.close();
  }

  render() {
    const {
      children,
      title,
      icon,
      titleBarHeight,
      controlledMaximized,
      menuContents,
      focusedBackgroundColor,
      blurBackground,
      iconColor,
      iconFocusedColor,
      ...attributes
    } = this.props;
    const { isMaximized } = this.state;
    const { theme } = this.context;
    const styles = getStyles(this);
    const classes = theme.prepareStyles({
      className: "TitleBar",
      styles
    });

    return (
      <div {...classes.wrapper}>
      <RenderToBody>
        <div
          {...attributes}
          {...classes.root}
        >
          <div {...classes.header}>
            <div {...classes.headerLeft}>
              {icon && typeof icon === "string"
                ? <img src={icon} {...classes.headerIcon} />
                : icon
              }
              {title && <p>{title}</p>}
              <div style={{ marginLeft: 20 }}>
                {menuContents}
              </div>
            </div>
            <div {...classes.icons}>
              <IconButton style={styles.icon} onClick={this.minimize}>
                ChromeMinimize
              </IconButton>
              <IconButton style={{ ...styles.icon, cursor: controlledMaximized ? "not-allowed" : "pointer" }} onClick={controlledMaximized ? void 0 : this.toggleMaximize}>
                {isMaximized ? "ChromeRestore" : "ChromeMaximize"}
              </IconButton>
              <IconButton style={styles.icon} hoverStyle={{ background: "rgb(215, 21, 38)", color: "#fff" }} onClick={this.closeWin}>
                ChromeClose
              </IconButton>
            </div>
          </div>
        </div>
        </RenderToBody>

        <div style={{ "WebkitAppRegion": "no-drag", zIndex: 1, marginTop: titleBarHeight }}>
          {children}
        </div>
      </div>
    );
  }
}

function getStyles(TitleBar: TitleBar) {
  const {
    context: { theme },
    props: { style, titleBarHeight, focusedBackgroundColor, blurBackground, iconColor, iconFocusedColor },
    state: { isFocused }
  } = TitleBar;
  const { prefixStyle } = theme;

  return {
    wrapper: prefixStyle({
      // "WebkitAppRegion": "drag",
      width: "100vw",
      height: "100vh",
      overflow: "hidden"
    }),
    root: prefixStyle({
      zIndex: 2147483647,
      position: "fixed",
      top: 0,
      left: 0,
      "WebkitAppRegion": "no-drag",
      flex: "0 0 auto",
      background: isFocused ? (focusedBackgroundColor || theme.accent) : (blurBackground || theme.chromeAltLow),
      color: isFocused ? "#fff" : "#666",
      padding: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "default",
      fontSize: 12,
      lineHeight: `${titleBarHeight}px`,
      // "WebkitAppRegion": "no-drag",
      width: "100%",
      height: titleBarHeight,
      ...style
    }),
    icons: prefixStyle({
      "WebkitAppRegion": "no-drag",
      display: "flex",
      flexDirection: "row",
      alignItems: "center"
    }),
    icon: prefixStyle({
      color: isFocused ? iconColor : iconFocusedColor,
      lineHeight: `${titleBarHeight}px`,
      fontSize: titleBarHeight / 3,
      width: 46,
      height: titleBarHeight
    }),
    header: prefixStyle({
      "WebkitAppRegion": "drag",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginLeft: 1,
      marginTop: 1,
      paddingLeft: 3,
      width: "calc(100% - 1px)",
      height: titleBarHeight - 1,
      position: "fixed",
      top: 0,
      left: 0
    }),
    headerIcon: prefixStyle({
      height: titleBarHeight - 8,
      maxWidth: titleBarHeight - 8,
      marginRight: 4
    }),
    headerLeft: prefixStyle({
      width: "100%",
      height: titleBarHeight - 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start"
    })
  };
}

export default TitleBar;
